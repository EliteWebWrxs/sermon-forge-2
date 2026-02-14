import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { getSermons } from "@/lib/db/sermons"
import { getUserMetadata } from "@/lib/db/users"
import { getSubscription, getMonthlySermonCount, isOnTrial, getTrialDaysRemaining } from "@/lib/db/subscriptions"
import { PLANS } from "@/lib/stripe/server"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { SermonCard } from "@/components/sermons/sermon-card"
import { EmptyState } from "@/components/sermons/empty-state"
import { AnalyticsWidget } from "@/components/analytics/analytics-widget"
import { SubscriptionWidget } from "@/components/subscription/subscription-widget"
import { TrialBanner } from "@/components/subscription/trial-banner"
import { DashboardOnboarding } from "@/components/onboarding/dashboard-onboarding"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const user = await requireAuth()
  const [sermons, userMetadata, subscription, monthlySermonCount] = await Promise.all([
    getSermons(user.id),
    getUserMetadata(user.id),
    getSubscription(),
    getMonthlySermonCount(user.id),
  ])

  // Check if user is on trial
  const onTrial = isOnTrial(subscription)
  const trialDaysRemaining = getTrialDaysRemaining(subscription)

  return (
    <>
      {/* Onboarding - Welcome modal and product tour */}
      <DashboardOnboarding
        onboardingCompleted={userMetadata?.onboarding_completed ?? false}
        onboardingStep={userMetadata?.onboarding_step ?? 0}
        productTourCompleted={userMetadata?.product_tour_completed ?? false}
        hasSermons={sermons.length > 0}
      />

      <Header
        title="Dashboard"
        description={`Welcome back${userMetadata?.church_name ? `, ${userMetadata.church_name}` : ""}. Here's what's happening with your sermons.`}
        action={
          <Link href="/sermons/new">
            <Button>Upload sermon</Button>
          </Link>
        }
      />

      {/* Trial Banner */}
      {onTrial && subscription && (
        <TrialBanner
          daysRemaining={trialDaysRemaining}
          sermonsUsed={monthlySermonCount}
          sermonLimit={subscription.trial_sermon_limit}
          planName={PLANS[subscription.plan_id as keyof typeof PLANS]?.name || subscription.plan_id}
        />
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Subscription Widget */}
        <div className="lg:col-span-1">
          <SubscriptionWidget
            subscription={subscription}
            plans={PLANS}
            monthlySermonCount={monthlySermonCount}
          />
        </div>

        {/* Analytics Widget */}
        <div className="lg:col-span-2">
          <AnalyticsWidget />
        </div>
      </div>

      {/* Recent sermons */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Recent Sermons
          </h2>
          {sermons.length > 0 && (
            <Link
              href="/sermons"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium py-1 px-2 -mr-2 rounded active:bg-blue-50"
            >
              View all
            </Link>
          )}
        </div>

        {sermons.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sermons.slice(0, 6).map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
