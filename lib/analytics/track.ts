import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { AnalyticsEventType, ContentType } from "@/types/database"

interface TrackEventOptions {
  userId: string
  sermonId?: string
  eventType: AnalyticsEventType
  eventData?: Record<string, unknown>
  useServiceClient?: boolean
}

/**
 * Track an analytics event
 * @param useServiceClient - Use service client for background jobs (bypasses RLS)
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  try {
    const supabase = options.useServiceClient
      ? createServiceClient()
      : await createClient()

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
  inputType: string,
  useServiceClient = false
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "sermon_created",
    eventData: { input_type: inputType },
    useServiceClient,
  })
}

/**
 * Track content generation
 */
export async function trackContentGenerated(
  userId: string,
  sermonId: string,
  contentType: ContentType,
  useServiceClient = false
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "content_generated",
    eventData: { content_type: contentType },
    useServiceClient,
  })
}

/**
 * Track content export
 */
export async function trackContentExported(
  userId: string,
  sermonId: string,
  contentType: string,
  format: string,
  useServiceClient = false
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "content_exported",
    eventData: { content_type: contentType, format },
    useServiceClient,
  })
}

/**
 * Track devotional view (for shared pages)
 */
export async function trackDevotionalViewed(
  userId: string,
  sermonId: string,
  useServiceClient = false
): Promise<void> {
  await trackEvent({
    userId,
    sermonId,
    eventType: "devotional_viewed",
    eventData: {},
    useServiceClient,
  })
}
