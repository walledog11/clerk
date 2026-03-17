"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Bot, ArrowLeft, Sparkles, Send, Clock, CheckCircle2 } from "lucide-react"
import useSWR from 'swr'

// 1. Define the SWR Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json())

const FILTERS = ["All", "Shopify", "Instagram", "TikTok", "Gmail"]

// Helper function to format timestamps cleanly
const formatTime = (dateString: string) => {
  if (!dateString) return "Just now";
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function InteractiveTicketsPage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null) 
  const [replyText, setReplyText] = useState("")

  // 2. Fetch the live data from PostgreSQL via Next.js API
  const { data: dbThreads, error, isLoading } = useSWR('/api/threads', fetcher, { 
    refreshInterval: 3000 // Silently poll for new messages every 3 seconds
  })

  // 3. Transform the raw database data into the shape your UI expects
  const liveTickets = dbThreads ? dbThreads.map((thread: any) => {
    
    // Map 'ig_dm' to 'Instagram' so your UI logic and logos work perfectly
    let platformName = "Unknown";
    let logoPath = "/logos/default.png";
    if (thread.channelType === 'ig_dm') {
      platformName = "Instagram";
      logoPath = "/logos/instagram-logo.png";
    }

    const lastMessage = thread.messages[thread.messages.length - 1];

    return {
      id: thread.id,
      platform: platformName,
      logo: logoPath,
      // If we don't have a name yet, use a shortened version of their ID
      customer: thread.customer?.name || `Shopper_${thread.customer?.platformId.substring(0,5)}`,
      time: lastMessage ? formatTime(lastMessage.sentAt) : 'New',
      subject: "New Inquiry", // We will build AI categorization for this later
      preview: lastMessage?.contentText || "No messages yet.",
      tag: "Support",
      tagColor: "text-blue-700 bg-blue-100 border-blue-200",
      aiSummary: "AI Summary generation pending...", // We will connect OpenAI to this later
      messages: thread.messages.map((msg: any) => ({
        sender: msg.senderType, // 'customer' or 'agent'
        text: msg.contentText,
        time: formatTime(msg.sentAt)
      }))
    }
  }) : [] // Default to empty array while loading

  // 4. Update the filter logic to use liveTickets instead of MOCK_TICKETS
  const filteredTickets = liveTickets.filter((ticket: any) => 
    activeFilter === "All" ? true : ticket.platform === activeFilter
  )

  const activeTicket = liveTickets.find((t: any) => t.id === activeTicketId)

  const handleAiDraft = () => {
    setReplyText("Hi there! Let me check on that for you right now...")
  }

  // Handle Initial Loading State
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[600px] w-full items-center justify-center bg-white rounded-[2rem] border border-slate-200">
        <div className="text-slate-500 font-bold animate-pulse">Loading Clerk Inbox...</div>
      </div>
    )
  }

  // Handle Error State
  if (error) {
    return (
      <div className="flex h-full min-h-[600px] w-full items-center justify-center bg-white rounded-[2rem] border border-red-200">
        <div className="text-red-500 font-bold">Failed to connect to database.</div>
      </div>
    )
  }

  return (
    // Your UI remains exactly the same from here down!
    <div className="flex h-full min-h-[600px] w-full overflow-hidden bg-white rounded-[2rem] border border-slate-200">
      
      {/* LEFT COLUMN: Ticket List */}
      <div className={`
        w-full md:w-1/3 md:min-w-[340px] md:max-w-[420px] border-r border-slate-200 flex-col bg-slate-50
        ${activeTicketId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="text-2xl font-extrabold tracking-tight mb-4 text-slate-900">Inbox</h2>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTERS.map((filter) => (
              <Badge 
                key={filter}
                variant={activeFilter === filter ? "default" : "secondary"}
                className={`cursor-pointer whitespace-nowrap px-3 py-1 font-bold ${
                  activeFilter === filter 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* We swapped MOCK_TICKETS to filteredTickets here */}
          {filteredTickets.map((ticket: any) => (
            <Card 
              key={ticket.id}
              onClick={() => setActiveTicketId(ticket.id)}
              className={`cursor-pointer transition-none border-none relative overflow-hidden rounded-2xl ${
                activeTicketId === ticket.id 
                  ? "bg-white ring-1 ring-slate-200 shadow-sm" 
                  : "bg-transparent hover:bg-white hover:ring-1 hover:ring-slate-200"
              }`}
            >
              {activeTicketId === ticket.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500" />
              )}
              <CardContent className="py-1 pl-5 mt-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 relative flex-shrink-0">
                       <Image src={ticket.logo} fill alt={ticket.platform} className="object-contain" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">{ticket.customer}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{ticket.time}</span>
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">{ticket.subject}</p>
                <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-3">
                  {ticket.preview}
                </p>
                <Badge variant="outline" className={`text-[10px] font-extrabold uppercase tracking-wider border ${ticket.tagColor}`}>
                  {ticket.tag}
                </Badge>
              </CardContent>
            </Card>
          ))}
          
          {filteredTickets.length === 0 && (
              <div className="text-center p-8 text-slate-400 font-bold text-sm">
                  No open tickets.
              </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Conversation & AI Workspace */}
      <div className={`
        flex-1 flex-col bg-white
        ${!activeTicketId ? 'hidden md:flex' : 'flex'}
      `}>
        {activeTicket ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-slate-200 flex items-center justify-between px-6 bg-white z-10">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden shrink-0 -ml-2 text-slate-500" 
                  onClick={() => setActiveTicketId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {activeTicket.customer}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    via {activeTicket.platform}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 font-bold border-slate-200">
                  <Clock className="w-4 h-4" /> Snooze
                </Button>
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Resolve
                </Button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              
              {/* Utilitarian AI Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-yellow-200 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-yellow-700" />
                  </div>
                  <h4 className="text-sm font-extrabold text-yellow-900">Clerk Context</h4>
                </div>
                <p className="text-sm font-medium text-yellow-800 leading-relaxed">
                  {activeTicket.aiSummary}
                </p>
              </div>

              {/* Message Thread */}
              <div className="space-y-6">
                {activeTicket.messages.map((msg: any, i: number) => (
                  <div key={i} className={`flex flex-col gap-1.5 ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 text-sm max-w-[85%] md:max-w-[75%] font-medium leading-relaxed ${
                      msg.sender === 'agent' 
                        ? 'bg-slate-900 text-white rounded-[1.5rem] rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-900 rounded-[1.5rem] rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 mx-2 uppercase tracking-wide">{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flat, structured Composer */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="border border-slate-200 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-yellow-500/20 focus-within:border-yellow-500 overflow-hidden">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full min-h-[100px] p-4 bg-transparent resize-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400" 
                  placeholder={`Reply to ${activeTicket.customer}...`}
                />
                
                <div className="flex justify-between items-center p-3 bg-slate-50 border-t border-slate-200">
                  <Button 
                    onClick={handleAiDraft} 
                    variant="ghost" 
                    size="sm" 
                    className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 font-bold"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Draft with Clerk</span>
                    <span className="sm:hidden">Draft</span>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    disabled={!replyText.trim()}
                    onClick={() => setReplyText("")}
                    className="font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 px-6"
                  >
                    <span className="hidden sm:inline mr-2">Send</span>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <Bot className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Inbox Zero</h3>
            <p className="text-sm font-medium">Select a conversation to view details.</p>
          </div>
        )}
      </div>
    </div>
  )
}