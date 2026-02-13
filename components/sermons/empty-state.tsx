import Link from "next/link"
import { Button } from "@/components/ui/button"

export function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No sermons yet
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Get started by uploading your first sermon. You can upload audio,
          video, PDF files, or paste a YouTube link.
        </p>
        <Link href="/sermons/new">
          <Button>Upload your first sermon</Button>
        </Link>
      </div>
    </div>
  )
}
