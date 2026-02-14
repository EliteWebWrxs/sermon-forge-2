import pptxgen from "pptxgenjs"

export interface PPTXBranding {
  churchName?: string | null
  churchLogoUrl?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  fontPreference?: string | null
}

interface SermonNotesPPTXData {
  title: string
  date: string
  branding?: PPTXBranding
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
 * Convert hex color to PPTX format (6 chars without #)
 */
function hexToPptx(hex?: string | null, fallback: string = "1E3A8A"): string {
  if (!hex) return fallback
  // Remove # if present and ensure uppercase
  const cleaned = hex.replace(/^#/, "").toUpperCase()
  // Validate it's a proper 6-char hex
  if (!/^[0-9A-F]{6}$/.test(cleaned)) return fallback
  return cleaned
}

/**
 * Lighten a hex color by a percentage (returns without #)
 */
function lightenHex(hex: string, percent: number = 85): string {
  // Clean the hex - remove # if present
  const h = hex.replace(/^#/, "")

  // Validate
  if (!/^[0-9A-Fa-f]{6}$/.test(h)) return "F0F4FF" // Default light color

  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)

  const lighten = (c: number) => Math.min(255, c + Math.floor((255 - c) * (percent / 100)))

  const lr = lighten(r).toString(16).padStart(2, "0")
  const lg = lighten(g).toString(16).padStart(2, "0")
  const lb = lighten(b).toString(16).padStart(2, "0")

  return `${lr}${lg}${lb}`.toUpperCase()
}

/**
 * Generate a professional PowerPoint presentation for sermon notes
 * @param data Sermon notes data
 * @returns pptxgen instance
 */
export function generateSermonNotesPPTX(data: SermonNotesPPTXData): pptxgen {
  const pptx = new pptxgen()

  const branding = data.branding || {}

  // Set presentation metadata
  pptx.author = branding.churchName || "SermonForge"
  pptx.title = data.title
  pptx.subject = "Sermon Notes"

  // Define color scheme using branding
  const primaryHex = branding.primaryColor || "#1E3A8A"
  const secondaryHex = branding.secondaryColor || "#3B82F6"

  const colors = {
    primary: hexToPptx(primaryHex),
    secondary: hexToPptx(secondaryHex),
    accent: lightenHex(primaryHex, 90),
    text: "1F2937", // Dark gray
    textLight: "6B7280", // Medium gray
    success: "10B981", // Green
    successLight: "D1FAE5", // Light green
  }

  // Title slide
  const titleSlide = pptx.addSlide()

  // Background gradient
  titleSlide.background = { color: colors.accent }

  const hasChurchName = !!branding.churchName
  const hasLogo = !!branding.churchLogoUrl

  // Church logo (if provided)
  if (hasLogo) {
    titleSlide.addImage({
      path: branding.churchLogoUrl!,
      x: 4.25,
      y: 0.3,
      w: 1.5,
      h: 1.5,
      sizing: { type: "contain", w: 1.5, h: 1.5 },
    })
  }

  // Church name (if provided)
  if (hasChurchName) {
    titleSlide.addText(branding.churchName!, {
      x: 0.5,
      y: hasLogo ? 1.9 : 0.5,
      w: 9,
      h: 0.5,
      fontSize: 16,
      color: colors.textLight,
      align: "center",
    })
  }

  // Calculate vertical offset based on logo/church name presence
  const titleYOffset = hasLogo ? 2.5 : (hasChurchName ? 1.5 : 2.0)

  // Sermon title
  titleSlide.addText(data.title, {
    x: 0.5,
    y: titleYOffset,
    w: 9,
    h: 1.5,
    fontSize: 40,
    bold: true,
    color: colors.primary,
    align: "center",
    valign: "middle",
  })

  // Date
  titleSlide.addText(data.date, {
    x: 0.5,
    y: titleYOffset + 1.8,
    w: 9,
    h: 0.5,
    fontSize: 18,
    italic: true,
    color: colors.textLight,
    align: "center",
  })

  // Add decorative line
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 3.5,
    y: titleYOffset + 1.5,
    w: 3,
    h: 0.03,
    fill: { color: colors.secondary },
  })

  // Create a slide for each section
  data.content.sections.forEach((section, sectionIndex) => {
    const slide = pptx.addSlide()

    // Background
    slide.background = { color: "FFFFFF" }

    // Header with section number and title
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 1.0,
      fill: { color: colors.primary },
    })

    slide.addText(`${sectionIndex + 1}. ${section.title}`, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "FFFFFF",
      valign: "middle",
    })

    // Points - use more conservative layout
    let yPosition = 1.3
    const maxYPosition = 5.0 // Very conservative limit to prevent cutoff
    let currentSlide = slide

    section.points.forEach((point, pointIndex) => {
      // More conservative height estimation
      const textLength = point.text.length
      const charsPerLine = 55 // More conservative chars per line estimate
      const estimatedTextLines = Math.ceil(textLength / charsPerLine)
      const textHeight = Math.max(0.5, estimatedTextLines * 0.35)
      const totalHeight = point.blank && point.answer ? textHeight + 0.8 : textHeight + 0.4

      // Create new slide if we're too close to the bottom
      if (yPosition + totalHeight > maxYPosition && pointIndex > 0) {
        currentSlide = pptx.addSlide()
        currentSlide.background = { color: "FFFFFF" }

        // Add continuation header
        currentSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.8,
          fill: { color: colors.primary },
        })

        currentSlide.addText(`${sectionIndex + 1}. ${section.title} (cont.)`, {
          x: 0.5,
          y: 0.15,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: "FFFFFF",
          valign: "middle",
        })

        yPosition = 1.1
      }

      if (point.blank) {
        // Fill-in-the-blank point
        const textWithBlanks = point.text.replace(/_____/g, "_______________")

        currentSlide.addText(`• ${textWithBlanks}`, {
          x: 0.5,
          y: yPosition,
          w: 9,
          h: textHeight + 0.2,
          fontSize: 16,
          color: colors.text,
          bullet: false,
          wrap: true,
          valign: "top",
        })

        yPosition += textHeight + 0.25

        // Answer hint (smaller, lighter text)
        if (point.answer) {
          currentSlide.addText(`(Answer: ${point.answer})`, {
            x: 1.0,
            y: yPosition,
            w: 8,
            h: 0.35,
            fontSize: 11,
            italic: true,
            color: colors.textLight,
            wrap: true,
          })
          yPosition += 0.5
        } else {
          yPosition += 0.25
        }
      } else {
        // Regular point (like scripture references)
        currentSlide.addText(`• ${point.text}`, {
          x: 0.5,
          y: yPosition,
          w: 9,
          h: textHeight + 0.2,
          fontSize: 16,
          color: colors.text,
          bullet: false,
          wrap: true,
          valign: "top",
        })
        yPosition += textHeight + 0.35
      }
    })
  })

  // Discussion Questions slide
  if (data.content.discussion_questions && data.content.discussion_questions.length > 0) {
    const questionsSlide = pptx.addSlide()
    questionsSlide.background = { color: "FFFFFF" }

    // Header
    questionsSlide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 1.0,
      fill: { color: colors.secondary },
    })

    questionsSlide.addText("Discussion Questions", {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "FFFFFF",
      valign: "middle",
    })

    // Questions - conservative layout
    let yPosition = 1.3
    const maxYPosition = 5.0 // Very conservative limit
    let currentSlide = questionsSlide

    data.content.discussion_questions.forEach((question, index) => {
      // Conservative height estimate
      const textLength = question.length
      const charsPerLine = 50
      const estimatedTextLines = Math.ceil(textLength / charsPerLine)
      const estimatedHeight = Math.max(0.6, estimatedTextLines * 0.4)

      // Create new slide if needed
      if (yPosition + estimatedHeight > maxYPosition && index > 0) {
        currentSlide = pptx.addSlide()
        currentSlide.background = { color: "FFFFFF" }

        currentSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.8,
          fill: { color: colors.secondary },
        })

        currentSlide.addText("Discussion Questions (cont.)", {
          x: 0.5,
          y: 0.15,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: "FFFFFF",
          valign: "middle",
        })

        yPosition = 1.1
      }

      currentSlide.addText(`${index + 1}. ${question}`, {
        x: 0.5,
        y: yPosition,
        w: 9,
        h: estimatedHeight + 0.2,
        fontSize: 15,
        color: colors.text,
        valign: "top",
        wrap: true,
      })

      yPosition += estimatedHeight + 0.35
    })
  }

  // Application Points slide
  if (data.content.application_points && data.content.application_points.length > 0) {
    const applicationSlide = pptx.addSlide()
    applicationSlide.background = { color: "FFFFFF" }

    // Header
    applicationSlide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 1.0,
      fill: { color: colors.success },
    })

    applicationSlide.addText("Application Points", {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: "FFFFFF",
      valign: "middle",
    })

    // Points - conservative layout
    let yPosition = 1.3
    const maxYPosition = 5.0 // Very conservative limit
    let currentSlide = applicationSlide

    data.content.application_points.forEach((point, index) => {
      // Conservative height estimate
      const textLength = point.length
      const charsPerLine = 55
      const estimatedTextLines = Math.ceil(textLength / charsPerLine)
      const estimatedHeight = Math.max(0.5, estimatedTextLines * 0.35)

      // Create new slide if needed
      if (yPosition + estimatedHeight > maxYPosition && index > 0) {
        currentSlide = pptx.addSlide()
        currentSlide.background = { color: "FFFFFF" }

        currentSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.8,
          fill: { color: colors.success },
        })

        currentSlide.addText("Application Points (cont.)", {
          x: 0.5,
          y: 0.15,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: "FFFFFF",
          valign: "middle",
        })

        yPosition = 1.1
      }

      currentSlide.addText(`> ${point}`, {
        x: 0.5,
        y: yPosition,
        w: 9,
        h: estimatedHeight + 0.2,
        fontSize: 15,
        color: colors.text,
        bullet: false,
        wrap: true,
        valign: "top",
      })

      yPosition += estimatedHeight + 0.35
    })
  }

  return pptx
}

/**
 * Generate sermon notes PPTX and return as base64
 */
export async function generateSermonNotesPPTXBase64(data: SermonNotesPPTXData): Promise<string> {
  const pptx = generateSermonNotesPPTX(data)
  const buffer = await pptx.write({ outputType: "base64" })
  return buffer as string
}

/**
 * Generate sermon notes PPTX and return as ArrayBuffer
 */
export async function generateSermonNotesPPTXBuffer(data: SermonNotesPPTXData): Promise<ArrayBuffer> {
  const pptx = generateSermonNotesPPTX(data)
  const buffer = await pptx.write({ outputType: "arraybuffer" })
  return buffer as ArrayBuffer
}
