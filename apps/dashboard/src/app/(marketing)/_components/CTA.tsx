import Link from "next/link";

export function CTA() {
  return (
    <div className="mt-20 bg-stone-900 px-7 py-24 text-center text-stone-100">
      <h2 className="mx-auto mb-6 max-w-[18ch] text-[clamp(48px,7vw,96px)] leading-[0.95] tracking-[-0.03em] [font-family:var(--m-serif)]">
        Stop typing the same reply{" "}
        <em className="italic text-green-600">three hundred times.</em>
      </h2>
      <p className="mb-8 text-base text-white/70">
        Connect your inbox in under five minutes. First two weeks on us.
      </p>
      <Link href="/signup" className="inline-flex items-center rounded-full bg-stone-100 px-7 py-3.5 text-sm font-semibold text-stone-900 no-underline">
        Start free →
      </Link>
    </div>
  );
}
