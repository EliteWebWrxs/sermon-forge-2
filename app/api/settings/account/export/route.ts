import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Mark data export as requested
    const { error } = await supabase
      .from("users_metadata")
      .update({
        data_export_requested_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error requesting data export:", error)
      return NextResponse.json(
        { error: "Failed to request data export" },
        { status: 500 }
      )
    }

    // In a production app, you would:
    // 1. Queue a background job to compile all user data
    // 2. Generate a downloadable archive (ZIP)
    // 3. Store it temporarily and send an email with download link
    // For now, we just mark the request

    return NextResponse.json({
      success: true,
      message: "Data export requested. You will receive an email when it's ready."
    })
  } catch (error) {
    console.error("Data export request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
