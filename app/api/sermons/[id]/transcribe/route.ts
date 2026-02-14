import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { transcribeAudio } from "@/lib/transcription/service"
import { updateSermon } from "@/lib/db/sermons"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the sermon
    const { data: sermon, error: fetchError } = await supabase
      .from("sermons")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Check if sermon has audio/video URL
    const audioUrl = sermon.audio_url || sermon.video_url

    if (!audioUrl) {
      return NextResponse.json(
        { error: "No audio or video to transcribe" },
        { status: 400 }
      )
    }

    // Update status to transcribing
    await updateSermon(
      id,
      {
        status: "transcribing",
      },
      user.id
    )

    try {
      // Transcribe with AssemblyAI
      console.log("Transcribing with AssemblyAI")
      const result = await transcribeAudio(audioUrl)

      // Update sermon with transcript and status
      await updateSermon(
        id,
        {
          transcript: result.text,
          status: "processing",
        },
        user.id
      )

      return NextResponse.json({
        success: true,
        transcript: result.text,
        confidence: result.confidence,
      })
    } catch (transcriptionError) {
      // Update sermon status to error
      await updateSermon(
        id,
        {
          status: "error",
        },
        user.id
      )

      console.error("Transcription failed:", transcriptionError)

      return NextResponse.json(
        {
          error: "Transcription failed",
          details:
            transcriptionError instanceof Error
              ? transcriptionError.message
              : "Unknown error",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in transcription route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
