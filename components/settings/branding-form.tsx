"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface BrandingFormProps {
  initialData: {
    churchName: string
    churchLogoUrl: string
    primaryColor: string
    secondaryColor: string
    fontPreference: string
  }
}

const fontOptions = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "montserrat", label: "Montserrat" },
  { value: "poppins", label: "Poppins" },
]

export function BrandingForm({ initialData }: BrandingFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type (PNG, JPG, WebP, GIF, SVG)
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a PNG, JPG, WebP, GIF, or SVG file" })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Logo must be smaller than 5MB" })
      return
    }

    setIsUploadingLogo(true)
    setMessage(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/settings/branding/logo", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload logo")
      }

      const { url } = await response.json()
      setFormData((prev) => ({ ...prev, churchLogoUrl: url }))
      setMessage({ type: "success", text: "Logo uploaded successfully" })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload logo",
      })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, churchLogoUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save settings")
      }

      setMessage({ type: "success", text: "Branding settings saved successfully" })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Church Name */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Church Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="churchName" className="block text-sm font-medium text-slate-700 mb-1">
              Church Name
            </label>
            <input
              type="text"
              id="churchName"
              value={formData.churchName}
              onChange={(e) => handleChange("churchName", e.target.value)}
              placeholder="e.g., Grace Community Church"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-slate-500">
              This will appear on exported documents
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Church Logo
            </label>
            <div className="flex items-start gap-4">
              {formData.churchLogoUrl ? (
                <div className="relative">
                  <img
                    src={formData.churchLogoUrl}
                    alt="Church logo"
                    className="w-24 h-24 object-contain rounded-lg border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {isUploadingLogo ? (
                    <svg className="w-6 h-6 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="text-sm text-slate-500">
                <p>Upload your church logo</p>
                <p>PNG, JPG, WebP, GIF, or SVG (max 5MB)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Brand Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-700 mb-1">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#1E3A8A"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Used for headings and accent elements
            </p>
          </div>

          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-slate-700 mb-1">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="secondaryColor"
                value={formData.secondaryColor}
                onChange={(e) => handleChange("secondaryColor", e.target.value)}
                className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleChange("secondaryColor", e.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#3B82F6"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Used for backgrounds and highlights
            </p>
          </div>
        </div>
      </div>

      {/* Font Preference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Typography</h2>
        <div>
          <label htmlFor="fontPreference" className="block text-sm font-medium text-slate-700 mb-1">
            Font Style
          </label>
          <select
            id="fontPreference"
            value={formData.fontPreference}
            onChange={(e) => handleChange("fontPreference", e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-slate-500">
            Font style for exported documents
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Preview</h2>
        <div
          className="border border-slate-200 rounded-lg p-6"
          style={{ backgroundColor: `${formData.secondaryColor}15` }}
        >
          <div className="flex items-center gap-3 mb-4">
            {formData.churchLogoUrl && (
              <img
                src={formData.churchLogoUrl}
                alt="Logo preview"
                className="w-10 h-10 object-contain"
              />
            )}
            <span className="text-sm text-slate-500">
              {formData.churchName || "Your Church Name"}
            </span>
          </div>
          <h3
            className="text-2xl font-bold mb-2"
            style={{ color: formData.primaryColor }}
          >
            Sample Sermon Title
          </h3>
          <div
            className="inline-block px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: formData.secondaryColor,
              color: "white",
            }}
          >
            Discussion Questions
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" loading={isSaving} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Branding Settings"}
        </Button>
      </div>
    </form>
  )
}
