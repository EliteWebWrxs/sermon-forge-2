"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TrialBannerProps {
  daysRemaining: number
  sermonsUsed: number
  sermonLimit: number
  planName: string
}

export function TrialBanner({
  daysRemaining,
  sermonsUsed,
  sermonLimit,
  planName,
}: TrialBannerProps) {
  const sermonsRemaining = Math.max(0, sermonLimit - sermonsUsed)
  const isLastDay = daysRemaining <= 1
  const isLowDays = daysRemaining <= 3
  const isLowSermons = sermonsRemaining <= 1

  // Determine banner style based on urgency
  const bannerStyle = isLastDay
    ? "bg-red-50 border-red-200"
    : isLowDays || isLowSermons
    ? "bg-amber-50 border-amber-200"
    : "bg-blue-50 border-blue-200"

  const textStyle = isLastDay
    ? "text-red-800"
    : isLowDays || isLowSermons
    ? "text-amber-800"
    : "text-blue-800"

  const iconStyle = isLastDay
    ? "text-red-600"
    : isLowDays || isLowSermons
    ? "text-amber-600"
    : "text-blue-600"

  return (
    <div className={`rounded-lg border p-4 mb-6 ${bannerStyle}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isLastDay ? "bg-red-100" : isLowDays || isLowSermons ? "bg-amber-100" : "bg-blue-100"}`}>
            <svg
              className={`w-5 h-5 ${iconStyle}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className={`font-medium ${textStyle}`}>
              {isLastDay
                ? "Your trial ends today!"
                : `${daysRemaining} days left in your ${planName} trial`}
            </p>
            <p className={`text-sm ${isLastDay ? "text-red-600" : isLowDays || isLowSermons ? "text-amber-600" : "text-blue-600"}`}>
              {sermonsRemaining === 0
                ? "You've used all your trial sermons"
                : `${sermonsUsed} of ${sermonLimit} trial sermons used`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/settings/billing">
            <Button size="sm" variant={isLastDay ? "primary" : "secondary"}>
              {isLastDay ? "Subscribe Now" : "View Plans"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress bar for trial usage */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isLastDay ? "text-red-600" : isLowDays || isLowSermons ? "text-amber-600" : "text-blue-600"}>
              Sermons
            </span>
            <span className={isLastDay ? "text-red-700" : isLowDays || isLowSermons ? "text-amber-700" : "text-blue-700"}>
              {sermonsUsed}/{sermonLimit}
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${isLastDay ? "bg-red-200" : isLowDays || isLowSermons ? "bg-amber-200" : "bg-blue-200"}`}>
            <div
              className={`h-full rounded-full transition-all ${
                isLastDay ? "bg-red-500" : isLowDays || isLowSermons ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min((sermonsUsed / sermonLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isLastDay ? "text-red-600" : isLowDays || isLowSermons ? "text-amber-600" : "text-blue-600"}>
              Days
            </span>
            <span className={isLastDay ? "text-red-700" : isLowDays || isLowSermons ? "text-amber-700" : "text-blue-700"}>
              {daysRemaining}/14
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${isLastDay ? "bg-red-200" : isLowDays || isLowSermons ? "bg-amber-200" : "bg-blue-200"}`}>
            <div
              className={`h-full rounded-full transition-all ${
                isLastDay ? "bg-red-500" : isLowDays || isLowSermons ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(((14 - daysRemaining) / 14) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
