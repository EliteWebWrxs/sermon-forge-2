import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSermonById } from "@/lib/db/sermons"
import { getGeneratedContentByType } from "@/lib/db/generated-content"
import { generateDiscussionGuideDocx } from "@/lib/docx/discussion-guide-docx"
import type { DiscussionGuideOutput } from "@/lib/ai/discussion-guide-generator"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get sermon
    const sermon = await getSermonById(id, user.id)
    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Get discussion guide content
    const discussionGuide = await getGeneratedContentByType(id, "discussion_guide")
    if (!discussionGuide) {
      return NextResponse.json(
        { error: "Discussion guide not found" },
        { status: 404 }
      )
    }

    // Get user metadata for church branding
    const { data: userMetadata } = await supabase
      .from("users_metadata")
      .select("church_name")
      .eq("user_id", user.id)
      .single()

    const content = discussionGuide.content as DiscussionGuideOutput

    // Generate DOCX
    const docxBlob = await generateDiscussionGuideDocx({
      title: sermon.title,
      date: new Date(sermon.sermon_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      churchName: userMetadata?.church_name || undefined,
      content,
    })

    // Convert blob to buffer
    const buffer = Buffer.from(await docxBlob.arrayBuffer())

    // Return DOCX
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${sermon.title.replace(/[^a-z0-9]/gi, "_")}_Discussion_Guide.docx"`,
      },
    })
  } catch (error) {
    console.error("Error generating discussion guide DOCX:", error)
    return NextResponse.json(
      { error: "Failed to generate DOCX" },
      { status: 500 }
    )
  }
}
