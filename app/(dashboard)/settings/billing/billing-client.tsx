"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { handleApiError } from "@/lib/toast"
import type { Subscription } from "@/lib/db/subscriptions"
import type { PLANS, PlanId } from "@/lib/stripe/server"

interface Invoice {
  id: string
  number: string | null
  amount: number
  currency: string
  status: string
  date: string
  pdfUrl: string | null
  description: string | null
}

interface ProrationPreview {
  currentPlan: string
  targetPlan: string
  isUpgrade: boolean
  proration: {
    amount: number
    dueNow: number
    credit: number
  }
  nextMonth: {
    amount: number
    date: string | null
  }
  daysRemaining: number
  message: string
}

interface BillingClientProps {
  subscription: Subscription | null
  plans: typeof PLANS
  currentPlan?: PlanId
}

export function BillingClient({
  subscription,
  plans,
  currentPlan,
}: BillingClientProps) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<PlanId | "portal" | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [prorationPreview, setProrationPreview] = useState<ProrationPreview | null>(null)
  const [previewingPlan, setPreviewingPlan] = useState<PlanId | null>(null)

  // Fetch invoices on mount
  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch("/api/stripe/invoices")
        const data = await response.json()
        setInvoices(data.invoices || [])
      } catch (error) {
        console.error("Failed to fetch invoices:", error)
      } finally {
        setInvoicesLoading(false)
      }
    }

    if (subscription?.stripe_customer_id) {
      fetchInvoices()
    } else {
      setInvoicesLoading(false)
    }
  }, [subscription?.stripe_customer_id])

  // Fetch proration preview when hovering/selecting a plan
  const fetchProrationPreview = async (planId: PlanId) => {
    if (!subscription?.stripe_subscription_id || planId === currentPlan) {
      setProrationPreview(null)
      return
    }

    setPreviewingPlan(planId)
    try {
      const response = await fetch("/api/stripe/proration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlanId: planId }),
      })
      const data = await response.json()
      if (response.ok) {
        setProrationPreview(data)
      }
    } catch (error) {
      console.error("Failed to fetch proration:", error)
    }
  }

  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  const handleSubscribe = async (planId: PlanId) => {
    setLoading(planId)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to start checkout")
        return
      }

      const data = await response.json()

      if (data.url) {
        toast.info("Redirecting to checkout...")
        window.location.href = data.url
      } else {
        toast.error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to start checkout. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setLoading("portal")
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to open billing portal")
        return
      }

      const data = await response.json()

      if (data.url) {
        toast.info("Opening billing portal...")
        window.location.href = data.url
      } else {
        toast.error("Failed to open billing portal")
      }
    } catch (error) {
      console.error("Portal error:", error)
      toast.error("Failed to open billing portal. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-8">
      {/* Success/Cancel Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm text-green-800">
              Your subscription has been activated successfully!
            </p>
          </div>
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Checkout was canceled. You can try again when you're ready.
          </p>
        </div>
      )}

      {/* Current Subscription */}
      {subscription && subscription.status !== "inactive" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Current Subscription
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-500 mb-1">Plan</p>
              <p className="font-medium text-slate-900 capitalize">
                {subscription.plan_id}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  subscription.status === "active"
                    ? "bg-green-100 text-green-700"
                    : subscription.status === "trialing"
                    ? "bg-blue-100 text-blue-700"
                    : subscription.status === "past_due"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Sermons Used</p>
              <p className="font-medium text-slate-900">
                {subscription.sermon_count} /{" "}
                {subscription.sermon_limit === -1
                  ? "Unlimited"
                  : subscription.sermon_limit}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Renews</p>
              <p className="font-medium text-slate-900">
                {subscription.cancel_at_period_end
                  ? `Cancels ${formatDate(subscription.current_period_end)}`
                  : formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleManageBilling}
            loading={loading === "portal"}
            variant="secondary"
          >
            Manage Billing
          </Button>
        </div>
      )}

      {/* Pricing Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {subscription?.status === "active" ? "Change Plan" : "Choose a Plan"}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(plans) as [PlanId, (typeof plans)[PlanId]][]).map(
            ([planId, plan]) => {
              const isCurrent = currentPlan === planId
              const isPopular = planId === "growth"

              return (
                <div
                  key={planId}
                  className={`relative bg-white rounded-xl border-2 p-6 ${
                    isPopular
                      ? "border-blue-500 shadow-lg"
                      : isCurrent
                      ? "border-green-500"
                      : "border-slate-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="text-slate-500">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Proration preview for this plan */}
                  {previewingPlan === planId && prorationPreview && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      prorationPreview.isUpgrade
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}>
                      <p className={prorationPreview.isUpgrade ? "text-blue-700" : "text-amber-700"}>
                        {prorationPreview.message}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubscribe(planId)}
                    onMouseEnter={() => fetchProrationPreview(planId)}
                    loading={loading === planId}
                    disabled={isCurrent || loading !== null}
                    className="w-full"
                    variant={isPopular ? "primary" : "secondary"}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : subscription?.status === "active"
                      ? "Switch Plan"
                      : "Get Started"}
                  </Button>
                </div>
              )
            }
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Billing History
        </h2>

        {invoicesLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="w-6 h-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No billing history yet. Your invoices will appear here after your first payment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-50">
                    <td className="py-3 px-2 text-sm text-slate-900">
                      {new Date(invoice.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">
                      {invoice.description || "Subscription"}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-900 font-medium">
                      ${invoice.amount.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "open"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Method - via Stripe Portal */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Payment Method
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Manage your payment methods, update card details, or add a new payment method.
        </p>
        <Button
          onClick={handleManageBilling}
          loading={loading === "portal"}
          variant="secondary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Manage Payment Method
        </Button>
      </div>

      {/* FAQ or Info */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-medium text-slate-900 mb-2">
          Questions about billing?
        </h3>
        <p className="text-sm text-slate-600">
          All plans include a 14-day money-back guarantee. You can upgrade,
          downgrade, or cancel your subscription at any time. Sermon counts
          reset at the start of each billing period. When upgrading, you'll be
          charged a prorated amount for the remainder of your billing cycle.
        </p>
      </div>
    </div>
  )
}
