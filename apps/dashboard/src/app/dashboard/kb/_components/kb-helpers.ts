import type { KbArticle, KbSource } from "@/types"

export type SortKey = 'recent' | 'alpha'
export type MobileView = 'list' | 'detail'
export type ArticleWithBase = KbArticle & { baseName: string; baseSource: KbSource }

export const inputCls = "w-full text-sm text-white/80 bg-white/[0.06] border border-white/[0.12] rounded-md px-3 py-2 focus:outline-none focus:border-white/[0.25] placeholder:text-white/25"

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Recently updated' },
  { value: 'alpha', label: 'Alphabetical (A-Z)' },
]

export const parseTags = (raw: string) =>
  raw.split(',').map(t => t.trim()).filter(Boolean)

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
