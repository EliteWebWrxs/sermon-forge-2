/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "./file-upload"
import { uploadSermonFile, getFileType } from "@/lib/storage"
import { extractPDFText } from "@/app/(dashboard)/sermons/pdf-actions"
import { createSermonAction } from "@/app/(dashboard)/sermons/actions"
import { toastSuccess, toastError, toastInfo } from "@/lib/toast"
import { ProgressBar, ProcessingStatusCard } from "@/components/progress-indicator"
import type { InputType } from "@/types"

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  sermon_date: z.string().min(1, "Date is required"),
})

type UploadFormValues = z.infer<typeof uploadSchema>

interface SermonUploadFormProps {
  userId: string
}

type UploadStep = "idle" | "uploading" | "extracting" | "creating" | "transcribing"

const STEP_MESSAGES: Record<UploadStep, { title: string; description: string; time?: string }> = {
  idle: { title: "", description: "" },
  uploading: { title: "Uploading file", description: "Securely uploading your file to our servers", time: "depends on file size" },
  extracting: { title: "Extracting text", description: "Reading and extracting text from your PDF" },
  creating: { title: "Creating sermon", description: "Setting up your sermon record" },
  transcribing: { title: "Transcription started", description: "Your audio is being transcribed. This may take 2-3 minutes.", time: "2-3 minutes" },
}

export function SermonUploadForm({ userId }: SermonUploadFormProps) {
  const router = useRouter()
  const [ uploadMethod, setUploadMethod ] = useState<
    "file" | "pdf" | "text"
  >("file")
  const [ selectedFile, setSelectedFile ] = useState<File | null>(null)
  const [ pastedText, setPastedText ] = useState("")
  const [ uploading, setUploading ] = useState(false)
  const [ uploadProgress, setUploadProgress ] = useState(0)
  const [ uploadStep, setUploadStep ] = useState<UploadStep>("idle")
  const [ error, setError ] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      sermon_date: new Date().toISOString().split("T")[ 0 ],
    },
  })

  const onSubmit = async (data: UploadFormValues) => {
    setError(null)
    setUploading(true)
    setUploadStep("uploading")

    try {
      let input_type: InputType | undefined
      let fileUrl: string | undefined
      let transcript: string | undefined

      // Handle different upload methods
      if (uploadMethod === "file") {
        if (!selectedFile) {
          toastError.generic("Please select a file")
          setUploading(false)
          setUploadStep("idle")
          return
        }

        // Generate a temporary sermon ID for upload path
        const tempId = crypto.randomUUID()

        setUploadProgress(10)

        // Upload file to Supabase Storage
        try {
          const { url } = await uploadSermonFile(userId, selectedFile, tempId)
          fileUrl = url
        } catch (uploadErr) {
          console.error("File upload error:", uploadErr)
          const message = uploadErr instanceof Error ? uploadErr.message : "Failed to upload file"
          if (message.includes("size") || message.includes("large")) {
            toastError.fileTooLarge("100MB")
          } else {
            toastError.uploadFailed()
          }
          setUploading(false)
          setUploadStep("idle")
          return
        }

        setUploadProgress(50)
        setUploadStep("creating")

        const fileType = getFileType(selectedFile)
        input_type = fileType

        setUploadProgress(100)
      } else if (uploadMethod === "pdf") {
        if (!selectedFile) {
          toastError.generic("Please select a PDF file")
          setUploading(false)
          setUploadStep("idle")
          return
        }

        setUploadProgress(10)
        setUploadStep("extracting")

        // Generate a temporary sermon ID for upload path
        const tempId = crypto.randomUUID()

        // Extract text from PDF using server action
        const formData = new FormData()
        formData.append("file", selectedFile)

        const { text: extractedText, error: extractError } =
          await extractPDFText(formData)

        if (extractError || !extractedText) {
          const errorMsg = extractError || "Could not extract text from PDF"
          setError(errorMsg)
          toastError.generic(errorMsg)
          setUploading(false)
          setUploadStep("idle")
          return
        }

        setUploadProgress(40)
        setUploadStep("uploading")

        // Upload PDF to Supabase Storage
        try {
          const { url } = await uploadSermonFile(userId, selectedFile, tempId)
          fileUrl = url
        } catch (uploadErr) {
          console.error("PDF upload error:", uploadErr)
          toastError.uploadFailed()
          setUploading(false)
          setUploadStep("idle")
          return
        }

        setUploadProgress(80)
        setUploadStep("creating")

        input_type = "pdf"
        transcript = extractedText

        setUploadProgress(100)
      } else if (uploadMethod === "text") {
        if (!pastedText || pastedText.length < 500) {
          const msg = "Please paste at least 500 characters of text"
          setError(msg)
          toastError.generic(msg)
          setUploading(false)
          setUploadStep("idle")
          return
        }

        setUploadStep("creating")
        input_type = "text_paste"
        transcript = pastedText
      }

      // Validate input_type is set
      if (!input_type) {
        toastError.generic("Please select an upload method")
        setUploading(false)
        setUploadStep("idle")
        return
      }

      // Create sermon record
      const result: any = await createSermonAction({
        title: data.title,
        sermon_date: data.sermon_date,
        input_type,
        audio_url: input_type === "audio" ? fileUrl : undefined,
        video_url: input_type === "video" ? fileUrl : undefined,
        pdf_url: input_type === "pdf" ? fileUrl : undefined,
        transcript,
      })

      // Success!
      toastSuccess.sermonUploaded()

      // Trigger transcription for audio/video files (don't wait for it)
      if (input_type === "audio" || input_type === "video") {
        setUploadStep("transcribing")
        toastInfo.transcribing()
        fetch(`/api/sermons/${result.id}/transcribe`, {
          method: "POST",
        }).catch((error) => {
          console.error("Failed to start transcription:", error)
          // Don't block the redirect if transcription fails to start
        })
      }

      router.push(`/sermons/${result.id}`)
    } catch (err) {
      console.error("Upload error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to upload sermon"

      // Check for specific error types
      if (errorMessage.includes("limit")) {
        toastError.limitReached()
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        toastError.networkError()
      } else {
        toastError.uploadFailed()
      }

      setError(errorMessage)
      setUploadStep("idle")
      setUploading(false)
    }
  }

  return (
    <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
      {/* Basic Info */ }
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Sermon Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Sermon Title"
            { ...register("title") }
            placeholder="e.g., The Power of Grace"
            error={ errors.title?.message }
            disabled={ uploading }
          />

          <Input
            label="Sermon Date"
            type="date"
            { ...register("sermon_date") }
            error={ errors.sermon_date?.message }
            disabled={ uploading }
          />
        </div>
      </div>

      {/* Upload Method */ }
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Upload Method
        </h2>

        <Tabs value={ uploadMethod } onValueChange={ (v) => setUploadMethod(v as any) }>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">Audio/Video</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="text">Paste Text</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <FileUpload
              accept=".mp3,.mp4,.m4a,.wav,.aac,.mov,.avi,.mkv,.webm"
              maxSizeMB={ 100 }
              onFileSelect={ setSelectedFile }
              disabled={ uploading }
            />
            <p className="text-xs text-slate-500 mt-2">
              Supported formats: MP3, MP4, M4A, WAV, AAC, MOV, AVI, MKV, WEBM
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Note: Files larger than 50MB may require a Supabase Pro plan. Consider compressing large videos before uploading.
            </p>
          </TabsContent>

          <TabsContent value="pdf">
            <FileUpload
              accept=".pdf"
              maxSizeMB={ 50 }
              onFileSelect={ setSelectedFile }
              disabled={ uploading }
            />
            <p className="text-xs text-slate-500 mt-2">
              Upload a PDF of your sermon notes or manuscript. Text will be
              extracted automatically.
            </p>
          </TabsContent>

          <TabsContent value="text">
            <div className="space-y-2">
              <Label htmlFor="transcript">Sermon Transcript</Label>
              <textarea
                id="transcript"
                value={ pastedText }
                onChange={ (e) => setPastedText(e.target.value) }
                placeholder="Paste your sermon transcript here (minimum 500 characters)..."
                disabled={ uploading }
                rows={ 12 }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-slate-500">
                { pastedText.length } / 500 characters minimum
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Error Message */ }
      { error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{ error }</p>
        </div>
      ) }

      {/* Upload Progress */ }
      { uploading && uploadStep !== "idle" && (
        <ProcessingStatusCard
          title={ STEP_MESSAGES[uploadStep].title }
          description={ STEP_MESSAGES[uploadStep].description }
          estimatedTime={ STEP_MESSAGES[uploadStep].time }
        />
      ) }

      {/* Progress Bar for file uploads */ }
      { uploading && uploadProgress > 0 && uploadStep === "uploading" && (
        <div className="px-4">
          <ProgressBar
            progress={ uploadProgress }
            label="Upload progress"
            size="md"
          />
        </div>
      ) }

      {/* Submit Button */ }
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={ () => router.back() }
          disabled={ uploading }
        >
          Cancel
        </Button>
        <Button type="submit" loading={ uploading }>
          { uploading ? "Uploading..." : "Upload Sermon" }
        </Button>
      </div>
    </form>
  )
}
