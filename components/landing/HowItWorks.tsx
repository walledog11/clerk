"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Bot, BrainCircuit, Cpu, Inbox, Send, Tag, FileText, AlertTriangle, MessageSquareText } from "lucide-react";

/* ── Card 1: Connect Your Channels ── */
function ConnectCard() {
  const platforms = [
    { src: "/logos/instagram-logo.png", alt: "Instagram", label: "Instagram" },
    { src: "/logos/tiktok-logo.png", alt: "TikTok", label: "TikTok" },
    { src: "/logos/shopify-inbox.png", alt: "Shopify Inbox", label: "Shopify Inbox" },
    { src: "/logos/gmail.png", alt: "Gmail", label: "Gmail" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full flex flex-col overflow-hidden">
      {/* Icon grid area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-2 gap-5 relative">
          {platforms.map((p, i) => (
            <motion.div
              key={p.alt}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <Image src={p.src} alt={p.alt} width={48} height={48} className="object-contain" />
            </motion.div>
          ))}

          {/* Animated cursor */}
          <motion.svg
            className="absolute -right-2 bottom-4 w-6 h-6 z-10 drop-shadow-md"
            viewBox="0 0 24 24"
            fill="none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <path d="M5 3l14 8-6 2-4 6z" fill="#111" stroke="#111" strokeWidth="1" strokeLinejoin="round" />
          </motion.svg>
        </div>
      </div>

      {/* Connected preview */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 space-y-2">
        {platforms.slice(0, 3).map((p, i) => (
          <motion.div
            key={p.alt}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <Image src={p.src} alt={p.alt} width={24} height={24} className="rounded-md" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-foreground">{p.label}</span>
              <span className="text-[10px] text-muted-foreground ml-2">Connected</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Card 2: AI Processes Messages ── */
function AICard() {
  const capabilities = [
    "Summarize",
    "Extract Info",
    "Draft Reply",
    "Categorize",
    "Detect Urgency",
    "Route",
  ];

  return (
    <div className="rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden bg-gradient-to-b from-yellow-400 to-amber-500">
      {/* Center chip visual */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Binary text decorations */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-mono text-yellow-900/30 leading-relaxed select-none pointer-events-none">
          01101<br />10110<br />01011<br />10101
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-mono text-yellow-900/30 leading-relaxed select-none pointer-events-none text-right">
          11010<br />01101<br />10011<br />01010
        </div>

        {/* Processor chip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-2xl bg-white/90 border-2 border-yellow-600/20 flex items-center justify-center shadow-lg relative"
        >
          {/* Chip connector lines */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <span className="w-4 h-0.5 bg-yellow-800/20 rounded" />
            <span className="w-4 h-0.5 bg-yellow-800/20 rounded" />
            <span className="w-4 h-0.5 bg-yellow-800/20 rounded" />
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <span className="w-4 h-0.5 bg-yellow-800/20 rounded" />
            <span className="w-4 h-0.5 bg-yellow-800/20 rounded" />
            <span className="w-4 h-0.5 bg-yellow-800/20 rounded" />
          </div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="w-0.5 h-4 bg-yellow-800/20 rounded" />
            <span className="w-0.5 h-4 bg-yellow-800/20 rounded" />
            <span className="w-0.5 h-4 bg-yellow-800/20 rounded" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="w-0.5 h-4 bg-yellow-800/20 rounded" />
            <span className="w-0.5 h-4 bg-yellow-800/20 rounded" />
            <span className="w-0.5 h-4 bg-yellow-800/20 rounded" />
          </div>
          <Cpu className="w-10 h-10 text-yellow-600" />
        </motion.div>

        {/* Capability badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {capabilities.map((cap, i) => (
            <motion.span
              key={cap}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
              className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-medium text-yellow-900 shadow-sm border border-yellow-200/50"
            >
              {cap}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Bottom logos */}
      <div className="flex items-center justify-center gap-4 px-5 py-4 bg-white/20 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
          <BrainCircuit className="w-4 h-4 text-yellow-700" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4 text-yellow-700" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
          <Inbox className="w-4 h-4 text-yellow-700" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
          <FileText className="w-4 h-4 text-yellow-700" />
        </div>
      </div>
    </div>
  );
}

/* ── Card 3: Respond & Resolve ── */
function RunCard() {
  const workflowSteps = [
    { icon: Inbox, label: "Customer Message", sub: "Received on Instagram", color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200" },
    { icon: BrainCircuit, label: "AI Drafts Response", sub: "With full context", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", highlight: true },
    { icon: Send, label: "Sent via Original", sub: "Channel auto-detected", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-[240px] space-y-0">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className={`w-full rounded-xl border ${step.border} ${step.bg} px-4 py-3.5 flex items-center gap-3 ${step.highlight ? "shadow-md ring-2 ring-yellow-300/50" : "shadow-sm"}`}
              >
                <div className={`w-9 h-9 rounded-lg ${step.highlight ? "bg-yellow-400" : "bg-white"} flex items-center justify-center shrink-0 shadow-sm`}>
                  <step.icon className={`w-4 h-4 ${step.highlight ? "text-white" : step.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground leading-tight">{step.label}</div>
                  <div className="text-[11px] text-muted-foreground">{step.sub}</div>
                </div>
              </motion.div>

              {/* Connector line between steps */}
              {i < workflowSteps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.3 }}
                  className="w-px h-6 border-l-2 border-dashed border-slate-300 origin-top"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 bg-slate-50/80">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-14">
          <p className="text-sm text-yellow-500 font-medium mb-3">Get started with three simple steps</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How it works
          </h2>
        </div>

        {/* Three cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="flex flex-col">
            <div className="flex-1 min-h-[400px]">
              <ConnectCard />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-yellow-400 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-lg font-bold text-foreground">Connect Your Channels</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-[34px]">
                Link your Instagram, TikTok, Shopify Inbox, and email in seconds
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col">
            <div className="flex-1 min-h-[400px]">
              <AICard />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-yellow-400 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="text-lg font-bold text-foreground">AI Reads &amp; Understands</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-[34px]">
                Messages are parsed, summarized, and prioritized automatically by AI
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col">
            <div className="flex-1 min-h-[400px]">
              <RunCard />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-6 h-6 rounded-md bg-yellow-400 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-lg font-bold text-foreground">Respond &amp; Resolve</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-[34px]">
                AI drafts replies and sends them through the original channel
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
