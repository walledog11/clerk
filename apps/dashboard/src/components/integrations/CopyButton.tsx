"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      aria-label="Copy"
      title="Copy"
      className="ml-1 text-white/20 hover:text-white/50 transition-colors"
    >
      {copied
        ? <Check className="w-3 h-3 text-emerald-400" />
        : <Copy className="w-3 h-3" />
      }
    </button>
  )
}
