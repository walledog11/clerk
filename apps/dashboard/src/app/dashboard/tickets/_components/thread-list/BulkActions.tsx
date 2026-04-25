"use client"

import { useState } from "react"
import { Archive, Tag, X } from "lucide-react"

interface BulkActionsProps {
  selectedCount: number
  onBulkArchive: () => void
  onBulkClose: () => void
  onBulkTag: (tag: string) => void
  onClearSelection: () => void
}

export function BulkActions({
  selectedCount,
  onBulkArchive,
  onBulkClose,
  onBulkTag,
  onClearSelection,
}: BulkActionsProps) {
  const [tagInput, setTagInput] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between bg-white/[0.10] border border-white/[0.12] rounded-md px-3 py-2">
        <span className="text-[11px] font-semibold text-white/80">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkClose}
            className="text-[11px] font-semibold text-white bg-white/[0.15] hover:bg-white/[0.22] px-2.5 py-1 rounded transition-colors"
          >
            Close
          </button>
          <button
            onClick={onBulkArchive}
            title="Archive selected"
            className="text-white/50 hover:text-white transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowTagInput(value => !value)}
            title="Tag selected"
            className="text-white/50 hover:text-white transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClearSelection} className="text-white/40 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {showTagInput && (
        <form
          onSubmit={event => {
            event.preventDefault()
            onBulkTag(tagInput.trim())
            setTagInput("")
            setShowTagInput(false)
          }}
          className="flex items-center gap-1.5"
        >
          <input
            autoFocus
            value={tagInput}
            onChange={event => setTagInput(event.target.value)}
            placeholder="Tag name…"
            className="flex-1 text-[11px] text-white/70 bg-white/[0.06] border border-white/[0.12] rounded px-2 py-1 focus:outline-none focus:border-white/[0.25] placeholder:text-white/25"
          />
          <button
            type="submit"
            disabled={!tagInput.trim()}
            className="text-[11px] font-semibold text-white bg-white/[0.15] hover:bg-white/[0.22] disabled:opacity-40 px-2.5 py-1 rounded transition-colors"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  )
}
