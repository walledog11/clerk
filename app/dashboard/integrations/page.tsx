"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// --- MOCK INTEGRATION DATA ---
const INITIAL_INTEGRATIONS = [
  {
    id: "shopify",
    name: "Shopify",
    logo: "/logos/shopify.svg",
    description: "Connect your store to sync customer orders, returns, and Shopify Inbox messages directly into Clerk.",
    status: "connected",
    lastSync: "2 mins ago",
    accounts: ["clerk-merch.myshopify.com", "clerk-eu.myshopify.com"]
  },
  {
    id: "instagram",
    name: "Instagram",
    logo: "/logos/instagram-logo.png",
    description: "Reply to Direct Messages and comments from your Instagram business account.",
    status: "disconnected",
    lastSync: null,
    accounts: []
  },
  {
    id: "tiktok",
    name: "TikTok",
    logo: "/logos/tiktok-logo.png",
    description: "Manage TikTok Shop messages and video comments in one unified place.",
    status: "disconnected",
    lastSync: null,
    accounts: []
  },
  {
    id: "gmail",
    name: "Gmail / Email",
    logo: "/logos/gmail.png",
    description: "Route your customer support email (e.g., help@yourstore.com) directly to your Clerk inbox.",
    status: "connected",
    lastSync: "Just now",
    accounts: ["support@clerk.com", "hello@clerk.com"]
  }
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)

  // Function to simulate connecting/disconnecting an app and injecting the correct handle format
  const toggleConnection = (id: string) => {
    setIntegrations(current => 
      current.map(app => {
        if (app.id === id) {
          const isConnecting = app.status === "disconnected"
          let mockAccounts: string[] = []
          // Generate realistic mock handles based on the platform being connected
          if (isConnecting) {
            switch (id) {
              case "shopify":
                mockAccounts = ["my-new-store.myshopify.com"]
                break
              case "instagram":
                mockAccounts = ["@clerk_hq"]
                break
              case "tiktok":
                mockAccounts = ["@clerk.app"]
                break
              case "gmail":
                mockAccounts = ["contact@mybusiness.com"]
                break
            }
            return {
              ...app,
              status: "connected",
              lastSync: "Just now",
              accounts: mockAccounts
            }
          } else {
            return {
              ...app,
              status: "disconnected",
              lastSync: null,
              accounts: [] as never[]
            }
          }
        }
        return app
      })
    )
  }

  return (
    // Removed duplicate padding, max-width, and scroll constraints. 
    // Just using responsive vertical spacing now.
    <div className="space-y-6 md:space-y-8 w-full">
      
      {/* Page Header */}
      <div>
        {/* Adjusted text sizing for mobile */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Integrations</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Connect your favorite apps and platforms to route all customer messages into Clerk.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
        {integrations.map((app) => (
          <Card key={app.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-muted flex items-center justify-center p-2 border shrink-0">
                  <Image 
                    src={app.logo} 
                    alt={`${app.name} logo`} 
                    width={32} 
                    height={32} 
                    className="object-contain"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl">{app.name}</CardTitle>
                </div>
              </div>
              <Badge 
                variant={app.status === "connected" ? "default" : "secondary"}
                className={app.status === "connected" ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"}
              >
                {app.status === "connected" ? "Connected" : "Not Connected"}
              </Badge>
            </CardHeader>
            
            <CardContent className="flex-1 mt-4">
              <p className="text-sm text-muted-foreground">
                {app.description}
              </p>
              
              {/* Connected Accounts Display */}
              {app.status === "connected" && app.accounts && app.accounts.length > 0 && (
                <div className="mt-5 space-y-2 border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Connected Accounts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {app.accounts.map((account, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="font-medium bg-muted/50 border-muted-foreground/20 text-xs md:text-sm py-1"
                      >
                        {account}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sync Status */}
              {app.status === "connected" && app.lastSync && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Last synced: {app.lastSync}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-4 border-t mt-auto bg-muted/10">
              <div className="flex w-full justify-between items-center gap-4">
                <span className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                  {app.status === "connected" ? "Active Integration" : "Requires Authentication"}
                </span>
                <Button 
                  variant={app.status === "connected" ? "outline" : "default"}
                  onClick={() => toggleConnection(app.id)}
                  size="sm"
                  className="shrink-0"
                >
                  {app.status === "connected" ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}