"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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
  const [progress, setProgress] = useState<string>("")

  async function handleGenerate() {
    setIsGenerating(true)
    setProgress("Generating all content...")

    try {
      const response = await fetch(`/api/sermons/${sermonId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_type: "all", // Generate all content types
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content")
      }

      setProgress("Content generated successfully!")

      // Refresh the page to show new content
      router.refresh()
    } catch (error) {
      console.error("Generation error:", error)
      alert(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setIsGenerating(false)
      setProgress("")
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleGenerate} loading={isGenerating} disabled={isGenerating}>
        {isGenerating ? "Generating..." : hasContent ? "Regenerate All" : "Generate All Content"}
      </Button>
      {progress && (
        <p className="text-xs text-slate-500">{progress}</p>
      )}
    </div>
  )
}
