import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface AnalyticsSummary {
  sermonsCreated: number
  contentGenerated: number
  contentExported: number
  devotionalViews: number
  contentByType: Record<string, number>
  exportsByFormat: Record<string, number>
  dailyActivity: Array<{
    date: string
    sermons: number
    generated: number
    exported: number
  }>
  mostPopularContentType: string | null
}

/**
 * GET /api/analytics/summary
 * Get analytics summary for the current user
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

    // Get date range from query params (default: last 30 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30", 10)
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

    // Process events
    const summary: AnalyticsSummary = {
      sermonsCreated: 0,
      contentGenerated: 0,
      contentExported: 0,
      devotionalViews: 0,
      contentByType: {},
      exportsByFormat: {},
      dailyActivity: [],
      mostPopularContentType: null,
    }

    const dailyMap = new Map<
      string,
      { sermons: number; generated: number; exported: number }
    >()

    for (const event of events || []) {
      // Extract date in YYYY-MM-DD format (UTC)
      const date = new Date(event.created_at).toISOString().split("T")[0]

      // Initialize daily entry if needed
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { sermons: 0, generated: 0, exported: 0 })
      }
      const daily = dailyMap.get(date)!

      switch (event.event_type) {
        case "sermon_created":
          summary.sermonsCreated++
          daily.sermons++
          break
        case "content_generated":
          summary.contentGenerated++
          daily.generated++
          const contentType = (event.event_data as Record<string, string>)?.content_type
          if (contentType) {
            summary.contentByType[contentType] =
              (summary.contentByType[contentType] || 0) + 1
          }
          break
        case "content_exported":
          summary.contentExported++
          daily.exported++
          const format = (event.event_data as Record<string, string>)?.format
          if (format) {
            summary.exportsByFormat[format] =
              (summary.exportsByFormat[format] || 0) + 1
          }
          break
        case "devotional_viewed":
          summary.devotionalViews++
          break
      }
    }

    // Convert daily map to array
    summary.dailyActivity = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Find most popular content type
    let maxCount = 0
    for (const [type, count] of Object.entries(summary.contentByType)) {
      if (count > maxCount) {
        maxCount = count
        summary.mostPopularContentType = type
      }
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error in analytics summary:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
