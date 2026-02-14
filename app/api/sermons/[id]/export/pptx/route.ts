import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSermonById } from "@/lib/db/sermons"
import { getGeneratedContentByType } from "@/lib/db/generated-content"
import { generateSermonNotesPPTXBuffer } from "@/lib/pptx/sermon-notes-pptx"
import { trackContentExported } from "@/lib/analytics/track"
import { format } from "date-fns"

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/sermons/[id]/export/pptx
 * Export sermon notes as PowerPoint presentation
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: sermonId } = await context.params

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the sermon
    const sermon = await getSermonById(sermonId, user.id)

    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 })
    }

    // Get sermon notes content
    const sermonNotes = await getGeneratedContentByType(sermonId, "sermon_notes")

    if (!sermonNotes) {
      return NextResponse.json(
        {
          error:
            "Sermon notes not found. Please generate sermon notes first.",
        },
        { status: 404 }
      )
    }

    // Get user metadata for church branding (including colors)
    const { data: userMetadata } = await supabase
      .from("users_metadata")
      .select("church_name, church_logo_url, primary_color, secondary_color, font_preference")
      .eq("user_id", user.id)
      .single()

    // Format date
    const formattedDate = format(new Date(sermon.sermon_date), "MMMM d, yyyy")

    // Generate PPTX with branding
    const pptxBuffer = await generateSermonNotesPPTXBuffer({
      title: sermon.title,
      date: formattedDate,
      branding: {
        churchName: userMetadata?.church_name,
        churchLogoUrl: userMetadata?.church_logo_url,
        primaryColor: userMetadata?.primary_color,
        secondaryColor: userMetadata?.secondary_color,
        fontPreference: userMetadata?.font_preference,
      },
      content: sermonNotes.content as any,
    })

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(pptxBuffer)

    // Track export
    await trackContentExported(user.id, sermonId, "sermon_notes", "pptx")

    // Generate filename
    const filename = `${sermon.title.replace(/[^a-z0-9]/gi, "_")}_Sermon_Notes.pptx`

    // Return PPTX file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating PPTX:", error)
    return NextResponse.json(
      {
        error: "Failed to generate PowerPoint",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
