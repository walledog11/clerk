"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  SVG Tangle Graphics                                                */
/* ------------------------------------------------------------------ */

function Tangle1() {
  return (
    <svg viewBox="0 0 240 200" fill="none" className="w-full h-full">
      <defs>
        <filter id="ts1">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.08" />
        </filter>
        <linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaeaec" />
          <stop offset="100%" stopColor="#d0d0d5" />
        </linearGradient>
      </defs>
      <g filter="url(#ts1)">
        <path
          d="M40,100 C40,50 80,20 120,55 C160,90 90,125 65,100 C40,75 95,35 135,60 C175,85 135,135 95,118 C55,101 75,55 115,65"
          stroke="url(#rg1)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M55,115 C85,70 145,55 160,95 C175,135 120,145 85,120"
          stroke="url(#rg1)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M105,40 C140,50 165,85 145,115 C125,145 80,130 75,100"
          stroke="url(#rg1)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function Tangle2() {
  return (
    <svg viewBox="0 0 240 200" fill="none" className="w-full h-full">
      <defs>
        <filter id="ts2">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.08" />
        </filter>
        <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaeaec" />
          <stop offset="100%" stopColor="#d0d0d5" />
        </linearGradient>
      </defs>
      <g filter="url(#ts2)">
        <path
          d="M50,90 C80,30 160,25 175,80 C190,135 110,155 65,125 C20,95 85,40 140,60 C195,80 155,145 100,135"
          stroke="url(#rg2)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M70,70 C100,45 155,50 165,90 C175,130 125,140 90,115 C55,90 90,55 130,75"
          stroke="url(#rg2)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M100,45 C130,35 170,60 160,100 C150,140 100,145 80,115"
          stroke="url(#rg2)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function Tangle3() {
  return (
    <svg viewBox="0 0 240 200" fill="none" className="w-full h-full">
      <defs>
        <filter id="ts3">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.08" />
        </filter>
        <linearGradient id="rg3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaeaec" />
          <stop offset="100%" stopColor="#d0d0d5" />
        </linearGradient>
      </defs>
      <g filter="url(#ts3)">
        <path
          d="M35,85 C55,30 135,15 165,60 C195,105 140,145 90,130 C40,115 60,65 115,55 C170,45 200,95 170,125"
          stroke="url(#rg3)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M60,120 C30,85 65,45 115,50 C165,55 185,100 150,130 C115,160 65,145 55,110"
          stroke="url(#rg3)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M130,40 C160,55 180,90 155,120 C130,150 80,140 65,110 C50,80 80,50 120,55"
          stroke="url(#rg3)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating App Icon                                                  */
/* ------------------------------------------------------------------ */

function FloatingIcon({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div
      className={`absolute w-9 h-9 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center ${className}`}
    >
      <Image src={src} alt={alt} width={20} height={20} className="object-contain" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small decorative icon (for the middle tangle)                      */
/* ------------------------------------------------------------------ */

function DecorIcon({
  children,
  className,
  round = false,
}: {
  children: React.ReactNode;
  className: string;
  round?: boolean;
}) {
  return (
    <div
      className={`absolute w-9 h-9 ${
        round ? "rounded-full" : "rounded-xl"
      } bg-white shadow-md border border-slate-100 flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Speech Bubble                                                      */
/* ------------------------------------------------------------------ */

function SpeechBubble({ text, className }: { text: string; className: string }) {
  return (
    <div
      className={`absolute bg-white rounded-lg shadow-md border border-slate-100 px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap ${className}`}
    >
      {text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function WorkSprawl() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative z-10 w-full py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* ── Headline ── */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] text-foreground">
            60% of work is lost in context
            <br />
            <span className="text-muted-foreground">– and AI is lost without it.</span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground">
            Work Sprawl is killing context and destroying productivity.
          </p>
        </motion.div>

        {/* ── Three tangled sections ── */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[38%] left-[12%] right-[12%] h-[4px] rounded-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-6 lg:gap-10">
            {/* ─── Context Switching ─── */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="relative w-60 h-52 mb-6">
                <Tangle1 />
                <FloatingIcon src="/logos/instagram-logo.png" alt="Instagram" className="top-0 left-2" />
                <FloatingIcon src="/logos/shopify-inbox.png" alt="Shopify Inbox" className="-top-1 right-6" />
                <FloatingIcon src="/logos/tiktok-logo.png" alt="TikTok" className="bottom-4 left-0" />
                <FloatingIcon src="/logos/gmail.png" alt="Email" className="bottom-6 right-2" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Context Switching</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                Digital fatigue reduces employee
                <br />
                performance by up to <span className="font-bold text-foreground">32%</span>
              </p>
            </motion.div>

            {/* ─── Context Missing ─── */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative w-60 h-52 mb-6">
                <Tangle2 />
                {/* Sparkle / AI-style icons */}
                <DecorIcon className="top-0 left-[42%]" round>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74z" />
                  </svg>
                </DecorIcon>
                <DecorIcon className="top-14 -right-1" round>
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                  </svg>
                </DecorIcon>
                <DecorIcon className="bottom-2 left-10" round>
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-1.5 4-4.5 7-9 7 4.5 0 7.5 3 9 7 1.5-4 4.5-7 9-7-4.5 0-7.5-3-9-7z" />
                  </svg>
                </DecorIcon>
                <DecorIcon className="bottom-8 right-4" round>
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" />
                  </svg>
                </DecorIcon>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Context Missing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                <span className="font-bold text-foreground">96% of companies fail</span>
                <br />
                in AI value &amp; adoption
              </p>
            </motion.div>

            {/* ─── Context Stitching ─── */}
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <div className="relative w-60 h-52 mb-6">
                <Tangle3 />
                <SpeechBubble text="Where&rsquo;s that..." className="-top-1 right-0" />
                <SpeechBubble text="Who can help with..." className="top-14 -right-6" />
                <SpeechBubble text="Is this accurate?" className="bottom-8 -right-2" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Context Stitching</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                <span className="font-bold text-foreground">2.5 hours daily</span> wasted
                <br />
                searching &amp; stitching context
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
