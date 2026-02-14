"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import type { CallBackProps, Step } from "react-joyride"

// Dynamically import Joyride to avoid SSR issues
const Joyride = dynamic(() => import("react-joyride"), { ssr: false })

interface ProductTourProps {
  run: boolean
  onComplete: () => void
}

const tourSteps: Step[] = [
  {
    target: "[data-tour='upload-sermon']",
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-slate-900 mb-2">Upload Your Sermon</h3>
        <p className="text-sm text-slate-600">
          Start by uploading an audio file, video, PDF, or pasting your sermon text directly.
          We support MP3, MP4, WAV, and more!
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "[data-tour='sermons-list']",
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-slate-900 mb-2">Your Sermons</h3>
        <p className="text-sm text-slate-600">
          All your uploaded sermons appear here. Click on any sermon to view details
          and generated content.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "[data-tour='generate-content']",
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-slate-900 mb-2">Generate Content</h3>
        <p className="text-sm text-slate-600">
          Once your sermon is transcribed, click here to generate sermon notes,
          devotionals, discussion guides, and more!
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "[data-tour='content-tabs']",
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-slate-900 mb-2">View Generated Content</h3>
        <p className="text-sm text-slate-600">
          Switch between different content types using these tabs. Each type is
          tailored for a specific purpose.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "[data-tour='export-button']",
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-slate-900 mb-2">Export & Share</h3>
        <p className="text-sm text-slate-600">
          Export your content as PDF, Word, or PowerPoint. Perfect for printing,
          sharing with your team, or posting online.
        </p>
      </div>
    ),
    placement: "left",
  },
  {
    target: "[data-tour='settings']",
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-slate-900 mb-2">Customize Your Experience</h3>
        <p className="text-sm text-slate-600">
          Add your church branding, manage your subscription, and customize
          your preferences in settings.
        </p>
      </div>
    ),
    placement: "right",
  },
]

const tourStyles = {
  options: {
    arrowColor: "#fff",
    backgroundColor: "#fff",
    overlayColor: "rgba(15, 23, 42, 0.75)",
    primaryColor: "#3b82f6",
    textColor: "#1e293b",
    zIndex: 1000,
  },
  tooltip: {
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  tooltipContainer: {
    textAlign: "left" as const,
  },
  buttonNext: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    color: "#fff",
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 500,
  },
  buttonBack: {
    color: "#64748b",
    marginRight: 10,
    fontSize: 14,
  },
  buttonSkip: {
    color: "#94a3b8",
    fontSize: 14,
  },
  spotlight: {
    borderRadius: 8,
  },
}

export function ProductTour({ run, onComplete }: ProductTourProps) {
  // Track if component is mounted (client-side only)
  const [mounted, setMounted] = useState(false)

  // Set mounted on first render - this is intentional for SSR hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCallback = async (data: CallBackProps) => {
    const { status } = data

    if (status === "finished" || status === "skipped") {
      // Save completion status
      try {
        await fetch("/api/onboarding/tour-complete", { method: "POST" })
      } catch (error) {
        console.error("Failed to save tour completion:", error)
      }
      onComplete()
    }
  }

  if (!mounted) return null

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleCallback}
      styles={tourStyles}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  )
}

// Tour trigger button for users who want to restart the tour
export function TourTriggerButton() {
  const [showTour, setShowTour] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowTour(true)}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Take a tour
      </button>
      <ProductTour run={showTour} onComplete={() => setShowTour(false)} />
    </>
  )
}
