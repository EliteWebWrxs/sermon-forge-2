import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  variant?: "sermons" | "content" | "transcription" | "analytics"
  showTour?: boolean
}

export function EmptyState({ variant = "sermons", showTour }: EmptyStateProps) {
  const content = {
    sermons: {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      iconBg: "bg-blue-50",
      title: "Upload your first sermon",
      description: "Transform your sermons into powerful content. Upload an audio file, video, PDF, or paste text to get started.",
      action: (
        <Link href="/sermons/new" data-tour="upload-sermon">
          <Button size="lg">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Sermon
          </Button>
        </Link>
      ),
      tips: [
        { icon: "🎙️", text: "Audio: MP3, WAV, M4A files up to 100MB" },
        { icon: "🎬", text: "Video: MP4, MOV files up to 100MB" },
        { icon: "📄", text: "PDF: Sermon manuscripts and notes" },
        { icon: "✍️", text: "Text: Paste your transcript directly" },
      ],
    },
    content: {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      iconBg: "bg-purple-50",
      title: "Ready to generate content?",
      description: "Click the 'Generate All Content' button above to create sermon notes, devotionals, discussion guides, and more!",
      action: null,
      tips: [
        { icon: "📝", text: "Sermon Notes: Fill-in-the-blank style for congregation" },
        { icon: "🙏", text: "Devotionals: 5-day devotional series" },
        { icon: "💬", text: "Discussion Guides: Small group questions" },
        { icon: "📱", text: "Social Media: Ready-to-post content" },
      ],
    },
    transcription: {
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      iconBg: "bg-amber-50",
      title: "Transcription in progress",
      description: "We're converting your audio to text. This usually takes 2-3 minutes depending on the length.",
      action: null,
      tips: [
        { icon: "⏱️", text: "Average processing time: 2-3 minutes" },
        { icon: "✨", text: "AI-powered accuracy for clear audio" },
        { icon: "🔄", text: "Page auto-refreshes when complete" },
      ],
    },
    analytics: {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: "bg-green-50",
      title: "No activity yet",
      description: "Start uploading sermons and generating content to see your analytics and insights here.",
      action: (
        <Link href="/sermons/new">
          <Button variant="secondary">Get Started</Button>
        </Link>
      ),
      tips: [
        { icon: "📊", text: "Track sermon uploads and content generation" },
        { icon: "📈", text: "Monitor engagement over time" },
        { icon: "📥", text: "Export reports for your team" },
      ],
    },
  }

  const current = content[variant]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl ${current.iconBg} flex items-center justify-center mb-6`}>
          {current.icon}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {current.title}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {current.description}
        </p>

        {/* Action */}
        {current.action && (
          <div className="mb-8">
            {current.action}
          </div>
        )}

        {/* Tips */}
        {current.tips && (
          <div className="w-full bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              {variant === "sermons" ? "Supported Formats" : "What you'll get"}
            </p>
            <div className="space-y-2">
              {current.tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show tour link if available */}
        {showTour && variant === "sermons" && (
          <p className="mt-6 text-xs text-slate-400">
            New here?{" "}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Take a quick tour
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

// Compact empty state for inline use
export function EmptyStateCompact({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="font-medium text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  )
}

// Content-specific empty state
export function NoContentGenerated() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white shadow-sm flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h4 className="font-semibold text-slate-900 mb-2">No content generated yet</h4>
      <p className="text-sm text-slate-500 mb-4">
        Click the <span className="font-medium text-slate-700">"Generate Content"</span> button above
        to create this content from your sermon transcript.
      </p>
      <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Usually takes 10-30 seconds</span>
      </div>
    </div>
  )
}
