import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { getSubscription } from "@/lib/db/subscriptions"
import { PLANS, type PlanId } from "@/lib/stripe/server"
import { BillingClient } from "./billing-client"

export const metadata: Metadata = {
  title: "Billing & Subscription",
}

export default async function BillingPage() {
  const user = await requireAuth()
  const subscription = await getSubscription()

  const currentPlan = subscription?.plan_id as PlanId | undefined
  const planDetails = currentPlan ? PLANS[currentPlan] : null

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-slate-500">
          Manage your subscription and billing details
        </p>
      </div>

      <BillingClient
        subscription={subscription}
        plans={PLANS}
        currentPlan={currentPlan}
      />
    </div>
  )
}
