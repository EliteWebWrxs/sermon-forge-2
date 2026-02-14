import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { SermonUploadForm } from "@/components/sermons/sermon-upload-form"
import { checkSermonLimits } from "@/lib/subscriptions/check-limits"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Upload Sermon" }

export default async function NewSermonPage() {
  const user = await requireAuth()
  const usage = await checkSermonLimits(user.id)

  // If at limit, show upgrade prompt instead of form
  if (!usage.allowed) {
    return (
      <>
        <Header
          title="Upload Sermon"
          description="Add a sermon to generate content from."
        />

        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-amber-900 mb-2">
              Monthly Limit Reached
            </h2>

            <p className="text-amber-700 mb-6">
              {usage.message || `You've used all ${usage.limit} sermon${usage.limit === 1 ? "" : "s"} in your ${usage.planName} plan this month.`}
            </p>

            {usage.billingPeriod.daysRemaining !== null && (
              <p className="text-sm text-amber-600 mb-6">
                Your limit resets in {usage.billingPeriod.daysRemaining} day{usage.billingPeriod.daysRemaining === 1 ? "" : "s"}.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Upgrade Plan
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Upload Sermon"
        description="Add a sermon to generate content from. Supports audio, video, PDF, YouTube links, or plain text."
      />

      {/* Usage indicator */}
      {!usage.isUnlimited && usage.remaining <= 2 && (
        <div className={`mb-6 p-4 rounded-lg border ${
          usage.remaining === 1
            ? "bg-amber-50 border-amber-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className={`w-5 h-5 ${usage.remaining === 1 ? "text-amber-600" : "text-blue-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className={`text-sm font-medium ${
                usage.remaining === 1 ? "text-amber-800" : "text-blue-800"
              }`}>
                {usage.remaining} sermon{usage.remaining === 1 ? "" : "s"} remaining this month
              </span>
            </div>
            <Link href="/pricing" className={`text-sm font-medium ${
              usage.remaining === 1 ? "text-amber-700 hover:text-amber-800" : "text-blue-700 hover:text-blue-800"
            }`}>
              Upgrade for more
            </Link>
          </div>
        </div>
      )}

      <SermonUploadForm userId={user.id} />
    </>
  )
}
