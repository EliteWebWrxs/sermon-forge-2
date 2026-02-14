import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/server"
import { getSubscription } from "@/lib/db/subscriptions"

export interface Invoice {
  id: string
  number: string | null
  amount: number
  currency: string
  status: string
  date: string
  pdfUrl: string | null
  description: string | null
}

/**
 * GET /api/stripe/invoices
 * Get billing history (invoices) for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await getSubscription()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] })
    }

    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: 24, // Last 2 years of monthly invoices
    })

    const invoices: Invoice[] = stripeInvoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status || "unknown",
      date: new Date(invoice.created * 1000).toISOString(),
      pdfUrl: invoice.invoice_pdf ?? null,
      description: invoice.description || `${invoice.lines.data[0]?.description || "Subscription"}`,
    }))

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}
