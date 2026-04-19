import Link from "next/link";

export function CTA() {
  return (
    <div style={{ padding: "96px 28px", textAlign: "center", background: "var(--m-ink)", color: "var(--m-paper)", marginTop: 80 }}>
      <h2 style={{
        fontFamily: "var(--m-serif)",
        fontSize: "clamp(48px, 7vw, 96px)",
        lineHeight: 0.95,
        letterSpacing: "-0.03em",
        margin: "0 0 24px",
        maxWidth: "18ch",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        Stop typing the same reply{" "}
        <em style={{ fontStyle: "italic", color: "var(--m-acid)" }}>three hundred times.</em>
      </h2>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: "0 0 32px" }}>
        Connect your inbox in under five minutes. First two weeks on us.
      </p>
      <Link href="/signup" style={{
        display: "inline-flex", alignItems: "center",
        fontSize: 14, padding: "14px 28px",
        background: "var(--m-paper)", color: "var(--m-ink)",
        border: 0, borderRadius: 999, fontWeight: 600,
        textDecoration: "none",
        cursor: "pointer",
      }}>
        Start free →
      </Link>
    </div>
  );
}
