"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Subscription } from "@/lib/db/subscriptions"
import type { PLANS, PlanId } from "@/lib/stripe/server"

interface SubscriptionWidgetProps {
  subscription: Subscription | null
  plans: typeof PLANS
  monthlySermonCount: number
}

export function SubscriptionWidget({
  subscription,
  plans,
  monthlySermonCount,
}: SubscriptionWidgetProps) {
  const [loading, setLoading] = useState(false)

  const planId = (subscription?.plan_id || "free") as PlanId | "free"
  const plan = planId !== "free" ? plans[planId] : null
  const limit = subscription?.sermon_limit ?? 1
  const isUnlimited = limit === -1
  const usagePercent = isUnlimited ? 0 : Math.min((monthlySermonCount / limit) * 100, 100)
  const isNearLimit = !isUnlimited && usagePercent >= 80
  const isAtLimit = !isUnlimited && monthlySermonCount >= limit

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Portal error:", error)
    } finally {
      setLoading(false)
    }
  }

  // No subscription - show free tier
  if (!subscription || subscription.status === "inactive") {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Free Tier</h3>
            <p className="text-sm text-slate-500">1 sermon per month</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">
            Free
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Sermons this month</span>
            <span className="font-medium text-slate-900">{monthlySermonCount} / 1</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                monthlySermonCount >= 1 ? "bg-red-500" : "bg-slate-400"
              }`}
              style={{ width: `${Math.min(monthlySermonCount * 100, 100)}%` }}
            />
          </div>
        </div>

        <Link href="/pricing">
          <Button className="w-full">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Upgrade Plan
          </Button>
        </Link>
      </div>
    )
  }

  // Active subscription
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-yellow-100 text-yellow-700",
    canceled: "bg-red-100 text-red-700",
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 capitalize">{subscription.plan_id} Plan</h3>
          <p className="text-sm text-slate-500">${plan?.price}/month</p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
            statusColors[subscription.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {subscription.status}
        </span>
      </div>

      {/* Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">Sermons this month</span>
          <span className={`font-medium ${isAtLimit ? "text-red-600" : "text-slate-900"}`}>
            {monthlySermonCount} / {isUnlimited ? "Unlimited" : limit}
          </span>
        </div>
        {!isUnlimited && (
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isAtLimit
                  ? "bg-red-500"
                  : isNearLimit
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        )}
        {isUnlimited && (
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
        )}
      </div>

      {/* Warning if near/at limit */}
      {isAtLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700">
            You've reached your monthly limit.{" "}
            <Link href="/pricing" className="font-medium underline">
              Upgrade now
            </Link>
          </p>
        </div>
      )}
      {isNearLimit && !isAtLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-700">
            You're approaching your monthly limit.
          </p>
        </div>
      )}

      {/* Renewal info */}
      {subscription.current_period_end && (
        <p className="text-xs text-slate-500 mb-4">
          {subscription.cancel_at_period_end ? "Cancels" : "Renews"}{" "}
          {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleManageBilling}
          loading={loading}
          variant="secondary"
          className="flex-1"
        >
          Manage Billing
        </Button>
        {subscription.plan_id !== "enterprise" && (
          <Link href="/pricing" className="flex-1">
            <Button variant="ghost" className="w-full">
              Upgrade
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
