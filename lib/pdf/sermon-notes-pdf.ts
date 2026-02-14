import jsPDF from "jspdf"

export interface PDFBranding {
  churchName?: string | null
  churchLogoUrl?: string | null
  churchLogoBase64?: string | null // Base64 encoded logo for embedding
  primaryColor?: string | null
  secondaryColor?: string | null
  fontPreference?: string | null
}

interface SermonNotesPDFData {
  title: string
  date: string
  branding?: PDFBranding
  content: {
    sections: Array<{
      title: string
      points: Array<{
        text: string
        blank: boolean
        answer?: string
      }>
    }>
    discussion_questions?: string[]
    application_points?: string[]
  }
}

/**
 * Convert hex color to RGB tuple
 */
function hexToRgb(hex?: string | null, fallback: [number, number, number] = [30, 58, 138]): [number, number, number] {
  if (!hex) return fallback
  const h = hex.replace("#", "")
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback
  return [r, g, b]
}

/**
 * Lighten a color by a percentage
 */
function lightenRgb(rgb: [number, number, number], percent: number): [number, number, number] {
  const lighten = (c: number) => Math.min(255, c + Math.floor((255 - c) * (percent / 100)))
  return [lighten(rgb[0]), lighten(rgb[1]), lighten(rgb[2])]
}

/**
 * Generate a professional PDF for sermon notes
 * @param data Sermon notes data
 * @returns jsPDF instance
 */
export function generateSermonNotesPDF(data: SermonNotesPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter", // 8.5" x 11"
  })

  const branding = data.branding || {}

  // Define colors from branding
  const primaryRgb = hexToRgb(branding.primaryColor, [30, 58, 138])
  const secondaryRgb = hexToRgb(branding.secondaryColor, [59, 130, 246])
  const primaryLightRgb = lightenRgb(primaryRgb, 90)
  const secondaryLightRgb = lightenRgb(secondaryRgb, 85)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Helper function to clean text for PDF encoding
  const cleanTextForPDF = (text: string): string => {
    return text
      .replace(/\n/g, " ")           // Replace newlines with spaces
      .replace(/\s+/g, " ")          // Collapse multiple spaces
      .replace(/[""]/g, '"')         // Replace smart quotes with regular quotes
      .replace(/['']/g, "'")         // Replace smart apostrophes
      .replace(/—/g, "-")            // Replace em dash
      .replace(/–/g, "-")            // Replace en dash
      .replace(/…/g, "...")          // Replace ellipsis
      .replace(/[^\x00-\x7F]/g, (char) => {
        // Replace other non-ASCII characters with safe alternatives
        const replacements: { [key: string]: string } = {
          'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
          'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a',
          'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
          'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o',
          'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
          '°': ' degrees ',
          '×': 'x',
          '÷': '/',
        }
        return replacements[char] || ''  // Remove unknown special chars
      })
      .trim()
  }

  // Helper function to check if we need a new page
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with automatic wrapping
  const addText = (
    text: string,
    x: number,
    fontSize: number,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    maxWidth?: number
  ) => {
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", fontStyle)

    const lines = doc.splitTextToSize(text, maxWidth || contentWidth)
    const lineHeight = fontSize * 0.5

    lines.forEach((line: string) => {
      checkPageBreak(lineHeight)
      doc.text(line, x, yPosition)
      yPosition += lineHeight
    })
  }

  // Header with church branding (logo + name)
  const hasLogo = !!branding.churchLogoBase64
  const logoSize = 15 // mm

  if (hasLogo) {
    try {
      // Add logo image
      doc.addImage(
        branding.churchLogoBase64!,
        "PNG",
        margin,
        yPosition,
        logoSize,
        logoSize
      )
    } catch (e) {
      // Logo failed to load, continue without it
      console.error("Failed to add logo to PDF:", e)
    }
  }

  if (branding.churchName) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    // Position church name next to logo if present
    const nameX = hasLogo ? margin + logoSize + 5 : margin
    const nameY = hasLogo ? yPosition + logoSize / 2 + 2 : yPosition
    doc.text(cleanTextForPDF(branding.churchName), nameX, nameY)
  }

  if (hasLogo || branding.churchName) {
    yPosition += hasLogo ? logoSize + 3 : 8
  }

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Sermon title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  const titleLines = doc.splitTextToSize(cleanTextForPDF(data.title), contentWidth)
  titleLines.forEach((line: string) => {
    checkPageBreak(10)
    doc.text(line, margin, yPosition)
    yPosition += 10
  })
  yPosition += 3

  // Date
  doc.setFontSize(10)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(100, 100, 100)
  doc.text(cleanTextForPDF(data.date), margin, yPosition)
  yPosition += 12

  // Main content - Sermon sections
  data.content.sections.forEach((section, sectionIndex) => {
    checkPageBreak(25)

    // Add some spacing before each section (except first)
    if (sectionIndex > 0) {
      yPosition += 5
    }

    // Section heading
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(30, 30, 30)

    const sectionTitle = `${sectionIndex + 1}. ${cleanTextForPDF(section.title)}`
    const titleLines = doc.splitTextToSize(sectionTitle, contentWidth)
    titleLines.forEach((line: string) => {
      checkPageBreak(7)
      doc.text(line, margin, yPosition)
      yPosition += 7
    })
    yPosition += 4

    // Section points
    section.points.forEach((point) => {
      checkPageBreak(15)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      if (point.blank) {
        // Fill-in-the-blank point - render as text with underline
        const displayText = cleanTextForPDF(point.text).replace(/_____/g, "_______________")
        const lines = doc.splitTextToSize(displayText, contentWidth - 15)

        // Draw bullet point separately
        doc.text("-", margin + 3, yPosition)

        lines.forEach((line: string, lineIndex: number) => {
          checkPageBreak(6)
          doc.text(line, margin + 10, yPosition)
          yPosition += 6
        })

        // Answer hint (in lighter text)
        if (point.answer) {
          checkPageBreak(5)
          doc.setFontSize(9)
          doc.setTextColor(120, 120, 120)
          doc.text("(Answer: " + cleanTextForPDF(point.answer) + ")", margin + 10, yPosition)
          yPosition += 5
          doc.setFontSize(11)
          doc.setTextColor(0, 0, 0)
        }
      } else {
        // Regular point (like scripture references)
        const lines = doc.splitTextToSize(cleanTextForPDF(point.text), contentWidth - 15)

        // Draw bullet point separately
        doc.text("-", margin + 3, yPosition)

        lines.forEach((line: string, lineIndex: number) => {
          checkPageBreak(6)
          doc.text(line, margin + 10, yPosition)
          yPosition += 6
        })
      }

      yPosition += 2
    })

    yPosition += 8
  })

  // Discussion Questions
  if (data.content.discussion_questions && data.content.discussion_questions.length > 0) {
    checkPageBreak(35)

    // Section header with branding colors
    yPosition += 8
    doc.setFillColor(secondaryLightRgb[0], secondaryLightRgb[1], secondaryLightRgb[2])
    doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2])
    doc.text("Discussion Questions", margin + 2, yPosition + 3)
    yPosition += 12

    // Questions
    data.content.discussion_questions.forEach((question, index) => {
      checkPageBreak(18)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      const questionText = `${index + 1}. ${cleanTextForPDF(question)}`
      const lines = doc.splitTextToSize(questionText, contentWidth - 8)
      lines.forEach((line: string) => {
        checkPageBreak(5)
        doc.text(line, margin + 4, yPosition)
        yPosition += 5.5
      })
      yPosition += 3
    })

    yPosition += 3
  }

  // Application Points
  if (data.content.application_points && data.content.application_points.length > 0) {
    checkPageBreak(35)

    // Section header
    yPosition += 8
    doc.setFillColor(240, 255, 240) // Light green background
    doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(22, 101, 52) // Green text
    doc.text("Application Points", margin + 2, yPosition + 3)
    yPosition += 12

    // Points
    data.content.application_points.forEach((point) => {
      checkPageBreak(18)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      const lines = doc.splitTextToSize(cleanTextForPDF(point), contentWidth - 15)

      // Draw checkmark separately (using a simple character)
      doc.text(">", margin + 6, yPosition)

      lines.forEach((line: string, lineIndex: number) => {
        checkPageBreak(5)
        doc.text(line, margin + 12, yPosition)
        yPosition += 5.5
      })
      yPosition += 3
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc
}

/**
 * Download sermon notes as PDF
 */
export function downloadSermonNotesPDF(data: SermonNotesPDFData, filename?: string) {
  const doc = generateSermonNotesPDF(data)
  const fileName = filename || `${data.title.replace(/[^a-z0-9]/gi, "_")}_Notes.pdf`
  doc.save(fileName)
}
