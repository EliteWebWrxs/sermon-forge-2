"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function SermonError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Unable to load sermon"
      description="We couldn't load this sermon. It might have been deleted or you may not have permission to view it."
      showDetails={process.env.NODE_ENV === "development"}
    />
  )
}
