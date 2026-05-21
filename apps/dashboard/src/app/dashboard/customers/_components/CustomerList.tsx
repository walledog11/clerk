import { ChevronRight, Users } from "lucide-react"
import { CustomerAvatar } from "./CustomerPrimitives"
import { formatLTV, fullName, locationString } from "./formatters"
import type { CustomerRow } from "./types"

export function CustomerListSkeleton() {
  return (
    <div className="divide-y divide-white/[0.05] animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <div className="w-9 h-9 rounded-full bg-white/[0.07]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 bg-white/[0.07] rounded" />
            <div className="h-2.5 w-44 bg-white/[0.04] rounded" />
          </div>
          <div className="hidden md:block h-2.5 w-16 bg-white/[0.05] rounded" />
          <div className="h-2.5 w-12 bg-white/[0.06] rounded" />
        </div>
      ))}
    </div>
  )
}

export function CustomerListRow({ customer, isSelected, onClick }: {
  customer: CustomerRow
  isSelected: boolean
  onClick: () => void
}) {
  const name = fullName(customer)
  const location = locationString(customer.default_address)
  const ltv = formatLTV(customer.total_spent)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors group ${
        isSelected
          ? "bg-white/[0.06]"
          : "hover:bg-white/[0.03]"
      }`}
    >
      <CustomerAvatar customer={customer} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80 truncate leading-tight">{name}</p>
        <p className="text-xs text-white/35 truncate mt-0.5">{customer.email}</p>
        {location && (
          <p className="text-[11px] text-white/25 truncate mt-0.5">{location}</p>
        )}
      </div>

      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-sm font-bold text-white/60">{ltv}</span>
        <span className="text-[11px] text-white/30">
          {customer.orders_count} order{customer.orders_count !== 1 ? "s" : ""}
        </span>
      </div>

      <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${
        isSelected ? "text-white/40" : "text-white/15 group-hover:text-white/30"
      }`} />
    </button>
  )
}

export function EmptyState({ isSearch, query }: { isSearch: boolean; query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-10 h-10 rounded-md bg-white/[0.05] border border-white/[0.07] flex items-center justify-center mb-3">
        <Users className="w-4 h-4 text-white/30" />
      </div>
      <p className="text-sm font-semibold text-white/40 mb-1">
        {isSearch ? `No customers match "${query}"` : "No customers found"}
      </p>
      {isSearch && (
        <p className="text-xs text-white/25">Try a different name or email address.</p>
      )}
    </div>
  )
}
