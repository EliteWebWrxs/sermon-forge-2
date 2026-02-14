"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200",
        className
      )}
    />
  )
}

/**
 * Skeleton for sermon cards on the dashboard
 */
export function SermonCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  )
}

/**
 * Multiple sermon card skeletons for loading list
 */
export function SermonListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SermonCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for generated content sections
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      {/* Section 2 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      {/* Section 3 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-52" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for discussion guide questions
 */
export function DiscussionGuideSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-6">
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-5 w-16 mt-3 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for form/settings pages
 */
export function FormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Form section 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
      {/* Form section 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
      {/* Submit button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton for transcript viewer
 */
export function TranscriptSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for billing/subscription cards
 */
export function BillingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Full page loading skeleton with header
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <SermonListSkeleton count={6} />
    </div>
  )
}

/**
 * Inline loading spinner
 */
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <svg
      className={cn("animate-spin text-blue-600", sizeClasses[size])}
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
  )
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  )
}
