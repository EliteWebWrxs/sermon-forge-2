import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { requireAuth } from "@/lib/auth"
import { getSermonById } from "@/lib/db/sermons"
import { getGeneratedContent } from "@/lib/db/generated-content"
import { StatusBadge } from "@/components/sermons/status-badge"
import { TranscriptViewer } from "@/components/sermons/transcript-viewer"
import { SermonContentTabs } from "@/components/sermons/sermon-content-tabs"
import { SermonPageClient } from "@/components/sermons/sermon-page-client"
import { ProcessingStatus } from "@/components/sermons/processing-status"

export const metadata: Metadata = { title: "Sermon Details" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function SermonPage({ params }: Props) {
  const { id } = await params
  const user = await requireAuth()

  const sermon = await getSermonById(id, user.id)

  if (!sermon) {
    notFound()
  }

  // Fetch generated content
  const generatedContent = await getGeneratedContent(id)
  const hasContent = generatedContent.length > 0
  const formattedDate = format(new Date(sermon.sermon_date), "MMMM d, yyyy")

  // Check if sermon has audio/video
  const hasAudio = !!(sermon.audio_url || sermon.video_url || sermon.youtube_url)

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back link */}
        <Link
          href="/sermons"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3 sm:mb-4 py-1 -ml-1 px-1 rounded active:bg-slate-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sermons
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 break-words">
              {sermon.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-slate-500">
              <span>{formattedDate}</span>
              <StatusBadge status={sermon.status} />
            </div>
          </div>
          <div className="flex-shrink-0">
            <SermonPageClient
              sermonId={id}
              hasContent={hasContent}
              hasTranscript={!!sermon.transcript}
              hasAudio={hasAudio}
            />
          </div>
        </div>
      </div>

      {/* Processing Status */}
      <ProcessingStatus sermonId={id} initialStatus={sermon.status} />

      {/* Content Grid - Stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Transcript - Shows second on mobile (using order), first column on desktop */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          {sermon.transcript ? (
            <TranscriptViewer transcript={sermon.transcript} />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Transcript
              </h2>
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">
                  {sermon.status === "transcribing"
                    ? "Transcription in progress..."
                    : sermon.status === "uploading"
                    ? "Upload in progress..."
                    : "No transcript available"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Generated Content - Shows first on mobile (using order), second column on desktop */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <SermonContentTabs
            sermonId={id}
            sermonTitle={sermon.title}
            generatedContent={generatedContent}
            hasTranscript={!!sermon.transcript}
          />
        </div>
      </div>
    </>
  )
}
