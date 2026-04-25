"use client"

import { useState } from "react"
import { Package } from "lucide-react"

interface ProductImageProps {
  src: string | null | undefined
  title: string
}

// Same thumbnail behavior as products/_components/ProductsPageClient.tsx.
export function ProductImage({ src, title }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) {
    return (
      <div className="w-7 h-7 rounded bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
        <Package className="w-3.5 h-3.5 text-white/20" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      onError={() => setFailedSrc(src)}
      className="w-7 h-7 rounded object-cover border border-white/[0.08] shrink-0"
    />
  )
}
