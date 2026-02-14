import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { functions } from "@/lib/inngest/functions"

// Determine the correct host URL for Inngest callbacks
function getServeHost(): string | undefined {
  // Use explicit app URL if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Fallback to Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return undefined
}

// Create the Inngest API handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
  serveHost: getServeHost(),
  servePath: "/api/inngest",
})
