"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ProcessingStatusProps {
  sermonId: string
  initialStatus: string
}

const statusSteps = [
  { key: "uploading", label: "Uploading", step: 1 },
  { key: "processing", label: "Processing", step: 1 },
  { key: "transcribing", label: "Transcribing audio", step: 2 },
  { key: "generating", label: "Generating content", step: 3 },
  { key: "complete", label: "Complete", step: 4 },
  { key: "error", label: "Error", step: 0 },
]

export function ProcessingStatus({
  sermonId,
  initialStatus,
}: ProcessingStatusProps) {
  const [status, setStatus] = useState(initialStatus)
  const router = useRouter()

  // Poll for status updates when processing
  useEffect(() => {
    if (
      status === "complete" ||
      status === "error" ||
      !["uploading", "processing", "transcribing", "generating"].includes(status)
    ) {
      return
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sermons/${sermonId}`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)

          // Refresh the page when complete to show new content
          if (data.status === "complete") {
            router.refresh()
          }
        }
      } catch (error) {
        console.error("Failed to fetch status:", error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [sermonId, status, router])

  // Don't show if complete
  if (status === "complete") {
    return null
  }

  const currentStep = statusSteps.find((s) => s.key === status)
  const totalSteps = 4

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800">
              Processing failed
            </p>
            <p className="text-xs text-red-600">
              There was an error processing your sermon. Please try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">
            {currentStep?.label || "Processing"}...
          </p>
          <p className="text-xs text-blue-600">
            Step {currentStep?.step || 1} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{
            width: `${((currentStep?.step || 1) / totalSteps) * 100}%`,
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-2 text-xs text-blue-600">
        <span className={currentStep?.step === 1 ? "font-medium" : ""}>
          Upload
        </span>
        <span className={currentStep?.step === 2 ? "font-medium" : ""}>
          Transcribe
        </span>
        <span className={currentStep?.step === 3 ? "font-medium" : ""}>
          Generate
        </span>
        <span className={currentStep?.step === 4 ? "font-medium" : ""}>
          Complete
        </span>
      </div>
    </div>
  )
}
