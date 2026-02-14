"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { GenerateContentDropdown } from "./generate-content-dropdown"
import { TranscribeButton } from "./transcribe-button"
import { ProcessSermonButton } from "./process-sermon-button"
import { SermonKeyboardShortcuts } from "./sermon-keyboard-shortcuts"
import Link from "next/link"

interface SermonPageClientProps {
  sermonId: string
  hasContent: boolean
  hasTranscript: boolean
  hasAudio: boolean
}

export function SermonPageClient({
  sermonId,
  hasContent,
  hasTranscript,
  hasAudio,
}: SermonPageClientProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const generateButtonRef = useRef<HTMLButtonElement>(null)

  const handleGenerate = () => {
    // This would trigger the dropdown programmatically
    // For now, we'll just focus the button
    generateButtonRef.current?.click()
  }

  const handleEdit = () => {
    setIsEditMode(!isEditMode)
    // Future: Enable inline editing mode
  }

  return (
    <>
      <SermonKeyboardShortcuts
        sermonId={sermonId}
        hasTranscript={hasTranscript}
        onGenerate={handleGenerate}
        onEdit={handleEdit}
      />
      <div className="flex items-center gap-3">
        <Link href={`/sermons/${sermonId}/edit`}>
          <Button variant="secondary">Edit Sermon</Button>
        </Link>
        {/* One-click background processing (shows when applicable) */}
        <ProcessSermonButton
          sermonId={sermonId}
          hasTranscript={hasTranscript}
          hasAudio={hasAudio}
        />
        {/* Individual controls for granular actions */}
        <TranscribeButton
          sermonId={sermonId}
          hasTranscript={hasTranscript}
          hasAudio={hasAudio}
        />
        <div ref={generateButtonRef as any}>
          <GenerateContentDropdown
            sermonId={sermonId}
            hasContent={hasContent}
            hasTranscript={hasTranscript}
          />
        </div>
      </div>
    </>
  )
}
