import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Mark onboarding step as 1 (started) but not completed
    // This prevents the welcome modal from showing again
    const { error } = await supabase
      .from("users_metadata")
      .update({ onboarding_step: 1 })
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to skip welcome:", error)
      return NextResponse.json({ error: "Failed to skip" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Skip welcome error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
