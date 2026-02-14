import * as React from "react"

interface PaymentFailedEmailProps {
  planName: string
  billingUrl: string
}

export function PaymentFailedEmail({
  planName,
  billingUrl,
}: PaymentFailedEmailProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SermonForge</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Payment Failed</h2>

        <p style={styles.text}>
          We were unable to process your payment for your SermonForge{" "}
          <strong>{planName}</strong> subscription.
        </p>

        <div style={styles.warningBox}>
          <p style={styles.warningText}>
            Please update your payment method to avoid any interruption to your
            service.
          </p>
        </div>

        <p style={styles.text}>
          This could happen if your card expired, was declined, or there were
          insufficient funds. Don't worry - you can easily fix this by updating
          your payment information.
        </p>

        <a href={billingUrl} style={styles.button}>
          Update Payment Method
        </a>

        <p style={styles.textSmall}>
          If you believe this is an error or need assistance, please reply to
          this email and we'll help you resolve it.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          You're receiving this email because you have an active subscription
          with SermonForge.
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
    color: "#dc2626",
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
  warningBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  warningText: {
    color: "#b91c1c",
    fontSize: "14px",
    margin: 0,
    fontWeight: "500",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#dc2626",
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

export function getPaymentFailedTextEmail({
  planName,
  billingUrl,
}: PaymentFailedEmailProps): string {
  return `
Payment Failed

We were unable to process your payment for your SermonForge ${planName} subscription.

IMPORTANT: Please update your payment method to avoid any interruption to your service.

This could happen if your card expired, was declined, or there were insufficient funds. Don't worry - you can easily fix this by updating your payment information.

Update your payment method: ${billingUrl}

If you believe this is an error or need assistance, please reply to this email and we'll help you resolve it.

---
SermonForge
`.trim()
}
