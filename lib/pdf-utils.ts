// This module is server-side only
import * as pdfParseMod from "pdf-parse"

// pdf-parse is a CommonJS module, need to access it correctly
const pdfParse = (pdfParseMod as any).default || pdfParseMod

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Extract text from PDF
    const data = await pdfParse(buffer)

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text found in PDF")
    }

    return data.text.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
    throw new Error("Failed to extract text from PDF")
  }
}

export function validatePDFText(text: string, minChars: number = 100): boolean {
  return text.trim().length >= minChars
}
