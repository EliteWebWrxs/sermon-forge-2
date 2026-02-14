// This module is server-side only
import { extractText } from "unpdf"

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array (which is accepted by unpdf)
    const uint8Array = new Uint8Array(buffer)

    const { text } = await extractText(uint8Array)

    // text is an array of strings (one per page), join them
    const fullText = (Array.isArray(text) ? text.join("\n\n") : text).trim()

    if (!fullText || fullText.length === 0) {
      throw new Error("No text found in PDF")
    }

    return fullText
  } catch (error) {
    console.error("PDF parsing error:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
    throw new Error("Failed to extract text from PDF")
  }
}

export function validatePDFText(text: string, minChars: number = 100): boolean {
  return text.trim().length >= minChars
}
