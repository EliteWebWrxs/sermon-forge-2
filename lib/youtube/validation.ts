/**
 * YouTube URL validation utilities (client-safe)
 */

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  // Remove whitespace
  url = url.trim()

  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\?\/\s]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  const videoId = extractVideoId(url)
  return videoId !== null && videoId.length === 11
}

/**
 * Get YouTube video info from URL (for display purposes)
 */
export function getVideoInfo(url: string): { videoId: string | null; embedUrl: string | null } {
  const videoId = extractVideoId(url)

  if (!videoId) {
    return { videoId: null, embedUrl: null }
  }

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  }
}
