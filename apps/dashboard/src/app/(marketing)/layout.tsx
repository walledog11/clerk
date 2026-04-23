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
        background: "#ffffff",
        color: "#161413",
        minHeight: "100vh",
        overflowX: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        "--m-serif": "var(--m-serif-font), 'Instrument Serif', serif",
        "--m-mono": "var(--m-mono-font), 'JetBrains Mono', monospace",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
