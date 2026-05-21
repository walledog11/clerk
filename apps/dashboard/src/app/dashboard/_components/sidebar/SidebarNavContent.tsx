"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import {
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/ui/cn"
import { useCommandPalette } from "../CommandPaletteContext"
import { FooterLinks } from "./FooterLinks"
import { NavGroupList } from "./NavGroupList"
import { OrgSwitcher } from "./OrgSwitcher"
import { UserMenu } from "./UserMenu"
import { dispatchNavProgressStart } from "./sidebar-helpers"
import type { NavAuth } from "./useNavAuth"

export function SidebarNavContent({
  openCount,
  onSwitching,
  navAuth,
}: {
  openCount: number
  onSwitching: (v: boolean) => void
  navAuth: NavAuth
}) {
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()
  const { open: openCmd } = useCommandPalette()

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const handleScroll = useCallback(() => {
    setIsScrolling(true)
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => setIsScrolling(false), 800)
  }, [])

  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, isActive: boolean) => {
    if (isActive) {
      e.preventDefault()
      return
    }
    if (isMobile) setOpenMobile(false)
    dispatchNavProgressStart()
  }

  return (
    <>
      <SidebarContent
        className={cn(
          "px-2 pt-1 pb-2 gap-0 overflow-x-hidden bg-black custom-scrollbar",
          isScrolling && "is-scrolling",
        )}
        onScroll={handleScroll}
      >
        <div className="pb-1 mb-2 border-b border-white/[0.06]">
          <OrgSwitcher navAuth={navAuth} onSwitching={onSwitching} variant="desktop" />
        </div>

        <button
          type="button"
          onClick={openCmd}
          className="w-full mb-2.5 flex items-center gap-2 px-2.5 py-2 rounded-md bg-white/[0.1] hover:bg-white/[0.2] transition-colors outline-none text-left"
        >
          <Search className="w-3.5 h-3.5 text-white/35 shrink-0" />
          <span className="flex-1 text-xs text-white/40">Search or jump to…</span>
          <kbd className="text-[10px] font-semibold bg-white/[0.08] px-1 py-0.5 rounded text-white/40 shrink-0 leading-none">⌘K</kbd>
        </button>

        <NavGroupList pathname={pathname} openCount={openCount} onNavigate={handleNavClick} variant="desktop" />
      </SidebarContent>

      <SidebarFooter className="border-t bg-black border-sidebar-border px-2 py-2 gap-0">
        <div className="flex items-center gap-1">
          <UserMenu navAuth={navAuth} variant="desktop" />
          <FooterLinks pathname={pathname} onNavigate={handleNavClick} variant="desktop" />
        </div>
      </SidebarFooter>
    </>
  )
}
