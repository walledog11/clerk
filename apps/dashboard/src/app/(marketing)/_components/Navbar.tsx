import Link from "next/link";

export function Navbar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "var(--m-paper)", borderBottom: "1px solid var(--m-line)",
      padding: "12px 20px", display: "flex", alignItems: "center", gap: 32,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em", flexShrink: 0 }}>
        <span style={{ width: 10, height: 10, background: "var(--m-acid)", borderRadius: "50%", display: "inline-block" }} />
        clerk
      </div>

      <div className="hidden md:flex" style={{ gap: 24, fontSize: 13, color: "var(--m-ink-2)", fontWeight: 500 }}>
        <Link href="#demo" style={{ color: "inherit", textDecoration: "none" }}>Live demo</Link>
        <Link href="#channels" style={{ color: "inherit", textDecoration: "none" }}>Channels</Link>
        <Link href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</Link>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
        <Link href="/login" className="hidden sm:inline-flex" style={{
          alignItems: "center", padding: "8px 14px",
          borderRadius: 999, fontSize: 13, fontWeight: 600,
          border: "1px solid var(--m-line)", background: "transparent",
          color: "var(--m-ink)", textDecoration: "none",
        }}>
          Sign in
        </Link>
        <Link href="/signup" style={{
          display: "inline-flex", alignItems: "center", padding: "8px 14px",
          borderRadius: 999, fontSize: 13, fontWeight: 600,
          background: "var(--m-ink)", color: "var(--m-paper)",
          border: "1px solid var(--m-ink)", textDecoration: "none",
          whiteSpace: "nowrap",
        }}>
          Start free →
        </Link>
      </div>
    </nav>
  );
}
