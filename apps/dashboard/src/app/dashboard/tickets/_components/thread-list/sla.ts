export function getSlaInfo(lastCustomerMessageAt: string | null) {
  if (!lastCustomerMessageAt) return null
  const ageH = (Date.now() - new Date(lastCustomerMessageAt).getTime()) / 3_600_000
  if (ageH < 4) return { color: "text-emerald-400/80", dot: "bg-emerald-400", label: `${Math.round(ageH * 10) / 10}h` }
  if (ageH < 24) return { color: "text-amber-400/80", dot: "bg-amber-400", label: `${Math.round(ageH)}h` }
  return { color: "text-red-400/80", dot: "bg-red-400", label: `${Math.floor(ageH / 24)}d` }
}
