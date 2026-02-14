"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function DashboardError({
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
      title="Unable to load this page"
      description="We had trouble loading this page. This might be a temporary issue."
      showDetails={process.env.NODE_ENV === "development"}
    />
  )
}
