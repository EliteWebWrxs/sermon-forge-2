import Anthropic from "@anthropic-ai/sdk"

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables")
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = "claude-sonnet-4-5-20250929"

export const SOCIAL_MEDIA_SYSTEM_PROMPT = `You are an experienced church social media strategist who creates engaging, platform-optimized content that drives authentic engagement.

Your task is to extract the most powerful, quotable moments from a sermon and create a complete social media content pack with platform-specific variations.

CONTENT SELECTION CRITERIA:
1. Choose quotes that are impactful when standalone (not misleading without full context)
2. Select moments that are:
   - Emotionally resonant
   - Theologically sound
   - Practically applicable
   - Shareable and memorable
3. Include variety: scripture-based, application-focused, inspirational, thought-provoking
4. Extract 5-6 quotes (15-35 words each - keep quotes concise for social media)

PLATFORM-SPECIFIC ADAPTATIONS:
- **Instagram**: Short, punchy captions with strategic emoji use, focus on visual appeal
- **Facebook**: Longer, more conversational captions with storytelling elements
- **Twitter/X**: Concise (under 280 chars), hook-driven, conversation-starting
- **LinkedIn**: Professional tone, leadership/growth focused, less casual
- **Stories/Reels**: Visual concepts, on-screen text suggestions, voiceover scripts

ENGAGEMENT STRATEGIES:
1. Include calls to action (questions, invitations to share, tag someone)
2. Use hashtags strategically (mix popular + niche)
3. Keep tone authentic to the church's voice
4. Make content shareable without feeling "preachy"
5. Provide brief context so quotes aren't misunderstood

Return your response as valid JSON:
{
  "quotes": [
    {
      "text": "The exact quote from the sermon",
      "context": "Brief 1-sentence context/setup for the quote",
      "instagram_caption": "Short caption with emojis, under 150 chars",
      "facebook_caption": "Longer, conversational caption with story element, 2-4 sentences",
      "twitter_text": "Hook-driven tweet under 280 characters including the quote",
      "linkedin_post": "Professional-toned post connecting faith to leadership/growth",
      "story_idea": "Visual concept: 'Show text on screen with sunset background' or 'Pastor speaking this quote as voiceover'"
    }
  ],
  "hashtags": ["#Faith", "#ChurchOnline", "#SundaySermon", "#ChristianLiving"],
  "posting_schedule_suggestion": "Brief weekly posting plan (2-3 sentences max)"
}

Make content that feels authentic, not overly promotional, and genuinely valuable to followers.`

export interface SocialMediaOutput {
  quotes: Array<{
    text: string
    context: string
    instagram_caption: string
    facebook_caption: string
    twitter_text: string
    linkedin_post: string
    story_idea: string
  }>
  hashtags: string[]
  posting_schedule_suggestion: string
}

/**
 * Generate a complete social media content pack from a sermon
 * @param transcript - The full sermon transcript
 * @param sermonTitle - Optional sermon title for context
 * @param customPrompt - Optional custom system prompt to override default
 * @returns Platform-specific social media content with quotes and captions
 */
export async function generateSocialMedia(
  transcript: string,
  sermonTitle?: string,
  customPrompt?: string
): Promise<SocialMediaOutput> {
  try {
    if (!transcript || transcript.trim().length < 100) {
      throw new Error("Transcript is too short to generate social media content")
    }

    console.log("Generating social media content with Claude...")

    const userPrompt = sermonTitle
      ? `Here is the sermon titled "${sermonTitle}":\n\n${transcript}\n\nCreate a complete social media content pack with platform-specific variations following the specified structure. Extract the most shareable, impactful quotes that work well standalone.`
      : `Here is the sermon transcript:\n\n${transcript}\n\nCreate a complete social media content pack with platform-specific variations following the specified structure. Extract the most shareable, impactful quotes that work well standalone.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096, // Increased to allow for longer social media content
      temperature: 0.8,
      system: customPrompt || SOCIAL_MEDIA_SYSTEM_PROMPT,
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

    // Check if response was truncated
    if (response.stop_reason === "max_tokens") {
      console.warn("Claude response was truncated due to max_tokens limit")
    }

    let jsonText = textContent.text.trim()

    // Try to extract JSON from markdown code blocks
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    }

    // Find the start of JSON
    const jsonStart = jsonText.indexOf('{')
    if (jsonStart === -1) {
      console.error("Raw response:", textContent.text)
      throw new Error("Could not find valid JSON in response")
    }

    // Find the matching closing brace by counting brackets
    let bracketCount = 0
    let jsonEnd = -1
    let inString = false
    let escapeNext = false

    for (let i = jsonStart; i < jsonText.length; i++) {
      const char = jsonText[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === '{') {
          bracketCount++
        } else if (char === '}') {
          bracketCount--
          if (bracketCount === 0) {
            jsonEnd = i
            break
          }
        }
      }
    }

    if (jsonEnd === -1) {
      // Response was likely truncated - try to fix it
      console.warn("JSON appears truncated, attempting to fix...")

      // Find the last complete quote object
      const lastCompleteQuoteEnd = jsonText.lastIndexOf('}')
      if (lastCompleteQuoteEnd === -1) {
        console.error("Raw response:", textContent.text)
        throw new Error("Could not find any complete JSON objects in response")
      }

      // Truncate to the last complete quote and close the array and object
      let truncatedText = jsonText.substring(jsonStart, lastCompleteQuoteEnd + 1)

      // Count how many closing brackets we need
      const needsArrayClose = truncatedText.includes('"quotes": [') && !truncatedText.endsWith(']')
      const needsObjectClose = true // Always need to close the main object

      if (needsArrayClose) {
        truncatedText += '\n  ]'
      }
      if (needsObjectClose) {
        truncatedText += '\n}'
      }

      jsonText = truncatedText
      console.log("Successfully repaired truncated JSON")
    } else {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1)
    }

    let parsedResponse: SocialMediaOutput
    try {
      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse JSON:", jsonText)
      console.error("Parse error:", parseError)
      throw new Error("Invalid JSON returned from Claude: " + (parseError instanceof Error ? parseError.message : "Unknown error"))
    }

    if (!Array.isArray(parsedResponse.quotes) || parsedResponse.quotes.length === 0) {
      throw new Error("Invalid social media structure: missing or empty quotes array")
    }

    // Add defaults for missing fields (in case response was truncated)
    if (!parsedResponse.hashtags || parsedResponse.hashtags.length === 0) {
      console.warn("No hashtags in response, using defaults")
      parsedResponse.hashtags = ["#Faith", "#ChristianLiving", "#SundaySermon", "#ChurchOnline"]
    }

    if (!parsedResponse.posting_schedule_suggestion) {
      console.warn("No posting schedule in response, using default")
      parsedResponse.posting_schedule_suggestion =
        "Post quotes throughout the week to maximize engagement. " +
        "Monday and Wednesday tend to perform well for inspirational content. " +
        "Share Stories/Reels on weekends when engagement is higher."
    }

    console.log("Successfully generated social media content")
    return parsedResponse
  } catch (error) {
    console.error("Error generating social media content:", error)
    throw error
  }
}
