import { createClient } from "@/lib/supabase/client"

export async function uploadSermonFile(
  userId: string,
  file: File,
  sermonId: string
): Promise<{ url: string; path: string }> {
  const supabase = createClient()

  // Create a unique file path: userId/sermonId/filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${sermonId}/${fileName}`

  const { data, error } = await supabase.storage
    .from("sermons")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("sermons").getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

export async function deleteSermonFile(filePath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from("sermons").remove([filePath])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function getFileType(file: File): "audio" | "video" | "pdf" {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (["mp3", "m4a", "wav", "aac", "ogg"].includes(ext || "")) {
    return "audio"
  }

  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "")) {
    return "video"
  }

  return "pdf"
}

export function validateFileSize(file: File, maxSizeMB: number = 500): boolean {
  const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
  return file.size <= maxSize
}

export function validateFileType(
  file: File,
  acceptedTypes: string[]
): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase()
  return ext ? acceptedTypes.includes(ext) : false
}
