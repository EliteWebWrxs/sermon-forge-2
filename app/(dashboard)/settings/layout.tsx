import { SettingsNav } from "@/components/settings/settings-nav"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Settings Navigation - Horizontal scroll on mobile, sidebar on desktop */}
      <aside className="lg:w-64 flex-shrink-0 -mx-4 sm:mx-0">
        <SettingsNav />
      </aside>

      {/* Settings Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
