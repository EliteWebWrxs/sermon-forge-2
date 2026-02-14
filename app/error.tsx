"use client"

import { ErrorFallback } from "@/components/error-fallback"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <ErrorFallback
        error={error}
        reset={reset}
        title="Something went wrong"
        description="We encountered an unexpected error. Our team has been notified and is working on a fix."
        showDetails={process.env.NODE_ENV === "development"}
      />
    </div>
  )
}
