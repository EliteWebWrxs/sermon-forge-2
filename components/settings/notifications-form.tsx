"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toastSuccess, toastError, handleApiError } from "@/lib/toast"
import type { NotificationPreferences } from "@/types"

interface NotificationOption {
  key: keyof NotificationPreferences
  title: string
  description: string
  category: "essential" | "digest" | "marketing"
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: "processing_complete",
    title: "Processing Complete",
    description: "Get notified when your sermon transcription and content generation is done",
    category: "essential",
  },
  {
    key: "payment_issues",
    title: "Payment Issues",
    description: "Alerts about failed payments or expiring cards",
    category: "essential",
  },
  {
    key: "usage_warnings",
    title: "Usage Limit Warnings",
    description: "Heads up when you're approaching your monthly sermon limit",
    category: "essential",
  },
  {
    key: "weekly_digest",
    title: "Weekly Digest",
    description: "A summary of your activity and usage each week",
    category: "digest",
  },
  {
    key: "product_updates",
    title: "Product Updates",
    description: "New features, improvements, and tips for using SermonForge",
    category: "marketing",
  },
]

interface NotificationsFormProps {
  email: string
  initialPreferences: NotificationPreferences
}

export function NotificationsForm({ email, initialPreferences }: NotificationsFormProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to save notification preferences")
        return
      }

      toastSuccess.settingsSaved()
      setHasChanges(false)
    } catch (error) {
      console.error("Notification preferences save error:", error)
      toastError.generic("Failed to save notification preferences")
    } finally {
      setIsSaving(false)
    }
  }

  const essentialNotifications = NOTIFICATION_OPTIONS.filter((n) => n.category === "essential")
  const digestNotifications = NOTIFICATION_OPTIONS.filter((n) => n.category === "digest")
  const marketingNotifications = NOTIFICATION_OPTIONS.filter((n) => n.category === "marketing")

  return (
    <div className="space-y-8">
      {/* Email destination */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Email Address</h2>
        <p className="text-sm text-slate-500 mb-4">
          Notifications will be sent to:
        </p>
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-slate-700 font-medium">{email}</span>
        </div>
      </div>

      {/* Essential Notifications */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Essential Notifications</h2>
        <p className="text-sm text-slate-500 mb-4">
          Important updates about your sermons and account
        </p>
        <div className="space-y-4">
          {essentialNotifications.map((option) => (
            <NotificationToggle
              key={option.key}
              option={option}
              enabled={preferences[option.key]}
              onToggle={() => handleToggle(option.key)}
            />
          ))}
        </div>
      </div>

      {/* Weekly Digest */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Weekly Digest</h2>
        <p className="text-sm text-slate-500 mb-4">
          A summary of your activity
        </p>
        <div className="space-y-4">
          {digestNotifications.map((option) => (
            <NotificationToggle
              key={option.key}
              option={option}
              enabled={preferences[option.key]}
              onToggle={() => handleToggle(option.key)}
            />
          ))}
        </div>
      </div>

      {/* Product Updates */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Product Updates</h2>
        <p className="text-sm text-slate-500 mb-4">
          News and updates about SermonForge
        </p>
        <div className="space-y-4">
          {marketingNotifications.map((option) => (
            <NotificationToggle
              key={option.key}
              option={option}
              enabled={preferences[option.key]}
              onToggle={() => handleToggle(option.key)}
            />
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {hasChanges && (
            <p className="text-sm text-amber-600">You have unsaved changes</p>
          )}
        </div>
        <Button onClick={handleSave} loading={isSaving} disabled={isSaving || !hasChanges}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}

function NotificationToggle({
  option,
  enabled,
  onToggle,
}: {
  option: NotificationOption
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-900">{option.title}</p>
        <p className="text-sm text-slate-500">{option.description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-slate-200"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
