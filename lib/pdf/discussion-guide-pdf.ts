import jsPDF from "jspdf"

interface DiscussionGuidePDFData {
  title: string
  date: string
  churchName?: string
  content: {
    title: string
    icebreaker: string
    scripture_study: Array<{
      question: string
      scripture_reference: string
    }>
    application_questions: string[]
    group_activity: string
    prayer_points: string[]
    additional_resources?: string[]
  }
}

/**
 * Generate a professional PDF for discussion guide
 * @param data Discussion guide data
 * @returns jsPDF instance
 */
export function generateDiscussionGuidePDF(data: DiscussionGuidePDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter", // 8.5" x 11"
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let yPosition = margin

  // Helper function to clean text for PDF encoding
  const cleanTextForPDF = (text: string): string => {
    return text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/—/g, "-")
      .replace(/–/g, "-")
      .replace(/…/g, "...")
      .replace(/[^\x00-\x7F]/g, (char) => {
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
        return replacements[char] || ''
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

  // Header with church branding
  if (data.churchName) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    doc.text(cleanTextForPDF(data.churchName), margin, yPosition)
    yPosition += 8
  }

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Guide title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  const titleLines = doc.splitTextToSize(cleanTextForPDF(data.content.title), contentWidth)
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
  yPosition += 15

  // Icebreaker Section
  checkPageBreak(30)
  doc.setFillColor(240, 248, 255) // Light blue
  doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 64, 175) // Blue text
  doc.text("Icebreaker", margin + 2, yPosition + 3)
  yPosition += 12

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)
  const icebreakerLines = doc.splitTextToSize(cleanTextForPDF(data.content.icebreaker), contentWidth - 8)
  icebreakerLines.forEach((line: string) => {
    checkPageBreak(5)
    doc.text(line, margin + 4, yPosition)
    yPosition += 5.5
  })
  yPosition += 8

  // Scripture Study Section
  checkPageBreak(35)
  doc.setFillColor(243, 232, 255) // Light purple
  doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(109, 40, 217) // Purple text
  doc.text("Scripture Study", margin + 2, yPosition + 3)
  yPosition += 12

  data.content.scripture_study.forEach((item, index) => {
    checkPageBreak(20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    // Question number
    doc.setFont("helvetica", "bold")
    doc.text(`${index + 1}.`, margin + 4, yPosition)

    // Question text
    doc.setFont("helvetica", "normal")
    const questionLines = doc.splitTextToSize(cleanTextForPDF(item.question), contentWidth - 18)
    questionLines.forEach((line: string, idx: number) => {
      checkPageBreak(5)
      if (idx === 0) {
        doc.text(line, margin + 10, yPosition)
      } else {
        doc.text(line, margin + 10, yPosition)
      }
      yPosition += 5.5
    })

    // Scripture reference
    checkPageBreak(5)
    doc.setFontSize(9)
    doc.setTextColor(109, 40, 217)
    doc.text(cleanTextForPDF(item.scripture_reference), margin + 10, yPosition)
    yPosition += 7
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
  })

  yPosition += 5

  // Application Questions Section
  checkPageBreak(35)
  doc.setFillColor(240, 253, 244) // Light green
  doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(22, 101, 52) // Green text
  doc.text("Application Questions", margin + 2, yPosition + 3)
  yPosition += 12

  data.content.application_questions.forEach((question, index) => {
    checkPageBreak(15)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    const questionText = `${index + 1}. ${cleanTextForPDF(question)}`
    const questionLines = doc.splitTextToSize(questionText, contentWidth - 8)
    questionLines.forEach((line: string) => {
      checkPageBreak(5)
      doc.text(line, margin + 4, yPosition)
      yPosition += 5.5
    })
    yPosition += 3
  })

  yPosition += 5

  // Group Activity Section
  checkPageBreak(30)
  doc.setFillColor(255, 251, 235) // Light amber
  doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(180, 83, 9) // Amber text
  doc.text("Group Activity", margin + 2, yPosition + 3)
  yPosition += 12

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)
  const activityLines = doc.splitTextToSize(cleanTextForPDF(data.content.group_activity), contentWidth - 8)
  activityLines.forEach((line: string) => {
    checkPageBreak(5)
    doc.text(line, margin + 4, yPosition)
    yPosition += 5.5
  })
  yPosition += 8

  // Prayer Points Section
  checkPageBreak(35)
  doc.setFillColor(238, 242, 255) // Light indigo
  doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(67, 56, 202) // Indigo text
  doc.text("Prayer Focus", margin + 2, yPosition + 3)
  yPosition += 12

  data.content.prayer_points.forEach((point) => {
    checkPageBreak(15)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)

    const lines = doc.splitTextToSize(cleanTextForPDF(point), contentWidth - 15)

    // Draw bullet
    doc.text("-", margin + 6, yPosition)

    lines.forEach((line: string) => {
      checkPageBreak(5)
      doc.text(line, margin + 12, yPosition)
      yPosition += 5.5
    })
    yPosition += 3
  })

  // Additional Resources (if present)
  if (data.content.additional_resources && data.content.additional_resources.length > 0) {
    yPosition += 5
    checkPageBreak(30)

    doc.setFillColor(248, 250, 252) // Light slate
    doc.rect(margin, yPosition - 4, contentWidth, 9, "F")
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(71, 85, 105) // Slate text
    doc.text("Additional Resources", margin + 2, yPosition + 3)
    yPosition += 12

    data.content.additional_resources.forEach((resource) => {
      checkPageBreak(15)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)

      const lines = doc.splitTextToSize(cleanTextForPDF(resource), contentWidth - 15)

      // Draw arrow
      doc.text(">", margin + 6, yPosition)

      lines.forEach((line: string) => {
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
 * Download discussion guide as PDF
 */
export function downloadDiscussionGuidePDF(data: DiscussionGuidePDFData, filename?: string) {
  const doc = generateDiscussionGuidePDF(data)
  const fileName = filename || `${data.title.replace(/[^a-z0-9]/gi, "_")}_Discussion_Guide.pdf`
  doc.save(fileName)
}
