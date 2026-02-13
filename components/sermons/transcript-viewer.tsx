interface TranscriptViewerProps {
  transcript: string
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Transcript</h2>
      <div className="prose prose-slate max-w-none">
        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
          {transcript}
        </div>
      </div>
    </div>
  )
}
