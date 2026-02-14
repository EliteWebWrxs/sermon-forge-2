"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { WelcomeModal } from "./welcome-modal"
import { ProductTour } from "./product-tour"

interface DashboardOnboardingProps {
  onboardingCompleted: boolean
  onboardingStep: number
  productTourCompleted: boolean
  hasSermons: boolean
}

export function DashboardOnboarding({
  onboardingCompleted,
  onboardingStep,
  productTourCompleted,
  hasSermons,
}: DashboardOnboardingProps) {
  const router = useRouter()

  // Initialize state based on props - brand new users (step 0) see welcome
  const shouldShowWelcome = !onboardingCompleted && onboardingStep === 0
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome)
  const [showTour, setShowTour] = useState(false)

  // Handle delayed tour display
  useEffect(() => {
    // Show product tour for users who completed onboarding but haven't done the tour
    // and have at least one sermon (so there's something to see)
    if (onboardingCompleted && !productTourCompleted && hasSermons && !showWelcome) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowTour(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [onboardingCompleted, productTourCompleted, hasSermons, showWelcome])

  const handleGetStarted = useCallback(() => {
    setShowWelcome(false)
    router.push("/onboarding")
  }, [router])

  const handleSkipWelcome = useCallback(async () => {
    setShowWelcome(false)
    try {
      await fetch("/api/onboarding/skip-welcome", { method: "POST" })
    } catch (error) {
      console.error("Failed to skip welcome:", error)
    }
  }, [])

  const handleTourComplete = useCallback(() => {
    setShowTour(false)
  }, [])

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          onGetStarted={handleGetStarted}
          onSkip={handleSkipWelcome}
        />
      )}
      <ProductTour run={showTour} onComplete={handleTourComplete} />
    </>
  )
}
