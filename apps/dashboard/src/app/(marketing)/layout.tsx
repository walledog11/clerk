import type { ReactNode } from "react";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--m-serif-font",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--m-mono-font",
  display: "swap",
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      style={{
        /* Hardcoded cream background and dark text — overrides body's dark theme */
        background: "#f6f2eb",
        color: "#161413",
        minHeight: "100vh",
        overflowX: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        /* Define all marketing design tokens inline so they cascade to all children */
        "--m-ink": "#161413",
        "--m-ink-2": "#3a3633",
        "--m-paper": "#f6f2eb",
        "--m-paper-2": "#efe9df",
        "--m-line": "rgba(22, 20, 19, 0.10)",
        "--m-line-2": "rgba(22, 20, 19, 0.06)",
        "--m-acid": "rgb(60, 158, 57)",
        "--m-good": "#2f7a4a",
        "--m-serif": "var(--m-serif-font), 'Instrument Serif', serif",
        "--m-mono": "var(--m-mono-font), 'JetBrains Mono', monospace",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
