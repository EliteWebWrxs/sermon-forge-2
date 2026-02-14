import * as React from "react"

interface TrialReminderEmailProps {
  daysRemaining: number
  planName: string
  sermonsUsed: number
  sermonLimit: number
  billingUrl: string
}

export function TrialReminderEmail({
  daysRemaining,
  planName,
  sermonsUsed,
  sermonLimit,
  billingUrl,
}: TrialReminderEmailProps) {
  const isLastDay = daysRemaining <= 1
  const sermonsRemaining = sermonLimit - sermonsUsed

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SermonForge</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>
          {isLastDay
            ? "Your trial ends tomorrow!"
            : `${daysRemaining} days left in your trial`}
        </h2>

        <p style={styles.text}>
          {isLastDay
            ? `Your ${planName} trial ends tomorrow. Subscribe now to keep creating amazing sermon content without interruption.`
            : `You have ${daysRemaining} days remaining in your ${planName} trial. We hope you're enjoying SermonForge!`}
        </p>

        <div style={styles.statsBox}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Trial sermons used</span>
            <span style={styles.statValue}>
              {sermonsUsed} of {sermonLimit}
            </span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Days remaining</span>
            <span style={styles.statValue}>{daysRemaining}</span>
          </div>
        </div>

        {sermonsRemaining > 0 && (
          <p style={styles.text}>
            You still have {sermonsRemaining} trial sermon
            {sermonsRemaining > 1 ? "s" : ""} available. Make the most of your
            trial!
          </p>
        )}

        <a href={billingUrl} style={styles.button}>
          {isLastDay ? "Subscribe Now" : "View Subscription Options"}
        </a>

        <div style={styles.benefitsBox}>
          <h3 style={styles.benefitsTitle}>What you'll get with a subscription:</h3>
          <ul style={styles.benefitsList}>
            <li style={styles.benefitItem}>More sermons per month (up to unlimited)</li>
            <li style={styles.benefitItem}>All content types: notes, devotionals, discussion guides</li>
            <li style={styles.benefitItem}>Export to PDF, Word, and PowerPoint</li>
            <li style={styles.benefitItem}>Church branding on exports</li>
          </ul>
        </div>

        <p style={styles.textSmall}>
          Questions? Just reply to this email and we'll be happy to help.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          You're receiving this email because you started a trial with
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
  statsBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  statLabel: {
    color: "#0369a1",
    fontSize: "14px",
  },
  statValue: {
    color: "#0c4a6e",
    fontSize: "14px",
    fontWeight: "600",
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
  benefitsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "24px",
  },
  benefitsTitle: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  benefitsList: {
    margin: 0,
    paddingLeft: "20px",
  },
  benefitItem: {
    color: "#475569",
    fontSize: "14px",
    marginBottom: "6px",
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

export function getTrialReminderTextEmail({
  daysRemaining,
  planName,
  sermonsUsed,
  sermonLimit,
  billingUrl,
}: TrialReminderEmailProps): string {
  const isLastDay = daysRemaining <= 1
  const sermonsRemaining = sermonLimit - sermonsUsed

  return `
${isLastDay ? "Your trial ends tomorrow!" : `${daysRemaining} days left in your trial`}

${
  isLastDay
    ? `Your ${planName} trial ends tomorrow. Subscribe now to keep creating amazing sermon content without interruption.`
    : `You have ${daysRemaining} days remaining in your ${planName} trial. We hope you're enjoying SermonForge!`
}

TRIAL USAGE
-----------
Trial sermons used: ${sermonsUsed} of ${sermonLimit}
Days remaining: ${daysRemaining}

${sermonsRemaining > 0 ? `You still have ${sermonsRemaining} trial sermon${sermonsRemaining > 1 ? "s" : ""} available. Make the most of your trial!` : ""}

${isLastDay ? "Subscribe now" : "View subscription options"}: ${billingUrl}

What you'll get with a subscription:
- More sermons per month (up to unlimited)
- All content types: notes, devotionals, discussion guides
- Export to PDF, Word, and PowerPoint
- Church branding on exports

Questions? Just reply to this email and we'll be happy to help.

---
SermonForge
`.trim()
}
