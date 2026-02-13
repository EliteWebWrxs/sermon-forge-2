import type {
  SermonNotesContent,
  DevotionalContent,
  DiscussionGuideContent,
  SocialMediaContent,
} from "@/types"

interface SermonNotesDisplayProps {
  content: SermonNotesContent
}

export function SermonNotesDisplay({ content }: SermonNotesDisplayProps) {
  return (
    <div className="space-y-6">
      {content.sections.map((section, idx) => (
        <div key={idx} className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {section.title}
          </h3>
          <ul className="space-y-2">
            {section.points.map((point, pointIdx) => (
              <li key={pointIdx} className="text-slate-700 leading-relaxed">
                {point.blank ? (
                  <span>
                    {point.text}{" "}
                    <span className="inline-block border-b-2 border-slate-300 w-32 h-6 align-middle" />
                  </span>
                ) : (
                  point.text
                )}
                {point.answer && (
                  <span className="ml-2 text-xs text-slate-500">
                    (Answer: {point.answer})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

interface DevotionalDisplayProps {
  content: DevotionalContent
}

export function DevotionalDisplay({ content }: DevotionalDisplayProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {content.title}
        </h2>
        <p className="text-sm text-slate-500 italic">
          {content.scripture_reference}
        </p>
      </div>

      <div className="prose prose-slate max-w-none">
        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
          {content.body}
        </div>
      </div>

      {content.reflection_questions && content.reflection_questions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-3">
            Reflection Questions
          </h3>
          <ul className="space-y-2">
            {content.reflection_questions.map((question, idx) => (
              <li key={idx} className="text-slate-700">
                {idx + 1}. {question}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.prayer && (
        <div className="border-l-4 border-blue-500 pl-4 italic text-slate-600">
          <p className="font-semibold mb-2">Prayer:</p>
          <p>{content.prayer}</p>
        </div>
      )}
    </div>
  )
}

interface DiscussionGuideDisplayProps {
  content: DiscussionGuideContent
}

export function DiscussionGuideDisplay({
  content,
}: DiscussionGuideDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Introduction</h3>
        <p className="text-slate-700">{content.introduction}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Discussion Questions</h3>
        {content.questions.map((q, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-slate-700">{q.question}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                  {q.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {content.closing && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Closing</h3>
          <p className="text-slate-700">{content.closing}</p>
        </div>
      )}
    </div>
  )
}

interface SocialMediaDisplayProps {
  content: SocialMediaContent
}

export function SocialMediaDisplay({ content }: SocialMediaDisplayProps) {
  const platformIcons = {
    twitter: "𝕏",
    facebook: "f",
    instagram: "📷",
  }

  return (
    <div className="space-y-4">
      {content.posts.map((post, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{platformIcons[post.platform]}</span>
            <span className="font-medium text-slate-900 capitalize">
              {post.platform}
            </span>
          </div>
          <p className="text-slate-700 mb-3 whitespace-pre-wrap">{post.text}</p>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag, tagIdx) => (
                <span
                  key={tagIdx}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function EmptyContentState({ contentType }: { contentType: string }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-slate-400"
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
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        No {contentType} Generated Yet
      </h3>
      <p className="text-sm text-slate-500">
        Click &quot;Generate Content&quot; to create this content using AI
      </p>
    </div>
  )
}
