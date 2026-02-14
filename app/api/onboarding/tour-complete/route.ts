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
      .update({ product_tour_completed: true })
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to complete tour:", error)
      return NextResponse.json({ error: "Failed to complete tour" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tour complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
