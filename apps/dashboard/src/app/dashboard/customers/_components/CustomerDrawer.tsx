"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ExternalLink, Loader2, MessageSquare, Pencil, RefreshCw, ShoppingBag, X } from "lucide-react"
import useSWR from "swr"
import { fetcher } from "@/lib/api/fetcher"
import { CopyButton, CustomerAvatar } from "./CustomerPrimitives"
import { formatDate, formatLTV, fulfillmentStyle, fullName } from "./formatters"
import type { CustomerDetailResponse, CustomerRow, EditState, ShopifyOrder } from "./types"

function makeDraft(customer: CustomerRow): EditState {
  const addr = customer.default_address
  return {
    first_name: customer.first_name ?? "",
    last_name:  customer.last_name  ?? "",
    email:      customer.email      ?? "",
    phone:      customer.phone      ?? "",
    address1:   addr?.address1      ?? "",
    city:       addr?.city          ?? "",
    province:   addr?.province      ?? "",
    zip:        addr?.zip           ?? "",
    country:    addr?.country_name  ?? "",
    note:       "",
  }
}

function CustomerEditForm({
  draft,
  isSaving,
  saveError,
  onDraftChange,
  onCancel,
  onSave,
}: {
  draft: EditState
  isSaving: boolean
  saveError: string | null
  onDraftChange: (patch: Partial<EditState>) => void
  onCancel: () => void
  onSave: () => void
}) {
  const inputCls = "w-full text-xs text-white/70 bg-white/[0.06] border border-white/[0.12] rounded px-2 py-1.5 focus:outline-none focus:border-white/[0.25]"
  const labelCls = "text-[10px] text-white/30 mb-0.5 block"

  return (
    <div className="rounded-md border border-white/[0.09] bg-white/[0.03] p-3 space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>First name</label>
          <input value={draft.first_name} onChange={e => onDraftChange({ first_name: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Last name</label>
          <input value={draft.last_name} onChange={e => onDraftChange({ last_name: e.target.value })} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input value={draft.email} onChange={e => onDraftChange({ email: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Phone</label>
        <input value={draft.phone} onChange={e => onDraftChange({ phone: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Address</label>
        <input value={draft.address1} onChange={e => onDraftChange({ address1: e.target.value })} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>City</label>
          <input value={draft.city} onChange={e => onDraftChange({ city: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Province</label>
          <input value={draft.province} onChange={e => onDraftChange({ province: e.target.value })} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>ZIP</label>
          <input value={draft.zip} onChange={e => onDraftChange({ zip: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input value={draft.country} onChange={e => onDraftChange({ country: e.target.value })} className={inputCls} />
        </div>
      </div>
      {saveError && <p className="text-xs text-red-400">{saveError}</p>}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1 text-xs font-semibold text-white bg-[#96BF48] hover:bg-[#7da33a] disabled:opacity-50 rounded px-2.5 py-1 transition-colors"
        >
          {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Save
        </button>
      </div>
    </div>
  )
}

function CustomerDetailsCard({
  customer,
  hasAddress,
}: {
  customer: CustomerRow
  hasAddress: boolean
}) {
  const addr = customer.default_address
  return (
    <div className="rounded-md border border-white/[0.07] bg-white/[0.03] p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] text-white/30 shrink-0">Email</span>
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs text-white/60 truncate">{customer.email}</span>
          <CopyButton value={customer.email} />
        </div>
      </div>
      {customer.phone && (
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] text-white/30 shrink-0">Phone</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/60">{customer.phone}</span>
            <CopyButton value={customer.phone} />
          </div>
        </div>
      )}
      {hasAddress && (
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] text-white/30 shrink-0 mt-0.5">Address</span>
          <div className="text-xs text-white/60 text-right space-y-0.5">
            {addr?.address1 && <p>{addr.address1}</p>}
            {(addr?.city || addr?.province || addr?.zip) && (
              <p>{[addr?.city, [addr?.province, addr?.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</p>
            )}
            {addr?.country_name && <p>{addr.country_name}</p>}
          </div>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] text-white/30 shrink-0">Customer since</span>
        <span className="text-xs text-white/50">{formatDate(customer.created_at)}</span>
      </div>
    </div>
  )
}

function RecentOrders({ orders, shop, isLoading }: { orders: ShopifyOrder[]; shop: string; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-md border border-white/[0.07] bg-white/[0.03] p-2.5 space-y-1.5">
            <div className="h-2.5 w-20 bg-white/[0.08] rounded" />
            <div className="h-2 w-32 bg-white/[0.05] rounded" />
            <div className="h-2 w-16 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return <p className="text-xs text-white/30 italic">No orders found.</p>
  }

  return (
    <div className="space-y-2">
      {orders.map(order => {
        const ff = fulfillmentStyle(order.fulfillment_status)
        const adminUrl = shop ? `https://${shop}/admin/orders/${order.id}` : null
        return (
          <div key={order.id} className="rounded-md border border-white/[0.07] bg-white/[0.03] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white/70">{order.name}</span>
                <CopyButton value={order.name} />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ff.cls}`}>{ff.label}</span>
            </div>
            <div className="space-y-0.5">
              {order.line_items.slice(0, 2).map((li, i) => (
                <p key={i} className="text-[11px] text-white/40 truncate">{li.quantity}× {li.title}</p>
              ))}
              {order.line_items.length > 2 && (
                <p className="text-[11px] text-white/25">+{order.line_items.length - 2} more</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">${parseFloat(order.total_price).toFixed(2)}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/30">{formatDate(order.created_at)}</span>
                {adminUrl && (
                  <a href={adminUrl} target="_blank" rel="noopener noreferrer"
                    className="text-white/25 hover:text-white/55 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DrawerContent({
  customer: initial,
  shop,
  onClose,
  onCustomerUpdated,
}: {
  customer: CustomerRow
  shop: string
  onClose: () => void
  onCustomerUpdated: (c: Partial<CustomerRow>) => void
}) {
  const router = useRouter()
  const { data, mutate } = useSWR<CustomerDetailResponse>(
    `/api/shopify/customer?customerId=${initial.id}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  const customer = data?.customer ?? initial
  const orders: ShopifyOrder[] = data?.orders ?? []
  const detailShop = data?.shop ?? shop
  const isLoadingDetail = !data

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditState>(() => makeDraft(customer))
  const [isStartingThread, setIsStartingThread] = useState(false)

  useEffect(() => {
    if (data?.customer) setDraft(makeDraft(data.customer))
  }, [data?.customer])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const res = await fetch("/api/shopify/customer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          updates: {
            first_name: draft.first_name,
            last_name:  draft.last_name,
            email:      draft.email,
            phone:      draft.phone || null,
            note:       draft.note  || null,
            address: {
              address1: draft.address1 || null,
              city:     draft.city     || null,
              province: draft.province || null,
              zip:      draft.zip      || null,
              country:  draft.country  || null,
            },
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSaveError(typeof json.error === "string" ? json.error : "Failed to save.")
        return
      }
      const updated = json.customer
      mutate({ ...data!, customer: { ...customer, ...updated } }, false)
      onCustomerUpdated({
        first_name: updated.first_name,
        last_name:  updated.last_name,
        email:      updated.email,
        phone:      updated.phone ?? null,
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartThread = async () => {
    setIsStartingThread(true)
    try {
      const res = await fetch("/api/threads/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopifyCustomerId: String(customer.id),
          customerEmail: customer.email,
          customerName: fullName(customer),
        }),
      })
      const json = await res.json()
      if (res.ok && json.threadId) {
        router.push(`/dashboard/tickets?thread=${json.threadId}`)
      }
    } finally {
      setIsStartingThread(false)
    }
  }

  const shopifyAdminUrl = detailShop
    ? `https://${detailShop}/admin/customers/${customer.id}`
    : null

  const addr = customer.default_address
  const hasAddress = !!(addr?.address1 || addr?.city || addr?.province || addr?.zip || addr?.country_name)
  const name = fullName(customer)
  const ltv = formatLTV(customer.total_spent)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <CustomerAvatar customer={customer} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white/85 truncate leading-tight">{name}</p>
            <p className="text-[11px] text-white/35 truncate">{customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {shopifyAdminUrl && (
            <a
              href={shopifyAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-[#96BF48] transition-colors"
              title="View in Shopify admin"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onClose}
            className="text-white/25 hover:text-white/60 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 px-4 py-3 border-b border-border shrink-0">
        <div>
          <p className="text-[10px] text-white/30 mb-0.5">Lifetime value</p>
          <p className="text-base font-bold text-white/70">{ltv}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.07]" />
        <div>
          <p className="text-[10px] text-white/30 mb-0.5">Orders</p>
          <p className="text-base font-bold text-white/70">{customer.orders_count}</p>
        </div>
        {customer.phone && (
          <>
            <div className="w-px h-8 bg-white/[0.07]" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/30 mb-0.5">Phone</p>
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium text-white/60 truncate">{customer.phone}</p>
                <CopyButton value={customer.phone} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-5">
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Details</span>
            {!isEditing && (
              <button
                onClick={() => { setDraft(makeDraft(customer)); setIsEditing(true); setSaveError(null) }}
                className="text-white/25 hover:text-white/55 transition-colors"
                title="Edit customer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <CustomerEditForm
              draft={draft}
              isSaving={isSaving}
              saveError={saveError}
              onDraftChange={(patch) => setDraft(d => ({ ...d, ...patch }))}
              onCancel={() => { setIsEditing(false); setSaveError(null) }}
              onSave={handleSave}
            />
          ) : (
            <CustomerDetailsCard customer={customer} hasAddress={hasAddress} />
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <ShoppingBag className="w-3 h-3 text-[#96BF48]" />
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Recent Orders</span>
          </div>
          <RecentOrders orders={orders} shop={detailShop} isLoading={isLoadingDetail} />
        </section>
      </div>

      <div className="px-4 py-3.5 border-t border-border shrink-0">
        <button
          onClick={handleStartThread}
          disabled={isStartingThread || !customer.email}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#96BF48] hover:bg-[#7da33a] disabled:opacity-40 rounded-md py-2.5 transition-colors"
        >
          {isStartingThread
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <MessageSquare className="w-4 h-4" />}
          {isStartingThread ? "Opening…" : "Start Support Thread"}
        </button>
      </div>
    </div>
  )
}

export function CustomerDrawer({
  customer,
  isOpen,
  onClose,
  shop,
  onCustomerUpdated,
}: {
  customer: CustomerRow
  isOpen: boolean
  onClose: () => void
  shop: string
  onCustomerUpdated: (c: Partial<CustomerRow>) => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/50 sm:bg-black/30" onClick={onClose} />

      <div
        className={`
          absolute bg-background border-border flex flex-col overflow-hidden
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl border-t
          sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-96 sm:max-h-none sm:rounded-none sm:border-t-0 sm:border-l
          ${isOpen
            ? "translate-y-0 sm:translate-x-0 opacity-100 scale-100"
            : "translate-y-full sm:translate-y-0 sm:translate-x-[calc(100%+1px)] opacity-0 sm:opacity-100 scale-[0.98] sm:scale-100"
          }
        `}
      >
        <DrawerContent
          customer={customer}
          shop={shop}
          onClose={onClose}
          onCustomerUpdated={onCustomerUpdated}
        />
      </div>
    </div>
  )
}
