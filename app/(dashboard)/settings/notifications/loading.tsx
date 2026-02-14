import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Notifications</h1>
        <p className="text-slate-500">
          Choose what notifications you'd like to receive
        </p>
      </div>

      <div className="space-y-8">
        {/* Email Address */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-28 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Essential Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-slate-100">
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Digest */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-28 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="flex items-start justify-between py-3">
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
