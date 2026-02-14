"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toastSuccess, toastError } from "@/lib/toast"

interface OnboardingWizardProps {
  userId: string
  userEmail: string
  initialStep?: number
  onComplete?: () => void
}

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { id: 1, title: "Church Info", description: "Tell us about your church" },
  { id: 2, title: "Branding", description: "Add your logo" },
  { id: 3, title: "Choose Plan", description: "Select your plan" },
  { id: 4, title: "First Sermon", description: "Upload your first sermon" },
]

export function OnboardingWizard({
  userEmail,
  initialStep = 1,
  onComplete,
}: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(initialStep as Step)
  const [loading, setLoading] = useState(false)

  // Form data
  const [churchName, setChurchName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProgress = useCallback(async (step: number, data?: Record<string, unknown>) => {
    try {
      await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, ...data }),
      })
    } catch (error) {
      console.error("Failed to save progress:", error)
    }
  }, [])

  const handleNext = async () => {
    setLoading(true)

    try {
      if (currentStep === 1) {
        // Save church name
        if (churchName.trim()) {
          await fetch("/api/settings/church", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ church_name: churchName }),
          })
        }
        await saveProgress(2, { church_name: churchName })
        setCurrentStep(2)
      } else if (currentStep === 2) {
        // Upload logo if selected
        if (logoFile) {
          const formData = new FormData()
          formData.append("file", logoFile)
          await fetch("/api/settings/branding/logo", {
            method: "POST",
            body: formData,
          })
        }
        await saveProgress(3)
        setCurrentStep(3)
      } else if (currentStep === 3) {
        // Plan selection - redirect to pricing or continue
        await saveProgress(4)
        setCurrentStep(4)
      } else if (currentStep === 4) {
        // Complete onboarding
        await fetch("/api/onboarding/complete", {
          method: "POST",
        })
        toastSuccess.generic("Welcome to SermonForge!")
        onComplete?.()
        router.push("/sermons/new")
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      toastError.generic("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await saveProgress(currentStep + 1)
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step)
      } else {
        await fetch("/api/onboarding/complete", {
          method: "POST",
        })
        onComplete?.()
        router.push("/dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSkipAll = async () => {
    setLoading(true)
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
      })
      onComplete?.()
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-white border-2 border-slate-200 text-slate-400"
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 rounded transition-all ${
                      currentStep > step.id ? "bg-blue-600" : "bg-slate-200"
                    }`}
                    style={{ width: "60px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            {currentStep === 1 && (
              <StepChurchInfo
                churchName={churchName}
                setChurchName={setChurchName}
                userEmail={userEmail}
              />
            )}
            {currentStep === 2 && (
              <StepLogo
                logoPreview={logoPreview}
                onLogoChange={handleLogoChange}
              />
            )}
            {currentStep === 3 && <StepPlan />}
            {currentStep === 4 && <StepFirstSermon />}
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleSkipAll}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              disabled={loading}
            >
              Skip setup
            </button>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep((currentStep - 1) as Step)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              {currentStep < 4 && currentStep !== 3 && (
                <Button
                  variant="secondary"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                loading={loading}
              >
                {currentStep === 4 ? "Get Started" : currentStep === 3 ? "Continue with Free" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 1: Church Info
function StepChurchInfo({
  churchName,
  setChurchName,
  userEmail,
}: {
  churchName: string
  setChurchName: (name: string) => void
  userEmail: string
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Welcome to SermonForge!
      </h2>
      <p className="text-slate-500 mb-8">
        Let&apos;s personalize your experience. What&apos;s your church called?
      </p>
      <div className="max-w-sm mx-auto">
        <Input
          label="Church Name"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          placeholder="e.g., Grace Community Church"
          autoFocus
        />
        <p className="text-xs text-slate-400 mt-2">
          Signed in as {userEmail}
        </p>
      </div>
    </div>
  )
}

// Step 2: Logo Upload
function StepLogo({
  logoPreview,
  onLogoChange,
}: {
  logoPreview: string | null
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Add Your Church Logo
      </h2>
      <p className="text-slate-500 mb-8">
        Your logo will appear on exported materials. You can always change this later.
      </p>
      <div className="max-w-sm mx-auto">
        <label className="block">
          <div className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            logoPreview ? "border-blue-300 bg-blue-50" : "border-slate-300 hover:border-slate-400"
          }`}>
            {logoPreview ? (
              <div className="space-y-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-h-24 mx-auto object-contain"
                />
                <p className="text-sm text-blue-600 font-medium">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600">Click to upload logo</p>
                <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onLogoChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}

// Step 3: Plan Selection
function StepPlan() {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Try SermonForge risk-free",
      features: ["1 sermon per month", "All content types", "PDF exports"],
      popular: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: "$19",
      description: "For small churches",
      features: ["5 sermons per month", "All content types", "All export formats", "Email support"],
      popular: false,
    },
    {
      id: "growth",
      name: "Growth",
      price: "$49",
      description: "For growing churches",
      features: ["20 sermons per month", "Priority processing", "Custom branding", "Priority support"],
      popular: true,
    },
  ]

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Choose Your Plan
      </h2>
      <p className="text-slate-500 mb-6">
        Start free, upgrade anytime. No credit card required.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        {plans.map((plan) => (
          <a
            key={plan.id}
            href={plan.id === "free" ? undefined : `/pricing?plan=${plan.id}`}
            className={`relative block p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              plan.popular
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            <div className="font-semibold text-slate-900">{plan.name}</div>
            <div className="text-2xl font-bold text-slate-900">
              {plan.price}
              <span className="text-sm font-normal text-slate-500">/mo</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
            <ul className="mt-3 space-y-1">
              {plan.features.slice(0, 2).map((feature, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4">
        You can upgrade or change your plan anytime from settings
      </p>
    </div>
  )
}

// Step 4: First Sermon
function StepFirstSermon() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        You&apos;re All Set!
      </h2>
      <p className="text-slate-500 mb-8">
        Upload your first sermon and watch SermonForge transform it into
        powerful content for your congregation.
      </p>

      <div className="max-w-md mx-auto bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">What you can create:</h3>
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { icon: "📝", label: "Sermon Notes" },
            { icon: "🙏", label: "Daily Devotionals" },
            { icon: "💬", label: "Discussion Guides" },
            { icon: "📱", label: "Social Media Posts" },
            { icon: "👶", label: "Kids Version" },
            { icon: "📄", label: "PDF & Word Exports" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>We&apos;ll guide you through the process</span>
      </div>
    </div>
  )
}
