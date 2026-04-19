"use client";

import { useState } from "react";

const steps = [
  {
    num: "STEP 01",
    title: 'Customer DMs you "where\'s my order?"',
    body: "Clerk reads it the second it lands. No queue, no delay.",
    vis: (
      <div>
        <div style={{ fontFamily: "var(--m-mono)", fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>incoming · 14:42:09</div>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "16px 20px", borderRadius: 12, borderBottomLeftRadius: 4, fontSize: 15, lineHeight: 1.5 }}>where&apos;s my order? been waiting a week 😩</div>
        <div style={{ marginTop: 22, display: "flex", gap: 8, color: "#ff5b1f", fontSize: 12, fontFamily: "var(--m-mono)", alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ff5b1f", flexShrink: 0 }} />
          Clerk read it · 0.4s ago
        </div>
      </div>
    ),
  },
  {
    num: "STEP 02",
    title: "It pulls the order, the policy, the history.",
    body: "Shopify order #3019. Shipped 2 days ago. Customer's last 3 messages.",
    vis: (
      <div>
        <div style={{ fontFamily: "var(--m-mono)", fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>context loading · 14:42:10</div>
        <div style={{ display: "grid", gap: 8, fontFamily: "var(--m-mono)", fontSize: 12 }}>
          {[
            ["shopify.order(2961)", "→ found"],
            ["usps.track(9400...)", "→ out for delivery"],
            ["history.last(3)", "→ first order"],
            ["policy.shipping", "→ 5-7 day est"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
              <span>{k}</span>
              <span style={{ color: "#ff5b1f" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "STEP 03",
    title: "Drafts a reply in your voice.",
    body: "Trained on the last 100 replies you sent. Same casual tone, same emoji habits.",
    vis: (
      <div>
        <div style={{ fontFamily: "var(--m-mono)", fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>drafting · in your voice</div>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "16px 20px", borderRadius: 12, borderBottomRightRadius: 4, fontSize: 15, lineHeight: 1.5, border: "1px solid rgba(255,91,31,0.5)" }}>
          Hey! so sorry for the wait — your order #2961 is out for delivery today, should arrive by 8pm. tracking: usps.com/track/9400... lmk if it doesn&apos;t show up 💛
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "var(--m-mono)" }}>tone match: 94% · learned from your last 127 replies</div>
      </div>
    ),
  },
  {
    num: "STEP 04",
    title: "You tap approve. Or you don't.",
    body: "Set up rules so easy ones (tracking links, hours) auto-send. Hard ones wait for you.",
    vis: (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--m-mono)", fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>awaiting your tap · 14:42:13</div>
        <div style={{ fontFamily: "var(--m-serif)", fontSize: 42, letterSpacing: "-0.02em", marginBottom: 20 }}>approve &amp; send?</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", border: 0, color: "#fff", borderRadius: 8, fontFamily: "inherit", cursor: "pointer", fontSize: 13 }}>Edit first</button>
          <button style={{ padding: "10px 20px", background: "#ff5b1f", border: 0, color: "#fff", borderRadius: 8, fontFamily: "inherit", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Send →</button>
        </div>
        <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--m-mono)" }}>avg time-to-approve: 4.2s</div>
      </div>
    ),
  },
];

export function Workflow() {
  const [active, setActive] = useState(0);

  return (
    <section style={{ padding: "80px 28px", maxWidth: 1280, margin: "0 auto", borderTop: "1px solid var(--m-line)" }}>
      <div style={{ fontFamily: "var(--m-mono)", fontSize: 11, color: "var(--m-ink-2)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 24, height: 1, background: "var(--m-ink-2)", display: "inline-block" }} />
        02 · How it actually works
      </div>
      <h2 style={{ fontFamily: "var(--m-serif)", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.02em", maxWidth: "18ch", margin: "0 0 48px" }}>
        You set the rules.{" "}
        <em style={{ fontStyle: "italic", color: "var(--m-acid)" }}>Clerk does the typing.</em>
      </h2>

      {/* Desktop: 2-col */}
      <div className="hidden md:grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {steps.map((s, i) => (
            <li
              key={i}
              onMouseEnter={() => setActive(i)}
              style={{
                padding: i === active ? "24px 0 24px 16px" : "24px 0",
                borderBottom: i < steps.length - 1 ? "1px solid var(--m-line)" : "none",
                cursor: "pointer", position: "relative", transition: "padding 0.2s",
              }}
            >
              {i === active && <span style={{ position: "absolute", left: 0, top: 24, bottom: 24, width: 3, background: "var(--m-acid)" }} />}
              <span style={{ fontFamily: "var(--m-mono)", fontSize: 11, color: "var(--m-ink-2)", marginBottom: 8, display: "block" }}>{s.num}</span>
              <h4 style={{ fontFamily: "var(--m-serif)", fontSize: 26, fontWeight: 400, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{s.title}</h4>
              <p style={{ fontSize: 14, color: "var(--m-ink-2)", margin: 0, lineHeight: 1.5 }}>{s.body}</p>
            </li>
          ))}
        </ol>
        <div style={{ background: "var(--m-ink)", color: "var(--m-paper)", borderRadius: 16, padding: 40, height: 440, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {steps[active].vis}
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {steps.map((s, i) => (
          <div key={i}>
            <span style={{ fontFamily: "var(--m-mono)", fontSize: 11, color: "var(--m-ink-2)", display: "block", marginBottom: 8 }}>{s.num}</span>
            <h4 style={{ fontFamily: "var(--m-serif)", fontSize: 24, fontWeight: 400, margin: "0 0 8px" }}>{s.title}</h4>
            <p style={{ fontSize: 14, color: "var(--m-ink-2)", margin: "0 0 16px", lineHeight: 1.5 }}>{s.body}</p>
            <div style={{ background: "var(--m-ink)", color: "var(--m-paper)", borderRadius: 12, padding: 24 }}>{s.vis}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
