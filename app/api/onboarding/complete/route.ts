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

    const { error } = await supabase
      .from("users_metadata")
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_step: 4,
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to complete onboarding:", error)
      return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
