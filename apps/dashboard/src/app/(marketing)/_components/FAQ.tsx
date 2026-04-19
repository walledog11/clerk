"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Will it ever send something embarrassing on my behalf?",
    a: "Not unless you tell it to. By default, Clerk drafts every reply but waits for you to approve. As you build trust you can turn on auto-send for narrow cases like \"send tracking link if order is shipped.\" Everything else still pings you.",
  },
  {
    q: "How does it learn my voice?",
    a: "It reads your last 100 outgoing replies on connect. From then on it learns from every draft you edit before sending.",
  },
  {
    q: "Can I export my data?",
    a: "Yes — full conversation history, customer notes, and tags export to CSV any time. We don't hold your data hostage.",
  },
  {
    q: "What if I don't use Shopify?",
    a: "Inbox + AI drafts work standalone. Shopify-specific actions (refund, address change) only fire if you connect a store.",
  },
  {
    q: "Can multiple team members use Clerk?",
    a: "Yes. Professional includes multi-member access, role-based permissions, and internal notes so teams can align privately before replying.",
  },
  {
    q: "Is my customers' data secure?",
    a: "All customer data is encrypted in transit and at rest. Each organization's data is strictly isolated — no cross-tenant access.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ padding: "24px 0", borderTop: "1px solid var(--m-line)", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--m-serif)", fontSize: "clamp(18px, 3vw, 24px)", letterSpacing: "-0.01em" }}>
        <span>{q}</span>
        <span style={{ fontFamily: "var(--m-mono)", fontSize: 18, fontWeight: 400, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none", flexShrink: 0, marginLeft: 16 }}>+</span>
      </div>
      {open && (
        <div style={{ fontSize: 14, color: "var(--m-ink-2)", lineHeight: 1.6, marginTop: 12, maxHeight: 200, overflow: "hidden" }}>
          {a}
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section style={{ padding: "80px 28px", maxWidth: 1280, margin: "0 auto", borderTop: "1px solid var(--m-line)", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--m-mono)", fontSize: 11, color: "var(--m-ink-2)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
        <span style={{ width: 24, height: 1, background: "var(--m-ink-2)", display: "inline-block" }} />
        04 · Honest questions
      </div>
      <h2 style={{ fontFamily: "var(--m-serif)", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.02em", maxWidth: "18ch", margin: "0 auto 48px" }}>
        Things people ask{" "}
        <em style={{ fontStyle: "italic", color: "var(--m-acid)" }}>before they trust an AI.</em>
      </h2>

      <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "left" }}>
        {faqs.map(item => (
          <FaqItem key={item.q} {...item} />
        ))}
        <div style={{ borderTop: "1px solid var(--m-line)" }} />
      </div>
    </section>
  );
}
