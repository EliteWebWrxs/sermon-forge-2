import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSermonById } from "@/lib/db/sermons"
import { getGeneratedContentByType } from "@/lib/db/generated-content"
import { generateSermonNotesPDF } from "@/lib/pdf/sermon-notes-pdf"
import { trackContentExported } from "@/lib/analytics/track"
import { format } from "date-fns"

/**
 * Fetch image and convert to base64 for embedding in PDF
 */
async function fetchLogoAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/png"

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error("Failed to fetch logo:", error)
    return null
  }
}

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/sermons/[id]/export/pdf
 * Export sermon notes as PDF
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

    // Fetch logo as base64 if URL exists
    let logoBase64: string | null = null
    if (userMetadata?.church_logo_url) {
      logoBase64 = await fetchLogoAsBase64(userMetadata.church_logo_url)
    }

    // Format date
    const formattedDate = format(new Date(sermon.sermon_date), "MMMM d, yyyy")

    // Generate PDF with branding
    const doc = generateSermonNotesPDF({
      title: sermon.title,
      date: formattedDate,
      branding: {
        churchName: userMetadata?.church_name,
        churchLogoUrl: userMetadata?.church_logo_url,
        churchLogoBase64: logoBase64,
        primaryColor: userMetadata?.primary_color,
        secondaryColor: userMetadata?.secondary_color,
        fontPreference: userMetadata?.font_preference,
      },
      content: sermonNotes.content as any,
    })

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // Track export
    await trackContentExported(user.id, sermonId, "sermon_notes", "pdf")

    // Generate filename
    const filename = `${sermon.title.replace(/[^a-z0-9]/gi, "_")}_Sermon_Notes.pdf`

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
