"use client"

import { LogOut } from "lucide-react"
import { OrgAvatar } from "@/components/OrgAvatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/ui/cn"
import type { NavAuth } from "./useNavAuth"

export function UserMenu({ navAuth, variant }: { navAuth: NavAuth; variant: "desktop" | "mobile" }) {
  const { user, signOut, fullName, roleLabel } = navAuth
  const isMobile = variant === "mobile"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2.5 rounded-lg hover:bg-white/[0.08] transition-colors text-left outline-none min-w-0 flex-1",
            isMobile ? "px-3 py-2.5" : "px-2 py-1.5 hover:bg-white/[0.06]",
          )}
        >
          <OrgAvatar
            name={fullName}
            imageUrl={user?.imageUrl}
            className={cn(
              "rounded-full bg-white/20 text-white font-bold ring-1 ring-white/20 shrink-0",
              isMobile ? "w-8 h-8 text-[11px]" : "w-7 h-7 text-[10px]",
            )}
          />
          <div className="flex-1 min-w-0">
            <p className={cn("font-semibold text-white truncate leading-tight", isMobile ? "text-sm" : "text-xs")}>
              {fullName}
            </p>
            <p className={cn("font-medium text-white/40 truncate leading-tight mt-0.5", isMobile ? "text-[11px]" : "text-[10px]")}>
              {roleLabel}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-48 bg-popover border-white/[0.09] text-white">
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="text-red-400 focus:text-red-400 focus:bg-white/[0.07] cursor-pointer gap-2"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
