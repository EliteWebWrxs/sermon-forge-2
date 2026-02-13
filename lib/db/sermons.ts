import { createClient } from "@/lib/supabase/server"
import type { InsertSermon, UpdateSermon, Sermon } from "@/types"

export async function getSermons(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sermons")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Sermon[]
}

export async function getSermonById(id: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sermons")
    .select(`
      *,
      generated_content (*)
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error) throw error
  return data
}

export async function createSermon(sermon: InsertSermon) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sermons")
    .insert(sermon)
    .select()
    .single()

  if (error) throw error
  return data as Sermon
}

export async function updateSermon(id: string, updates: UpdateSermon, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sermons")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data as Sermon
}

export async function deleteSermon(id: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("sermons")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
}

export async function getSermonsByStatus(userId: string, status: Sermon["status"]) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sermons")
    .select("*")
    .eq("user_id", userId)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Sermon[]
}
