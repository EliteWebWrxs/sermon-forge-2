import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { getSermons } from "@/lib/db/sermons"
import { getUserMetadata } from "@/lib/db/users"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { SermonCard } from "@/components/sermons/sermon-card"
import { EmptyState } from "@/components/sermons/empty-state"
import { AnalyticsWidget } from "@/components/analytics/analytics-widget"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const user = await requireAuth()
  const [sermons, userMetadata] = await Promise.all([
    getSermons(user.id),
    getUserMetadata(user.id),
  ])

  return (
    <>
      <Header
        title="Dashboard"
        description={`Welcome back${userMetadata?.church_name ? `, ${userMetadata.church_name}` : ""}. Here's what's happening with your sermons.`}
        action={
          <Link href="/sermons/new">
            <Button>Upload sermon</Button>
          </Link>
        }
      />

      {/* Analytics Widget */}
      <div className="mb-8">
        <AnalyticsWidget />
      </div>

      {/* Recent sermons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Sermons
          </h2>
          {sermons.length > 0 && (
            <Link
              href="/sermons"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          )}
        </div>

        {sermons.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sermons.slice(0, 6).map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
