"use server"

import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { createSermon } from "@/lib/db/sermons"
import type { InputType } from "@/types"

interface CreateSermonInput {
  title: string
  sermon_date: string
  input_type: InputType
  audio_url?: string
  video_url?: string
  pdf_url?: string
  youtube_url?: string
  transcript?: string
}

export async function createSermonAction(input: CreateSermonInput) {
  const user = await requireAuth()

  try {
    // Determine initial status based on input type
    let status: "uploading" | "processing" | "transcribing" = "uploading"

    if (input.input_type === "text_paste" || input.input_type === "pdf") {
      // Skip transcription if we already have text
      status = "processing"
    } else if (
      input.input_type === "audio" ||
      input.input_type === "video" ||
      input.input_type === "youtube"
    ) {
      // Need transcription for these
      status = "transcribing"
    }

    const sermon = await createSermon({
      user_id: user.id,
      title: input.title,
      sermon_date: input.sermon_date,
      input_type: input.input_type,
      audio_url: input.audio_url || null,
      video_url: input.video_url || null,
      pdf_url: input.pdf_url || null,
      youtube_url: input.youtube_url || null,
      transcript: input.transcript || null,
      status,
    })

    redirect(`/sermons/${sermon.id}`)
  } catch (error) {
    console.error("Error creating sermon:", error)
    throw new Error("Failed to create sermon")
  }
}
