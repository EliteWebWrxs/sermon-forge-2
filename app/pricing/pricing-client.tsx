"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PLANS, PlanId } from "@/lib/stripe/server"

interface PricingClientProps {
  plans: typeof PLANS
}

export function PricingClient({ plans }: PricingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanId | null>(null)

  const handleSubscribe = async (planId: PlanId) => {
    setLoading(planId)

    try {
      // Check if user is logged in by attempting to create checkout
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // Not logged in, redirect to signup with plan info
        router.push(`/signup?plan=${planId}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      // If any error, redirect to signup
      router.push(`/signup?plan=${planId}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4 sm:px-6">
      {(Object.entries(plans) as [PlanId, (typeof plans)[PlanId]][]).map(
        ([planId, plan]) => {
          const isPopular = planId === "growth"

          return (
            <div
              key={planId}
              className={`relative bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-xl ${
                isPopular
                  ? "border-blue-500 shadow-lg md:scale-105 z-10 order-first md:order-none"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-500 mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">
                    ${plan.price}
                  </span>
                  <span className="text-slate-500 text-lg">/month</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  {plan.sermonLimit === -1
                    ? "Unlimited sermons"
                    : `${plan.sermonLimit} sermons per month`}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isPopular ? "bg-blue-100" : "bg-green-100"
                      }`}
                    >
                      <svg
                        className={`w-3 h-3 ${
                          isPopular ? "text-blue-600" : "text-green-600"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(planId)}
                disabled={loading !== null}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  isPopular
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === planId ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Get Started"
                )}
              </button>

              {planId === "starter" && (
                <p className="text-center text-sm text-slate-400 mt-4">
                  Perfect for getting started
                </p>
              )}
              {planId === "growth" && (
                <p className="text-center text-sm text-blue-600 mt-4 font-medium">
                  Best value for growing churches
                </p>
              )}
              {planId === "enterprise" && (
                <p className="text-center text-sm text-slate-400 mt-4">
                  For large ministries
                </p>
              )}
            </div>
          )
        }
      )}
    </div>
  )
}
