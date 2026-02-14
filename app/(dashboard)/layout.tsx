import { Sidebar } from "@/components/layout/sidebar"
import { MobileNavWrapper } from "@/components/layout/mobile-nav-wrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - hidden on mobile, sticky */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNavWrapper />

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 min-w-0">
        {/* Add top padding on mobile for fixed header */}
        <div className="pt-14 lg:pt-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
