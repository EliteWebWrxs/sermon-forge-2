interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2 sm:line-clamp-none">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  )
}
