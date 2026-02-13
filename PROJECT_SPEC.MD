# Sermon Content Suite MVP

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (auth + database)
- Anthropic Claude API (content generation)
- Tailwind CSS
- React Hook Form + Zod (forms)
- jsPDF (PDF generation)
- ASSEMBLYAI

## Core Features

1. User authentication (Supabase Auth)
2. Sermon upload (audio/video/PDF/text file or YouTube URL or text or PDF)
3. Transcription (use AssemblyAI)
4. AI content generation (sermon notes + devotional)
5. View/edit generated content
6. Export to PDF
7. Simple dashboard

## Database Schema

- users (handled by Supabase Auth)
- sermons (id, user_id, title, date, input_type, audio_url, video_url, pdf_url, youtube_url, transcript, status)
- generated_content (id, sermon_id, content_type, content, created_at)
- subscriptions (id, user_id, stripe_customer_id, plan, status, current_period_end)

## Pages Needed

- / (landing page)
- /login
- /dashboard
- /sermons/new (upload)
- /sermons/[id] (view sermon + generated content)
- /sermons/[id]/edit

## AI Prompts to Generate

- Sermon notes (fill-in-blank style)
- Devotional blog post (800-1200 words, SEO optimized)
- Small group discussion guide
- Social media content pack (5-7 quotes + captions)
- Kids version (optional, premium tier)
