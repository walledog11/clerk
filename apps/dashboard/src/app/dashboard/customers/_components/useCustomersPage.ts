"use client"

import { useCallback, useRef, useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/api/fetcher"
import type { CustomerRow, CustomersResponse } from "./types"

function customerKey(query: string) {
  if (query.length >= 1) {
    return `/api/shopify/customers?q=${encodeURIComponent(query)}`
  }
  return "/api/shopify/customers"
}

export function useCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [pages, setPages] = useState<CustomerRow[][]>([])
  const [nextPageInfo, setNextPageInfo] = useState<string | null>(null)
  const [shop, setShop] = useState("")
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawerCustomerRef = useRef<CustomerRow | null>(null)

  const { data, isLoading, error } = useSWR<CustomersResponse>(
    customerKey(debouncedQuery),
    fetcher,
    {
      onSuccess: (d) => {
        setPages([d.customers])
        setNextPageInfo(d.nextPageInfo)
        setShop(d.shop ?? "")
      },
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  )

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(q)
      setPages([])
      setNextPageInfo(null)
    }, 150)
  }

  const openDrawer = (customer: CustomerRow) => {
    drawerCustomerRef.current = customer
    setSelectedCustomer(customer)
    setIsDrawerOpen(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsDrawerOpen(true))
    })
  }

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setTimeout(() => {
      setSelectedCustomer(null)
      drawerCustomerRef.current = null
    }, 300)
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextPageInfo || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/shopify/customers?page_info=${encodeURIComponent(nextPageInfo)}`)
      const d: CustomersResponse = await res.json()
      setPages(prev => [...prev, d.customers])
      setNextPageInfo(d.nextPageInfo)
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextPageInfo, isLoadingMore])

  const handleCustomerUpdated = useCallback((updated: Partial<CustomerRow>) => {
    setPages(prev => prev.map(page =>
      page.map(c => c.id === selectedCustomer?.id ? { ...c, ...updated } : c)
    ))
    setSelectedCustomer(prev => prev ? { ...prev, ...updated } : prev)
  }, [selectedCustomer?.id])

  return {
    allCustomers: pages.flat(),
    data,
    debouncedQuery,
    drawerCustomer: selectedCustomer ?? drawerCustomerRef.current,
    error,
    handleCustomerUpdated,
    handleSearchChange,
    isDrawerOpen,
    isLoading,
    isLoadingMore,
    isSearchMode: debouncedQuery.length >= 1,
    loadMore,
    nextPageInfo,
    openDrawer,
    closeDrawer,
    pages,
    searchQuery,
    selectedCustomer,
    shop,
  }
}
