"use client"

import { ChevronDown } from "lucide-react"
import { OrgAvatar } from "@/components/OrgAvatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/ui/cn"
import { dispatchNavProgressStart, type WorkspaceMembership } from "./sidebar-helpers"
import type { NavAuth } from "./useNavAuth"

export function OrgSwitcher({
  navAuth,
  onSwitching,
  onClose,
  variant,
}: {
  navAuth: NavAuth
  onSwitching: (v: boolean) => void
  onClose?: () => void
  variant: "desktop" | "mobile" | "mobileCompact"
}) {
  const { organization, userMemberships, setActive, mounted, planName, seatCount } = navAuth
  const isMobile = variant === "mobile"
  const isCompact = variant === "desktop" || variant === "mobileCompact"
  const memberships = userMemberships.data as WorkspaceMembership[] | undefined

  const switchOrganization = async (organizationId: string) => {
    if (organizationId === organization?.id || !setActive) return

    onClose?.()
    onSwitching(true)

    try {
      await setActive({ organization: organizationId })
      window.location.reload()
    } catch (error) {
      console.error("Failed to switch workspace", error)
      onSwitching(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center outline-none text-left transition-colors hover:bg-white/[0.06]",
            isMobile ? "gap-2.5 px-3 py-2.5 mb-4 rounded-lg" : "gap-2 px-1 py-1 rounded-lg hover:bg-white/[0.04]",
          )}
        >
          <OrgAvatar
            name={organization?.name}
            imageUrl={organization?.imageUrl}
            className={cn(
              "rounded-md bg-green-500/20 text-[13px] font-bold text-green-300 shrink-0",
              isCompact ? "w-6 h-6" : "w-9 h-9",
            )}
          />
          <div className="flex-1 min-w-0">
            <p className={cn("font-bold text-white truncate leading-tight", isCompact ? "text-xs" : "text-sm")}>
              {organization?.name ?? "Workspace"}
            </p>
            <p className="text-[11px] font-medium text-white/40 truncate leading-tight mt-0.5">
              {planName} plan · {seatCount} seat{seatCount === 1 ? "" : "s"}
            </p>
          </div>
          <ChevronDown className={cn("text-white/30 shrink-0", isCompact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] bg-popover border-white/[0.09] text-white"
      >
        {mounted &&
          memberships?.map((mem) => {
            const isActive = mem.organization.id === organization?.id

            return (
              <DropdownMenuItem
                key={mem.organization.id}
                onClick={() => switchOrganization(mem.organization.id)}
                className={cn(
                  "flex items-center gap-2.5 cursor-pointer focus:bg-white/[0.07]",
                  isActive && "bg-white/[0.04]",
                )}
              >
                <OrgAvatar
                  name={mem.organization.name}
                  imageUrl={mem.organization.imageUrl}
                  className="w-5 h-5 rounded bg-white/10 text-[10px] text-white/70 shrink-0"
                />
                <span className="flex-1 text-xs font-medium text-white/80 truncate">{mem.organization.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
              </DropdownMenuItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
