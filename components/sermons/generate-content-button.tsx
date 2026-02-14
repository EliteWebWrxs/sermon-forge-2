"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toastSuccess, toastError, toastInfo, handleApiError } from "@/lib/toast"

interface GenerateContentButtonProps {
  sermonId: string
  hasContent: boolean
}

export function GenerateContentButton({
  sermonId,
  hasContent,
}: GenerateContentButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate() {
    setIsGenerating(true)
    toastInfo.generating("all content")

    try {
      const response = await fetch(`/api/sermons/${sermonId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_type: "all",
        }),
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to generate content")
        return
      }

      toastSuccess.allContentGenerated()
      router.refresh()
    } catch (error) {
      console.error("Generation error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toastError.networkError()
      } else {
        toastError.generationFailed()
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerate} loading={isGenerating} disabled={isGenerating}>
      {isGenerating ? "Generating..." : hasContent ? "Regenerate All" : "Generate All Content"}
    </Button>
  )
}
