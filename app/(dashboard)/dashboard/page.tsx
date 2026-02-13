import type { Metadata } from "next"
import Link from "next/link"
import { startOfMonth } from "date-fns"
import { requireAuth } from "@/lib/auth"
import { getSermons } from "@/lib/db/sermons"
import { getUserMetadata } from "@/lib/db/users"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { SermonCard } from "@/components/sermons/sermon-card"
import { EmptyState } from "@/components/sermons/empty-state"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const user = await requireAuth()
  const [sermons, userMetadata] = await Promise.all([
    getSermons(user.id),
    getUserMetadata(user.id),
  ])

  // Calculate stats
  const totalSermons = sermons.length
  const completedSermons = sermons.filter((s) => s.status === "complete").length
  const thisMonth = sermons.filter(
    (s) => new Date(s.created_at) >= startOfMonth(new Date())
  ).length

  const stats = [
    { label: "Total Sermons", value: totalSermons.toString() },
    { label: "Content Generated", value: completedSermons.toString() },
    { label: "This Month", value: thisMonth.toString() },
  ]

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
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
