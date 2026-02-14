import { Skeleton } from "@/components/ui/skeleton"

export default function AccountLoading() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Settings</h1>
        <p className="text-slate-500">
          Manage your account security and data
        </p>
      </div>

      <div className="space-y-8">
        {/* Change Password */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>

        {/* Two-Factor */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Skeleton className="h-6 w-36 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
