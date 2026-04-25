"use client"

import { RefreshCw, Search, UserPlus, X } from "lucide-react"
import type { ShopifyCustomerSearchResult } from "@/types/shopify"

interface ShopifyCustomerSearchProps {
  query: string
  customers: ShopifyCustomerSearchResult[] | undefined
  isSearching: boolean
  isLinking: number | null
  linkError: string | null
  hasSearchError: boolean
  canCreate: boolean
  onQueryChange: (query: string) => void
  onClear: () => void
  onCancel: () => void
  onCreate: () => void
  onLink: (customer: ShopifyCustomerSearchResult) => void
}

export function ShopifyCustomerSearch({
  query,
  customers,
  isSearching,
  isLinking,
  linkError,
  hasSearchError,
  canCreate,
  onQueryChange,
  onClear,
  onCancel,
  onCreate,
  onLink,
}: ShopifyCustomerSearchProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">Search Shopify customers to link.</p>
        <button type="button" onClick={onCancel} className="text-xs text-white/40 hover:text-white/70 transition-colors">Cancel</button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
        <input
          autoFocus
          type="text"
          placeholder="Name or email..."
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          className="w-full pl-6 pr-7 py-1.5 text-xs text-white/70 rounded-md border border-white/[0.12] bg-white/[0.06] focus:outline-none focus:border-white/[0.25] placeholder:text-white/20"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          {isSearching
            ? <RefreshCw className="w-3 h-3 text-white/20 animate-spin" />
            : query
              ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-white/25 hover:text-white/60"
                  aria-label="Clear customer search"
                >
                  <X className="w-3 h-3" />
                </button>
              )
              : null}
        </span>
      </div>

      {linkError && <p className="text-xs text-red-400">{linkError}</p>}
      {hasSearchError && <p className="text-xs text-red-400">Unable to search customers.</p>}

      {customers?.length === 0 && (
        <p className="text-xs text-white/30">No customers found.</p>
      )}

      {customers && customers.length > 0 && (
        <div className="space-y-1">
          {customers.map(customer => {
            const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || '-'
            return (
              <button
                type="button"
                key={customer.id}
                onClick={() => onLink(customer)}
                disabled={isLinking !== null}
                className="w-full flex items-center justify-between gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.12] disabled:opacity-60 px-2.5 py-1.5 transition-colors text-left group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/70 truncate">{fullName}</p>
                  <p className="text-xs text-white/30 truncate">{customer.email || 'No email'}</p>
                </div>
                <div className="shrink-0 flex h-5 w-5 items-center justify-center text-white/40 group-hover:text-[#96BF48] transition-colors" aria-hidden="true">
                  {isLinking === customer.id
                    ? <RefreshCw className="w-3 h-3 animate-spin" />
                    : <UserPlus className="w-3 h-3" />
                  }
                </div>
              </button>
            )
          })}
        </div>
      )}

      {canCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/60 border border-dashed border-white/[0.12] hover:border-white/[0.25] rounded-md py-2 transition-colors"
        >
          <UserPlus className="w-3 h-3" /> Create new customer
        </button>
      )}
    </div>
  )
}
