import Link from "next/link";

export function Footer() {
  return (
    <div style={{
      padding: "28px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      fontSize: 12,
      color: "rgba(255,255,255,0.5)",
      background: "var(--m-ink)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      fontFamily: "var(--m-mono)",
    }}>
      <div>clerk · made for shopkeepers</div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
        <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
        <a href="mailto:hello@useclerk.co" style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
      </div>
    </div>
  );
}
