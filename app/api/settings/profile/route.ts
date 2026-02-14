import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { displayName, churchName, timezone } = body

    const supabase = await createClient()

    // Update or insert user metadata
    const { error } = await supabase
      .from("users_metadata")
      .upsert({
        user_id: user.id,
        display_name: displayName || null,
        church_name: churchName || null,
        timezone: timezone || "America/New_York",
      }, {
        onConflict: "user_id",
      })

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
