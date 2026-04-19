import Link from "next/link";

export function Hero() {
  return (
    <section style={{
      padding: "48px 28px 24px",
      maxWidth: 1280, margin: "0 auto",
      textAlign: "center",
    }}>
      {/* Eyebrow */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "6px 14px", border: "1px solid var(--m-line)",
        borderRadius: 999, fontSize: 12, fontWeight: 500,
        background: "var(--m-paper-2)", marginBottom: 32,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "var(--m-acid)",
          display: "inline-block",
          animation: "m-pulse 1.8s ease infinite",
        }} />
        Watching Sarah&apos;s DMs in real-time
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "var(--m-serif)",
        fontWeight: 400,
        fontSize: "clamp(48px, 7vw, 108px)",
        lineHeight: 0.92,
        letterSpacing: "-0.03em",
        margin: "0 0 24px",
        maxWidth: "14ch",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        Your DMs answered themselves{" "}
        <em style={{ fontStyle: "italic", color: "var(--m-acid)" }}>while you slept.</em>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 19, lineHeight: 1.45, color: "var(--m-ink-2)",
        maxWidth: "52ch", margin: "0 auto 36px", fontWeight: 400,
      }}>
        Clerk is an AI support agent for Shopify brands. It reads every Instagram DM, email, and SMS — drafts replies that actually sound like you, and only sends after you tap approve.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600,
          background: "var(--m-ink)", color: "var(--m-paper)",
          border: "1px solid var(--m-ink)", textDecoration: "none",
        }}>
          Start free — 14 days
        </Link>
        <Link href="#demo" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
          border: "1px solid var(--m-line)", background: "transparent",
          color: "var(--m-ink)", textDecoration: "none",
        }}>
          ▶ Watch a 90s walkthrough
        </Link>
      </div>

      {/* Meta row */}
      <div style={{
        display: "flex", gap: 24, fontSize: 12, color: "var(--m-ink-2)",
        marginTop: 24, flexWrap: "wrap", justifyContent: "center",
      }}>
        {["No credit card", "Connect Shopify in 2 min", "Cancel any time"].map((item) => (
          <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              background: "#2f7a4a", color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, flexShrink: 0,
            }}>✓</span>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
