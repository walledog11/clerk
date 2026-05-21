"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { initials } from "./formatters"
import type { CustomerRow } from "./types"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        navigator.clipboard.writeText(value).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-white/20 hover:text-white/50 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export function CustomerAvatar({ customer, size = "md" }: { customer: CustomerRow; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "w-12 h-12 text-sm" : size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs"
  return (
    <div className={`${cls} rounded-full bg-white/[0.08] border border-white/[0.10] flex items-center justify-center font-bold text-white/60 shrink-0`}>
      {initials(customer)}
    </div>
  )
}
