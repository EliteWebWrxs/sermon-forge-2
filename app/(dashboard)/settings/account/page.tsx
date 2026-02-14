import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { getUserMetadata } from "@/lib/db/users"
import { AccountSettings } from "@/components/settings/account-settings"

export const metadata: Metadata = {
  title: "Account Settings",
}

export default async function AccountPage() {
  const user = await requireAuth()
  const metadata = await getUserMetadata(user.id)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Settings</h1>
        <p className="text-slate-500">
          Manage your account security and data
        </p>
      </div>

      <AccountSettings
        user={{
          id: user.id,
          email: user.email || "",
          provider: user.app_metadata?.provider || "email",
        }}
        twoFactorEnabled={metadata?.two_factor_enabled || false}
      />
    </div>
  )
}
