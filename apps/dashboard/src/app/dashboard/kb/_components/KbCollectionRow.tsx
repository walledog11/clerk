"use client"

import { X } from "lucide-react"

export function KbCollectionRow({
  icon, label, count, active, onClick, onDelete,
}: {
  icon: React.ReactNode
  label: string
  count: number
  active: boolean
  onClick: () => void
  onDelete?: () => void
}) {
  return (
    <div className={`group flex items-center rounded-md transition-colors ${active ? 'bg-white/[0.10]' : 'hover:bg-white/[0.05]'}`}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70 focus-visible:ring-inset"
      >
        <span className={`shrink-0 ${active ? 'text-white/85' : 'text-white/55'}`}>{icon}</span>
        <span className={`text-xs flex-1 truncate ${active ? 'text-white font-medium' : 'text-white/80'}`}>{label}</span>
        <span className={`text-[10px] tabular-nums ${active ? 'text-white/60' : 'text-white/35'}`}>{count}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${label}`}
          className="flex items-center justify-center shrink-0 w-0 opacity-0 overflow-hidden text-white/30 hover:text-red-400 transition-all duration-200 group-hover:w-7 group-hover:opacity-100 focus-visible:w-7 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
        >
          <X className="w-3 h-3 shrink-0" />
        </button>
      )}
    </div>
  )
}
