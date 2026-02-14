"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastSuccess, toastError, handleApiError } from "@/lib/toast"

const churchSchema = z.object({
  churchName: z.string().max(200).optional(),
  churchWebsite: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  churchSize: z.string().optional(),
  denomination: z.string().max(100).optional(),
})

type ChurchFormValues = z.infer<typeof churchSchema>

const CHURCH_SIZES = [
  { value: "", label: "Select church size" },
  { value: "small", label: "Small (under 100 members)" },
  { value: "medium", label: "Medium (100-500 members)" },
  { value: "large", label: "Large (500-2000 members)" },
  { value: "mega", label: "Mega (2000+ members)" },
]

const DENOMINATIONS = [
  { value: "", label: "Select denomination (optional)" },
  { value: "baptist", label: "Baptist" },
  { value: "catholic", label: "Catholic" },
  { value: "episcopal", label: "Episcopal" },
  { value: "lutheran", label: "Lutheran" },
  { value: "methodist", label: "Methodist" },
  { value: "non-denominational", label: "Non-Denominational" },
  { value: "pentecostal", label: "Pentecostal" },
  { value: "presbyterian", label: "Presbyterian" },
  { value: "reformed", label: "Reformed" },
  { value: "other", label: "Other" },
]

interface ChurchFormProps {
  initialData: {
    churchName: string
    churchWebsite: string
    churchLogoUrl: string
    churchSize: string
    denomination: string
  }
}

export function ChurchForm({ initialData }: ChurchFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [churchLogoUrl, setChurchLogoUrl] = useState(initialData.churchLogoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ChurchFormValues>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      churchName: initialData.churchName,
      churchWebsite: initialData.churchWebsite,
      churchSize: initialData.churchSize,
      denomination: initialData.denomination,
    },
  })

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toastError.invalidFileType("PNG, JPG, WebP, GIF, or SVG")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError.fileTooLarge("5MB")
      return
    }

    setIsUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/settings/branding/logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to upload logo")
        return
      }

      const { url } = await response.json()
      setChurchLogoUrl(url)
      toastSuccess.settingsSaved()
    } catch (error) {
      console.error("Logo upload error:", error)
      toastError.generic("Failed to upload logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      const response = await fetch("/api/settings/church/logo", {
        method: "DELETE",
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to remove logo")
        return
      }

      setChurchLogoUrl("")
      toastSuccess.settingsSaved()
    } catch (error) {
      console.error("Logo removal error:", error)
      toastError.generic("Failed to remove logo")
    }
  }

  const onSubmit = async (data: ChurchFormValues) => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/settings/church", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          churchLogoUrl,
        }),
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to save church settings")
        return
      }

      toastSuccess.settingsSaved()
    } catch (error) {
      console.error("Church settings save error:", error)
      toastError.generic("Failed to save church settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Church Logo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Church Logo</h2>
        <div className="flex items-start gap-6">
          <div className="relative">
            {churchLogoUrl ? (
              <img
                src={churchLogoUrl}
                alt="Church logo"
                className="w-24 h-24 object-contain rounded-lg border border-slate-200 bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {isUploadingLogo && (
              <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
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
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? "Uploading..." : "Upload Logo"}
              </Button>
              {churchLogoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={isUploadingLogo}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              PNG, JPG, WebP, GIF, or SVG. Max 5MB.
            </p>
            <p className="text-xs text-slate-500">
              This logo will appear on exported documents.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Church Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Church Details</h2>

        <Input
          label="Church Name"
          placeholder="e.g., Grace Community Church"
          error={errors.churchName?.message}
          {...register("churchName")}
        />

        <Input
          label="Website"
          placeholder="https://yourchurch.com"
          error={errors.churchWebsite?.message}
          {...register("churchWebsite")}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Church Size
          </label>
          <select
            {...register("churchSize")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {CHURCH_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Denomination
          </label>
          <select
            {...register("denomination")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DENOMINATIONS.map((denom) => (
              <option key={denom.value} value={denom.value}>
                {denom.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Optional - helps us customize content suggestions
          </p>
        </div>
      </div>

      {/* Note about branding */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-900 font-medium">Looking for brand colors?</p>
            <p className="text-sm text-blue-700 mt-1">
              Visit the{" "}
              <a href="/settings/branding" className="underline font-medium">
                Branding settings
              </a>{" "}
              to customize colors and fonts for your exports.
            </p>
          </div>
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
