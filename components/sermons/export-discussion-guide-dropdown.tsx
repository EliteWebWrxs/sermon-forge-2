"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface ExportDiscussionGuideDropdownProps {
  sermonId: string
  sermonTitle: string
}

export function ExportDiscussionGuideDropdown({ sermonId, sermonTitle }: ExportDiscussionGuideDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: "pdf" | "docx") => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/sermons/${sermonId}/export/discussion-guide/${type}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${sermonTitle}_Discussion_Guide.${type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export discussion guide. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu
      trigger={
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isExporting}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? "Exporting..." : "Export"}
        </button>
      }
    >
      <DropdownMenuItem
        onClick={() => handleExport("pdf")}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
      >
        Download PDF
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleExport("docx")}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      >
        Download Word
      </DropdownMenuItem>
    </DropdownMenu>
  )
}
