import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { getUserMetadata } from "@/lib/db/users"
import { ProfileForm } from "@/components/settings/profile-form"

export const metadata: Metadata = {
  title: "Profile Settings",
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const metadata = await getUserMetadata(user.id)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-500">
          Manage your personal information and preferences
        </p>
      </div>

      <ProfileForm
        user={{
          id: user.id,
          email: user.email || "",
        }}
        initialData={{
          displayName: metadata?.display_name || "",
          churchName: metadata?.church_name || "",
          profilePictureUrl: metadata?.profile_picture_url || "",
          timezone: metadata?.timezone || "America/New_York",
        }}
      />
    </div>
  )
}
