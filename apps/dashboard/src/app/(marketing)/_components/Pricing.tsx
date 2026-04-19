import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$19",
    per: "/mo",
    desc: "For solo founders just getting their DMs under control.",
    features: ["Unified inbox — IG, email, SMS", "AI drafts every reply", "Up to 500 conversations/mo"],
    cta: "Start free trial",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro · most picked",
    price: "$49",
    per: "/mo",
    desc: "For brands ready to delegate work, not just drafts.",
    features: ["Everything in Starter", "Shopify actions (refund, address, track)", "SMS agent workflows", "Custom voice training", "2 team seats included"],
    cta: "Try Pro free →",
    href: "/signup",
    featured: true,
  },
  {
    name: "Scale",
    price: "$129",
    per: "/mo",
    desc: "For teams running 100+ tickets a day.",
    features: ["Everything in Pro", "Unlimited conversations", "Custom AI instructions per channel", "SLA + audit log", "Dedicated onboarding"],
    cta: "Talk to us",
    href: "mailto:hello@useclerk.co",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: "80px 28px", maxWidth: 1280, margin: "0 auto", borderTop: "1px solid var(--m-line)" }}>
      <div style={{ fontFamily: "var(--m-mono)", fontSize: 11, color: "var(--m-ink-2)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 24, height: 1, background: "var(--m-ink-2)", display: "inline-block" }} />
        03 · Pricing
      </div>
      <h2 style={{ fontFamily: "var(--m-serif)", fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.02em", maxWidth: "18ch", margin: "0 0 48px" }}>
        Costs less than{" "}
        <em style={{ fontStyle: "italic", color: "var(--m-acid)" }}>a part-time CX hire.</em>
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", border: "1px solid var(--m-line)", borderRadius: 12, overflow: "hidden", background: "var(--m-paper-2)" }}>
        {tiers.map((tier, i) => (
          <div key={tier.name} style={{
            padding: "36px 28px",
            borderRight: i < tiers.length - 1 ? "1px solid var(--m-line)" : "none",
            position: "relative",
            background: tier.featured ? "var(--m-ink)" : "transparent",
            color: tier.featured ? "var(--m-paper)" : "var(--m-ink)",
          }}>
            <div style={{ fontFamily: "var(--m-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16, color: tier.featured ? "var(--m-acid)" : "var(--m-ink-2)" }}>
              {tier.name}
            </div>
            <div style={{ fontFamily: "var(--m-serif)", fontSize: 64, letterSpacing: "-0.03em", lineHeight: 1, display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              {tier.price}
              <small style={{ fontSize: 14, fontFamily: "inherit", color: tier.featured ? "rgba(255,255,255,0.6)" : "var(--m-ink-2)", fontWeight: 500 }}>{tier.per}</small>
            </div>
            <div style={{ fontSize: 13, color: tier.featured ? "rgba(255,255,255,0.7)" : "var(--m-ink-2)", marginBottom: 24, minHeight: 40 }}>{tier.desc}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", fontSize: 13, lineHeight: 1.7 }}>
              {tier.features.map(f => (
                <li key={f} style={{ paddingLeft: 20, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--m-acid)", fontWeight: 700 }}>→</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={tier.href} style={{
              display: "block", width: "100%", padding: "12px", borderRadius: 8,
              border: tier.featured ? "none" : "1px solid var(--m-ink)",
              fontSize: 13, fontWeight: 600, textAlign: "center",
              background: tier.featured ? "var(--m-acid)" : "transparent",
              color: tier.featured ? "#fff" : "var(--m-ink)",
              textDecoration: "none",
            }}>
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
