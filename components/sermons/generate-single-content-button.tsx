"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

  async function handleGenerate() {
    setIsGenerating(true)

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content")
      }

      // Refresh the page to show new content
      router.refresh()
    } catch (error) {
      console.error("Generation error:", error)
      alert(error instanceof Error ? error.message : "Failed to generate content")
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
        ? `Regenerate ${CONTENT_TYPE_LABELS[contentType]}`
        : `Generate ${CONTENT_TYPE_LABELS[contentType]}`}
    </Button>
  )
}
