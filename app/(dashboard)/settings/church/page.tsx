import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { getUserMetadata } from "@/lib/db/users"
import { ChurchForm } from "@/components/settings/church-form"

export const metadata: Metadata = {
  title: "Church Settings",
}

export default async function ChurchPage() {
  const user = await requireAuth()
  const metadata = await getUserMetadata(user.id)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Church Information</h1>
        <p className="text-slate-500">
          Add details about your church for a more personalized experience
        </p>
      </div>

      <ChurchForm
        initialData={{
          churchName: metadata?.church_name || "",
          churchWebsite: metadata?.church_website || "",
          churchLogoUrl: metadata?.church_logo_url || "",
          churchSize: metadata?.church_size || "",
          denomination: metadata?.denomination || "",
        }}
      />
    </div>
  )
}
