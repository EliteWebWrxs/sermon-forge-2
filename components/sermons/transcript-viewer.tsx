interface TranscriptViewerProps {
  transcript: string
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit sticky top-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Transcript</h2>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
          {transcript}
        </div>
      </div>
    </div>
  )
}
