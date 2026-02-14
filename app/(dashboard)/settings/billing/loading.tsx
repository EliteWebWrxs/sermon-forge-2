import { Skeleton, BillingCardSkeleton } from "@/components/ui/skeleton"

export default function BillingLoading() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-slate-500">
          Manage your subscription and billing details
        </p>
      </div>

      <div className="space-y-6">
        {/* Current plan skeleton */}
        <BillingCardSkeleton />

        {/* Usage skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Plan options skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-10 w-full mt-4 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
