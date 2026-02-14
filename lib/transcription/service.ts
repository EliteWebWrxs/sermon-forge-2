import { AssemblyAI } from "assemblyai";

if (!process.env.ASSEMBLYAI_API_KEY) {
  throw new Error("ASSEMBLYAI_API_KEY is not set in environment variables");
}

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export interface TranscriptionError {
  error: string;
  status?: string;
}

/**
 * Transcribe audio file from URL using AssemblyAI
 * @param audioUrl - Public URL to the audio/video file
 * @returns Promise<string> - The transcribed text
 */
export async function transcribeAudio(
  audioUrl: string,
): Promise<TranscriptionResult> {
  try {
    console.log("Starting transcription for:", audioUrl);

    // Create transcript
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_detection: true,
      speech_models: ["universal-3-pro", "universal-2"],
      speaker_labels: true, // Identify different speakers
      punctuate: true, // Add punctuation
      format_text: true, // Format text nicely
    });

    if (transcript.status === "error") {
      throw new Error(transcript.error || "Transcription failed");
    }

    if (!transcript.text) {
      throw new Error("No transcription text returned");
    }

    console.log("Transcription completed successfully");

    return {
      text: transcript.text,
      confidence: transcript.confidence || 0,
      words: transcript.words?.map((word) => ({
        text: word.text,
        start: word.start,
        end: word.end,
        confidence: word.confidence,
      })),
    };
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}

/**
 * Check transcription status (for manual polling if needed)
 * @param transcriptId - AssemblyAI transcript ID
 */
export async function getTranscriptionStatus(transcriptId: string) {
  try {
    const transcript = await client.transcripts.get(transcriptId);
    return {
      status: transcript.status,
      text: transcript.text,
      error: transcript.error,
    };
  } catch (error) {
    console.error("Error checking transcription status:", error);
    throw error;
  }
}

/**
 * Get supported audio/video formats
 */
export function getSupportedFormats() {
  return {
    audio: [".mp3", ".mp4", ".m4a", ".wav", ".flac", ".ogg", ".opus", ".webm"],
    video: [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"],
  };
}
