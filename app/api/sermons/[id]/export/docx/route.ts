import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSermonById } from "@/lib/db/sermons"
import { getGeneratedContentByType } from "@/lib/db/generated-content"
import { generateSermonNotesDocx } from "@/lib/docx/sermon-notes-docx"
import { trackContentExported } from "@/lib/analytics/track"
import { format } from "date-fns"

/**
 * Fetch image and convert to Buffer for embedding in DOCX
 */
async function fetchLogoAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error("Failed to fetch logo:", error)
    return null
  }
}

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/sermons/[id]/export/docx
 * Export sermon notes as DOCX
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

    // Fetch logo as buffer if URL exists
    let logoBuffer: Buffer | null = null
    if (userMetadata?.church_logo_url) {
      logoBuffer = await fetchLogoAsBuffer(userMetadata.church_logo_url)
    }

    // Format date
    const formattedDate = format(new Date(sermon.sermon_date), "MMMM d, yyyy")

    // Generate DOCX with branding
    const blob = await generateSermonNotesDocx({
      title: sermon.title,
      date: formattedDate,
      branding: {
        churchName: userMetadata?.church_name,
        churchLogoUrl: userMetadata?.church_logo_url,
        churchLogoBuffer: logoBuffer,
        primaryColor: userMetadata?.primary_color,
        secondaryColor: userMetadata?.secondary_color,
        fontPreference: userMetadata?.font_preference,
      },
      content: sermonNotes.content as any,
    })

    // Convert blob to buffer
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Track export
    await trackContentExported(user.id, sermonId, "sermon_notes", "docx")

    // Generate filename
    const filename = `${sermon.title.replace(/[^a-z0-9]/gi, "_")}_Sermon_Notes.docx`

    // Return DOCX file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating DOCX:", error)
    return NextResponse.json(
      {
        error: "Failed to generate DOCX",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
