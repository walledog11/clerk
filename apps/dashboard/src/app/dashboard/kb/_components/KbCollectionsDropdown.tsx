"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Check, Loader2, ShoppingBag, BookOpen, Library, ChevronDown } from "lucide-react"
import { KbCollectionRow } from "./KbCollectionRow"
import { inputCls } from "./kb-helpers"
import type { KnowledgeBase } from "@/types"

export function KbCollectionsDropdown({
  knowledgeBases,
  selectedBaseId,
  allArticlesCount,
  onSelectBase,
  onDeleteKb,
  isCreatingKb,
  setIsCreatingKb,
  newKbName,
  setNewKbName,
  isCreatingKbSaving,
  onCreateKb,
}: {
  knowledgeBases: KnowledgeBase[]
  selectedBaseId: string
  allArticlesCount: number
  onSelectBase: (id: string) => void
  onDeleteKb: (id: string) => void
  isCreatingKb: boolean
  setIsCreatingKb: (v: boolean) => void
  newKbName: string
  setNewKbName: (v: string) => void
  isCreatingKbSaving: boolean
  onCreateKb: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => { setOpen(false) }, [selectedBaseId])

  const userKbs = knowledgeBases.filter(kb => kb.source === 'user')
  const shopifyKb = knowledgeBases.find(kb => kb.source === 'shopify')

  const active = (() => {
    if (selectedBaseId === 'all') return { icon: <Library className="w-3.5 h-3.5 text-white/55" />, label: 'All memory', count: allArticlesCount }
    const kb = knowledgeBases.find(k => k.id === selectedBaseId)
    if (!kb) return { icon: <Library className="w-3.5 h-3.5 text-white/55" />, label: 'All memory', count: allArticlesCount }
    if (kb.source === 'shopify') return { icon: <ShoppingBag className="w-3.5 h-3.5 text-green-400/70" />, label: 'Shopify', count: kb.articles.length }
    return { icon: <BookOpen className="w-3.5 h-3.5 text-white/40" />, label: kb.name, count: kb.articles.length }
  })()

  return (
    <div ref={ref} className="md:hidden relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] rounded-md px-3 py-2"
      >
        <span className="shrink-0">{active.icon}</span>
        <span className="text-xs text-white/85 font-medium flex-1 truncate text-left">{active.label}</span>
        <span className="text-[10px] tabular-nums text-white/40">{active.count}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-zinc-950 border border-white/[0.12] rounded-md shadow-lg p-2">
          <div className="space-y-0.5">
            <KbCollectionRow
              icon={<Library className="w-3.5 h-3.5" />}
              label="All memory"
              count={allArticlesCount}
              active={selectedBaseId === 'all'}
              onClick={() => onSelectBase('all')}
            />
            {shopifyKb && (
              <KbCollectionRow
                icon={<ShoppingBag className="w-3.5 h-3.5 text-green-400/70" />}
                label="Shopify"
                count={shopifyKb.articles.length}
                active={selectedBaseId === shopifyKb.id}
                onClick={() => onSelectBase(shopifyKb.id)}
              />
            )}
            {userKbs.map(kb => (
              <KbCollectionRow
                key={kb.id}
                icon={<BookOpen className="w-3.5 h-3.5 text-white/40" />}
                label={kb.name}
                count={kb.articles.length}
                active={selectedBaseId === kb.id}
                onClick={() => onSelectBase(kb.id)}
                onDelete={() => onDeleteKb(kb.id)}
              />
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-white/[0.08]">
            {isCreatingKb ? (
              <>
                <input
                  autoFocus
                  placeholder="Collection name"
                  value={newKbName}
                  onChange={e => setNewKbName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onCreateKb()
                    if (e.key === 'Escape') { setIsCreatingKb(false); setNewKbName('') }
                  }}
                  className={inputCls}
                />
                <div className="flex justify-end gap-1 mt-2">
                  <button
                    onClick={() => { setIsCreatingKb(false); setNewKbName('') }}
                    className="text-[11px] text-white/40 hover:text-white/70 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onCreateKb}
                    disabled={isCreatingKbSaving || !newKbName.trim()}
                    className="flex items-center gap-1 text-[11px] font-semibold text-white bg-white/[0.12] hover:bg-white/[0.18] disabled:opacity-40 px-2 py-1 rounded transition-colors"
                  >
                    {isCreatingKbSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Create
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingKb(true)}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.05] rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New collection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
