"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ProcessSermonButtonProps {
  sermonId: string
  hasTranscript: boolean
  hasAudio: boolean
}

export function ProcessSermonButton({
  sermonId,
  hasTranscript,
  hasAudio,
}: ProcessSermonButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Don't show if no audio and no transcript
  if (!hasAudio && !hasTranscript) {
    return null
  }

  const handleProcess = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/sermons/${sermonId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skipTranscription: hasTranscript,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to start processing")
      }

      // Refresh the page to show processing status
      router.refresh()
    } catch (error) {
      console.error("Error starting processing:", error)
      alert(error instanceof Error ? error.message : "Failed to start processing")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      onClick={handleProcess}
      disabled={isProcessing}
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
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
          Starting...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {hasTranscript ? "Generate All Content" : "Transcribe & Generate"}
        </>
      )}
    </Button>
  )
}
