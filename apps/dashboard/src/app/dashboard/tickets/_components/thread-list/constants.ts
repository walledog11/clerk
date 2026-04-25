import { getChannelInfo } from "@/lib/messaging/channels"
import type { ChannelType } from "@/types"

export type TicketListTab = "open" | "closed"

export const FILTER_IDS: ChannelType[] = ["email", "ig_dm", "sms_agent"]

export const CHANNEL_FILTERS = FILTER_IDS.map(id => {
  const info = getChannelInfo(id)
  return { id, logo: info.logo, label: info.name }
})

const TAG_STYLES: Record<string, { label: string; className: string }> = {
  Shipping:          { label: "Shipping",        className: "bg-blue-500/15 text-blue-300" },
  Returns:           { label: "Returns",         className: "bg-amber-700/25 text-amber-300" },
  "Order Status":    { label: "Order Status",    className: "bg-purple-500/15 text-purple-300" },
  "Product Inquiry": { label: "Product Inquiry", className: "bg-rose-500/15 text-rose-300" },
  General:           { label: "General",         className: "bg-slate-500/20 text-slate-300" },
}

export function getTagStyle(tag: string | null | undefined) {
  if (tag && TAG_STYLES[tag]) return TAG_STYLES[tag]
  return TAG_STYLES.General
}

const AVATAR_GRADIENTS = [
  "from-orange-400 to-rose-500",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-pink-400 to-fuchsia-600",
  "from-amber-400 to-orange-500",
]

export function getAvatarGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
