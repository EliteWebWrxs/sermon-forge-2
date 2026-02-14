import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/analytics/export
 * Export analytics data as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range from query params (default: last 90 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "90", 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch all events for the user in date range
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching analytics:", error)
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      )
    }

    // Build CSV content
    const headers = ["Date", "Time", "Event Type", "Content Type", "Format", "Sermon ID"]
    const rows: string[][] = []

    for (const event of events || []) {
      const date = new Date(event.created_at)
      const eventData = event.event_data as Record<string, string> || {}

      rows.push([
        date.toLocaleDateString("en-US"),
        date.toLocaleTimeString("en-US"),
        formatEventType(event.event_type),
        eventData.content_type || "",
        eventData.format || "",
        event.sermon_id || "",
      ])
    }

    // Generate CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="sermonforge_analytics_${formatDate(new Date())}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    sermon_created: "Sermon Created",
    content_generated: "Content Generated",
    content_exported: "Content Exported",
    devotional_viewed: "Devotional Viewed",
  }
  return labels[type] || type
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}
