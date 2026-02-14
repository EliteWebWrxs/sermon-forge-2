import { FormSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function ChurchLoading() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Church Information</h1>
        <p className="text-slate-500">
          Add details about your church for a more personalized experience
        </p>
      </div>

      <div className="space-y-8">
        {/* Church Logo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        <FormSkeleton />
      </div>
    </div>
  )
}
