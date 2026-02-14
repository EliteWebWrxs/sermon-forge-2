import { Skeleton, ContentSkeleton, TranscriptSkeleton } from "@/components/ui/skeleton"

export default function SermonDetailLoading() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-80 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Transcript Skeleton */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <TranscriptSkeleton />
          </div>
        </div>

        {/* Right Column - Content Tabs Skeleton */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200">
            {/* Tabs skeleton */}
            <div className="border-b border-slate-200 p-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-28 rounded-lg" />
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="p-6">
              <ContentSkeleton />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
