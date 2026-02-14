import { createClient } from "@/lib/supabase/server"
import type { AnalyticsEventType, ContentType } from "@/types/database"

interface TrackEventOptions {
  userId: string
  sermonId?: string
  eventType: AnalyticsEventType
  eventData?: Record<string, unknown>
}

/**
 * Track an analytics event
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from("analytics_events").insert({
      user_id: options.userId,
      sermon_id: options.sermonId || null,
      event_type: options.eventType,
      event_data: options.eventData || {},
    })
  } catch (error) {
    // Don't throw - analytics should never break the main flow
    console.error("Failed to track analytics event:", error)
  }
}

/**
 * Track sermon creation
 */
export async function trackSermonCreated(
  userId: string,
  sermonId: string,
  inputType: string
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "sermon_created",
    eventData: { input_type: inputType },
  })
}

/**
 * Track content generation
 */
export async function trackContentGenerated(
  userId: string,
  sermonId: string,
  contentType: ContentType
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "content_generated",
    eventData: { content_type: contentType },
  })
}

/**
 * Track content export
 */
export async function trackContentExported(
  userId: string,
  sermonId: string,
  contentType: string,
  format: string
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "content_exported",
    eventData: { content_type: contentType, format },
  })
}

/**
 * Track devotional view (for shared pages)
 */
export async function trackDevotionalViewed(
  userId: string,
  sermonId: string
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "devotional_viewed",
    eventData: {},
  })
}
