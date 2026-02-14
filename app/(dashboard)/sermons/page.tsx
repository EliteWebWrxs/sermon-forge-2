import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { getSermons } from "@/lib/db/sermons"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { SermonCard } from "@/components/sermons/sermon-card"
import { EmptyState } from "@/components/sermons/empty-state"

export const metadata: Metadata = { title: "My Sermons" }

export default async function SermonsPage() {
  const user = await requireAuth()
  const sermons = await getSermons(user.id)

  return (
    <>
      <Header
        title="My Sermons"
        description="Manage all your sermon uploads and generated content."
        action={
          <Link href="/sermons/new">
            <Button>Upload sermon</Button>
          </Link>
        }
      />

      {sermons.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sermons.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
        </div>
      )}
    </>
  )
}
