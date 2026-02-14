import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// Delete account
export async function DELETE() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Mark account for deletion (actual deletion should be handled by a background job)
    const { error } = await supabase
      .from("users_metadata")
      .update({
        account_deletion_requested_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error marking account for deletion:", error)
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
