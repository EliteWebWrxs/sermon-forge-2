"use server"

import { extractTextFromPDFBuffer } from "@/lib/pdf-utils"

export async function extractPDFText(formData: FormData): Promise<{
  text?: string
  error?: string
}> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    if (!file.name.endsWith(".pdf")) {
      return { error: "File must be a PDF" }
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text
    const text = await extractTextFromPDFBuffer(buffer)

    if (text.length < 100) {
      return { error: "Could not extract enough text from PDF" }
    }

    return { text }
  } catch (error) {
    console.error("PDF extraction error:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract text from PDF",
    }
  }
}
