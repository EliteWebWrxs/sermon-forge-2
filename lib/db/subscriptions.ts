import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { PlanId } from "@/lib/stripe/server"

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  plan_id: PlanId
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  sermon_count: number
  sermon_limit: number
  // Trial fields
  trial_end: string | null
  trial_sermon_limit: number
  had_trial: boolean
  created_at: string
  updated_at: string
}

/**
 * Check if subscription is currently in trial
 */
export function isOnTrial(subscription: Subscription | null): boolean {
  if (!subscription) return false
  if (subscription.status !== "trialing") return false
  if (!subscription.trial_end) return false
  return new Date(subscription.trial_end) > new Date()
}

/**
 * Get trial days remaining
 */
export function getTrialDaysRemaining(subscription: Subscription | null): number {
  if (!subscription?.trial_end) return 0
  if (subscription.status !== "trialing") return 0

  const now = new Date()
  const trialEnd = new Date(subscription.trial_end)
  const diff = trialEnd.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Get subscription for the current user
 */
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    console.error("Error fetching subscription:", error)
    return null
  }

  return data
}

/**
 * Get subscription by user ID (for server-side use)
 */
export async function getSubscriptionByUserId(
  userId: string
): Promise<Subscription | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Error fetching subscription:", error)
    return null
  }

  return data
}

/**
 * Create or update subscription (used by webhooks)
 */
export async function upsertSubscription(
  userId: string,
  data: Partial<Subscription>
): Promise<Subscription | null> {
  const supabase = createServiceClient()

  const { data: result, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single()

  if (error) {
    console.error("Error upserting subscription:", error)
    return null
  }

  return result
}

/**
 * Update subscription by Stripe subscription ID
 */
export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<Subscription>
): Promise<Subscription | null> {
  const supabase = createServiceClient()

  const { data: result, error } = await supabase
    .from("subscriptions")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating subscription:", error)
    return null
  }

  return result
}

/**
 * Get user's current month sermon count
 */
export async function getMonthlySermonCount(userId: string): Promise<number> {
  const supabase = createServiceClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from("sermons")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString())

  if (error) {
    console.error("Error counting sermons:", error)
    return 0
  }

  return count || 0
}

/**
 * Check if user can create more sermons
 */
export async function canCreateSermon(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  message?: string
}> {
  const subscription = await getSubscriptionByUserId(userId)

  // No subscription = free tier (limited)
  if (!subscription) {
    const count = await getMonthlySermonCount(userId)
    const freeLimit = 1 // 1 free sermon per month
    return {
      allowed: count < freeLimit,
      current: count,
      limit: freeLimit,
      message:
        count >= freeLimit
          ? "Free tier limit reached. Upgrade to create more sermons."
          : undefined,
    }
  }

  // Check subscription status
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return {
      allowed: false,
      current: subscription.sermon_count,
      limit: subscription.sermon_limit,
      message: "Your subscription is inactive. Please update your payment method.",
    }
  }

  // Unlimited plan
  if (subscription.sermon_limit === -1) {
    return {
      allowed: true,
      current: subscription.sermon_count,
      limit: -1,
    }
  }

  // Check against limit
  const count = await getMonthlySermonCount(userId)
  return {
    allowed: count < subscription.sermon_limit,
    current: count,
    limit: subscription.sermon_limit,
    message:
      count >= subscription.sermon_limit
        ? "Monthly sermon limit reached. Upgrade for more."
        : undefined,
  }
}
