import { resend, FROM_EMAIL } from "./client"
import {
  SermonCompleteEmail,
  getSermonCompleteTextEmail,
} from "./templates/sermon-complete"
import {
  SubscriptionWelcomeEmail,
  getSubscriptionWelcomeTextEmail,
} from "./templates/subscription-welcome"
import {
  PaymentFailedEmail,
  getPaymentFailedTextEmail,
} from "./templates/payment-failed"
import {
  SubscriptionCanceledEmail,
  getSubscriptionCanceledTextEmail,
} from "./templates/subscription-canceled"
import {
  TrialReminderEmail,
  getTrialReminderTextEmail,
} from "./templates/trial-reminder"
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

// Subscription Welcome Email
interface SendSubscriptionWelcomeEmailParams {
  to: string
  planName: string
  sermonLimit: number
}

export async function sendSubscriptionWelcomeEmail({
  to,
  planName,
  sermonLimit,
}: SendSubscriptionWelcomeEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const dashboardUrl = `${appUrl}/dashboard`

  const emailProps = {
    planName,
    sermonLimit: sermonLimit === -1 ? ("Unlimited" as const) : sermonLimit,
    dashboardUrl,
  }

  const html = await render(SubscriptionWelcomeEmail(emailProps))
  const text = getSubscriptionWelcomeTextEmail(emailProps)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to SermonForge ${planName}!`,
    html,
    text,
  })

  if (error) {
    console.error("Failed to send subscription welcome email:", error)
    throw error
  }

  return data
}

// Payment Failed Email
interface SendPaymentFailedEmailParams {
  to: string
  planName: string
}

export async function sendPaymentFailedEmail({
  to,
  planName,
}: SendPaymentFailedEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const billingUrl = `${appUrl}/settings/billing`

  const emailProps = {
    planName,
    billingUrl,
  }

  const html = await render(PaymentFailedEmail(emailProps))
  const text = getPaymentFailedTextEmail(emailProps)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Action Required: Payment Failed for SermonForge",
    html,
    text,
  })

  if (error) {
    console.error("Failed to send payment failed email:", error)
    throw error
  }

  return data
}

// Subscription Canceled Email
interface SendSubscriptionCanceledEmailParams {
  to: string
  planName: string
}

export async function sendSubscriptionCanceledEmail({
  to,
  planName,
}: SendSubscriptionCanceledEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const pricingUrl = `${appUrl}/pricing`

  const emailProps = {
    planName,
    pricingUrl,
  }

  const html = await render(SubscriptionCanceledEmail(emailProps))
  const text = getSubscriptionCanceledTextEmail(emailProps)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your SermonForge subscription has been canceled",
    html,
    text,
  })

  if (error) {
    console.error("Failed to send subscription canceled email:", error)
    throw error
  }

  return data
}

// Trial Reminder Email
interface SendTrialReminderEmailParams {
  to: string
  daysRemaining: number
  planName: string
  sermonsUsed: number
  sermonLimit: number
}

export async function sendTrialReminderEmail({
  to,
  daysRemaining,
  planName,
  sermonsUsed,
  sermonLimit,
}: SendTrialReminderEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const billingUrl = `${appUrl}/settings/billing`

  const emailProps = {
    daysRemaining,
    planName,
    sermonsUsed,
    sermonLimit,
    billingUrl,
  }

  const html = await render(TrialReminderEmail(emailProps))
  const text = getTrialReminderTextEmail(emailProps)

  const isLastDay = daysRemaining <= 1

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: isLastDay
      ? "Your SermonForge trial ends tomorrow!"
      : `${daysRemaining} days left in your SermonForge trial`,
    html,
    text,
  })

  if (error) {
    console.error("Failed to send trial reminder email:", error)
    throw error
  }

  return data
}
