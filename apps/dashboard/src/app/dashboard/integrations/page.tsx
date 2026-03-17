"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// --- STRICT TYPESCRIPT INTERFACES ---
type Account = {
  name: string;
  lastSync: string;
};

type Integration = {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: "connected" | "disconnected";
  accounts: Account[];
};

// --- MOCK INTEGRATION DATA ---
const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "shopify",
    name: "Shopify",
    logo: "/logos/shopify.svg",
    description: "Connect your store to sync customer orders, returns, and Shopify Inbox messages directly into Clerk.",
    status: "connected",
    accounts: [
      { name: "clerk-merch.myshopify.com", lastSync: "2 mins ago" },
      { name: "clerk-eu.myshopify.com", lastSync: "1 hr ago" }
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    logo: "/logos/instagram-logo.png",
    description: "Reply to Direct Messages and comments from your Instagram business account.",
    status: "disconnected",
    accounts: []
  },
  {
    id: "tiktok",
    name: "TikTok",
    logo: "/logos/tiktok-logo.png",
    description: "Manage TikTok Shop messages and video comments in one unified place.",
    status: "disconnected",
    accounts: []
  },
  {
    id: "gmail",
    name: "Gmail / Email",
    logo: "/logos/gmail.png",
    description: "Route your customer support email (e.g., help@yourstore.com) directly to your Clerk inbox.",
    status: "connected",
    accounts: [
      { name: "support@clerk.com", lastSync: "Just now" },
      { name: "hello@clerk.com", lastSync: "5 mins ago" }
    ]
  }
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS)

  const toggleConnection = (id: string) => {
    setIntegrations(current => 
      current.map(app => {
        if (app.id === id) {
          const isConnecting = app.status === "disconnected"
          let mockAccounts: Account[] = []
          
          if (isConnecting) {
            switch (id) {
              case "shopify":
                mockAccounts = [{ name: "my-new-store.myshopify.com", lastSync: "Just now" }]
                break
              case "instagram":
                mockAccounts = [{ name: "@clerk_hq", lastSync: "Just now" }]
                break
              case "tiktok":
                mockAccounts = [{ name: "@clerk.app", lastSync: "Just now" }]
                break
              case "gmail":
                mockAccounts = [{ name: "contact@mybusiness.com", lastSync: "Just now" }]
                break
            }
            return {
              ...app,
              status: "connected",
              accounts: mockAccounts
            }
          } else {
            return {
              ...app,
              status: "disconnected",
              accounts: [] // Clears accounts when disconnected
            }
          }
        }
        return app
      })
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full bg-white rounded-[2rem] p-8 border border-slate-200 min-h-[600px]">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900">Integrations</h1>
        <p className="text-base font-medium text-slate-500">
          Connect your favorite apps and platforms to route all customer messages into Clerk.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {integrations.map((app) => (
          <Card key={app.id} className="flex flex-col border-slate-200 shadow-sm rounded-[1.5rem] hover:shadow-md transition-shadow bg-white relative">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-6 px-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-200 shrink-0">
                  <Image 
                    src={app.logo} 
                    alt={`${app.name} logo`} 
                    width={32} 
                    height={32} 
                    className="object-contain"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl font-extrabold text-slate-900">{app.name}</CardTitle>
                </div>
              </div>
              <Badge 
                variant="outline"
                className={`font-bold uppercase tracking-wider text-[10px] ${
                  app.status === "connected" 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                {app.status === "connected" ? "Connected" : "Disconnected"}
              </Badge>
            </CardHeader>
            
            <CardContent className="flex-1 mt-4 px-6">
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {app.description}
              </p>
              
              {/* CONNECTED ACCOUNTS & TOOLTIPS */}
              {app.status === "connected" && app.accounts && app.accounts.length > 0 && (
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Connected Accounts
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {app.accounts.map((account, idx) => (
                      // Added inline-flex so the hover area exactly matches the badge size
                      <div key={idx} className="group relative inline-flex">
                        
                        <Badge 
                          variant="outline" 
                          className="font-bold bg-slate-50 border-slate-200 text-slate-700 text-xs py-1 transition-colors group-hover:bg-yellow-50 group-hover:border-yellow-300 group-hover:text-yellow-900 cursor-default"
                        >
                          {account.name}
                        </Badge>
                        
                        {/* Independent Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg whitespace-nowrap z-10 shadow-md animate-in fade-in zoom-in-95 duration-200">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          Synced: {account.lastSync}
                          
                          {/* CSS Triangle pointing down */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900"></div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-4 pb-6 px-6 border-t border-slate-100 mt-auto bg-slate-50/50 rounded-b-[1.5rem]">
              <div className="flex w-full justify-between items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
                  {app.status === "connected" ? "Active Integration" : "Auth Required"}
                </span>
                <Button 
                  variant={app.status === "connected" ? "outline" : "default"}
                  onClick={() => toggleConnection(app.id)}
                  size="sm"
                  className={`shrink-0 font-bold ${
                    app.status === "connected" 
                      ? "border-slate-300 text-slate-700 hover:bg-slate-100" 
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
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