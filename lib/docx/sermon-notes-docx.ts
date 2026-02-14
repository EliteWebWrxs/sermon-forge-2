import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  BorderStyle,
  ShadingType,
} from "docx"

export interface DocxBranding {
  churchName?: string | null
  churchLogoUrl?: string | null
  churchLogoBuffer?: Buffer | null // Logo as buffer for embedding
  primaryColor?: string | null
  secondaryColor?: string | null
  fontPreference?: string | null
}

interface SermonNotesDocxData {
  title: string
  date: string
  branding?: DocxBranding
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
 * Convert hex color to DOCX format (6 chars without #)
 */
function hexToDocx(hex?: string | null, fallback: string = "1E3A8A"): string {
  if (!hex) return fallback
  return hex.replace("#", "").toUpperCase()
}

/**
 * Lighten a hex color by percentage
 */
function lightenHex(hex: string, percent: number = 85): string {
  const h = hex.replace("#", "")
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
 * Generate a professional DOCX file for sermon notes
 * @param data Sermon notes data
 * @returns Promise<Blob> DOCX file blob
 */
export async function generateSermonNotesDocx(
  data: SermonNotesDocxData
): Promise<Blob> {
  const branding = data.branding || {}

  // Define colors from branding
  const primaryHex = branding.primaryColor || "#1E3A8A"
  const secondaryHex = branding.secondaryColor || "#3B82F6"
  const primaryColor = hexToDocx(primaryHex)
  const secondaryLightColor = lightenHex(secondaryHex, 85)

  const sections: Paragraph[] = []

  // Church logo (if available)
  if (branding.churchLogoBuffer) {
    try {
      sections.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: branding.churchLogoBuffer,
              transformation: {
                width: 80,
                height: 80,
              },
              type: "png",
            }),
          ],
          spacing: { after: 100 },
        })
      )
    } catch (e) {
      // Logo failed to load, continue without it
      console.error("Failed to add logo to DOCX:", e)
    }
  }

  // Church name header (if available)
  if (branding.churchName) {
    sections.push(
      new Paragraph({
        text: branding.churchName,
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
        run: {
          size: 20, // 10pt
          color: "666666",
        },
      })
    )
  }

  // Horizontal line (if we have logo or church name)
  if (branding.churchLogoBuffer || branding.churchName) {
    sections.push(
      new Paragraph({
        border: {
          bottom: {
            color: "CCCCCC",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { after: 200 },
      })
    )
  }

  // Sermon title
  sections.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 100 },
    })
  )

  // Date
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.date,
          italics: true,
          color: "666666",
          size: 22, // 11pt
        }),
      ],
      spacing: { after: 400 },
    })
  )

  // Sermon sections
  data.content.sections.forEach((section, sectionIndex) => {
    // Section heading
    sections.push(
      new Paragraph({
        text: `${sectionIndex + 1}. ${section.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    )

    // Section points
    section.points.forEach((point) => {
      if (point.blank) {
        // Fill-in-the-blank point
        const textRuns: TextRun[] = []

        // Split by blank placeholder
        const parts = point.text.split("_____")

        parts.forEach((part, index) => {
          if (part) {
            textRuns.push(
              new TextRun({
                text: index === 0 ? `   • ${part} ` : part,
                size: 22, // 11pt
              })
            )
          }

          // Add blank line (except after last part)
          if (index < parts.length - 1) {
            textRuns.push(
              new TextRun({
                text: "                    ",
                underline: {
                  type: UnderlineType.SINGLE,
                },
                size: 22,
              })
            )
          }
        })

        // Add answer hint if available
        if (point.answer) {
          textRuns.push(
            new TextRun({
              text: `  (Answer: ${point.answer})`,
              size: 18, // 9pt
              color: "999999",
              italics: true,
            })
          )
        }

        sections.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 150 },
          })
        )
      } else {
        // Regular point (like scripture references)
        sections.push(
          new Paragraph({
            text: `   • ${point.text}`,
            spacing: { after: 150 },
            run: {
              size: 22, // 11pt
            },
          })
        )
      }
    })

    // Extra spacing after section
    sections.push(
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      })
    )
  })

  // Discussion Questions
  if (
    data.content.discussion_questions &&
    data.content.discussion_questions.length > 0
  ) {
    // Section header with branding background
    sections.push(
      new Paragraph({
        text: "Discussion Questions",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        shading: {
          type: ShadingType.SOLID,
          color: secondaryLightColor,
        },
      })
    )

    // Questions
    data.content.discussion_questions.forEach((question, index) => {
      sections.push(
        new Paragraph({
          text: `${index + 1}. ${question}`,
          spacing: { after: 200 },
          indent: { left: 300 },
          run: {
            size: 22,
          },
        })
      )
    })
  }

  // Application Points
  if (data.content.application_points && data.content.application_points.length > 0) {
    // Section header with background
    sections.push(
      new Paragraph({
        text: "Application Points",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        shading: {
          type: ShadingType.SOLID,
          color: "E6FFE6", // Light green
        },
      })
    )

    // Points
    data.content.application_points.forEach((point) => {
      sections.push(
        new Paragraph({
          text: `   ✓ ${point}`,
          spacing: { after: 200 },
          indent: { left: 300 },
          run: {
            size: 22,
          },
        })
      )
    })
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: sections,
      },
    ],
  })

  // Generate blob
  const blob = await Packer.toBlob(doc)
  return blob
}

/**
 * Download sermon notes as DOCX
 */
export async function downloadSermonNotesDocx(
  data: SermonNotesDocxData,
  filename?: string
) {
  const blob = await generateSermonNotesDocx(data)
  const fileName =
    filename || `${data.title.replace(/[^a-z0-9]/gi, "_")}_Notes.docx`

  // Create download link
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
