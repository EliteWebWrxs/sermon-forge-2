import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { SermonUploadForm } from "@/components/sermons/sermon-upload-form"

export const metadata: Metadata = { title: "Upload Sermon" }

export default async function NewSermonPage() {
  const user = await requireAuth()

  return (
    <>
      <Header
        title="Upload Sermon"
        description="Add a sermon to generate content from. Supports audio, video, PDF, YouTube links, or plain text."
      />

      <SermonUploadForm userId={user.id} />
    </>
  )
}
