"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastSuccess, toastError, handleApiError } from "@/lib/toast"

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  churchName: z.string().max(200).optional(),
  timezone: z.string(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// Common timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
]

interface ProfileFormProps {
  user: {
    id: string
    email: string
  }
  initialData: {
    displayName: string
    churchName: string
    profilePictureUrl: string
    timezone: string
  }
}

export function ProfileForm({ user, initialData }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialData.profilePictureUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialData.displayName,
      churchName: initialData.churchName,
      timezone: initialData.timezone,
    },
  })

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toastError.invalidFileType("PNG, JPG, WebP, or GIF")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toastError.fileTooLarge("2MB")
      return
    }

    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/settings/profile/photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to upload photo")
        return
      }

      const { url } = await response.json()
      setProfilePictureUrl(url)
      toastSuccess.settingsSaved()
    } catch (error) {
      console.error("Photo upload error:", error)
      toastError.generic("Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch("/api/settings/profile/photo", {
        method: "DELETE",
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to remove photo")
        return
      }

      setProfilePictureUrl("")
      toastSuccess.settingsSaved()
    } catch (error) {
      console.error("Photo removal error:", error)
      toastError.generic("Failed to remove photo")
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to save profile")
        return
      }

      toastSuccess.settingsSaved()
    } catch (error) {
      console.error("Profile save error:", error)
      toastError.generic("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Profile Picture */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
              </Button>
              {profilePictureUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              PNG, JPG, WebP or GIF. Max 2MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>

        <Input
          label="Display Name"
          placeholder="Your name"
          error={errors.displayName?.message}
          {...register("displayName")}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-500">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        <Input
          label="Church Name"
          placeholder="Your church name (optional)"
          error={errors.churchName?.message}
          {...register("churchName")}
        />
      </div>

      {/* Timezone */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Timezone</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Timezone
          </label>
          <select
            {...register("timezone")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Used for displaying dates and times
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {isDirty && (
            <p className="text-sm text-amber-600">You have unsaved changes</p>
          )}
        </div>
        <Button type="submit" loading={isSaving} disabled={isSaving || !isDirty}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
