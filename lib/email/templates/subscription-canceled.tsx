import * as React from "react"

interface SubscriptionCanceledEmailProps {
  planName: string
  pricingUrl: string
}

export function SubscriptionCanceledEmail({
  planName,
  pricingUrl,
}: SubscriptionCanceledEmailProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SermonForge</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Your subscription has been canceled</h2>

        <p style={styles.text}>
          Your SermonForge <strong>{planName}</strong> subscription has been
          canceled. We're sorry to see you go!
        </p>

        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>What happens now?</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              You'll continue to have access until the end of your billing
              period
            </li>
            <li style={styles.listItem}>
              After that, you'll be on our free tier (1 sermon/month)
            </li>
            <li style={styles.listItem}>
              All your existing sermons and content will remain accessible
            </li>
          </ul>
        </div>

        <p style={styles.text}>
          If you canceled by mistake or want to continue using SermonForge, you
          can resubscribe at any time.
        </p>

        <a href={pricingUrl} style={styles.button}>
          View Plans
        </a>

        <p style={styles.textSmall}>
          We'd love to hear your feedback! If there's anything we could have
          done better, please reply to this email and let us know.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          You're receiving this email because you had a subscription with
          SermonForge.
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#1e3a8a",
    padding: "24px",
    textAlign: "center" as const,
  },
  logo: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },
  content: {
    padding: "32px 24px",
  },
  title: {
    color: "#1e293b",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "16px",
  },
  text: {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  textSmall: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5",
    marginTop: "24px",
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  infoTitle: {
    color: "#334155",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  list: {
    margin: 0,
    paddingLeft: "20px",
  },
  listItem: {
    color: "#475569",
    fontSize: "14px",
    marginBottom: "8px",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    padding: "14px 28px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
  },
  footer: {
    backgroundColor: "#f8fafc",
    padding: "24px",
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center" as const,
    margin: 0,
  },
}

export function getSubscriptionCanceledTextEmail({
  planName,
  pricingUrl,
}: SubscriptionCanceledEmailProps): string {
  return `
Your subscription has been canceled

Your SermonForge ${planName} subscription has been canceled. We're sorry to see you go!

WHAT HAPPENS NOW
----------------
- You'll continue to have access until the end of your billing period
- After that, you'll be on our free tier (1 sermon/month)
- All your existing sermons and content will remain accessible

If you canceled by mistake or want to continue using SermonForge, you can resubscribe at any time.

View plans: ${pricingUrl}

We'd love to hear your feedback! If there's anything we could have done better, please reply to this email and let us know.

---
SermonForge
`.trim()
}
