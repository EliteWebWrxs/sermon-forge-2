import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/settings/branding/logo
 * Upload church logo to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (PNG, JPG, WebP, GIF, SVG)
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be a PNG, JPG, WebP, GIF, or SVG image" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "png"
    const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Delete old logo if exists
    const { data: existingFiles } = await supabase.storage
      .from("church-logos")
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from("church-logos").remove(filesToDelete)
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("church-logos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload logo" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("church-logos")
      .getPublicUrl(fileName)

    // Update user metadata with logo URL
    await supabase
      .from("users_metadata")
      .update({ church_logo_url: urlData.publicUrl })
      .eq("user_id", user.id)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error("Error uploading logo:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/settings/branding/logo
 * Delete church logo from Supabase Storage
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // List and delete all logos for this user
    const { data: existingFiles } = await supabase.storage
      .from("church-logos")
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from("church-logos").remove(filesToDelete)
    }

    // Clear logo URL from user metadata
    await supabase
      .from("users_metadata")
      .update({ church_logo_url: null })
      .eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting logo:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
