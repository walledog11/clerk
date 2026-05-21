"use client"

import type { ProductRow } from "./products-helpers"

export function ProductStatStrip({ products, isLoading }: { products: ProductRow[]; isLoading: boolean }) {
  const total = products.length
  const active = products.filter(p => p.status === 'active').length
  const outOfStock = products.filter(p => p.total_inventory <= 0).length

  const shimmer = 'h-4 w-16 bg-white/[0.07] rounded animate-pulse'

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/30 font-medium">Total</span>
        {isLoading
          ? <div className={shimmer} />
          : <span className="text-sm font-bold text-white/70">{total}</span>}
      </div>
      <div className="w-px h-4 bg-white/[0.08]" />
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
        <span className="text-[11px] text-white/30 font-medium">Active</span>
        {isLoading
          ? <div className={shimmer} />
          : <span className="text-sm font-bold text-white/60">{active}</span>}
      </div>
      {outOfStock > 0 && (
        <>
          <div className="w-px h-4 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="text-[11px] text-white/30 font-medium">Out of stock</span>
            {isLoading
              ? <div className={shimmer} />
              : <span className="text-sm font-bold text-red-400">{outOfStock}</span>}
          </div>
        </>
      )}
    </div>
  )
}
