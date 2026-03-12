"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

// --- MOCK DATA ---
const MOCK_TICKETS = [
  {
    id: "t-1",
    platform: "Instagram",
    logo: "/logos/instagram-logo.png",
    customer: "Sarah Jenkins",
    time: "10m ago",
    subject: "Where is my order?",
    preview: "I ordered the Glossier lip balm 2 weeks ago and it still hasn't arrived.",
    tag: "Shipping Delay",
    tagColor: "text-amber-600 bg-amber-50",
    aiSummary: "Customer is frustrated regarding a delayed order for a Glossier lip balm placed 14 days ago. Sentiment is negative. Recommend providing tracking info.",
    messages: [
      { sender: "customer", text: "Hey, I ordered the Glossier lip balm 2 weeks ago and it still hasn't arrived. Can someone help?", time: "Today, 10:42 AM" }
    ]
  },
  {
    id: "t-2",
    platform: "TikTok",
    logo: "/logos/tiktok-logo.png",
    customer: "user88492",
    time: "1h ago",
    subject: "Restock question",
    preview: "Do you guys restock the blue skims dress anytime soon?",
    tag: "Product Inquiry",
    tagColor: "text-blue-600 bg-blue-50",
    aiSummary: "User is inquiring about the restock timeline for the 'blue skims dress'.",
    messages: [
      { sender: "customer", text: "Do you guys restock the blue skims dress anytime soon?", time: "Today, 9:15 AM" }
    ]
  },
  {
    id: "t-3",
    platform: "Shopify",
    logo: "/logos/shopify.svg",
    customer: "Mark D.",
    time: "3h ago",
    subject: "Return Request",
    preview: "The sizing is a bit too small. I need to exchange this for a medium.",
    tag: "Returns",
    tagColor: "text-purple-600 bg-purple-50",
    aiSummary: "Customer wants to exchange a small item for a medium. Needs return label.",
    messages: [
      { sender: "customer", text: "The sizing is a bit too small. I need to exchange this for a medium. How do I initiate a return?", time: "Today, 7:30 AM" },
      { sender: "agent", text: "Hi Mark, sorry about the sizing! I just emailed you a return label. Let me know if you received it.", time: "Today, 8:00 AM" },
      { sender: "customer", text: "Got it, thanks!", time: "Today, 8:15 AM" }
    ]
  }
]

const FILTERS = ["All", "Shopify", "Instagram", "TikTok", "Gmail"]

export default function InteractiveTicketsPage() {
  const [activeFilter, setActiveFilter] = useState("All")
  // Start with null so mobile users see the list first
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null) 
  const [replyText, setReplyText] = useState("")

  // Filter tickets based on the selected platform badge
  const filteredTickets = MOCK_TICKETS.filter(ticket => 
    activeFilter === "All" ? true : ticket.platform === activeFilter
  )

  // Find the currently selected ticket data
  const activeTicket = MOCK_TICKETS.find(t => t.id === activeTicketId)

  const handleAiDraft = () => {
    setReplyText("Hi there! I'm so sorry for the delay. Let me check your tracking information right now...")
  }

  return (
    // Using an absolute min-height ensures it doesn't get crushed by the parent's padding
    <div className="flex h-full min-h-[600px] w-full overflow-hidden bg-background rounded-xl border">
      
      {/* LEFT COLUMN: Ticket List (Hidden on mobile if a ticket is selected) */}
      <div className={`
        w-full md:w-1/3 md:min-w-[320px] md:max-w-[420px] border-r flex-col
        ${activeTicketId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">Unified Inbox</h2>
          
          {/* Interactive Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((filter) => (
              <Badge 
                key={filter}
                variant={activeFilter === filter ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        {/* Scrollable Ticket List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm mt-10">
              No tickets found for {activeFilter}.
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`cursor-pointer transition-colors ${
                  activeTicketId === ticket.id 
                    ? "border-primary shadow-sm bg-accent/50" 
                    : "hover:bg-muted/50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Image src={ticket.logo} width={16} height={16} alt={ticket.platform} className="object-contain" />
                      <span className="font-medium text-sm">{ticket.customer}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{ticket.time}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {ticket.preview}
                  </p>
                  <Badge variant="outline" className={`text-xs ${ticket.tagColor}`}>
                    {ticket.tag}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE: Conversation & AI Workspace (Hidden on mobile if NO ticket is selected) */}
      <div className={`
        flex-1 flex-col bg-muted/10 
        ${!activeTicketId ? 'hidden md:flex' : 'flex'}
      `}>
        {activeTicket ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden shrink-0 -ml-2" 
                  onClick={() => setActiveTicketId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="font-semibold">{activeTicket.customer}</h3>
                  <p className="text-xs text-muted-foreground">{activeTicket.platform} Message</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex">Snooze</Button>
                <Button size="sm">Mark Resolved</Button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* Clerk AI Summary */}
              <Card className="bg-blue-50/50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                    ✨ Clerk AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-900">
                    {activeTicket.aiSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Message Thread */}
              <div className="space-y-4">
                {activeTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1 ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 text-sm max-w-[85%] md:max-w-[80%] shadow-sm ${
                      msg.sender === 'agent' 
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                        : 'bg-background border rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-muted-foreground mx-1">{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Composer */}
            <div className="p-4 bg-background border-t">
              <div className="border rounded-lg shadow-sm focus-within:ring-1 focus-within:ring-ring">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full min-h-[100px] p-3 bg-transparent resize-none outline-none text-sm" 
                  placeholder={`Type your reply to ${activeTicket.customer}...`}
                />
                <div className="flex justify-between items-center p-2 border-t bg-muted/20">
                  <Button onClick={handleAiDraft} variant="ghost" size="sm" className="text-blue-600">
                    <span className="hidden sm:inline">✨ Draft AI Reply</span>
                    <span className="sm:hidden">✨ AI Draft</span>
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!replyText.trim()}
                    onClick={() => {
                      setReplyText("")
                    }}
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
            Select a ticket from the inbox to view the conversation
          </div>
        )}
      </div>
    </div>
  )
}