"use server";

import { requireAuth } from "@/lib/auth";
import { createSermon } from "@/lib/db/sermons";
import { canProcessSermon } from "@/lib/subscriptions/check-limits";
import type { InputType } from "@/types";

interface CreateSermonInput {
  title: string;
  sermon_date: string;
  input_type: InputType;
  audio_url?: string;
  video_url?: string;
  pdf_url?: string;
  youtube_url?: string;
  transcript?: string;
}

export async function createSermonAction(input: CreateSermonInput) {
  const user = await requireAuth();

  // Check subscription limits before creating sermon
  const limitCheck = await canProcessSermon(user.id);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || "Monthly sermon limit reached. Please upgrade your plan.");
  }

  // All new sermons start as "draft"
  // Status changes to processing/transcribing/generating when user triggers it
  // Status becomes "complete" only after content is generated
  const status = "draft";

  try {
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
    });

    return { id: sermon.id };
  } catch (error) {
    console.error("Error creating sermon:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create sermon";
    throw new Error(message);
  }
}
