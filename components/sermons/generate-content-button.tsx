"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { triggerContentGeneration } from "@/app/(dashboard)/sermons/[id]/actions"

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

    try {
      const result = await triggerContentGeneration(sermonId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Failed to generate content")
      }
    } catch (error) {
      console.error("Generation error:", error)
      alert("Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerate} loading={isGenerating}>
      {hasContent ? "Regenerate Content" : "Generate Content"}
    </Button>
  )
}
