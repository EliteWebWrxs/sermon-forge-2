import Link from "next/link"
import { format } from "date-fns"
import type { Sermon } from "@/types"
import { StatusBadge } from "./status-badge"
import { DeleteSermonButton } from "./delete-sermon-button"

interface SermonCardProps {
  sermon: Sermon
}

export function SermonCard({ sermon }: SermonCardProps) {
  const formattedDate = format(new Date(sermon.sermon_date), "MMM d, yyyy")

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow active:bg-slate-50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate mb-1">
            {sermon.title}
          </h3>
          <p className="text-sm text-slate-500">{formattedDate}</p>
        </div>
        <StatusBadge status={sermon.status} />
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-slate-100">
        <Link
          href={`/sermons/${sermon.id}`}
          className="flex-1 sm:flex-none text-center sm:text-left py-2 sm:py-0 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors rounded-lg sm:rounded-none active:bg-blue-50 sm:active:bg-transparent"
        >
          View
        </Link>
        <Link
          href={`/sermons/${sermon.id}/edit`}
          className="flex-1 sm:flex-none text-center sm:text-left py-2 sm:py-0 text-sm text-slate-600 hover:text-slate-700 font-medium transition-colors rounded-lg sm:rounded-none active:bg-slate-100 sm:active:bg-transparent"
        >
          Edit
        </Link>
        <div className="flex-1 sm:flex-none text-center sm:text-left">
          <DeleteSermonButton
            sermonId={sermon.id}
            sermonTitle={sermon.title}
          />
        </div>
      </div>
    </div>
  )
}
