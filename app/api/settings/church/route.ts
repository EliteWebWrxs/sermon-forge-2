import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { churchName, churchWebsite, churchLogoUrl, churchSize, denomination } = body

    const supabase = await createClient()

    // Update or insert user metadata
    const { error } = await supabase
      .from("users_metadata")
      .upsert({
        user_id: user.id,
        church_name: churchName || null,
        church_website: churchWebsite || null,
        church_logo_url: churchLogoUrl || null,
        church_size: churchSize || null,
        denomination: denomination || null,
      }, {
        onConflict: "user_id",
      })

    if (error) {
      console.error("Error updating church settings:", error)
      return NextResponse.json(
        { error: "Failed to update church settings" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Church settings update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
