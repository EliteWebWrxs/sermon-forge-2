import * as React from "react"

interface SubscriptionWelcomeEmailProps {
  planName: string
  sermonLimit: number | "Unlimited"
  dashboardUrl: string
}

export function SubscriptionWelcomeEmail({
  planName,
  sermonLimit,
  dashboardUrl,
}: SubscriptionWelcomeEmailProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SermonForge</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Welcome to SermonForge {planName}!</h2>

        <p style={styles.text}>
          Thank you for subscribing to SermonForge. Your {planName} plan is now
          active and you're ready to start transforming your sermons into
          engaging content.
        </p>

        <div style={styles.planBox}>
          <h3 style={styles.planTitle}>Your Plan Details</h3>
          <p style={styles.planDetail}>
            <strong>Plan:</strong> {planName}
          </p>
          <p style={styles.planDetail}>
            <strong>Sermons per month:</strong>{" "}
            {sermonLimit === "Unlimited" ? "Unlimited" : sermonLimit}
          </p>
        </div>

        <p style={styles.text}>Here's what you can do with your subscription:</p>

        <ul style={styles.list}>
          <li style={styles.listItem}>Upload sermons as text, PDF, audio, or video</li>
          <li style={styles.listItem}>Generate sermon notes, devotionals, and discussion guides</li>
          <li style={styles.listItem}>Create social media content packs</li>
          <li style={styles.listItem}>Export to PDF, Word, and PowerPoint</li>
        </ul>

        <a href={dashboardUrl} style={styles.button}>
          Go to Dashboard
        </a>

        <p style={styles.textSmall}>
          If you have any questions, just reply to this email. We're here to
          help!
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          You're receiving this email because you subscribed to SermonForge.
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
  planBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  planTitle: {
    color: "#0369a1",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  planDetail: {
    color: "#0c4a6e",
    fontSize: "14px",
    margin: "4px 0",
  },
  list: {
    marginBottom: "24px",
    paddingLeft: "20px",
  },
  listItem: {
    color: "#475569",
    fontSize: "16px",
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

export function getSubscriptionWelcomeTextEmail({
  planName,
  sermonLimit,
  dashboardUrl,
}: SubscriptionWelcomeEmailProps): string {
  return `
Welcome to SermonForge ${planName}!

Thank you for subscribing to SermonForge. Your ${planName} plan is now active and you're ready to start transforming your sermons into engaging content.

YOUR PLAN DETAILS
-----------------
Plan: ${planName}
Sermons per month: ${sermonLimit === "Unlimited" ? "Unlimited" : sermonLimit}

Here's what you can do with your subscription:
- Upload sermons as text, PDF, audio, or video
- Generate sermon notes, devotionals, and discussion guides
- Create social media content packs
- Export to PDF, Word, and PowerPoint

Go to your dashboard: ${dashboardUrl}

If you have any questions, just reply to this email. We're here to help!

---
SermonForge
`.trim()
}
