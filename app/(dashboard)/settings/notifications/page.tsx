import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { getUserMetadata } from "@/lib/db/users"
import { NotificationsForm } from "@/components/settings/notifications-form"
import type { NotificationPreferences } from "@/types"

export const metadata: Metadata = {
  title: "Notification Settings",
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  processing_complete: true,
  payment_issues: true,
  usage_warnings: true,
  weekly_digest: false,
  product_updates: true,
}

export default async function NotificationsPage() {
  const user = await requireAuth()
  const metadata = await getUserMetadata(user.id)

  const preferences: NotificationPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(metadata?.notification_preferences || {}),
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Notifications</h1>
        <p className="text-slate-500">
          Choose what notifications you'd like to receive
        </p>
      </div>

      <NotificationsForm
        email={user.email || ""}
        initialPreferences={preferences}
      />
    </div>
  )
}
