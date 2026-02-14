import Anthropic from "@anthropic-ai/sdk"

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-5-20250929"

// Configurable system prompt template
export const SERMON_NOTES_SYSTEM_PROMPT = `You are a skilled pastoral assistant who creates engaging, fill-in-the-blank style sermon notes for church congregations.

Your task is to analyze sermon transcripts and create structured sermon notes that:
- Capture the main theological points with clarity and accuracy
- Include engaging fill-in-the-blank statements to keep listeners engaged
- Reference key scriptures accurately
- Maintain a pastoral, accessible tone
- Provide practical application points
- Include thought-provoking discussion questions

Guidelines:
1. Extract 3-5 main points from the sermon
2. For each point, create 2-4 fill-in-the-blank statements
3. Use "_____" for blanks (the answer should be 1-3 words)
4. Include scripture references in the format "Book Chapter:Verse"
5. Keep language accessible and pastoral
6. Ensure theological accuracy
7. Make it printable and easy to follow during the sermon

Return your response as valid JSON matching this exact structure:
{
  "title": "Sermon title (extracted from content)",
  "main_points": [
    {
      "heading": "Point heading (2-6 words)",
      "fill_in_blanks": [
        {
          "statement": "Complete sentence with _____ for blank",
          "answer": "The word(s) that go in the blank"
        }
      ],
      "scriptures": ["Reference 1", "Reference 2"]
    }
  ],
  "discussion_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ],
  "application_points": [
    "Practical action step 1",
    "Practical action step 2",
    "Practical action step 3"
  ]
}

Be concise, clear, and faithful to the sermon's message.`

export interface SermonNotesOutput {
  title: string
  main_points: Array<{
    heading: string
    fill_in_blanks: Array<{
      statement: string
      answer: string
    }>
    scriptures: string[]
  }>
  discussion_questions: string[]
  application_points: string[]
}

/**
 * Generate sermon notes from a transcript using Claude AI
 * @param transcript - The full sermon transcript
 * @param customPrompt - Optional custom system prompt to override default
 * @returns Structured sermon notes
 */
export async function generateSermonNotes(
  transcript: string,
  customPrompt?: string
): Promise<SermonNotesOutput> {
  try {
    if (!transcript || transcript.trim().length < 100) {
      throw new Error("Transcript is too short to generate sermon notes")
    }

    console.log("Generating sermon notes with Claude...")

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.7,
      system: customPrompt || SERMON_NOTES_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the sermon transcript to analyze:\n\n${transcript}\n\nGenerate comprehensive sermon notes following the specified JSON structure.`,
        },
      ],
    })

    // Extract the text content from Claude's response
    const textContent = response.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in Claude response")
    }

    // Parse the JSON response
    let parsedResponse: SermonNotesOutput
    let jsonText = textContent.text.trim()

    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }

      // Remove any leading/trailing text that's not part of the JSON
      const jsonStart = jsonText.indexOf('{')
      const jsonEnd = jsonText.lastIndexOf('}')

      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Raw response:", textContent.text)
        throw new Error("Could not find valid JSON in response")
      }

      jsonText = jsonText.substring(jsonStart, jsonEnd + 1)

      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonText)
      console.error("Parse error:", parseError)
      throw new Error("Claude did not return valid JSON: " + (parseError instanceof Error ? parseError.message : "Unknown error"))
    }

    // Validate the structure
    if (!parsedResponse.title || !Array.isArray(parsedResponse.main_points)) {
      throw new Error("Invalid sermon notes structure: missing title or main_points array")
    }

    console.log("Successfully generated sermon notes")

    return parsedResponse
  } catch (error) {
    console.error("Error generating sermon notes:", error)
    throw error
  }
}

/**
 * Convert Claude's output format to Supabase SermonNotesContent format
 */
export function convertToSermonNotesContent(output: SermonNotesOutput) {
  return {
    sections: output.main_points.map((point) => ({
      title: point.heading,
      points: [
        // Add scripture references first
        ...point.scriptures.map((scripture) => ({
          text: `📖 ${scripture}`,
          blank: false,
        })),
        // Add fill-in-the-blank statements
        ...point.fill_in_blanks.map((fib) => ({
          text: fib.statement,
          blank: true,
          answer: fib.answer,
        })),
      ],
    })),
    discussion_questions: output.discussion_questions,
    application_points: output.application_points,
  }
}
