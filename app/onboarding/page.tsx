import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { getUserMetadata } from "@/lib/db/users"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata = {
  title: "Get Started | SermonForge",
}

export default async function OnboardingPage() {
  const user = await requireAuth()
  const metadata = await getUserMetadata(user.id)

  // If already completed onboarding, redirect to dashboard
  if (metadata?.onboarding_completed) {
    redirect("/dashboard")
  }

  return (
    <OnboardingWizard
      userId={user.id}
      userEmail={user.email!}
      initialStep={(metadata?.onboarding_step || 1) as 1 | 2 | 3 | 4}
    />
  )
}
