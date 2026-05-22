export function Kicker({ step, label }: { step: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[10.5px] font-bold uppercase tracking-wider text-white/45">
      <span className="rounded-sm bg-white/[0.06] px-1.5 py-0.5 text-white/70">STEP {String(step).padStart(2, "0")} / 06</span>
      <span className="text-green-400">· {label}</span>
    </div>
  );
}

export function BigTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-2 mt-3 max-w-[720px] text-balance text-[34px] font-semibold leading-[1.12] tracking-tight text-white">{children}</h1>;
}

export function Lede({ children }: { children: React.ReactNode }) {
  return <p className="m-0 max-w-[620px] text-pretty text-[15px] leading-relaxed text-white/70">{children}</p>;
}

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[12.5px] font-semibold text-white">{label}</span>
        {required && <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-green-400">REQUIRED</span>}
      </div>
      {children}
      {hint && <div className="mt-1.5 text-[11.5px] leading-snug text-white/45">{hint}</div>}
    </div>
  );
}
