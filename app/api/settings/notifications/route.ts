import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import type { NotificationPreferences } from "@/types"

export async function PUT(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json() as NotificationPreferences

    // Validate the notification preferences object
    const validKeys = [
      "processing_complete",
      "payment_issues",
      "usage_warnings",
      "weekly_digest",
      "product_updates",
    ]

    const preferences: NotificationPreferences = {
      processing_complete: Boolean(body.processing_complete),
      payment_issues: Boolean(body.payment_issues),
      usage_warnings: Boolean(body.usage_warnings),
      weekly_digest: Boolean(body.weekly_digest),
      product_updates: Boolean(body.product_updates),
    }

    const supabase = await createClient()

    // Update or insert user metadata
    const { error } = await supabase
      .from("users_metadata")
      .upsert({
        user_id: user.id,
        notification_preferences: preferences,
      }, {
        onConflict: "user_id",
      })

    if (error) {
      console.error("Error updating notification preferences:", error)
      return NextResponse.json(
        { error: "Failed to update notification preferences" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification preferences update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users_metadata")
      .select("notification_preferences")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching notification preferences:", error)
      return NextResponse.json(
        { error: "Failed to fetch notification preferences" },
        { status: 500 }
      )
    }

    const defaultPreferences: NotificationPreferences = {
      processing_complete: true,
      payment_issues: true,
      usage_warnings: true,
      weekly_digest: false,
      product_updates: true,
    }

    return NextResponse.json({
      preferences: data?.notification_preferences || defaultPreferences,
    })
  } catch (error) {
    console.error("Notification preferences fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
