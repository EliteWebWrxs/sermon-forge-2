"use client"

import { ReactNode, useState, useRef, useEffect } from "react"

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  onClick: () => void
  children: ReactNode
  icon?: ReactNode
}

export function DropdownMenuItem({ onClick, children, icon }: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-slate-200 my-1" />
}
