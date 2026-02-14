"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toastSuccess, toastError, toastInfo, handleApiError } from "@/lib/toast"

interface TranscribeButtonProps {
  sermonId: string
  hasTranscript: boolean
  hasAudio: boolean
}

export function TranscribeButton({
  sermonId,
  hasTranscript,
  hasAudio,
}: TranscribeButtonProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const router = useRouter()

  const handleTranscribe = async () => {
    if (!hasAudio) {
      toastError.generic("No audio or video file to transcribe")
      return
    }

    setIsTranscribing(true)
    toastInfo.transcribing()

    try {
      const response = await fetch(`/api/sermons/${sermonId}/transcribe`, {
        method: "POST",
      })

      if (!response.ok) {
        await handleApiError(response, "Transcription failed")
        return
      }

      toastSuccess.transcriptionComplete()
      router.refresh()
    } catch (error) {
      console.error("Transcription error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toastError.networkError()
      } else {
        toastError.transcriptionFailed()
      }
    } finally {
      setIsTranscribing(false)
    }
  }

  if (hasTranscript) {
    return null // Don't show button if transcript already exists
  }

  if (!hasAudio) {
    return null // Don't show button if no audio to transcribe
  }

  return (
    <Button
      onClick={handleTranscribe}
      disabled={isTranscribing}
      variant="secondary"
    >
      {isTranscribing ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          Transcribing...
        </>
      ) : (
        "Transcribe Audio"
      )}
    </Button>
  )
}
