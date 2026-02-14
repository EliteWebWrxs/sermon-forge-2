"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  fallback?: React.ReactNode
}

/**
 * Optimized image component with lazy loading and fallback
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  fallback,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError && fallback) {
    return <>{fallback}</>
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
      />
    </div>
  )
}

/**
 * Avatar image with fallback initials
 */
interface AvatarImageProps {
  src?: string | null
  alt: string
  fallbackText: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
}

export function AvatarImage({
  src,
  alt,
  fallbackText,
  size = "md",
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false)

  const initials = fallbackText
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-blue-600 flex items-center justify-center text-white font-medium",
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={cn(
        "rounded-full object-cover",
        sizeClasses[size],
        className
      )}
    />
  )
}
