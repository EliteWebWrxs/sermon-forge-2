import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { BrandingForm } from "@/components/settings/branding-form"

export const metadata: Metadata = {
  title: "Church Branding Settings",
}

export default async function BrandingSettingsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch current branding settings
  const { data: userMetadata } = await supabase
    .from("users_metadata")
    .select("church_name, church_logo_url, primary_color, secondary_color, font_preference")
    .eq("user_id", user.id)
    .single()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Church Branding
        </h1>
        <p className="text-slate-500">
          Customize how your church brand appears on exported documents (PDF, Word, PowerPoint).
        </p>
      </div>

      {/* Branding Form */}
      <BrandingForm
        initialData={{
          churchName: userMetadata?.church_name || "",
          churchLogoUrl: userMetadata?.church_logo_url || "",
          primaryColor: userMetadata?.primary_color || "#1E3A8A",
          secondaryColor: userMetadata?.secondary_color || "#3B82F6",
          fontPreference: userMetadata?.font_preference || "inter",
        }}
      />
    </div>
  )
}
