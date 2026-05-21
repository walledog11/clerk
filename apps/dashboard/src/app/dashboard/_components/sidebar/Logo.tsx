"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { dispatchNavProgressStart } from "./sidebar-helpers"

export function Logo() {
  const pathname = usePathname()

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1.5"
      onClick={() => {
        if (pathname !== "/dashboard") dispatchNavProgressStart()
      }}
    >
      <span className="text-xl font-black text-white tracking-tight">clerk</span>
      <span className="w-2 h-2 rounded-full bg-green-400 self-start mt-1.5 shrink-0" />
    </Link>
  )
}
