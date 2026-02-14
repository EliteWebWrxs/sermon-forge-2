import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { step } = body

    const supabase = await createClient()

    const { error } = await supabase
      .from("users_metadata")
      .update({ onboarding_step: step })
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to save onboarding progress:", error)
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }

    return NextResponse.json({ success: true, step })
  } catch (error) {
    console.error("Onboarding progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
