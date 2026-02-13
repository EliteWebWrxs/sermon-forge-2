"use client"

import { signOut } from "@/app/(auth)/actions"
import { useState } from "react"

interface UserMenuProps {
  email: string
}

export function UserMenu({ email }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const initials = email
    .split("@")[0]
    .split(".")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
          {initials}
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-sm font-medium text-slate-100 truncate">{email}</p>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-3 right-3 mb-2 z-20 bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
