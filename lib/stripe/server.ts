import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

// Subscription plans configuration
export const PLANS = {
  starter: {
    name: "Starter",
    description: "Perfect for small churches",
    price: 149,
    sermonLimit: 4,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    features: [
      "4 sermons per month",
      "All content types",
      "PDF & Word exports",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    description: "For growing congregations",
    price: 299,
    sermonLimit: 12,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || "",
    features: [
      "12 sermons per month",
      "All content types",
      "PDF, Word & PowerPoint exports",
      "Church branding",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    description: "Unlimited for large ministries",
    price: 599,
    sermonLimit: -1, // -1 means unlimited
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    features: [
      "Unlimited sermons",
      "All content types",
      "All export formats",
      "Church branding",
      "Custom integrations",
      "Dedicated support",
    ],
  },
} as const

export type PlanId = keyof typeof PLANS

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 14,
  sermonLimit: 2, // Only 2 sermons during trial
  requireCard: true,
} as const

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Search for existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    const customer = existingCustomers.data[0]
    // Update metadata if needed
    if (customer.metadata?.user_id !== userId) {
      await stripe.customers.update(customer.id, {
        metadata: { user_id: userId },
      })
    }
    return customer.id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { user_id: userId },
  })

  return customer.id
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string,
  options?: {
    trialDays?: number
    isNewUser?: boolean
  }
): Promise<Stripe.Checkout.Session> {
  const { trialDays, isNewUser } = options || {}

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      is_trial: trialDays ? "true" : "false",
    },
    subscription_data: {
      metadata: {
        user_id: userId,
      },
      // Add trial period for new users
      ...(trialDays && trialDays > 0
        ? { trial_period_days: trialDays }
        : {}),
    },
    // Require card upfront for trials
    payment_method_collection: "always",
    allow_promotion_codes: true,
  })
}

/**
 * Create a customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch {
    return null
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Get plan details from price ID
 */
export function getPlanFromPriceId(priceId: string): PlanId | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return planId as PlanId
    }
  }
  return null
}
