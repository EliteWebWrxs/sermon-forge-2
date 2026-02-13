import { z } from "zod"

export const sermonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  sermon_date: z.string().min(1, "Date is required"),
  input_type: z.enum(["audio", "video", "pdf", "youtube", "text_paste"]),
  youtube_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  audio_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pdf_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  transcript: z.string().optional(),
})

export type SermonFormValues = z.infer<typeof sermonSchema>
