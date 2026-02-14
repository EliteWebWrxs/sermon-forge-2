import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  PLANS,
  TRIAL_CONFIG,
  getOrCreateCustomer,
  createCheckoutSession,
  type PlanId,
} from "@/lib/stripe/server"
import { getSubscription, upsertSubscription } from "@/lib/db/subscriptions"

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, skipTrial } = body as { planId: PlanId; skipTrial?: boolean }

    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const plan = PLANS[planId]

    if (!plan.priceId) {
      return NextResponse.json(
        { error: "Plan not configured. Please contact support." },
        { status: 500 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      user.id,
      user.email,
      user.user_metadata?.full_name
    )

    // Check if user is eligible for trial (no previous subscription)
    const existingSubscription = await getSubscription()
    const hasHadSubscription = existingSubscription?.stripe_subscription_id != null
    const isEligibleForTrial = !hasHadSubscription && !skipTrial

    // Ensure subscription record exists
    await upsertSubscription(user.id, {
      stripe_customer_id: customerId,
      plan_id: planId,
      status: "incomplete",
    })

    // Create checkout session with trial for eligible new users
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const session = await createCheckoutSession(
      customerId,
      plan.priceId,
      user.id,
      `${appUrl}/settings/billing?success=true`,
      `${appUrl}/settings/billing?canceled=true`,
      {
        trialDays: isEligibleForTrial ? TRIAL_CONFIG.durationDays : undefined,
        isNewUser: isEligibleForTrial,
      }
    )

    return NextResponse.json({
      url: session.url,
      hasTrial: isEligibleForTrial,
      trialDays: isEligibleForTrial ? TRIAL_CONFIG.durationDays : 0,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
