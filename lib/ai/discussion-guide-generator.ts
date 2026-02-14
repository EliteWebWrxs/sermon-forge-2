import Anthropic from "@anthropic-ai/sdk"

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-5-20250929"

export const DISCUSSION_GUIDE_SYSTEM_PROMPT = `You are an experienced small group ministry leader who creates engaging, transformative discussion guides for church groups.

Your task is to create a comprehensive discussion guide that:
- Helps groups dig deeper than surface-level understanding
- Encourages vulnerable, authentic conversation and real-life sharing
- Balances biblical study with practical personal application
- Works effectively for groups of 5-15 people
- Takes 60-90 minutes to complete
- Creates space for everyone to participate

QUESTION GUIDELINES:
1. Create open-ended questions that can't be answered with yes/no
2. Ask "how" and "why" questions more than "what" questions
3. Encourage storytelling: "Share about a time when..."
4. Make questions specific enough to guide discussion but broad enough for diverse answers
5. Build from observation → interpretation → application
6. Include follow-up prompts for deeper exploration

DISCUSSION FLOW:
1. Icebreaker: Light, engaging question to warm up the group
2. Scripture Study: 3-5 questions exploring the biblical texts directly
3. Application: 3-5 questions connecting Scripture to real life
4. Group Activity: Practical, doable activity to reinforce the message
5. Prayer Points: Specific prayer focuses aligned with sermon themes
6. Additional Resources: Suggested readings, podcasts, or Scripture for further study

Return your response as valid JSON:
{
  "title": "Discussion guide title (related to sermon topic)",
  "icebreaker": "Engaging opening question (example: 'What's a time when you felt completely out of your depth?')",
  "scripture_study": [
    {
      "question": "Deep exploration question about the text",
      "scripture_reference": "Book Chapter:Verse"
    }
  ],
  "application_questions": [
    "Practical application question that encourages vulnerability",
    "Question connecting biblical truth to daily life"
  ],
  "group_activity": "Practical activity description (prayer exercise, sharing practice, journaling prompt, etc.)",
  "prayer_points": [
    "Specific prayer focus 1",
    "Specific prayer focus 2"
  ],
  "additional_resources": [
    "Related Scripture passage for further study",
    "Book or resource recommendation"
  ]
}

Make questions that create space for honest sharing, deeper understanding, and genuine life transformation.`

export interface DiscussionGuideOutput {
  title: string
  icebreaker: string
  scripture_study: Array<{
    question: string
    scripture_reference: string
  }>
  application_questions: string[]
  group_activity: string
  prayer_points: string[]
  additional_resources: string[]
}

/**
 * Generate a comprehensive small group discussion guide from a sermon
 * @param transcript - The full sermon transcript
 * @param sermonTitle - Optional sermon title for context
 * @param mainPoints - Optional array of main sermon points to reference
 * @param customPrompt - Optional custom system prompt to override default
 * @returns Structured discussion guide
 */
export async function generateDiscussionGuide(
  transcript: string,
  sermonTitle?: string,
  mainPoints?: string[],
  customPrompt?: string
): Promise<DiscussionGuideOutput> {
  try {
    if (!transcript || transcript.trim().length < 100) {
      throw new Error("Transcript is too short to generate discussion guide")
    }

    console.log("Generating discussion guide with Claude...")

    let userPrompt = `Here is the sermon transcript`
    if (sermonTitle) {
      userPrompt += ` titled "${sermonTitle}"`
    }
    userPrompt += `:\n\n${transcript}\n\n`

    if (mainPoints && mainPoints.length > 0) {
      userPrompt += `Main sermon points:\n${mainPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}\n\n`
    }

    userPrompt += `Create a comprehensive small group discussion guide following the specified structure. Focus on creating questions that encourage deeper reflection and authentic sharing.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3072,
      temperature: 0.7,
      system: customPrompt || DISCUSSION_GUIDE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in Claude response")
    }

    let jsonText = textContent.text.trim()

    // Try to extract JSON from markdown code blocks
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

    let parsedResponse: DiscussionGuideOutput
    try {
      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonText)
      console.error("Parse error:", parseError)
      throw new Error("Invalid JSON returned from Claude: " + (parseError instanceof Error ? parseError.message : "Unknown error"))
    }

    if (
      !parsedResponse.title ||
      !Array.isArray(parsedResponse.scripture_study) ||
      !Array.isArray(parsedResponse.application_questions)
    ) {
      throw new Error("Invalid discussion guide structure: missing required fields or arrays")
    }

    console.log("Successfully generated discussion guide")
    return parsedResponse
  } catch (error) {
    console.error("Error generating discussion guide:", error)
    throw error
  }
}
