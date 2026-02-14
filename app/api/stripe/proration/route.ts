import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe, PLANS, type PlanId } from "@/lib/stripe/server"
import { getSubscription } from "@/lib/db/subscriptions"

/**
 * POST /api/stripe/proration
 * Preview proration for changing plans
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetPlanId } = await request.json()

    if (!targetPlanId || !PLANS[targetPlanId as PlanId]) {
      return NextResponse.json(
        { error: "Invalid target plan" },
        { status: 400 }
      )
    }

    const subscription = await getSubscription()

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      )
    }

    const targetPlan = PLANS[targetPlanId as PlanId]

    // Get the current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    )

    const currentItem = stripeSubscription.items.data[0]

    if (!currentItem) {
      return NextResponse.json(
        { error: "No subscription items found" },
        { status: 400 }
      )
    }

    // Create a proration preview using upcoming invoice
    const prorationPreview = await stripe.invoices.createPreview({
      customer: subscription.stripe_customer_id,
      subscription: subscription.stripe_subscription_id,
      subscription_details: {
        items: [
          {
            id: currentItem.id,
            price: targetPlan.priceId,
          },
        ],
        proration_behavior: "create_prorations",
      },
    })

    // Calculate the total amount due for the proration preview
    // This is the difference between what they'd pay now vs their current plan
    const prorationAmount = prorationPreview.amount_due

    const nextMonthAmount = targetPlan.price * 100 // Convert to cents for comparison

    // Calculate days remaining in current period
    const now = new Date()
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null
    const daysRemaining = periodEnd
      ? Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    const isUpgrade = targetPlan.price > (PLANS[subscription.plan_id as PlanId]?.price || 0)

    return NextResponse.json({
      currentPlan: subscription.plan_id,
      targetPlan: targetPlanId,
      isUpgrade,
      proration: {
        amount: prorationAmount / 100, // Convert to dollars
        dueNow: prorationAmount > 0 ? prorationAmount / 100 : 0,
        credit: prorationAmount < 0 ? Math.abs(prorationAmount) / 100 : 0,
      },
      nextMonth: {
        amount: nextMonthAmount / 100,
        date: periodEnd?.toISOString() || null,
      },
      daysRemaining,
      message: isUpgrade
        ? prorationAmount > 0
          ? `You'll be charged $${(prorationAmount / 100).toFixed(2)} today for the upgrade, then $${targetPlan.price}/month starting ${periodEnd?.toLocaleDateString() || "next billing cycle"}.`
          : `Your plan will upgrade immediately. You'll be charged $${targetPlan.price}/month starting next billing cycle.`
        : `Your plan will change at the end of your current billing period (${periodEnd?.toLocaleDateString() || "next cycle"}). You'll be charged $${targetPlan.price}/month after that.`,
    })
  } catch (error) {
    console.error("Error calculating proration:", error)
    return NextResponse.json(
      { error: "Failed to calculate proration" },
      { status: 500 }
    )
  }
}
