import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * PUT /api/settings/branding
 * Update user's branding preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { churchName, churchLogoUrl, primaryColor, secondaryColor, fontPreference } = body

    // Validate hex colors
    const hexPattern = /^#[0-9A-Fa-f]{6}$/
    if (primaryColor && !hexPattern.test(primaryColor)) {
      return NextResponse.json(
        { error: "Invalid primary color format. Use hex format (e.g., #1E3A8A)" },
        { status: 400 }
      )
    }
    if (secondaryColor && !hexPattern.test(secondaryColor)) {
      return NextResponse.json(
        { error: "Invalid secondary color format. Use hex format (e.g., #3B82F6)" },
        { status: 400 }
      )
    }

    // Validate font preference
    const validFonts = ["inter", "roboto", "open-sans", "lato", "montserrat", "poppins"]
    if (fontPreference && !validFonts.includes(fontPreference)) {
      return NextResponse.json(
        { error: "Invalid font preference" },
        { status: 400 }
      )
    }

    // Update user metadata
    const { error } = await supabase
      .from("users_metadata")
      .update({
        church_name: churchName || null,
        church_logo_url: churchLogoUrl || null,
        primary_color: primaryColor || null,
        secondary_color: secondaryColor || null,
        font_preference: fontPreference || null,
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error updating branding:", error)
      return NextResponse.json(
        { error: "Failed to update branding settings" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in branding update:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/settings/branding
 * Get user's branding preferences
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("users_metadata")
      .select("church_name, church_logo_url, primary_color, secondary_color, font_preference")
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching branding:", error)
      return NextResponse.json(
        { error: "Failed to fetch branding settings" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      churchName: data?.church_name || "",
      churchLogoUrl: data?.church_logo_url || "",
      primaryColor: data?.primary_color || "#1E3A8A",
      secondaryColor: data?.secondary_color || "#3B82F6",
      fontPreference: data?.font_preference || "inter",
    })
  } catch (error) {
    console.error("Error in branding fetch:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
