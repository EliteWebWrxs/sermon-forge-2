"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toastSuccess, toastError, toastInfo, handleApiError } from "@/lib/toast"
import type { ContentType } from "@/types"

interface GenerateSingleContentButtonProps {
  sermonId: string
  contentType: ContentType
  hasContent: boolean
  variant?: "primary" | "secondary"
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  sermon_notes: "Sermon Notes",
  devotional: "Devotional",
  discussion_guide: "Discussion Guide",
  social_media: "Social Media Pack",
  kids_version: "Kids Version",
}

export function GenerateSingleContentButton({
  sermonId,
  contentType,
  hasContent,
  variant = "secondary",
}: GenerateSingleContentButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  const label = CONTENT_TYPE_LABELS[contentType]

  async function handleGenerate() {
    setIsGenerating(true)
    toastInfo.generating(label)

    try {
      const response = await fetch(`/api/sermons/${sermonId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_type: contentType,
        }),
      })

      if (!response.ok) {
        await handleApiError(response, `Failed to generate ${label}`)
        return
      }

      toastSuccess.contentGenerated(label)
      router.refresh()
    } catch (error) {
      console.error("Generation error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toastError.networkError()
      } else {
        toastError.generationFailed(label)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      loading={isGenerating}
      disabled={isGenerating}
      variant={variant}
      size="sm"
    >
      {isGenerating
        ? "Generating..."
        : hasContent
        ? `Regenerate ${label}`
        : `Generate ${label}`}
    </Button>
  )
}
