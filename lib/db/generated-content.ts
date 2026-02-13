import { createClient } from "@/lib/supabase/server"
import type { ContentType } from "@/types"

export async function getGeneratedContent(sermonId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("generated_content")
    .select("*")
    .eq("sermon_id", sermonId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getGeneratedContentByType(
  sermonId: string,
  contentType: ContentType
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("generated_content")
    .select("*")
    .eq("sermon_id", sermonId)
    .eq("content_type", contentType)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw error
  }
  return data
}

// Note: Write operations (insert/update/delete) will be added when needed
// Current Supabase client types have issues with JSONB columns
