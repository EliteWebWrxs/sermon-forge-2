import { getCurrentUser } from "@/lib/auth"
import { SidebarNav } from "./sidebar-nav"
import { UserMenu } from "./user-menu"

export async function Sidebar() {
  const user = await getCurrentUser()

  return (
    <aside className="flex flex-col w-64 h-screen bg-slate-900 text-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <span className="font-semibold text-lg tracking-tight">SermonForge</span>
      </div>

      {/* Navigation */}
      <SidebarNav />

      {/* User menu */}
      {user && (
        <div className="px-3 py-4 border-t border-slate-700">
          <UserMenu email={user.email!} />
        </div>
      )}
    </aside>
  )
}
