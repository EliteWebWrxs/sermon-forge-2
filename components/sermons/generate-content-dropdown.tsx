"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import type { ContentType } from "@/types"

interface GenerateContentDropdownProps {
  sermonId: string
  hasContent: boolean
  hasTranscript: boolean
}

type GenerationType = ContentType | "all"

const CONTENT_TYPE_LABELS: Record<GenerationType, string> = {
  all: "All Content",
  sermon_notes: "Sermon Notes",
  devotional: "Devotional",
  discussion_guide: "Discussion Guide",
  social_media: "Social Media Pack",
  kids_version: "Kids Version",
}

export function GenerateContentDropdown({
  sermonId,
  hasContent,
  hasTranscript,
}: GenerateContentDropdownProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<GenerationType | null>(null)
  const [progress, setProgress] = useState<string>("")

  async function handleGenerate(contentType: GenerationType) {
    if (!hasTranscript) {
      alert("Please transcribe the sermon first before generating content.")
      return
    }

    setIsGenerating(true)
    setGeneratingType(contentType)
    setProgress(`Generating ${CONTENT_TYPE_LABELS[contentType]}...`)

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

      setProgress("Content generated successfully!")

      // Refresh the page to show new content
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Generation error:", error)
      alert(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
        setGeneratingType(null)
        setProgress("")
      }, 1000)
    }
  }

  const trigger = (
    <Button
      loading={isGenerating}
      disabled={isGenerating || !hasTranscript}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        progress
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
          {hasContent ? "Regenerate Content" : "Generate Content"}
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </>
      )}
    </Button>
  )

  if (isGenerating) {
    return trigger
  }

  return (
    <DropdownMenu trigger={trigger}>
      <DropdownMenuItem onClick={() => handleGenerate("all")}>
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
        Generate All Content
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleGenerate("sermon_notes")}>
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Sermon Notes Only
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleGenerate("devotional")}>
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        Devotional Only
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleGenerate("discussion_guide")}>
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Discussion Guide Only
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleGenerate("social_media")}>
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
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        Social Media Pack Only
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
