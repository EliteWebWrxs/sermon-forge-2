"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept: string
  maxSizeMB?: number
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function FileUpload({
  accept,
  maxSizeMB = 500,
  onFileSelect,
  disabled,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
      alert(
        `File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB.\n\n` +
        `Please use a smaller file or compress your video/audio before uploading.`
      )
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Change file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-blue-600">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Max file size: {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
