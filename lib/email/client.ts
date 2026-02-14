import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set - emails will not be sent");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default from address - update this to your verified domain
export const FROM_EMAIL =
  process.env.FROM_EMAIL || "SermonForge <onboarding@getsermonforge.com>";
