/**
 * Sermon Content Generation API
 *
 * POST /api/sermons/[id]/generate
 * Generates AI-powered content from sermon transcripts using Claude API
 *
 * FEATURES:
 * - Generate single content type or all types in parallel
 * - Automatic error handling with sermon status updates
 * - Saves generated content to database
 *
 * RATE LIMITING CONSIDERATIONS:
 * - Claude API has rate limits (RPM and TPM)
 * - Generating "all" makes 4 parallel API calls
 * - Consider implementing:
 *   1. User-level rate limiting (e.g., 10 generations per hour)
 *   2. IP-based rate limiting for abuse prevention
 *   3. Queue system for high-load scenarios
 *
 * QUEUE SYSTEM (Future Enhancement):
 * For production at scale, consider implementing a queue:
 * - Inngest: https://www.inngest.com/ (recommended for Next.js)
 * - BullMQ: https://docs.bullmq.io/ (Redis-based)
 * - Trigger.dev: https://trigger.dev/ (event-driven)
 *
 * Benefits of queuing:
 * - Handle API timeouts gracefully (Claude can take 30-60s per generation)
 * - Better error recovery and retry logic
 * - Progress tracking for long-running operations
 * - Prevents API route timeouts in Vercel/serverless
 *
 * CURRENT IMPLEMENTATION:
 * - Synchronous API calls (simple, works for low-medium traffic)
 * - Parallel generation when content_type = "all"
 * - Error handling with Promise.allSettled
 * - Max timeout: ~2-3 minutes (Vercel limit: 60s for Hobby, 300s for Pro)
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateSermon } from "@/lib/db/sermons"
import { saveGeneratedContent } from "@/lib/db/generated-content"
import { generateSermonNotes, convertToSermonNotesContent } from "@/lib/ai/sermon-notes-generator"
import { generateDevotional } from "@/lib/ai/devotional-generator"
import { generateDiscussionGuide } from "@/lib/ai/discussion-guide-generator"
import { generateSocialMedia } from "@/lib/ai/social-media-generator"
import { trackContentGenerated } from "@/lib/analytics/track"
import type { ContentType } from "@/types"

interface RouteContext {
  params: Promise<{ id: string }>
}

type GenerationType = ContentType | "all"

interface GenerateRequest {
  content_type: GenerationType
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: sermonId } = await context.params

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body: GenerateRequest = await request.json()
    const { content_type } = body

    if (!content_type) {
      return NextResponse.json(
        { error: "content_type is required" },
        { status: 400 }
      )
    }

    // Get the sermon
    const { data: sermon, error: fetchError } = await supabase
      .from("sermons")
      .select("*")
      .eq("id", sermonId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Check if transcript exists
    if (!sermon.transcript || sermon.transcript.trim().length < 100) {
      return NextResponse.json(
        { error: "Sermon transcript is required for content generation. Please transcribe the sermon first." },
        { status: 400 }
      )
    }

    // Update sermon status to generating
    await updateSermon(
      sermonId,
      { status: "generating" },
      user.id
    )

    try {
      if (content_type === "all") {
        // Generate all content types in parallel
        console.log("Generating all content types in parallel...")

        const [sermonNotesResult, devotionalResult, discussionGuideResult, socialMediaResult] =
          await Promise.allSettled([
            generateSermonNotes(sermon.transcript),
            generateDevotional(sermon.transcript, sermon.title),
            generateDiscussionGuide(sermon.transcript, sermon.title),
            generateSocialMedia(sermon.transcript, sermon.title),
          ])

        // Save successful results
        const results: Record<string, any> = {}

        if (sermonNotesResult.status === "fulfilled") {
          const content = convertToSermonNotesContent(sermonNotesResult.value)
          await saveGeneratedContent(sermonId, "sermon_notes", content)
          await trackContentGenerated(user.id, sermonId, "sermon_notes")
          results.sermon_notes = content
        } else {
          console.error("Sermon notes generation failed:", sermonNotesResult.reason)
          results.sermon_notes = { error: sermonNotesResult.reason.message }
        }

        if (devotionalResult.status === "fulfilled") {
          await saveGeneratedContent(sermonId, "devotional", devotionalResult.value)
          await trackContentGenerated(user.id, sermonId, "devotional")
          results.devotional = devotionalResult.value
        } else {
          console.error("Devotional generation failed:", devotionalResult.reason)
          results.devotional = { error: devotionalResult.reason.message }
        }

        if (discussionGuideResult.status === "fulfilled") {
          await saveGeneratedContent(sermonId, "discussion_guide", discussionGuideResult.value)
          await trackContentGenerated(user.id, sermonId, "discussion_guide")
          results.discussion_guide = discussionGuideResult.value
        } else {
          console.error("Discussion guide generation failed:", discussionGuideResult.reason)
          results.discussion_guide = { error: discussionGuideResult.reason.message }
        }

        if (socialMediaResult.status === "fulfilled") {
          await saveGeneratedContent(sermonId, "social_media", socialMediaResult.value)
          await trackContentGenerated(user.id, sermonId, "social_media")
          results.social_media = socialMediaResult.value
        } else {
          console.error("Social media generation failed:", socialMediaResult.reason)
          results.social_media = { error: socialMediaResult.reason.message }
        }

        // Update sermon status to complete
        await updateSermon(
          sermonId,
          { status: "complete" },
          user.id
        )

        return NextResponse.json({
          success: true,
          content: results,
        })
      } else {
        // Generate single content type
        console.log(`Generating ${content_type}...`)

        let generatedContent: any

        switch (content_type) {
          case "sermon_notes": {
            const rawContent = await generateSermonNotes(sermon.transcript)
            generatedContent = convertToSermonNotesContent(rawContent)
            break
          }
          case "devotional": {
            generatedContent = await generateDevotional(sermon.transcript, sermon.title)
            break
          }
          case "discussion_guide": {
            generatedContent = await generateDiscussionGuide(sermon.transcript, sermon.title)
            break
          }
          case "social_media": {
            generatedContent = await generateSocialMedia(sermon.transcript, sermon.title)
            break
          }
          default:
            return NextResponse.json(
              { error: `Invalid content_type: ${content_type}` },
              { status: 400 }
            )
        }

        // Save generated content
        await saveGeneratedContent(sermonId, content_type as ContentType, generatedContent)

        // Track analytics
        await trackContentGenerated(user.id, sermonId, content_type as ContentType)

        // Update sermon status to complete
        await updateSermon(
          sermonId,
          { status: "complete" },
          user.id
        )

        return NextResponse.json({
          success: true,
          content_type,
          content: generatedContent,
        })
      }
    } catch (generationError) {
      // Update sermon status to error
      await updateSermon(
        sermonId,
        { status: "error" },
        user.id
      )

      console.error("Content generation failed:", generationError)

      return NextResponse.json(
        {
          error: "Content generation failed",
          details:
            generationError instanceof Error
              ? generationError.message
              : "Unknown error",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in generate route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
