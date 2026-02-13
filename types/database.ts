export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InputType = "audio" | "video" | "pdf" | "youtube" | "text_paste"

export type SermonStatus =
  | "uploading"
  | "processing"
  | "transcribing"
  | "generating"
  | "complete"
  | "error"

export type ContentType =
  | "sermon_notes"
  | "devotional"
  | "discussion_guide"
  | "social_media"
  | "kids_version"

export type SubscriptionPlan = "starter" | "growth" | "enterprise"

export type SubscriptionStatus = "active" | "canceled" | "past_due"

export interface Database {
  public: {
    Tables: {
      users_metadata: {
        Row: {
          user_id: string
          church_name: string | null
          church_logo_url: string | null
          sermons_processed_count: number
          created_at: string
        }
        Insert: {
          user_id: string
          church_name?: string | null
          church_logo_url?: string | null
          sermons_processed_count?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          church_name?: string | null
          church_logo_url?: string | null
          sermons_processed_count?: number
          created_at?: string
        }
      }
      sermons: {
        Row: {
          id: string
          user_id: string
          title: string
          sermon_date: string
          input_type: InputType
          audio_url: string | null
          video_url: string | null
          pdf_url: string | null
          youtube_url: string | null
          transcript: string | null
          status: SermonStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          sermon_date: string
          input_type: InputType
          audio_url?: string | null
          video_url?: string | null
          pdf_url?: string | null
          youtube_url?: string | null
          transcript?: string | null
          status?: SermonStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          sermon_date?: string
          input_type?: InputType
          audio_url?: string | null
          video_url?: string | null
          pdf_url?: string | null
          youtube_url?: string | null
          transcript?: string | null
          status?: SermonStatus
          created_at?: string
          updated_at?: string
        }
      }
      generated_content: {
        Row: {
          id: string
          sermon_id: string
          content_type: ContentType
          content: Json
          created_at: string
        }
        Insert: {
          id?: string
          sermon_id: string
          content_type: ContentType
          content: Json
          created_at?: string
        }
        Update: {
          id?: string
          sermon_id?: string
          content_type?: ContentType
          content?: Json
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: SubscriptionPlan
          status: SubscriptionStatus
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for working with the database
export type UserMetadata = Database["public"]["Tables"]["users_metadata"]["Row"]
export type Sermon = Database["public"]["Tables"]["sermons"]["Row"]
export type GeneratedContent = Database["public"]["Tables"]["generated_content"]["Row"]
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

export type InsertUserMetadata = Database["public"]["Tables"]["users_metadata"]["Insert"]
export type InsertSermon = Database["public"]["Tables"]["sermons"]["Insert"]
export type InsertGeneratedContent = Database["public"]["Tables"]["generated_content"]["Insert"]
export type InsertSubscription = Database["public"]["Tables"]["subscriptions"]["Insert"]

export type UpdateUserMetadata = Database["public"]["Tables"]["users_metadata"]["Update"]
export type UpdateSermon = Database["public"]["Tables"]["sermons"]["Update"]
export type UpdateGeneratedContent = Database["public"]["Tables"]["generated_content"]["Update"]
export type UpdateSubscription = Database["public"]["Tables"]["subscriptions"]["Update"]

// Content type definitions for JSONB fields
export interface SermonNotesContent {
  sections: Array<{
    title: string
    points: Array<{
      text: string
      blank?: boolean
      answer?: string
    }>
  }>
}

export interface DevotionalContent {
  title: string
  scripture_reference: string
  body: string
  reflection_questions: string[]
  prayer: string
}

export interface DiscussionGuideContent {
  introduction: string
  questions: Array<{
    question: string
    type: "icebreaker" | "discussion" | "application"
  }>
  closing: string
}

export interface SocialMediaContent {
  posts: Array<{
    platform: "twitter" | "facebook" | "instagram"
    text: string
    hashtags: string[]
  }>
}

export interface KidsVersionContent {
  title: string
  age_range: string
  simplified_message: string
  activities: string[]
  discussion_questions: string[]
}
