"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toastSuccess, toastError, handleApiError } from "@/lib/toast"

interface DeleteSermonButtonProps {
  sermonId: string
  sermonTitle: string
}

export function DeleteSermonButton({
  sermonId,
  sermonTitle,
}: DeleteSermonButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/sermons/${sermonId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        await handleApiError(response, "Failed to delete sermon")
        return
      }

      toastSuccess.sermonDeleted()
      router.push("/sermons")
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      console.error("Error deleting sermon:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toastError.networkError()
      } else {
        toastError.generic("Failed to delete sermon. Please try again.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Delete Sermon
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to delete &quot;{sermonTitle}&quot;? This action
            cannot be undone and will also delete all generated content.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
    >
      Delete
    </button>
  )
}
