"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { updateSermon } from "@/lib/db/sermons"

export async function triggerContentGeneration(sermonId: string) {
  const user = await requireAuth()

  try {
    // Update sermon status to 'generating'
    await updateSermon(
      sermonId,
      {
        status: "generating",
      },
      user.id
    )

    // TODO: Trigger actual content generation job
    // This will be implemented later with Claude API integration

    revalidatePath(`/sermons/${sermonId}`)

    return { success: true }
  } catch (error) {
    console.error("Error triggering content generation:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to trigger content generation",
    }
  }
}
