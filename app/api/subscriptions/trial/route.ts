import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getSubscription,
  isOnTrial,
  getTrialDaysRemaining,
  getMonthlySermonCount,
} from "@/lib/db/subscriptions"
import { TRIAL_CONFIG, PLANS, type PlanId } from "@/lib/stripe/server"

/**
 * GET /api/subscriptions/trial
 * Returns trial status and info for current user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await getSubscription()

    // No subscription - not on trial
    if (!subscription) {
      return NextResponse.json({
        isOnTrial: false,
        isEligibleForTrial: true,
        hadTrial: false,
        trialConfig: {
          durationDays: TRIAL_CONFIG.durationDays,
          sermonLimit: TRIAL_CONFIG.sermonLimit,
        },
      })
    }

    const onTrial = isOnTrial(subscription)
    const daysRemaining = getTrialDaysRemaining(subscription)
    const sermonsUsed = await getMonthlySermonCount(user.id)
    const planId = subscription.plan_id as PlanId
    const plan = PLANS[planId]

    return NextResponse.json({
      isOnTrial: onTrial,
      isEligibleForTrial: !subscription.had_trial,
      hadTrial: subscription.had_trial,
      trial: onTrial
        ? {
            daysRemaining,
            endsAt: subscription.trial_end,
            sermonLimit: subscription.trial_sermon_limit,
            sermonsUsed,
            sermonsRemaining: Math.max(0, subscription.trial_sermon_limit - sermonsUsed),
          }
        : null,
      subscription: {
        planId: subscription.plan_id,
        planName: plan?.name || subscription.plan_id,
        status: subscription.status,
        hasPaymentMethod: true, // Card is required for trial
      },
      trialConfig: {
        durationDays: TRIAL_CONFIG.durationDays,
        sermonLimit: TRIAL_CONFIG.sermonLimit,
      },
    })
  } catch (error) {
    console.error("Error fetching trial status:", error)
    return NextResponse.json(
      { error: "Failed to fetch trial status" },
      { status: 500 }
    )
  }
}
