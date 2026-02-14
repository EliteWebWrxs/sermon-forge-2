import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe, PLANS, TRIAL_CONFIG, getPlanFromPriceId } from "@/lib/stripe/server"
import {
  upsertSubscription,
  updateSubscriptionByStripeId,
} from "@/lib/db/subscriptions"
import {
  sendSubscriptionWelcomeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
  sendTrialReminderEmail,
} from "@/lib/email/send"
import { getMonthlySermonCount } from "@/lib/db/subscriptions"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription
        await handleTrialWillEnd(subscription)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const isTrial = session.metadata?.is_trial === "true"

  if (!userId) {
    console.error("No user_id in checkout session metadata")
    return
  }

  // Fetch the subscription to get details
  const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)
  const subscriptionItem = subscriptionData.items.data[0]
  const priceId = subscriptionItem?.price.id
  const planId = getPlanFromPriceId(priceId) || "starter"
  const plan = PLANS[planId]

  // Get billing period from subscription item
  const periodStart = subscriptionItem?.current_period_start
  const periodEnd = subscriptionItem?.current_period_end

  // Check if this is a trial subscription
  const trialEnd = subscriptionData.trial_end
  const isTrialing = subscriptionData.status === "trialing"

  await upsertSubscription(userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    plan_id: planId,
    status: subscriptionData.status,
    current_period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    // Use trial limit during trial, otherwise use plan limit
    sermon_limit: isTrialing ? TRIAL_CONFIG.sermonLimit : plan.sermonLimit,
    cancel_at_period_end: subscriptionData.cancel_at_period_end,
    // Trial fields
    trial_end: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
    trial_sermon_limit: TRIAL_CONFIG.sermonLimit,
    had_trial: isTrialing || isTrial,
  })

  // Send welcome email (different message for trial)
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && customer.email) {
      await sendSubscriptionWelcomeEmail({
        to: customer.email,
        planName: isTrialing ? `${plan.name} (14-day Trial)` : plan.name,
        sermonLimit: isTrialing ? TRIAL_CONFIG.sermonLimit : plan.sermonLimit,
      })
      console.log(`Welcome email sent to ${customer.email}`)
    }
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError)
    // Don't throw - email is non-critical
  }

  console.log(`Subscription created for user ${userId}: ${planId}${isTrialing ? " (trial)" : ""}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionItem = subscription.items.data[0]
  const priceId = subscriptionItem?.price.id
  const planId = getPlanFromPriceId(priceId) || "starter"
  const plan = PLANS[planId]

  // Get billing period from subscription item
  const periodStart = subscriptionItem?.current_period_start
  const periodEnd = subscriptionItem?.current_period_end

  // Check trial status
  const trialEnd = subscription.trial_end
  const isTrialing = subscription.status === "trialing"

  await updateSubscriptionByStripeId(subscription.id, {
    stripe_price_id: priceId,
    plan_id: planId,
    status: subscription.status,
    current_period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    // Use trial limit during trial, otherwise use plan limit
    sermon_limit: isTrialing ? TRIAL_CONFIG.sermonLimit : plan.sermonLimit,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    // Update trial end if present
    trial_end: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
  })

  console.log(`Subscription updated: ${subscription.id} -> ${planId}${isTrialing ? " (trial)" : ""}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionItem = subscription.items.data[0]
  const priceId = subscriptionItem?.price.id
  const planId = getPlanFromPriceId(priceId) || "starter"
  const plan = PLANS[planId]

  await updateSubscriptionByStripeId(subscription.id, {
    status: "canceled",
    canceled_at: new Date().toISOString(),
  })

  // Send cancellation email
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && customer.email) {
      await sendSubscriptionCanceledEmail({
        to: customer.email,
        planName: plan.name,
      })
      console.log(`Cancellation email sent to ${customer.email}`)
    }
  } catch (emailError) {
    console.error("Failed to send cancellation email:", emailError)
    // Don't throw - email is non-critical
  }

  console.log(`Subscription canceled: ${subscription.id}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Get subscription ID from invoice (can be string or expanded object)
  const invoiceData = invoice as unknown as { subscription?: string | { id: string } }
  const subscriptionId =
    typeof invoiceData.subscription === "string"
      ? invoiceData.subscription
      : invoiceData.subscription?.id

  if (subscriptionId) {
    // Reset sermon count on successful payment (new billing period)
    await updateSubscriptionByStripeId(subscriptionId, {
      sermon_count: 0,
      status: "active",
    })

    console.log(`Invoice paid, reset sermon count: ${subscriptionId}`)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID from invoice (can be string or expanded object)
  const invoiceData = invoice as unknown as { subscription?: string | { id: string } }
  const subscriptionId =
    typeof invoiceData.subscription === "string"
      ? invoiceData.subscription
      : invoiceData.subscription?.id

  if (subscriptionId) {
    await updateSubscriptionByStripeId(subscriptionId, {
      status: "past_due",
    })

    // Send payment failed email
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const subscriptionItem = subscription.items.data[0]
      const priceId = subscriptionItem?.price.id
      const planId = getPlanFromPriceId(priceId) || "starter"
      const plan = PLANS[planId]

      const customerId = subscription.customer as string
      const customer = await stripe.customers.retrieve(customerId)
      if (customer && !customer.deleted && customer.email) {
        await sendPaymentFailedEmail({
          to: customer.email,
          planName: plan.name,
        })
        console.log(`Payment failed email sent to ${customer.email}`)
      }
    } catch (emailError) {
      console.error("Failed to send payment failed email:", emailError)
      // Don't throw - email is non-critical
    }

    console.log(`Invoice payment failed: ${subscriptionId}`)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  // This event fires 3 days before trial ends
  const subscriptionItem = subscription.items.data[0]
  const priceId = subscriptionItem?.price.id
  const planId = getPlanFromPriceId(priceId) || "starter"
  const plan = PLANS[planId]

  const trialEnd = subscription.trial_end
  if (!trialEnd) return

  // Calculate days remaining
  const now = new Date()
  const trialEndDate = new Date(trialEnd * 1000)
  const daysRemaining = Math.max(
    0,
    Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  // Get user ID from metadata
  const userId = subscription.metadata?.user_id

  // Get sermon usage
  let sermonsUsed = 0
  if (userId) {
    sermonsUsed = await getMonthlySermonCount(userId)
  }

  // Send trial reminder email
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && customer.email) {
      await sendTrialReminderEmail({
        to: customer.email,
        daysRemaining,
        planName: plan.name,
        sermonsUsed,
        sermonLimit: TRIAL_CONFIG.sermonLimit,
      })
      console.log(`Trial reminder email sent to ${customer.email} (${daysRemaining} days remaining)`)
    }
  } catch (emailError) {
    console.error("Failed to send trial reminder email:", emailError)
    // Don't throw - email is non-critical
  }

  console.log(`Trial will end in ${daysRemaining} days: ${subscription.id}`)
}
