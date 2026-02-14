import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/lib/inngest/client"

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * POST /api/sermons/[id]/process
 * Trigger background processing for a sermon (transcription + content generation)
 */
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

    // Get the sermon to verify ownership
    const { data: sermon, error: fetchError } = await supabase
      .from("sermons")
      .select("*")
      .eq("id", sermonId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Parse request body for options
    let options: { skipTranscription?: boolean } = {}
    try {
      options = await request.json()
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Check if sermon has audio/video for transcription
    const hasAudio = !!(sermon.audio_url || sermon.video_url || sermon.youtube_url)
    const hasTranscript = !!(sermon.transcript && sermon.transcript.trim().length > 100)

    // Determine if we should skip transcription
    const skipTranscription = options.skipTranscription || !hasAudio || hasTranscript

    if (!hasAudio && !hasTranscript) {
      return NextResponse.json(
        { error: "Sermon has no audio source and no transcript" },
        { status: 400 }
      )
    }

    // Update status to processing
    await supabase
      .from("sermons")
      .update({ status: "processing" })
      .eq("id", sermonId)

    // Send event to Inngest to process the sermon
    await inngest.send({
      name: "sermon/process",
      data: {
        sermonId,
        userId: user.id,
        skipTranscription,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Sermon processing started",
      sermonId,
      willTranscribe: !skipTranscription,
    })
  } catch (error) {
    console.error("Error starting sermon processing:", error)
    return NextResponse.json(
      {
        error: "Failed to start processing",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
