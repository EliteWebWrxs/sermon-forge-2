import { getSubscriptionByUserId, getMonthlySermonCount, isOnTrial, getTrialDaysRemaining } from "@/lib/db/subscriptions"
import { PLANS, type PlanId } from "@/lib/stripe/server"

export interface UsageInfo {
  allowed: boolean
  current: number
  limit: number
  isUnlimited: boolean
  percentUsed: number
  remaining: number
  planId: PlanId | "free"
  planName: string
  status: "active" | "trialing" | "past_due" | "canceled" | "inactive"
  billingPeriod: {
    start: Date | null
    end: Date | null
    daysRemaining: number | null
  }
  trial?: {
    isOnTrial: boolean
    daysRemaining: number
    endsAt: Date | null
  }
  message?: string
}

/**
 * Check if a user can process a sermon and get detailed usage info
 */
export async function checkSermonLimits(userId: string): Promise<UsageInfo> {
  const subscription = await getSubscriptionByUserId(userId)
  const monthlyCount = await getMonthlySermonCount(userId)

  // No subscription = free tier
  if (!subscription) {
    const freeLimit = 1
    const allowed = monthlyCount < freeLimit

    // Calculate days until month end for free tier
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      allowed,
      current: monthlyCount,
      limit: freeLimit,
      isUnlimited: false,
      percentUsed: Math.min((monthlyCount / freeLimit) * 100, 100),
      remaining: Math.max(freeLimit - monthlyCount, 0),
      planId: "free",
      planName: "Free",
      status: "active",
      billingPeriod: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfMonth,
        daysRemaining,
      },
      message: allowed
        ? undefined
        : "You've used your free sermon this month. Upgrade to continue.",
    }
  }

  const planId = subscription.plan_id as PlanId
  const plan = PLANS[planId]
  const isUnlimited = subscription.sermon_limit === -1
  const limit = subscription.sermon_limit
  const status = subscription.status as UsageInfo["status"]

  // Check trial status
  const onTrial = isOnTrial(subscription)
  const trialDaysRemaining = getTrialDaysRemaining(subscription)
  const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end) : null

  // Parse billing period dates
  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start)
    : null
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null

  // Calculate days remaining in billing period (use trial end for trials)
  let daysRemaining: number | null = null
  const endDate = onTrial && trialEndsAt ? trialEndsAt : periodEnd
  if (endDate) {
    const now = new Date()
    daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
  }

  // Check if subscription is active
  const isActive = status === "active" || status === "trialing"

  // Trial info to include in response
  const trialInfo = onTrial
    ? {
        isOnTrial: true,
        daysRemaining: trialDaysRemaining,
        endsAt: trialEndsAt,
      }
    : undefined

  if (!isActive) {
    return {
      allowed: false,
      current: monthlyCount,
      limit,
      isUnlimited,
      percentUsed: isUnlimited ? 0 : Math.min((monthlyCount / limit) * 100, 100),
      remaining: isUnlimited ? -1 : Math.max(limit - monthlyCount, 0),
      planId,
      planName: plan?.name || planId,
      status,
      billingPeriod: {
        start: periodStart,
        end: periodEnd,
        daysRemaining,
      },
      trial: trialInfo,
      message: status === "past_due"
        ? "Payment failed. Please update your payment method to continue."
        : "Your subscription is inactive. Please renew to continue.",
    }
  }

  // Unlimited plan - always allowed
  if (isUnlimited) {
    return {
      allowed: true,
      current: monthlyCount,
      limit: -1,
      isUnlimited: true,
      percentUsed: 0,
      remaining: -1,
      planId,
      planName: plan?.name || planId,
      status,
      billingPeriod: {
        start: periodStart,
        end: periodEnd,
        daysRemaining,
      },
      trial: trialInfo,
    }
  }

  // Check against limit
  const allowed = monthlyCount < limit
  const remaining = Math.max(limit - monthlyCount, 0)
  const percentUsed = Math.min((monthlyCount / limit) * 100, 100)

  // Build message based on trial status
  let message: string | undefined
  if (!allowed) {
    message = onTrial
      ? `You've used your ${limit} trial sermons. Subscribe now for more!`
      : `You've reached your ${limit} sermon limit. Upgrade for more.`
  } else if (remaining === 1) {
    message = onTrial
      ? `1 trial sermon remaining. ${trialDaysRemaining} days left in your trial.`
      : "You have 1 sermon remaining this billing period."
  }

  return {
    allowed,
    current: monthlyCount,
    limit,
    isUnlimited: false,
    percentUsed,
    remaining,
    planId,
    planName: onTrial ? `${plan?.name || planId} (Trial)` : (plan?.name || planId),
    status,
    billingPeriod: {
      start: periodStart,
      end: onTrial ? trialEndsAt : periodEnd,
      daysRemaining,
    },
    trial: trialInfo,
    message,
  }
}

/**
 * Quick check if user can process a sermon (used in API routes)
 */
export async function canProcessSermon(userId: string): Promise<{
  allowed: boolean
  message?: string
}> {
  const usage = await checkSermonLimits(userId)
  return {
    allowed: usage.allowed,
    message: usage.message,
  }
}
