import { toast } from "sonner"

/**
 * Toast utility functions for consistent messaging throughout the app
 */

// Success messages
export const toastSuccess = {
  generic: (message: string) => toast.success(message),
  sermonUploaded: () => toast.success("Sermon uploaded successfully!"),
  sermonDeleted: () => toast.success("Sermon deleted"),
  contentGenerated: (type: string) =>
    toast.success(`${type} generated successfully!`),
  allContentGenerated: () =>
    toast.success("All content generated successfully!"),
  transcriptionComplete: () => toast.success("Transcription complete!"),
  exportReady: (format: string) =>
    toast.success(`${format} export is ready for download`),
  settingsSaved: () => toast.success("Settings saved"),
  brandingSaved: () => toast.success("Branding updated successfully!"),
  copied: (item: string) => toast.success(`${item} copied to clipboard`),
}

// Error messages
export const toastError = {
  generic: (message?: string) =>
    toast.error(message || "Something went wrong. Please try again."),
  uploadFailed: () =>
    toast.error("Failed to upload sermon. Please try again."),
  generationFailed: (type?: string) =>
    toast.error(
      type
        ? `Failed to generate ${type}. Please try again.`
        : "Content generation failed. Please try again."
    ),
  transcriptionFailed: () =>
    toast.error("Transcription failed. Please try again."),
  exportFailed: () =>
    toast.error("Export failed. Please try again."),
  networkError: () =>
    toast.error("Network error. Please check your connection and try again."),
  unauthorized: () =>
    toast.error("Please sign in to continue."),
  notFound: (item: string) =>
    toast.error(`${item} not found.`),
  limitReached: () =>
    toast.error("You've reached your plan limit. Upgrade to continue."),
  fileTooLarge: (maxSize: string) =>
    toast.error(`File too large. Maximum size is ${maxSize}.`),
  invalidFileType: (allowedTypes: string) =>
    toast.error(`Invalid file type. Allowed types: ${allowedTypes}`),
  paymentFailed: () =>
    toast.error("Payment failed. Please update your payment method."),
  noTranscript: () =>
    toast.error("No transcript available. Please transcribe the sermon first."),
  rateLimited: () =>
    toast.error("Too many requests. Please wait a moment and try again."),
}

// Info/Loading messages
export const toastInfo = {
  processing: () =>
    toast.info("Processing your sermon...", { duration: 10000 }),
  generating: (type: string) =>
    toast.info(`Generating ${type}...`, { duration: 30000 }),
  transcribing: () =>
    toast.info("Transcribing audio... This may take a few minutes.", {
      duration: 60000,
    }),
  uploading: () => toast.info("Uploading file..."),
  exporting: () => toast.info("Preparing export..."),
}

// Warning messages
export const toastWarning = {
  approachingLimit: (remaining: number) =>
    toast.warning(
      `You have ${remaining} sermon${remaining === 1 ? "" : "s"} remaining this month.`
    ),
  trialEnding: (days: number) =>
    toast.warning(
      `Your trial ends in ${days} day${days === 1 ? "" : "s"}. Subscribe to continue.`
    ),
  unsavedChanges: () =>
    toast.warning("You have unsaved changes."),
  longProcessing: () =>
    toast.warning(
      "This is taking longer than expected. Please wait..."
    ),
}

// Promise-based toast for async operations
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string
    error: string
  }
): void {
  toast.promise(promise, messages)
}

// Dismiss all toasts
export function dismissAllToasts() {
  toast.dismiss()
}

/**
 * Parse API error response and show appropriate toast
 */
export async function handleApiError(
  response: Response,
  defaultMessage?: string
): Promise<string> {
  let message = defaultMessage || "Something went wrong"

  try {
    const data = await response.json()
    message = data.error || data.message || message
  } catch {
    // Use default message if JSON parsing fails
  }

  // Handle specific status codes
  switch (response.status) {
    case 401:
      toastError.unauthorized()
      break
    case 403:
      toast.error("You don't have permission to perform this action.")
      break
    case 404:
      toast.error(message)
      break
    case 429:
      toastError.rateLimited()
      break
    case 500:
    case 502:
    case 503:
      toast.error("Server error. Please try again later.")
      break
    default:
      toast.error(message)
  }

  return message
}
