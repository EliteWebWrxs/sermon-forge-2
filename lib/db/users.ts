import { createClient } from "@/lib/supabase/server"
import type { UserMetadata, UpdateUserMetadata } from "@/types"

export async function getUserMetadata(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users_metadata")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw error
  }
  return data as UserMetadata
}

export async function updateUserMetadata(
  userId: string,
  updates: UpdateUserMetadata
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users_metadata")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data as UserMetadata
}

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // Not found
    throw error
  }
  return data
}
