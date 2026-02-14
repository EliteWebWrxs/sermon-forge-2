import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, BorderStyle } from "docx"

interface DiscussionGuideDocxData {
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
 * Generate a professional DOCX for discussion guide
 * @param data Discussion guide data
 * @returns Blob containing the DOCX file
 */
export async function generateDiscussionGuideDocx(
  data: DiscussionGuideDocxData
): Promise<Blob> {
  const sections: Paragraph[] = []

  // Church branding (if provided)
  if (data.churchName) {
    sections.push(
      new Paragraph({
        text: data.churchName,
        spacing: { after: 200 },
        style: "Normal",
      })
    )
  }

  // Horizontal line (using border)
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

  // Title
  sections.push(
    new Paragraph({
      text: data.content.title,
      heading: HeadingLevel.HEADING_1,
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
        }),
      ],
      spacing: { after: 400 },
    })
  )

  // Icebreaker Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Icebreaker",
          bold: true,
          color: "1E40AF",
        }),
      ],
      shading: {
        fill: "F0F8FF",
      },
      spacing: { before: 200, after: 200 },
    })
  )

  sections.push(
    new Paragraph({
      text: data.content.icebreaker,
      spacing: { after: 400 },
    })
  )

  // Scripture Study Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Scripture Study",
          bold: true,
          color: "6D28D9",
        }),
      ],
      shading: {
        fill: "F3E8FF",
      },
      spacing: { before: 200, after: 200 },
    })
  )

  data.content.scripture_study.forEach((item, index) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. `,
            bold: true,
          }),
          new TextRun({
            text: item.question,
          }),
        ],
        spacing: { after: 100 },
      })
    )

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: item.scripture_reference,
            color: "6D28D9",
            size: 18, // 9pt
          }),
        ],
        spacing: { after: 200 },
      })
    )
  })

  // Application Questions Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Application Questions",
          bold: true,
          color: "166534",
        }),
      ],
      shading: {
        fill: "F0FDF4",
      },
      spacing: { before: 200, after: 200 },
    })
  )

  data.content.application_questions.forEach((question, index) => {
    sections.push(
      new Paragraph({
        text: `${index + 1}. ${question}`,
        spacing: { after: 200 },
      })
    )
  })

  // Group Activity Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Group Activity",
          bold: true,
          color: "B45309",
        }),
      ],
      shading: {
        fill: "FFFBEB",
      },
      spacing: { before: 200, after: 200 },
    })
  )

  sections.push(
    new Paragraph({
      text: data.content.group_activity,
      spacing: { after: 400 },
    })
  )

  // Prayer Points Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Prayer Focus",
          bold: true,
          color: "4338CA",
        }),
      ],
      shading: {
        fill: "EEF2FF",
      },
      spacing: { before: 200, after: 200 },
    })
  )

  data.content.prayer_points.forEach((point) => {
    sections.push(
      new Paragraph({
        text: `• ${point}`,
        spacing: { after: 150 },
      })
    )
  })

  // Additional Resources (if present)
  if (data.content.additional_resources && data.content.additional_resources.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Additional Resources",
            bold: true,
            color: "475569",
          }),
        ],
        shading: {
          fill: "F8FAFC",
        },
        spacing: { before: 200, after: 200 },
      })
    )

    data.content.additional_resources.forEach((resource) => {
      sections.push(
        new Paragraph({
          text: `→ ${resource}`,
          spacing: { after: 150 },
        })
      )
    })
  }

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,  // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
            },
          },
        },
        children: sections,
      },
    ],
  })

  // Generate and return the blob
  return await Packer.toBlob(doc)
}
