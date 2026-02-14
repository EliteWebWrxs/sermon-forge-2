"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  error: Error & { digest?: string }
  reset?: () => void
  title?: string
  description?: string
  showDetails?: boolean
}

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "We're sorry, but something unexpected happened. Please try again.",
  showDetails = false,
}: ErrorFallbackProps) {
  useEffect(() => {
    // Log error to console (or error tracking service like Sentry)
    console.error("Error caught by error boundary:", error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{description}</p>

        {/* Error Details (for development) */}
        {showDetails && error.message && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-1">Error details:</p>
            <p className="text-sm text-slate-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <Button onClick={reset}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-slate-500 mt-6">
          If this problem persists,{" "}
          <a
            href="mailto:support@getsermonforge.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}

/**
 * Simplified error message component for inline errors
 */
interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state with error styling
 */
interface ErrorEmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ErrorEmptyState({
  title,
  description,
  action,
}: ErrorEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 mb-4">{description}</p>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
