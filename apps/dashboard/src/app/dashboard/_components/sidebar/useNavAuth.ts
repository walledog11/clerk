"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { useClerk, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs"
import { fetcher } from "@/lib/api/fetcher"
import { formatRole } from "@/lib/format/role"

export type NavAuth = ReturnType<typeof useNavAuth>

export function useNavAuth() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { organization, membership, memberships } = useOrganization({
    memberships: { infinite: false, pageSize: 20 },
  })
  const { userMemberships, setActive } = useOrganizationList({ userMemberships: { infinite: true } })
  const { data: orgData } = useSWR<{ planName?: string }>("/api/org", fetcher, {
    revalidateOnFocus: false,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const membershipPage = memberships as { count?: number; data?: unknown[] } | undefined
  const seatCount = membershipPage?.count ?? membershipPage?.data?.length ?? 1

  return {
    user,
    signOut,
    organization,
    userMemberships,
    setActive,
    mounted,
    fullName: user?.fullName ?? user?.firstName ?? "User",
    roleLabel: formatRole(membership?.role),
    planName: orgData?.planName ?? "Free",
    seatCount,
  }
}
