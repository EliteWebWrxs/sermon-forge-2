import type { SermonStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: SermonStatus
  className?: string
}

const statusConfig: Record<
  SermonStatus,
  { label: string; className: string }
> = {
  uploading: {
    label: "Uploading",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  processing: {
    label: "Processing",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  transcribing: {
    label: "Transcribing",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  generating: {
    label: "Generating",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  complete: {
    label: "Complete",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  error: {
    label: "Error",
    className: "bg-red-100 text-red-700 border-red-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
