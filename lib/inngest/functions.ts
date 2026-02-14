import { inngest } from "./client"
import { createServiceClient } from "@/lib/supabase/service"
import { transcribeAudio } from "@/lib/transcription/service"
import { generateSermonNotes, convertToSermonNotesContent } from "@/lib/ai/sermon-notes-generator"
import { generateDevotional } from "@/lib/ai/devotional-generator"
import { generateDiscussionGuide } from "@/lib/ai/discussion-guide-generator"
import { generateSocialMedia } from "@/lib/ai/social-media-generator"
import { saveGeneratedContent } from "@/lib/db/generated-content"
import { trackContentGenerated, trackSermonCreated } from "@/lib/analytics/track"
import type { ContentType } from "@/types/database"

/**
 * Main sermon processing function - orchestrates the entire workflow
 * This runs as a durable function with automatic retries
 */
export const processSermon = inngest.createFunction(
  {
    id: "process-sermon",
    name: "Process Sermon",
    retries: 3,
    onFailure: async ({ event, error }) => {
      // Access original event data from the failure event
      const originalEvent = event.data.event as { data: { sermonId: string; userId: string } }
      const sermonId = originalEvent?.data?.sermonId
      console.error(`Sermon processing failed for ${sermonId}:`, error)
      // Update sermon status to error
      if (sermonId) {
        const supabase = createServiceClient()
        await supabase
          .from("sermons")
          .update({ status: "error" })
          .eq("id", sermonId)
      }
    },
  },
  { event: "sermon/process" },
  async ({ event, step }) => {
    const { sermonId, userId, skipTranscription } = event.data

    const supabase = createServiceClient()

    // Step 1: Get sermon details
    const sermon = await step.run("get-sermon", async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", sermonId)
        .single()

      if (error || !data) {
        throw new Error(`Sermon not found: ${sermonId}`)
      }

      return data
    })

    // Track sermon created
    await step.run("track-creation", async () => {
      await trackSermonCreated(userId, sermonId, sermon.input_type)
    })

    // Step 2: Transcribe if needed
    let transcript = sermon.transcript

    if (!skipTranscription && !transcript) {
      // Update status to transcribing
      await step.run("update-status-transcribing", async () => {
        await supabase
          .from("sermons")
          .update({ status: "transcribing" })
          .eq("id", sermonId)
      })

      // Get audio URL
      const audioUrl = sermon.audio_url || sermon.video_url || sermon.youtube_url

      if (!audioUrl) {
        throw new Error("No audio source found for transcription")
      }

      // Transcribe
      transcript = await step.run("transcribe-audio", async () => {
        const result = await transcribeAudio(audioUrl)
        return result.text
      })

      // Save transcript
      await step.run("save-transcript", async () => {
        await supabase
          .from("sermons")
          .update({ transcript })
          .eq("id", sermonId)
      })
    }

    if (!transcript || transcript.trim().length < 100) {
      throw new Error("Transcript is too short for content generation")
    }

    // Step 3: Generate content
    await step.run("update-status-generating", async () => {
      await supabase
        .from("sermons")
        .update({ status: "generating" })
        .eq("id", sermonId)
    })

    // Generate all content types in parallel using step.run for each
    const [sermonNotes, devotional, discussionGuide, socialMedia] = await Promise.all([
      step.run("generate-sermon-notes", async () => {
        try {
          const raw = await generateSermonNotes(transcript!)
          const content = convertToSermonNotesContent(raw)
          await saveGeneratedContent(sermonId, "sermon_notes", content)
          await trackContentGenerated(userId, sermonId, "sermon_notes")
          return { success: true, content }
        } catch (error) {
          console.error("Sermon notes generation failed:", error)
          return { success: false, error: String(error) }
        }
      }),
      step.run("generate-devotional", async () => {
        try {
          const content = await generateDevotional(transcript!, sermon.title)
          await saveGeneratedContent(sermonId, "devotional", content)
          await trackContentGenerated(userId, sermonId, "devotional")
          return { success: true, content }
        } catch (error) {
          console.error("Devotional generation failed:", error)
          return { success: false, error: String(error) }
        }
      }),
      step.run("generate-discussion-guide", async () => {
        try {
          const content = await generateDiscussionGuide(transcript!, sermon.title)
          await saveGeneratedContent(sermonId, "discussion_guide", content)
          await trackContentGenerated(userId, sermonId, "discussion_guide")
          return { success: true, content }
        } catch (error) {
          console.error("Discussion guide generation failed:", error)
          return { success: false, error: String(error) }
        }
      }),
      step.run("generate-social-media", async () => {
        try {
          const content = await generateSocialMedia(transcript!, sermon.title)
          await saveGeneratedContent(sermonId, "social_media", content)
          await trackContentGenerated(userId, sermonId, "social_media")
          return { success: true, content }
        } catch (error) {
          console.error("Social media generation failed:", error)
          return { success: false, error: String(error) }
        }
      }),
    ])

    // Step 4: Update status to complete
    await step.run("update-status-complete", async () => {
      await supabase
        .from("sermons")
        .update({ status: "complete" })
        .eq("id", sermonId)
    })

    // Step 5: Send completion email (optional, fire and forget)
    await step.sendEvent("send-completion-email", {
      name: "sermon/send-completion-email",
      data: {
        sermonId,
        userId,
        userEmail: "", // Will be fetched in the email function
        sermonTitle: sermon.title,
      },
    })

    return {
      success: true,
      sermonId,
      results: {
        sermonNotes: sermonNotes.success,
        devotional: devotional.success,
        discussionGuide: discussionGuide.success,
        socialMedia: socialMedia.success,
      },
    }
  }
)

/**
 * Transcribe a single sermon
 */
export const transcribeSermon = inngest.createFunction(
  {
    id: "transcribe-sermon",
    name: "Transcribe Sermon",
    retries: 2,
  },
  { event: "sermon/transcribe" },
  async ({ event, step }) => {
    const { sermonId } = event.data
    const supabase = createServiceClient()

    // Get sermon
    const sermon = await step.run("get-sermon", async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", sermonId)
        .single()

      if (error || !data) {
        throw new Error(`Sermon not found: ${sermonId}`)
      }
      return data
    })

    // Update status
    await step.run("update-status", async () => {
      await supabase
        .from("sermons")
        .update({ status: "transcribing" })
        .eq("id", sermonId)
    })

    // Get audio URL
    const audioUrl = sermon.audio_url || sermon.video_url || sermon.youtube_url
    if (!audioUrl) {
      throw new Error("No audio source found")
    }

    // Transcribe
    const transcript = await step.run("transcribe", async () => {
      const result = await transcribeAudio(audioUrl)
      return result.text
    })

    // Save transcript
    await step.run("save-transcript", async () => {
      await supabase
        .from("sermons")
        .update({
          transcript,
          status: "complete",
        })
        .eq("id", sermonId)
    })

    return { success: true, sermonId, transcriptLength: transcript.length }
  }
)

/**
 * Generate specific content types for a sermon
 */
export const generateContent = inngest.createFunction(
  {
    id: "generate-content",
    name: "Generate Content",
    retries: 2,
  },
  { event: "sermon/generate-content" },
  async ({ event, step }) => {
    const { sermonId, userId, contentTypes } = event.data
    const supabase = createServiceClient()

    // Get sermon
    const sermon = await step.run("get-sermon", async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", sermonId)
        .single()

      if (error || !data) {
        throw new Error(`Sermon not found: ${sermonId}`)
      }
      return data
    })

    if (!sermon.transcript) {
      throw new Error("Sermon has no transcript")
    }

    // Update status
    await step.run("update-status", async () => {
      await supabase
        .from("sermons")
        .update({ status: "generating" })
        .eq("id", sermonId)
    })

    // Generate requested content types
    const results: Record<string, boolean> = {}

    for (const type of contentTypes) {
      const success = await step.run(`generate-${type}`, async () => {
        try {
          let content: unknown

          switch (type) {
            case "sermon_notes":
              const raw = await generateSermonNotes(sermon.transcript!)
              content = convertToSermonNotesContent(raw)
              break
            case "devotional":
              content = await generateDevotional(sermon.transcript!, sermon.title)
              break
            case "discussion_guide":
              content = await generateDiscussionGuide(sermon.transcript!, sermon.title)
              break
            case "social_media":
              content = await generateSocialMedia(sermon.transcript!, sermon.title)
              break
            default:
              throw new Error(`Unknown content type: ${type}`)
          }

          await saveGeneratedContent(sermonId, type as ContentType, content as Record<string, unknown>)
          await trackContentGenerated(userId, sermonId, type as ContentType)
          return true
        } catch (error) {
          console.error(`Failed to generate ${type}:`, error)
          return false
        }
      })

      results[type] = success
    }

    // Update status to complete
    await step.run("update-status-complete", async () => {
      await supabase
        .from("sermons")
        .update({ status: "complete" })
        .eq("id", sermonId)
    })

    return { success: true, sermonId, results }
  }
)

/**
 * Send completion email to user
 */
export const sendCompletionEmail = inngest.createFunction(
  {
    id: "send-completion-email",
    name: "Send Completion Email",
    retries: 2,
  },
  { event: "sermon/send-completion-email" },
  async ({ event, step }) => {
    const { userId, sermonTitle } = event.data
    const supabase = createServiceClient()

    // Get user email
    const userEmail = await step.run("get-user-email", async () => {
      const { data, error } = await supabase.auth.admin.getUserById(userId)
      if (error || !data.user?.email) {
        console.log("Could not get user email, skipping notification")
        return null
      }
      return data.user.email
    })

    if (!userEmail) {
      return { success: false, reason: "No email found" }
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, just log that we would send an email
    await step.run("send-email", async () => {
      console.log(`Would send completion email to ${userEmail} for sermon: ${sermonTitle}`)
      // Example with Resend:
      // await resend.emails.send({
      //   from: 'SermonForge <notifications@sermonforge.app>',
      //   to: userEmail,
      //   subject: `Your sermon "${sermonTitle}" is ready!`,
      //   html: `<p>Great news! Your sermon has been processed and all content is ready.</p>
      //          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/sermons/${sermonId}">View your sermon</a></p>`,
      // })
    })

    return { success: true, email: userEmail }
  }
)

// Export all functions for the Inngest serve handler
export const functions = [
  processSermon,
  transcribeSermon,
  generateContent,
  sendCompletionEmail,
]
