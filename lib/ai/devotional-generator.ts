import Anthropic from "@anthropic-ai/sdk"

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-5-20250929"

export const DEVOTIONAL_SYSTEM_PROMPT = `You are a skilled Christian writer who creates engaging, SEO-optimized devotional blog posts.

Your task is to transform sermon content into a 800-1200 word devotional that:
- Captures and maintains the pastor's unique voice and teaching style
- Opens with a compelling hook (personal story, question, or relatable scenario)
- Clearly explains the biblical truth with depth and clarity
- Includes practical, actionable application points
- Uses accessible, warm, conversational language
- Naturally integrates relevant scripture throughout
- Ends with a prayer or personal reflection prompt
- Is fully optimized for SEO and web reading

SEO OPTIMIZATION REQUIREMENTS:
1. Create an attention-grabbing, keyword-rich title (50-60 characters)
2. Write a compelling meta description (140-160 characters)
3. Use H2 headings for main sections (2-3 sections)
4. Use H3 headings for subsections where appropriate
5. Include primary keywords naturally in the first paragraph
6. Use keyword variations throughout the content
7. Keep paragraphs short (2-4 sentences) for readability

CONTENT STRUCTURE:
1. Opening paragraph with hook (100-150 words)
2. Main teaching broken into 2-3 sections with H2 headings
3. Each section should include:
   - Clear biblical teaching
   - Scripture references integrated naturally
   - Real-life application or examples
4. Practical application section with specific action steps
5. Closing prayer or reflection (50-100 words)

PASTOR'S VOICE:
- Maintain the same tone, phrases, and teaching style from the sermon
- Use any memorable phrases or illustrations from the original message
- Keep the theological emphasis and perspective consistent
- Preserve the pastor's unique way of explaining concepts

Return your response as valid JSON with HTML content:
{
  "title": "SEO-optimized, compelling title (50-60 chars)",
  "meta_description": "Engaging description for search results (140-160 chars)",
  "content": "<p>Opening paragraph...</p><h2>First Heading</h2><p>Content...</p><h3>Subheading</h3><p>More content...</p>... (Full HTML with proper heading hierarchy)",
  "scripture_references": ["Book Chapter:Verse", "Book Chapter:Verse"],
  "keywords": ["primary keyword", "secondary keyword", "related keyword"]
}

Target 800-1200 words. Make it shareable, memorable, and spiritually enriching.`

export interface DevotionalOutput {
  title: string
  meta_description: string
  content: string // Full HTML content
  scripture_references: string[]
  keywords: string[]
}

/**
 * Generate an SEO-optimized devotional blog post from a sermon transcript
 * @param transcript - The full sermon transcript
 * @param sermonTitle - Optional sermon title to help maintain context
 * @param customPrompt - Optional custom system prompt to override default
 * @returns Structured devotional with HTML content
 */
export async function generateDevotional(
  transcript: string,
  sermonTitle?: string,
  customPrompt?: string
): Promise<DevotionalOutput> {
  try {
    if (!transcript || transcript.trim().length < 100) {
      throw new Error("Transcript is too short to generate devotional")
    }

    console.log("Generating devotional with Claude...")

    const userPrompt = sermonTitle
      ? `Here is the sermon titled "${sermonTitle}":\n\n${transcript}\n\nCreate an engaging, SEO-optimized devotional blog post following the specified structure. Maintain the pastor's voice and teaching style from the sermon.`
      : `Here is the sermon transcript:\n\n${transcript}\n\nCreate an engaging, SEO-optimized devotional blog post following the specified structure.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.8,
      system: customPrompt || DEVOTIONAL_SYSTEM_PROMPT,
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

    let parsedResponse: DevotionalOutput
    try {
      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonText)
      console.error("Parse error:", parseError)
      throw new Error("Invalid JSON returned from Claude: " + (parseError instanceof Error ? parseError.message : "Unknown error"))
    }

    if (!parsedResponse.title || !parsedResponse.content || !parsedResponse.meta_description) {
      throw new Error("Invalid devotional structure: missing required fields")
    }

    console.log("Successfully generated devotional")
    return parsedResponse
  } catch (error) {
    console.error("Error generating devotional:", error)
    throw error
  }
}
