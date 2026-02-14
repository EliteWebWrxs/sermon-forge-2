import { createClient } from "@/lib/supabase/server"

export interface BrandingPreferences {
  churchName?: string | null
  churchLogoUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  fontPreference?: string | null
}

// Default branding colors
export const DEFAULT_BRANDING: BrandingPreferences = {
  primaryColor: "#1E3A8A", // Dark blue
  secondaryColor: "#3B82F6", // Blue
  fontPreference: "inter",
}

/**
 * Fetch user's branding preferences from database
 */
export async function getUserBranding(userId: string): Promise<BrandingPreferences> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users_metadata")
    .select("church_name, church_logo_url, primary_color, secondary_color, font_preference")
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    return DEFAULT_BRANDING
  }

  return {
    churchName: data.church_name,
    churchLogoUrl: data.church_logo_url,
    primaryColor: data.primary_color || DEFAULT_BRANDING.primaryColor,
    secondaryColor: data.secondary_color || DEFAULT_BRANDING.secondaryColor,
    fontPreference: data.font_preference || DEFAULT_BRANDING.fontPreference,
  }
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace("#", "")

  // Parse hex values
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b }
    }
  }

  return null
}

/**
 * Convert hex color to lighter shade (for backgrounds)
 */
export function lightenColor(hex: string, percent: number = 50): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const increase = (color: number) => {
    return Math.min(255, color + Math.floor((255 - color) * (percent / 100)))
  }

  const r = increase(rgb.r).toString(16).padStart(2, "0")
  const g = increase(rgb.g).toString(16).padStart(2, "0")
  const b = increase(rgb.b).toString(16).padStart(2, "0")

  return `#${r}${g}${b}`
}

/**
 * Get safe color for PDF (converts hex to RGB array)
 */
export function getPdfColor(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex)
  if (!rgb) return [30, 58, 138] // Default dark blue

  return [rgb.r, rgb.g, rgb.b]
}

/**
 * Get font mapping for different export formats
 */
export function getFontMapping(preference?: string | null): {
  pdf: string
  docx: string
  display: string
} {
  const fonts: Record<string, { pdf: string; docx: string; display: string }> = {
    inter: {
      pdf: "helvetica",
      docx: "Calibri",
      display: "Inter, sans-serif",
    },
    roboto: {
      pdf: "helvetica",
      docx: "Arial",
      display: "Roboto, sans-serif",
    },
    "open-sans": {
      pdf: "helvetica",
      docx: "Arial",
      display: "Open Sans, sans-serif",
    },
    lato: {
      pdf: "helvetica",
      docx: "Calibri",
      display: "Lato, sans-serif",
    },
    montserrat: {
      pdf: "helvetica",
      docx: "Calibri",
      display: "Montserrat, sans-serif",
    },
    poppins: {
      pdf: "helvetica",
      docx: "Arial",
      display: "Poppins, sans-serif",
    },
  }

  return fonts[preference || "inter"] || fonts.inter
}

/**
 * Update user's branding preferences
 */
export async function updateUserBranding(
  userId: string,
  branding: Partial<BrandingPreferences>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const updates: Record<string, string | null> = {}

  if (branding.churchName !== undefined) updates.church_name = branding.churchName
  if (branding.churchLogoUrl !== undefined) updates.church_logo_url = branding.churchLogoUrl
  if (branding.primaryColor !== undefined) updates.primary_color = branding.primaryColor
  if (branding.secondaryColor !== undefined) updates.secondary_color = branding.secondaryColor
  if (branding.fontPreference !== undefined) updates.font_preference = branding.fontPreference

  const { error } = await supabase
    .from("users_metadata")
    .update(updates)
    .eq("user_id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
