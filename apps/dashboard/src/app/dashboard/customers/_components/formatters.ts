import type { CustomerRow, ShopifyAddress } from "./types"

export function fullName(c: CustomerRow) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "—"
}

export function initials(c: CustomerRow) {
  const parts = [c.first_name, c.last_name].filter(Boolean)
  return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2) || "?"
}

export function formatLTV(val: string) {
  const n = parseFloat(val)
  if (isNaN(n)) return "$0"
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function locationString(addr: ShopifyAddress | null) {
  if (!addr) return null
  return [addr.city, addr.country_name].filter(Boolean).join(", ") || null
}

export function fulfillmentStyle(status: string | null) {
  switch (status) {
    case "fulfilled":  return { label: "Fulfilled",   cls: "text-green-400 bg-green-400/10 border-green-400/20" }
    case "partial":    return { label: "Partial",     cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" }
    case "restocked":  return { label: "Restocked",   cls: "text-white/40 bg-white/[0.06] border-white/[0.10]" }
    default:           return { label: "Unfulfilled", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" }
  }
}
