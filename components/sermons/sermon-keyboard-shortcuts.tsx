"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface SermonKeyboardShortcutsProps {
  sermonId: string
  hasTranscript: boolean
  onGenerate?: () => void
  onEdit?: () => void
}

export function SermonKeyboardShortcuts({
  sermonId,
  hasTranscript,
  onGenerate,
  onEdit,
}: SermonKeyboardShortcutsProps) {
  const router = useRouter()

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      // Only handle if not in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).contentEditable === "true"
      ) {
        return
      }

      // Cmd/Ctrl + G to generate content
      if ((e.metaKey || e.ctrlKey) && e.key === "g") {
        e.preventDefault()
        if (hasTranscript && onGenerate) {
          onGenerate()
        } else if (!hasTranscript) {
          alert("Please transcribe the sermon first before generating content.")
        }
      }

      // Cmd/Ctrl + E to edit (placeholder for future edit mode)
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault()
        if (onEdit) {
          onEdit()
        }
      }

      // Cmd/Ctrl + T to go to transcribe
      if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault()
        // Trigger transcription action
        console.log("Transcribe shortcut pressed")
      }

      // Cmd/Ctrl + B to go back to sermons list
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        router.push("/sermons")
      }

      // ? to show shortcuts help
      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault()
        showShortcutsHelp()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [hasTranscript, onGenerate, onEdit, router])

  return null
}

function showShortcutsHelp() {
  const shortcuts = [
    { keys: "Cmd+G", description: "Generate content" },
    { keys: "Cmd+E", description: "Edit mode (coming soon)" },
    { keys: "Cmd+T", description: "Transcribe audio" },
    { keys: "Cmd+B", description: "Back to sermons list" },
    { keys: "Cmd+1-4", description: "Switch content tabs" },
    { keys: "?", description: "Show this help" },
  ]

  const message = shortcuts
    .map((s) => `${s.keys.padEnd(15)} - ${s.description}`)
    .join("\n")

  alert(`Keyboard Shortcuts:\n\n${message}`)
}
