"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { toastSuccess, toastError, toastInfo, handleApiError } from "@/lib/toast"

interface ExportSermonNotesDropdownProps {
  sermonId: string
  sermonTitle: string
}

export function ExportSermonNotesDropdown({
  sermonId,
  sermonTitle,
}: ExportSermonNotesDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingType, setExportingType] = useState<"pdf" | "docx" | "pptx" | null>(null)

  const handleExport = async (type: "pdf" | "docx" | "pptx") => {
    setIsExporting(true)
    setExportingType(type)
    toastInfo.exporting()

    try {
      const response = await fetch(`/api/sermons/${sermonId}/export/${type}`)

      if (!response.ok) {
        await handleApiError(response, `Failed to export ${type.toUpperCase()}`)
        return
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const extension = type === "docx" ? "docx" : type === "pptx" ? "pptx" : "pdf"
      link.download = `${sermonTitle.replace(/[^a-z0-9]/gi, "_")}_Sermon_Notes.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toastSuccess.exportReady(type.toUpperCase())
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toastError.networkError()
      } else {
        toastError.exportFailed()
      }
    } finally {
      setIsExporting(false)
      setExportingType(null)
    }
  }

  const trigger = (
    <Button
      variant="secondary"
      size="sm"
      loading={isExporting}
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      {isExporting ? (
        `Exporting ${exportingType?.toUpperCase()}...`
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export
          <svg
            className="w-3 h-3"
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

  if (isExporting) {
    return trigger
  }

  return (
    <DropdownMenu trigger={trigger}>
      <DropdownMenuItem onClick={() => handleExport("pdf")}>
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
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        Download PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport("docx")}>
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
        Download Word Doc
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleExport("pptx")}>
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
            d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18"
          />
        </svg>
        Download PowerPoint
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <div className="px-4 py-2">
        <p className="text-xs text-slate-500">
          Exports include fill-in-blanks, scripture references, discussion questions, and
          application points. Use PowerPoint for projecting during services.
        </p>
      </div>
    </DropdownMenu>
  )
}
