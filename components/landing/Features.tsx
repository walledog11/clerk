"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Inbox, BrainCircuit, Send, SendHorizontal, Plug,
  MessageCircle, ShoppingBag, Mail, Filter, Bell,
  Star, Zap, Clock, FileText, Bot, PenLine,
  Link2, Settings, RefreshCw, Shield,
  Pointer,
} from "lucide-react";

const tabs = [
  {
    id: "inbox",
    label: "Unified Inbox",
    category: "INBOX",
    title: "All your messages,\none clean dashboard",
    description:
      "Customer messages from TikTok, Instagram, Shopify Inbox, and Email — routed to one place. No more switching tabs.",
    icon: Inbox,
    preview: "inbox",
    bgClass: "bg-blue-100/60",
    categoryColor: "text-blue-600",
    subFeatures: [
      { icon: MessageCircle, label: "Multi-channel" },
      { icon: RefreshCw, label: "Real-time Sync" },
      { icon: Filter, label: "Smart Filters" },
      { icon: Bell, label: "Notifications" },
    ],
  },
  {
    id: "summarize",
    label: "AI Summaries",
    category: "SUMMARIZE",
    title: "From ticket\nto insight, instantly",
    description:
      "Every incoming ticket is summarized with vital details — order numbers, tracking info, customer intent — so you respond in seconds.",
    icon: BrainCircuit,
    preview: "summary",
    bgClass: "bg-amber-100/60",
    categoryColor: "text-amber-600",
    subFeatures: [
      { icon: Zap, label: "Instant Analysis" },
      { icon: FileText, label: "Key Details" },
      { icon: Clock, label: "Time Saved" },
      { icon: Star, label: "Smart Priority" },
    ],
  },
  {
    id: "respond",
    label: "Agentic Capabilities",
    category: "RESPOND",
    title: "Delegate tasks,\nlike a real employee",
    description:
      "Communicate with clerk like a team member. Delegate tasks by simply instructing what you'd like done.",
    icon: Send,
    preview: "respond",
    bgClass: "bg-green-100/60",
    categoryColor: "text-green-600",
    subFeatures: [
      { icon: Bot, label: "AI Agent" },
      { icon: Send, label: "Auto-respond" },
      { icon: PenLine, label: "Draft & Edit" },
      { icon: Shield, label: "Brand Voice" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    category: "CONNECT",
    title: "Connect all your\nchannels in minutes",
    description:
      "Plug in TikTok, Instagram, Shopify Chat, and your business email. New channels added regularly. Setup takes under 5 minutes.",
    icon: Plug,
    preview: "integrations",
    bgClass: "bg-purple-100/60",
    categoryColor: "text-purple-600",
    subFeatures: [
      { icon: Link2, label: "Easy Setup" },
      { icon: Settings, label: "Configure" },
      { icon: RefreshCw, label: "Auto-sync" },
      { icon: Plug, label: "Extensible" },
    ],
  },
];

function InboxPreview() {
  return (
    <div className="flex justify-center">
      {/* Phone frame — 9:19.5 ratio like a real smartphone */}
      <div className="relative w-[260px] aspect-[9/19.5] rounded-[2.5rem] border-[6px] border-slate-900 bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Status bar / notch area */}
        <div className="relative flex items-center justify-center pt-3 pb-2 bg-white">
          {/* Dynamic Island */}
          <div className="w-20 h-5 bg-slate-900 rounded-full" />
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <span className="text-xs font-semibold text-foreground">Inbox</span>
          <span className="text-[10px] text-muted-foreground">4 new</span>
        </div>

        {/* Message list */}
        <div className="divide-y flex-1">
          {[
            { platform: "IG", color: "bg-pink-100 text-pink-600", name: "Sarah M.", msg: "Hi, I need help with my order #2849..." },
            { platform: "TK", color: "bg-slate-900 text-white", name: "James L.", msg: "Can I change my shipping address?" },
            { platform: "SP", color: "bg-green-100 text-green-700", name: "Emma R.", msg: "When will my item be back in stock?" },
            { platform: "EM", color: "bg-red-100 text-red-500", name: "David K.", msg: "Requesting a refund for order #3012" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.color}`}>
                {item.platform}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground truncate">{item.msg}</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            </div>
          ))}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center py-3 bg-white mt-auto">
          <div className="w-24 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SummaryPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Animation sequence timeline
    const timers = [
      setTimeout(() => setStep(1), 1000), // Cursor moves to button
      setTimeout(() => setStep(2), 2000), // Cursor clicks
      setTimeout(() => setStep(3), 2700), // Processing state
      setTimeout(() => setStep(4), 5000), // Success state
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex justify-center w-full h-[580px]">
      {/* Dashboard App Window */}
      <div className="relative w-[340px] h-full rounded-2xl border border-slate-200 bg-slate-50 shadow-xl overflow-hidden flex flex-col font-sans">
        
        {/* App Header */}
        <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-center px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-800">clerk</span>
          </div>
        </div>

        {/* List of Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* CARD 1 - Animated */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
            
            {/* Standard View (Fades out when processing) */}
            <div className={`transition-opacity duration-300 ${step >= 3 ? 'opacity-0 hidden' : 'opacity-100'}`}>
              <div className="p-3 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium">Marketplace Prints</span>
                    <span className="text-xs font-bold text-slate-800">Order #MXP29187</span>
                  </div>
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium border border-red-100">
                    Modify Order
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Customer would like to remove the &quot;Canvas Tote&quot; from their order before it ships.
                </p>
              </div>
              
              <div className="p-3 bg-gradient-to-b from-blue-50/50 to-blue-50 border-t-2 border-t-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Suggested Action</span>
                </div>
                <p className="text-[11px] text-blue-900 mb-3 leading-snug font-medium">
                  Check if shipped. If not, remove item, issue partial refund, and notify customer.
                </p>
                <div className="flex gap-2">
                  <button className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all flex items-center justify-center gap-1
                    ${step === 2 ? 'bg-blue-700 text-white scale-[0.98]' : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'}`}>
                    <Zap className="w-3 h-3" />
                    Approve & Run
                  </button>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 hover:bg-slate-50">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Processing / Success State (Fades in) */}
            <div className={`absolute inset-0 bg-white flex flex-col justify-center items-center p-4 transition-opacity duration-300 
              ${step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              
              {step === 3 && (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-800 mb-1">Agent is working...</span>
                    <span className="text-[10px] text-slate-500">Checking Shopify fulfillment status...</span>
                  </div>
                </div>
              )}

              {step >= 4 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center w-full"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 mb-1">Resolved Successfully</span>
                  <div className="text-[10px] text-slate-600 bg-slate-50 w-full p-2 rounded border border-slate-100 text-left space-y-1">
                    <div>✅ Item removed from #MXP29187</div>
                    <div>✅ $24.00 refunded to original payment</div>
                    <div>✅ Confirmation email sent</div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>

          {/* CARD 2 - Static */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-90">
            <div className="p-3 border-b border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">Color Couture</span>
                  <span className="text-xs font-bold text-slate-800">TikTok Comment</span>
                </div>
                <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium border border-orange-100">
                  Restock Info
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug mb-2">
                User asking &quot;When will the summer dress be back in stock?&quot; Also noted some negative sentiment on the post.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-medium text-slate-500">AI drafted response ready</span>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 shadow-sm">
                Review Draft
              </button>
            </div>
          </div>

          {/* CARD 3 - Static */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-80">
            <div className="p-3 border-b border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">Marketplace Prints</span>
                  <span className="text-xs font-bold text-slate-800">Order #MXP28196</span>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium border border-amber-100">
                  Return
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Customer would like to start a return for their recent order.
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-medium text-slate-500">Action requires approval</span>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700 shadow-sm">
                Review Policy
              </button>
            </div>
          </div>

        </div>

        {/* Animated Mouse Cursor */}
        <div 
          className="absolute z-50 pointer-events-none transition-all duration-800 ease-in-out"
          style={{
            top: step >= 1 ? '250px' : '350px',
            left: step >= 1 ? '200px' : '300px',
            opacity: step >= 3 ? 0 : 1
          }}
        >
          <Pointer />
        </div>

      </div>
    </div>
  );
}
let respondAnimationPlayed = false;

const YOU_SAID_TEXT = "Update the address and inform the customer about the changes";

function RespondPreview() {
  const [step, setStep] = useState(() => (respondAnimationPlayed ? 4 : 0));
  const [typedText, setTypedText] = useState(() => (respondAnimationPlayed ? YOU_SAID_TEXT : ""));
  const [showCursor, setShowCursor] = useState(false);
  const typingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (respondAnimationPlayed) return;

    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step !== 2 || respondAnimationPlayed) return;

    setShowCursor(true);
    let charIndex = 0;
    typingInterval.current = setInterval(() => {
      charIndex++;
      setTypedText(YOU_SAID_TEXT.slice(0, charIndex));
      if (charIndex >= YOU_SAID_TEXT.length) {
        clearInterval(typingInterval.current!);
        setShowCursor(false);
        setTimeout(() => setStep(3), 400);
      }
    }, 24);

    return () => {
      if (typingInterval.current) clearInterval(typingInterval.current);
    };
  }, [step]);

  useEffect(() => {
    if (step !== 3 || respondAnimationPlayed) return;

    const timer = setTimeout(() => {
      setStep(4);
      respondAnimationPlayed = true;
    }, 1200);

    return () => clearTimeout(timer);
  }, [step]);

  const messages = [
    {
      content: (
        <div className="rounded-xl shadow-xs shadow-pink-200 overflow-hidden">
          <div className="bg-pink-100 rounded-lg p-3 text-xs">
            <span className="text-pink-400 font-medium">Support ticket for <span className="text-blue-500 underline">#2849</span>:</span>
            <p className="mt-1 text-muted-foreground">Customer requested an address change to this address: <br /><br />1234 Main Street<br />Los Angeles, CA 90210</p>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="rounded-xl shadow-xs shadow-blue-200 overflow-hidden">
          <div className="bg-blue-100 rounded-lg p-3 text-xs">
            <span className="text-blue-400 font-medium">You said:</span>
            <p className="mt-1 text-muted-foreground">&quot;{typedText}{showCursor && <span className="inline-block w-[2px] h-3 bg-muted-foreground align-middle ml-[1px] animate-pulse" />}&quot;</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 min-h-[300px]">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`transition-all duration-1000 ease-out ${
            i < step
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {msg.content}
        </div>
      ))}

      <div
        className={`transition-all duration-1000 ease-out ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="rounded-xl shadow-xs shadow-green-150 overflow-hidden">
          <div className="bg-green-50 rounded-lg text-xs border border-green-100 relative">

            <div className={`p-3 transition-opacity duration-700 ease-in-out ${
              step === 3 ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}>
              <div className="flex items-center gap-1.5 py-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
   
            <div className={`p-3 transition-opacity duration-700 ease-in-out ${
              step >= 4 ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}>
              <span className="text-green-600 font-medium">clerk Draft → Instagram DM:</span>
              <p className="mt-1 text-foreground">Hi Sarah! We&apos;ve updated the shipping address for your order #2849 and it will ship to the new address tomorrow. Let us know if you need anything else!</p>
              <div className="flex gap-2 mt-3">
                <div className="px-5 py-1.5 bg-green-600 text-background rounded-full text-xs font-medium">Send</div>
                <div className="px-5 py-1.5 border border-green-600 text-foreground rounded-full text-xs font-medium">Edit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsPreview() {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
        <Plug className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-medium text-muted-foreground">Connected Channels</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {[
          { name: "Instagram", icon: MessageCircle, color: "text-pink-500 bg-pink-50", connected: true },
          { name: "TikTok", icon: MessageCircle, color: "text-slate-900 bg-slate-100", connected: true },
          { name: "Shopify Inbox", icon: ShoppingBag, color: "text-green-600 bg-green-50", connected: true },
          { name: "Email", icon: Mail, color: "text-red-500 bg-red-50", connected: true },
        ].map((ch) => (
          <div key={ch.name} className="flex items-center gap-2 rounded-lg border p-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ch.color}`}>
              <ch.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium">{ch.name}</div>
              <div className={`text-[10px] ${ch.connected ? "text-green-600" : "text-muted-foreground"}`}>
                {ch.connected ? "Connected" : "Connect →"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


const previewComponents: Record<string, React.FC> = {
  inbox: InboxPreview,
  summary: SummaryPreview,
  respond: RespondPreview,
  integrations: IntegrationsPreview,
};

export function Features() {
  const [activeTab, setActiveTab] = useState("inbox");
  const activeFeature = tabs.find((t) => t.id === activeTab)!;
  const PreviewComponent = previewComponents[activeFeature.preview];

  return (
    <section id="features" className="relative z-10 w-full py-14">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section heading */}
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-12">
          Everything you need in one place
        </h2>

        {/* Tab bar */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-full p-1 mx-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative text-[11px] sm:text-sm font-medium rounded-full px-2 sm:px-5 py-1.5 sm:py-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature panel */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className={`rounded-3xl ${activeFeature.bgClass} p-8 md:p-12 lg:p-16`}
            >
              <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
                {/* Left: preview */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <PreviewComponent />
                </motion.div>

                {/* Right: text content */}
                <div className="flex flex-col">
                  {/* Category label */}
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className={`text-xs font-semibold tracking-widest uppercase ${activeFeature.categoryColor} mb-4`}
                  >
                    {activeFeature.category}
                  </motion.span>

                  {/* Heading */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-foreground leading-tight whitespace-pre-line"
                  >
                    {activeFeature.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed"
                  >
                    {activeFeature.description}
                  </motion.p>

                  {/* Sub-features 2×2 grid */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    className="grid grid-cols-2 gap-x-6 gap-y-4 mt-8"
                  >
                    {activeFeature.subFeatures.map((sf, i) => (
                      <motion.div
                        key={sf.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                        className="flex items-center gap-2.5"
                      >
                        <sf.icon className="w-5 h-5 text-foreground/70 shrink-0" />
                        <span className="text-sm font-medium text-foreground">
                          {sf.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.45 }}
                    className="mt-8"
                  >
                    <button className="px-6 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                      Learn more
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}