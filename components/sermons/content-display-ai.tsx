"use client"

import { useState } from "react"
import type { DevotionalOutput } from "@/lib/ai/devotional-generator"
import type { DiscussionGuideOutput } from "@/lib/ai/discussion-guide-generator"
import type { SocialMediaOutput } from "@/lib/ai/social-media-generator"

// Updated Sermon Notes Display (matches convertToSermonNotesContent structure)
interface SermonNotesDisplayProps {
  content: {
    sections: Array<{
      title: string
      points: Array<{
        text: string
        blank: boolean
        answer?: string
      }>
    }>
    discussion_questions?: string[]
    application_points?: string[]
  }
}

export function SermonNotesDisplayAI({ content }: SermonNotesDisplayProps) {
  // Helper function to clean text
  const cleanText = (text: string) => {
    return text.replace(/\n/g, " ").replace(/\s+/g, " ").trim()
  }

  // Helper to render fill-in-blank text
  const renderBlankText = (text: string) => {
    const parts = text.split("_____")
    return parts.map((part, i) => (
      <span key={i}>
        {cleanText(part)}
        {i < parts.length - 1 && (
          <span className="inline-block border-b-2 border-slate-400 min-w-[120px] mx-1 align-bottom pb-1" />
        )}
      </span>
    ))
  }

  return (
    <div className="space-y-8">
      {content.sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-b-2 border-blue-500 pb-2">
            {cleanText(section.title)}
          </h3>
          <ul className="space-y-3 ml-4">
            {section.points.map((point, pointIdx) => (
              <li key={pointIdx} className="text-slate-700 leading-relaxed flex items-start gap-3">
                <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                <div className="flex-1 min-w-0">
                  {point.blank ? (
                    <div className="space-y-1">
                      <div className="text-slate-700">
                        {renderBlankText(point.text)}
                      </div>
                      {point.answer && (
                        <div className="text-xs text-slate-500 italic pl-2">
                          (Answer: {cleanText(point.answer)})
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-700">{cleanText(point.text)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {content.discussion_questions && content.discussion_questions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 space-y-3">
          <h4 className="font-semibold text-slate-900 text-lg">Discussion Questions</h4>
          <ul className="space-y-3">
            {content.discussion_questions.map((question, idx) => (
              <li key={idx} className="text-slate-700 flex gap-3">
                <span className="font-medium text-blue-600 flex-shrink-0">{idx + 1}.</span>
                <span className="flex-1">{cleanText(question)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.application_points && content.application_points.length > 0 && (
        <div className="bg-green-50 rounded-lg p-6 space-y-3">
          <h4 className="font-semibold text-slate-900 text-lg">Application Points</h4>
          <ul className="space-y-3">
            {content.application_points.map((point, idx) => (
              <li key={idx} className="text-slate-700 flex gap-3">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span className="flex-1">{cleanText(point)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Devotional Display (HTML content)
interface DevotionalDisplayAIProps {
  content: DevotionalOutput
}

export function DevotionalDisplayAI({ content }: DevotionalDisplayAIProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header with meta info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">{content.title}</h2>
        <p className="text-slate-600 italic mb-4">{content.meta_description}</p>
        <div className="flex flex-wrap gap-2">
          {content.keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-600"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy HTML
            </>
          )}
        </button>
      </div>

      {/* HTML content rendered */}
      <div
        className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-slate-900 prose-strong:font-semibold"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />

      {/* Scripture references */}
      {content.scripture_references && content.scripture_references.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-6">
          <h4 className="font-semibold text-slate-900 mb-3">Key Scripture References</h4>
          <div className="flex flex-wrap gap-2">
            {content.scripture_references.map((ref, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white rounded-full text-sm text-slate-700 border border-amber-200"
              >
                📖 {ref}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Discussion Guide Display
interface DiscussionGuideDisplayAIProps {
  content: DiscussionGuideOutput
}

export function DiscussionGuideDisplayAI({ content }: DiscussionGuideDisplayAIProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{content.title}</h2>
      </div>

      {/* Icebreaker */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <span className="text-blue-500">🎯</span>
          Icebreaker
        </h3>
        <p className="text-slate-700">{content.icebreaker}</p>
      </div>

      {/* Scripture Study */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Scripture Study</h3>
        {content.scripture_study.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-slate-700 mb-2">{item.question}</p>
                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                  📖 {item.scripture_reference}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Application Questions</h3>
        {content.application_questions.map((question, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-semibold flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="flex-1 text-slate-700">{question}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Group Activity */}
      <div className="bg-amber-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <span className="text-amber-600">⚡</span>
          Group Activity
        </h3>
        <p className="text-slate-700">{content.group_activity}</p>
      </div>

      {/* Prayer Points */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <span className="text-indigo-600">🙏</span>
          Prayer Focus
        </h3>
        <ul className="space-y-2">
          {content.prayer_points.map((point, idx) => (
            <li key={idx} className="text-slate-700 flex gap-2">
              <span className="text-indigo-500">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Resources */}
      {content.additional_resources && content.additional_resources.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Additional Resources</h3>
          <ul className="space-y-2">
            {content.additional_resources.map((resource, idx) => (
              <li key={idx} className="text-slate-700 flex gap-2">
                <span className="text-slate-400">→</span>
                <span>{resource}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Social Media Display
interface SocialMediaDisplayAIProps {
  content: SocialMediaOutput
}

export function SocialMediaDisplayAI({ content }: SocialMediaDisplayAIProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Helper to format posting schedule text
  const formatPostingSchedule = (text: string) => {
    // Clean up markdown-style bold formatting
    const cleanText = text.replace(/\*\*/g, '')

    // Split by lines
    const lines = cleanText.split('\n').filter(line => line.trim())

    return (
      <div className="space-y-3">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.length < 3) return null

          // Check if it's a day of the week
          const dayMatch = trimmed.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Bonus):\s*(.+)/)

          if (dayMatch) {
            const [, day, content] = dayMatch
            return (
              <div key={idx} className="flex items-start gap-3 pl-2 border-l-2 border-blue-200">
                <span className="font-semibold text-blue-600 min-w-[90px] text-sm">
                  {day}:
                </span>
                <span className="text-sm text-slate-700 leading-relaxed flex-1">
                  {content}
                </span>
              </div>
            )
          }

          // Check if it's a section header (all caps words followed by colon)
          const headerMatch = trimmed.match(/^([A-Z\s]{3,}):/)
          if (headerMatch) {
            return (
              <div key={idx} className="mt-4 first:mt-0">
                <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
                  {trimmed}
                </h5>
              </div>
            )
          }

          // Regular text (indented slightly)
          return (
            <p key={idx} className="text-sm text-slate-700 leading-relaxed pl-2">
              {trimmed}
            </p>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Posting schedule */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-lg">
              Posting Schedule Suggestion
            </h4>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          {formatPostingSchedule(content.posting_schedule_suggestion)}
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Suggested Hashtags</h4>
        <div className="flex flex-wrap gap-2">
          {content.hashtags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => handleCopy(tag, -idx - 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-blue-600 font-medium transition-colors"
              title="Click to copy"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Quote cards */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Social Media Quotes</h4>
        <div className="grid grid-cols-1 gap-4">
        {content.quotes.map((quote, idx) => (
          <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
            {/* Quote text - large and prominent */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white relative">
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 shadow-lg">
                <span className="text-base font-bold text-white drop-shadow-md">{idx + 1}</span>
              </div>
              <p className="text-2xl font-bold leading-relaxed pr-16">&ldquo;{quote.text}&rdquo;</p>
            </div>

            {/* Platform-specific captions */}
            <div className="p-6 space-y-4">
              {/* Context */}
              <div className="text-sm text-slate-600 italic border-l-4 border-slate-300 pl-3">
                {quote.context}
              </div>

              {/* Platform tabs */}
              <div className="space-y-3">
                <PlatformCaption
                  platform="Instagram"
                  icon="📷"
                  caption={quote.instagram_caption}
                  onCopy={() => handleCopy(quote.instagram_caption, idx * 10 + 1)}
                  copied={copiedIndex === idx * 10 + 1}
                />
                <PlatformCaption
                  platform="Facebook"
                  icon="📘"
                  caption={quote.facebook_caption}
                  onCopy={() => handleCopy(quote.facebook_caption, idx * 10 + 2)}
                  copied={copiedIndex === idx * 10 + 2}
                />
                <PlatformCaption
                  platform="Twitter/X"
                  icon="𝕏"
                  caption={quote.twitter_text}
                  onCopy={() => handleCopy(quote.twitter_text, idx * 10 + 3)}
                  copied={copiedIndex === idx * 10 + 3}
                />
                <PlatformCaption
                  platform="LinkedIn"
                  icon="💼"
                  caption={quote.linkedin_post}
                  onCopy={() => handleCopy(quote.linkedin_post, idx * 10 + 4)}
                  copied={copiedIndex === idx * 10 + 4}
                />
              </div>

              {/* Story idea */}
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-purple-900 mb-1">Story/Reel Idea:</p>
                <p className="text-sm text-purple-800">{quote.story_idea}</p>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

// Helper component for platform captions
function PlatformCaption({
  platform,
  icon,
  caption,
  onCopy,
  copied,
}: {
  platform: string
  icon: string
  caption: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
          <span>{icon}</span>
          {platform}
        </span>
        <button
          onClick={onCopy}
          className="text-xs px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-slate-600">{caption}</p>
    </div>
  )
}
