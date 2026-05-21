import { Download } from "lucide-react"

export function ExportButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border hover:border-white/[0.2] rounded-md px-2.5 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="w-3 h-3" />
      Export CSV
    </button>
  )
}
