// This module is server-side only
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import path from "path"

// Point to the worker file in node_modules
if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs'
  )
}

export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer)

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      verbosity: 0, // Suppress warnings
    })
    const pdf = await loadingTask.promise

    const textParts: string[] = []

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Combine text items with spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ")

      textParts.push(pageText)
    }

    const fullText = textParts.join("\n\n").trim()

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
