"use client"

import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/api/fetcher"
import { resolveAgentSettings } from "@/lib/agent/settings"
import type { OrgSettings } from "@/types"
import { PermissionToggleRow } from "./PermissionToggleRow"

export function ShopifyPermissionsPanel() {
  const { data, mutate } = useSWR<{ settings: Partial<OrgSettings> }>('/api/org', fetcher)
  const settings = resolveAgentSettings(data?.settings)
  const refundCap = settings.maxRefundAmount == null ? null : `auto-approve up to $${settings.maxRefundAmount}`

  async function patch(partial: Partial<OrgSettings>) {
    await fetch('/api/org', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: partial }),
    })
    await mutate()
  }

  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] px-4 py-3">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Permissions &amp; limits</p>
        <Link
          href="/dashboard/settings"
          className="text-[10px] font-medium text-white/30 hover:text-white/70 transition-colors"
        >
          Advanced settings →
        </Link>
      </div>
      <div className="divide-y divide-white/[0.05]">
        <PermissionToggleRow
          label="Read orders, customers, products"
          required
          checked={settings.toolsEnabled.read}
          onChange={() => { /* required */ }}
        />
        <PermissionToggleRow
          label="Issue refunds"
          suffix={settings.toolsEnabled.action ? refundCap : null}
          checked={settings.toolsEnabled.action}
          onChange={(v) => patch({ toolsEnabled: { ...settings.toolsEnabled, action: v } })}
        />
        <PermissionToggleRow
          label="Cancel unfulfilled orders"
          checked={settings.toolsEnabled.action && !settings.blockCancellations}
          onChange={(v) => patch({ blockCancellations: !v })}
        />
        <PermissionToggleRow
          label="Modify line items & discounts"
          checked={settings.toolsEnabled.action && !settings.blockCustomLineItems}
          onChange={(v) => patch({ blockCustomLineItems: !v })}
        />
      </div>
    </div>
  )
}
