import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PNG, JPG, WebP, or GIF." },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate unique filename
    const ext = file.name.split(".").pop()
    const filename = `${user.id}/profile.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filename)

    // Update user metadata
    const { error: updateError } = await supabase
      .from("users_metadata")
      .upsert({
        user_id: user.id,
        profile_picture_url: publicUrl,
      }, {
        onConflict: "user_id",
      })

    if (updateError) {
      console.error("Error updating profile picture URL:", updateError)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Profile photo upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Remove profile picture URL from metadata
    const { error } = await supabase
      .from("users_metadata")
      .update({ profile_picture_url: null })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error removing profile picture:", error)
      return NextResponse.json(
        { error: "Failed to remove photo" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile photo removal error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
