import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkSermonLimits } from "@/lib/subscriptions/check-limits"

/**
 * GET /api/subscriptions/usage
 * Returns current usage stats, plan details, and billing info
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

    const usage = await checkSermonLimits(user.id)

    return NextResponse.json({
      allowed: usage.allowed,
      current: usage.current,
      limit: usage.limit,
      isUnlimited: usage.isUnlimited,
      percentUsed: usage.percentUsed,
      remaining: usage.remaining,
      plan: {
        id: usage.planId,
        name: usage.planName,
      },
      status: usage.status,
      billingPeriod: {
        start: usage.billingPeriod.start?.toISOString() || null,
        end: usage.billingPeriod.end?.toISOString() || null,
        daysRemaining: usage.billingPeriod.daysRemaining,
      },
      message: usage.message,
    })
  } catch (error) {
    console.error("Error fetching usage:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    )
  }
}
