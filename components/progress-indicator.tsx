"use client"

import { cn } from "@/lib/utils"

export type ProcessingStep = {
  id: string
  label: string
  description?: string
  estimatedTime?: string
}

export type StepStatus = "pending" | "in_progress" | "completed" | "error"

interface ProgressIndicatorProps {
  steps: ProcessingStep[]
  currentStepId: string
  completedStepIds: string[]
  errorStepId?: string
  className?: string
}

/**
 * Multi-step progress indicator for sermon processing
 */
export function ProgressIndicator({
  steps,
  currentStepId,
  completedStepIds,
  errorStepId,
  className,
}: ProgressIndicatorProps) {
  const getStepStatus = (stepId: string): StepStatus => {
    if (errorStepId === stepId) return "error"
    if (completedStepIds.includes(stepId)) return "completed"
    if (currentStepId === stepId) return "in_progress"
    return "pending"
  }

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id)
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-4">
              {/* Step indicator */}
              <div className="relative flex flex-col items-center">
                <StepIcon status={status} />
                {!isLast && (
                  <div
                    className={cn(
                      "absolute top-8 w-0.5 h-8",
                      completedStepIds.includes(step.id)
                        ? "bg-green-500"
                        : "bg-slate-200"
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      status === "completed" && "text-green-700",
                      status === "in_progress" && "text-blue-700",
                      status === "error" && "text-red-700",
                      status === "pending" && "text-slate-400"
                    )}
                  >
                    {step.label}
                  </span>
                  {status === "in_progress" && step.estimatedTime && (
                    <span className="text-xs text-slate-500">
                      ({step.estimatedTime})
                    </span>
                  )}
                </div>
                {step.description && status === "in_progress" && (
                  <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center"

  switch (status) {
    case "completed":
      return (
        <div className={cn(baseClasses, "bg-green-500 text-white")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    case "in_progress":
      return (
        <div className={cn(baseClasses, "bg-blue-500 text-white")}>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )
    case "error":
      return (
        <div className={cn(baseClasses, "bg-red-500 text-white")}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    default:
      return (
        <div className={cn(baseClasses, "bg-slate-200 text-slate-400")}>
          <div className="w-2 h-2 rounded-full bg-current" />
        </div>
      )
  }
}

/**
 * Pre-configured progress indicator for sermon upload/processing
 */
export const SERMON_PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: "upload",
    label: "Uploading file",
    description: "Securely uploading your file to our servers",
    estimatedTime: "depends on file size",
  },
  {
    id: "transcribe",
    label: "Transcribing audio",
    description: "Converting speech to text using AI",
    estimatedTime: "2-3 minutes",
  },
  {
    id: "generate",
    label: "Generating content",
    description: "Creating sermon notes, devotional, and more",
    estimatedTime: "30-60 seconds",
  },
  {
    id: "complete",
    label: "Complete",
    description: "Your sermon is ready!",
  },
]

interface SermonProcessingProgressProps {
  currentStep: "upload" | "transcribe" | "generate" | "complete"
  uploadProgress?: number
  error?: string
}

export function SermonProcessingProgress({
  currentStep,
  uploadProgress,
  error,
}: SermonProcessingProgressProps) {
  const stepOrder = ["upload", "transcribe", "generate", "complete"]
  const currentIndex = stepOrder.indexOf(currentStep)
  const completedSteps = stepOrder.slice(0, currentIndex)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Processing Your Sermon
      </h3>

      <ProgressIndicator
        steps={SERMON_PROCESSING_STEPS}
        currentStepId={currentStep}
        completedStepIds={completedSteps}
        errorStepId={error ? currentStep : undefined}
      />

      {/* Upload progress bar */}
      {currentStep === "upload" && uploadProgress !== undefined && (
        <div className="mt-4 ml-12">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-600">Uploading...</span>
            <span className="text-slate-900 font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 ml-12 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Simple linear progress bar with label
 */
interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = "md",
  variant = "default",
}: ProgressBarProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  const variantClasses = {
    default: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-amber-500",
    error: "bg-red-600",
  }

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-slate-900">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-slate-200 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Indeterminate loading bar
 */
export function IndeterminateProgress({ label }: { label?: string }) {
  return (
    <div>
      {label && <p className="text-sm text-slate-600 mb-1">{label}</p>}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className="h-full w-1/3 bg-blue-600 rounded-full animate-indeterminate" />
      </div>
    </div>
  )
}

/**
 * Processing status card with animated indicator
 */
interface ProcessingStatusCardProps {
  title: string
  description: string
  estimatedTime?: string
}

export function ProcessingStatusCard({
  title,
  description,
  estimatedTime,
}: ProcessingStatusCardProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
          <p className="text-sm text-blue-700 mt-1">{description}</p>
          {estimatedTime && (
            <p className="text-xs text-blue-600 mt-2">
              Estimated time: {estimatedTime}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
