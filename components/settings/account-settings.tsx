"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastSuccess, toastError, handleApiError } from "@/lib/toast"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

interface AccountSettingsProps {
  user: {
    id: string
    email: string
    provider: string
  }
  twoFactorEnabled: boolean
}

export function AccountSettings({ user, twoFactorEnabled }: AccountSettingsProps) {
  const router = useRouter()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const isOAuthUser = user.provider !== "email"

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/settings/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to change password")
        return
      }

      toastSuccess.settingsSaved()
      reset()
    } catch (error) {
      console.error("Password change error:", error)
      toastError.generic("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/settings/account/export", {
        method: "POST",
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to request data export")
        return
      }

      toastSuccess.generic("Data export requested! You'll receive an email when it's ready.")
    } catch (error) {
      console.error("Data export error:", error)
      toastError.generic("Failed to request data export")
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return

    setIsDeleting(true)

    try {
      const response = await fetch("/api/settings/account", {
        method: "DELETE",
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to delete account")
        return
      }

      toastSuccess.generic("Account deleted. Goodbye!")
      router.push("/")
    } catch (error) {
      console.error("Account deletion error:", error)
      toastError.generic("Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>

        {isOAuthUser ? (
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              You signed in with {user.provider}. Password management is handled by your OAuth provider.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              placeholder="Enter your current password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />

            <Input
              type="password"
              label="New Password"
              placeholder="Enter a new password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className="flex justify-end">
              <Button type="submit" loading={isChangingPassword}>
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
            <p className="text-sm text-slate-500 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-2">
            {twoFactorEnabled ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Disabled
              </span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button variant="secondary" disabled>
            {twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"} (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Export Your Data</h2>
        <p className="text-sm text-slate-500 mb-4">
          Download all your data including sermons, generated content, and settings.
          You'll receive an email with a download link when it's ready.
        </p>
        <Button variant="secondary" onClick={handleExportData} loading={isExporting}>
          {isExporting ? "Requesting..." : "Request Data Export"}
        </Button>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h2>
        <p className="text-sm text-slate-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Account
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                This will permanently delete:
              </p>
              <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                <li>All your sermons and transcripts</li>
                <li>All generated content (notes, devotionals, etc.)</li>
                <li>Your subscription and billing history</li>
                <li>All account settings and preferences</li>
              </ul>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 font-medium">
                  This action cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText("")
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                loading={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
