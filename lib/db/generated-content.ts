import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import type { ContentType } from "@/types"
import type { SupabaseClient } from "@supabase/supabase-js"

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

/**
 * Create or update generated content for a sermon
 * Uses upsert to handle both creation and updates
 * @param useServiceClient - Use service client for background jobs (bypasses RLS)
 */
export async function saveGeneratedContent(
  sermonId: string,
  contentType: ContentType,
  content: any,
  useServiceClient = false
) {
  const supabase: SupabaseClient = useServiceClient
    ? createServiceClient()
    : await createClient()

  // Check if content already exists (use service client for this check too)
  const { data: existing } = await supabase
    .from("generated_content")
    .select("id")
    .eq("sermon_id", sermonId)
    .eq("content_type", contentType)
    .single()

  if (existing) {
    // Update existing content
    const { data, error } = await supabase
      .from("generated_content")
      .update({ content })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Insert new content
    const { data, error } = await supabase
      .from("generated_content")
      .insert({
        sermon_id: sermonId,
        content_type: contentType,
        content,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

/**
 * Delete generated content
 */
export async function deleteGeneratedContent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("generated_content")
    .delete()
    .eq("id", id)

  if (error) throw error
}
