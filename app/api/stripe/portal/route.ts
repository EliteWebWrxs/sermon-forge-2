import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPortalSession } from "@/lib/stripe/server"
import { getSubscription } from "@/lib/db/subscriptions"

/**
 * POST /api/stripe/portal
 * Create a Stripe Customer Portal session
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription to find Stripe customer ID
    const subscription = await getSubscription()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const session = await createPortalSession(
      subscription.stripe_customer_id,
      `${appUrl}/settings/billing`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Portal session error:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}
