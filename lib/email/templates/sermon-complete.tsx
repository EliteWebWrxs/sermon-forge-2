import * as React from "react"

interface SermonCompleteEmailProps {
  sermonTitle: string
  sermonUrl: string
  contentGenerated: {
    sermonNotes: boolean
    devotional: boolean
    discussionGuide: boolean
    socialMedia: boolean
  }
}

export function SermonCompleteEmail({
  sermonTitle,
  sermonUrl,
  contentGenerated,
}: SermonCompleteEmailProps) {
  const generatedItems: string[] = [
    contentGenerated.sermonNotes ? "Sermon Notes" : "",
    contentGenerated.devotional ? "Daily Devotional" : "",
    contentGenerated.discussionGuide ? "Discussion Guide" : "",
    contentGenerated.socialMedia ? "Social Media Pack" : "",
  ].filter((item): item is string => item !== "")

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>SermonForge</h1>
      </div>

      <div style={styles.content}>
        <h2 style={styles.title}>Your sermon is ready!</h2>

        <p style={styles.text}>
          Great news! Your sermon <strong>"{sermonTitle}"</strong> has been
          processed and all content is ready for you.
        </p>

        {generatedItems.length > 0 && (
          <>
            <p style={styles.text}>We've generated the following content:</p>
            <ul style={styles.list}>
              {generatedItems.map((item) => (
                <li key={item} style={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}

        <a href={sermonUrl} style={styles.button}>
          View Your Sermon
        </a>

        <p style={styles.textSmall}>
          You can now export your content to PDF, Word, or PowerPoint formats,
          and customize it with your church branding.
        </p>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          You're receiving this email because you processed a sermon on
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

// Plain text version for email clients that don't support HTML
export function getSermonCompleteTextEmail({
  sermonTitle,
  sermonUrl,
  contentGenerated,
}: SermonCompleteEmailProps): string {
  const generatedItems = [
    contentGenerated.sermonNotes && "- Sermon Notes",
    contentGenerated.devotional && "- Daily Devotional",
    contentGenerated.discussionGuide && "- Discussion Guide",
    contentGenerated.socialMedia && "- Social Media Pack",
  ].filter(Boolean)

  return `
Your sermon is ready!

Great news! Your sermon "${sermonTitle}" has been processed and all content is ready for you.

${generatedItems.length > 0 ? "We've generated the following content:\n" + generatedItems.join("\n") : ""}

View your sermon: ${sermonUrl}

You can now export your content to PDF, Word, or PowerPoint formats, and customize it with your church branding.

---
SermonForge
`.trim()
}
