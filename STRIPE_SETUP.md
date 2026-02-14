# Stripe Setup Guide

This guide walks you through setting up Stripe for subscription billing in SermonForge.

## Prerequisites

- Stripe account (create one at [stripe.com](https://stripe.com))
- Access to Stripe Dashboard

## Step 1: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

Add to your `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

## Step 2: Create Products and Prices

### Option A: Using Stripe Dashboard (Recommended)

1. Go to **Products** → **Add product**

2. Create **Starter** plan:
   - Name: `Starter`
   - Description: `Perfect for small churches - 4 sermons per month`
   - Price: `$149.00` / month (recurring)
   - Copy the Price ID (starts with `price_`)

3. Create **Growth** plan:
   - Name: `Growth`
   - Description: `For growing congregations - 12 sermons per month`
   - Price: `$299.00` / month (recurring)
   - Copy the Price ID

4. Create **Enterprise** plan:
   - Name: `Enterprise`
   - Description: `Unlimited for large ministries`
   - Price: `$599.00` / month (recurring)
   - Copy the Price ID

### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create products and prices
stripe products create --name="Starter" --description="4 sermons per month"
stripe prices create --product=prod_xxx --unit-amount=14900 --currency=usd --recurring[interval]=month

stripe products create --name="Growth" --description="12 sermons per month"
stripe prices create --product=prod_xxx --unit-amount=29900 --currency=usd --recurring[interval]=month

stripe products create --name="Enterprise" --description="Unlimited sermons"
stripe prices create --product=prod_xxx --unit-amount=59900 --currency=usd --recurring[interval]=month
```

Add Price IDs to `.env.local`:

```env
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_GROWTH_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
```

## Step 3: Set Up Webhooks

### For Local Development

1. Install Stripe CLI (if not already):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login and forward webhooks:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Copy the webhook signing secret displayed and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### For Production

1. Go to **Developers** → **Webhooks** → **Add endpoint**

2. Enter your endpoint URL:
   ```
   https://your-domain.com/api/stripe/webhook
   ```

3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copy the **Signing secret** and add to your production environment variables

## Step 4: Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**

2. Enable the portal and configure:
   - **Payment methods**: Allow customers to update
   - **Subscriptions**: Allow cancellation (at period end recommended)
   - **Invoices**: Show invoice history

3. Save changes

## Step 5: Run Database Migration

Run the subscription table migration:

```sql
-- In Supabase SQL Editor, run the contents of:
-- supabase/migrations/20240319000000_subscriptions.sql
```

Or via CLI:
```bash
supabase db push
```

## Environment Variables Summary

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_GROWTH_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
```

## Testing

### Test Cards

Use these test card numbers in test mode:

| Scenario | Card Number |
|----------|-------------|
| Success | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| Requires Auth | `4000 0025 0000 3155` |
| Insufficient Funds | `4000 0000 0000 9995` |

Use any future expiry date and any 3-digit CVC.

### Testing Flow

1. Go to `/settings/billing`
2. Select a plan and click "Get Started"
3. Enter test card details
4. Complete checkout
5. Verify subscription appears in dashboard
6. Test "Manage Billing" button opens portal

### Webhook Testing

With Stripe CLI running (`stripe listen --forward-to localhost:3000/api/stripe/webhook`):

1. Complete a checkout
2. Watch the CLI output for webhook events
3. Verify subscription is created in your database

## Troubleshooting

### "Invalid API Key"
- Ensure you're using the correct key (test vs live)
- Check for extra spaces in environment variables

### Webhooks Not Working
- Verify webhook secret is correct
- Check endpoint URL is accessible
- Review Stripe Dashboard → Webhooks for failed attempts

### Subscription Not Created
- Check webhook logs for errors
- Verify `user_id` is in session metadata
- Check database RLS policies

## Going Live

1. Switch to live API keys in production
2. Create live products/prices (or copy from test mode)
3. Update environment variables with live values
4. Set up live webhook endpoint
5. Test with real card (can refund immediately)

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
