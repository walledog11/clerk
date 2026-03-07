"use client";

import { useState, useEffect, useRef } from "react";
import { Inbox, BrainCircuit, Send, SendHorizontal, Plug, MessageCircle, ShoppingBag, Mail } from "lucide-react";

const tabs = [
  {
    id: "inbox",
    label: "Unified Inbox",
    title: "Meet your unified inbox",
    description:
      "All your customer messages from TikTok, Instagram, Shopify Inbox, and Email — routed to one clean dashboard. No more switching tabs.",
    icon: Inbox,
    preview: "inbox",
  },
  {
    id: "summarize",
    label: "AI Summaries",
    title: "Instant AI summaries",
    description:
      "Every incoming ticket is summarized with vital details — order numbers, tracking info, customer intent — so you can respond in seconds, not minutes.",
    icon: BrainCircuit,
    preview: "summary",
  },
  {
    id: "respond",
    label: "Agentic Capabilities",
    title: "Offload tasks and delegate",
    description:
      "Communicate with clerk like a real employee. Delegate tasks by simply instructing what you would like done. ",
    icon: Send,
    preview: "respond",
  },
  {
    id: "integrations",
    label: "Integrations",
    title: "Connect all your channels",
    description:
      "Plug in TikTok, Instagram, Shopify Chat, and your business email. New channels are added regularly. Setup takes under 5 minutes.",
    icon: Plug,
    preview: "integrations",
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
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
         <SendHorizontal className="w-4 h-4 text-blue-600 transform scale-x-[-1]" />
        <span className="text-xs font-medium text-muted-foreground">Support Ticket</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
          <div className="text-xs space-y-2 w-full">
            <div className="flex justify-between"><span className="font-semibold text-foreground">Customer</span><span className="text-muted-foreground">Sarah M.</span></div>
            <div className="flex justify-between"><span className="font-semibold text-foreground">Order</span><span className="text-muted-foreground">#2849</span></div>
            <div className="flex justify-between"><span className="font-semibold text-foreground">Channel</span><span className="text-muted-foreground">Instagram DM</span></div>
            <div className="flex justify-between"><span className="font-semibold text-foreground">Intent</span><span className="text-blue-600 font-medium">Address change</span></div>
            <div className="flex justify-between"><span className="font-semibold text-foreground">Tracking</span><span className="text-muted-foreground">1Z999AA1...</span></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Customer wants to update the shipping address for order #2849 before it ships tomorrow.</p>
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
    <section id="features" className="w-full py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section heading */}
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-12">
          Everything you need in one place
        </h2>

        {/* Tabs */}
        <div className="flex items-center justify-center mb-16 ">
          <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-full p-1 mx-4 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[11px] sm:text-sm font-medium rounded-full px-2 sm:px-4 py-1.5 sm:py-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        {/* Content area */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start max-w-5xl mx-auto">
          {/* Left: text */}
          <div className="flex flex-col space-y-6">
      
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {activeFeature.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {activeFeature.description}
            </p>
          </div>

          {/* Right: preview mock */}
          <div className="flex items-center justify-center">
            <PreviewComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
