"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface WelcomeModalProps {
  userName?: string
  onGetStarted: () => void
  onSkip: () => void
}

export function WelcomeModal({ userName, onGetStarted, onSkip }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onSkip}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-500 ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Decorative header */}
        <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-white/5 rounded-full" />

          {/* Icon */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-8 px-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to SermonForge{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="text-slate-500 mb-6">
            Transform your sermons into powerful content — notes, devotionals,
            social posts, and more. Let&apos;s get you set up in just a few steps.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "⚡", label: "Quick Setup", desc: "2 minutes" },
              { icon: "✨", label: "AI-Powered", desc: "Smart content" },
              { icon: "📤", label: "Easy Export", desc: "PDF, Word, more" },
            ].map((feature) => (
              <div key={feature.label} className="text-center">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="text-xs font-medium text-slate-900">{feature.label}</div>
                <div className="text-xs text-slate-500">{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={onGetStarted} className="w-full" size="lg">
              <span className="flex items-center justify-center gap-2">
                Let&apos;s Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
            <button
              onClick={onSkip}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              I&apos;ll explore on my own
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Wrapper component that checks onboarding status
export function OnboardingCheck({
  children,
  showWelcome,
  onboardingCompleted,
}: {
  children: React.ReactNode
  showWelcome: boolean
  onboardingCompleted: boolean
}) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(showWelcome && !onboardingCompleted)

  const handleGetStarted = () => {
    setShowModal(false)
    router.push("/onboarding")
  }

  const handleSkip = async () => {
    setShowModal(false)
    // Mark as seen but not completed
    try {
      await fetch("/api/onboarding/skip-welcome", { method: "POST" })
    } catch (error) {
      console.error("Failed to skip welcome:", error)
    }
  }

  return (
    <>
      {children}
      {showModal && (
        <WelcomeModal
          onGetStarted={handleGetStarted}
          onSkip={handleSkip}
        />
      )}
    </>
  )
}
