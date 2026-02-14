import { Inngest } from "inngest"

// Create the Inngest client
export const inngest = new Inngest({
  id: "sermon-forge",
  name: "SermonForge",
})

// Event types for type safety
export type SermonEvents = {
  "sermon/process": {
    data: {
      sermonId: string
      userId: string
      skipTranscription?: boolean
    }
  }
  "sermon/transcribe": {
    data: {
      sermonId: string
      userId: string
    }
  }
  "sermon/generate-content": {
    data: {
      sermonId: string
      userId: string
      contentTypes: string[]
    }
  }
  "sermon/send-completion-email": {
    data: {
      sermonId: string
      userId: string
      userEmail: string
      sermonTitle: string
    }
  }
}
