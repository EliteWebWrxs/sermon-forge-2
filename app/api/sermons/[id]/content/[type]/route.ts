import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getGeneratedContentByType, saveGeneratedContent } from "@/lib/db/generated-content"
import type { ContentType } from "@/types"

interface RouteContext {
  params: Promise<{ id: string; type: string }>
}

const VALID_CONTENT_TYPES: ContentType[] = [
  "sermon_notes",
  "devotional",
  "discussion_guide",
  "social_media",
  "kids_version",
]

/**
 * GET /api/sermons/[id]/content/[type]
 * Fetch specific generated content
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: sermonId, type } = await context.params

    // Validate content type
    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return NextResponse.json(
        { error: `Invalid content type: ${type}` },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns this sermon
    const { data: sermon, error: sermonError } = await supabase
      .from("sermons")
      .select("id")
      .eq("id", sermonId)
      .eq("user_id", user.id)
      .single()

    if (sermonError || !sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Get generated content
    const content = await getGeneratedContentByType(
      sermonId,
      type as ContentType
    )

    if (!content) {
      return NextResponse.json(
        { error: "Content not found. Generate it first." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error("Error fetching generated content:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sermons/[id]/content/[type]
 * Update/edit generated content
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: sermonId, type } = await context.params

    // Validate content type
    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return NextResponse.json(
        { error: `Invalid content type: ${type}` },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns this sermon
    const { data: sermon, error: sermonError } = await supabase
      .from("sermons")
      .select("id")
      .eq("id", sermonId)
      .eq("user_id", user.id)
      .single()

    if (sermonError || !sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: "content is required in request body" },
        { status: 400 }
      )
    }

    // Save updated content
    const updatedContent = await saveGeneratedContent(
      sermonId,
      type as ContentType,
      content
    )

    return NextResponse.json({
      success: true,
      content: updatedContent,
    })
  } catch (error) {
    console.error("Error updating generated content:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
