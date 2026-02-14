import { resend, FROM_EMAIL } from "./client"
import {
  SermonCompleteEmail,
  getSermonCompleteTextEmail,
} from "./templates/sermon-complete"
import { render } from "@react-email/render"

interface SendSermonCompleteEmailParams {
  to: string
  sermonId: string
  sermonTitle: string
  contentGenerated: {
    sermonNotes: boolean
    devotional: boolean
    discussionGuide: boolean
    socialMedia: boolean
  }
}

export async function sendSermonCompleteEmail({
  to,
  sermonId,
  sermonTitle,
  contentGenerated,
}: SendSermonCompleteEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const sermonUrl = `${appUrl}/sermons/${sermonId}`

  const emailProps = {
    sermonTitle,
    sermonUrl,
    contentGenerated,
  }

  const html = await render(SermonCompleteEmail(emailProps))
  const text = getSermonCompleteTextEmail(emailProps)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your sermon "${sermonTitle}" is ready!`,
    html,
    text,
  })

  if (error) {
    console.error("Failed to send sermon complete email:", error)
    throw error
  }

  return data
}
