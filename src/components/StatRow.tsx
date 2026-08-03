interface StatRowProps {
  icon: string
  label: string
  value: string
}

/** Impact equivalence row: 🚗 / 🌳 / 💧. design.md §6. */
export function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-ink bg-paper-3 px-3 py-2.5">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="font-mono text-[15px] text-ink">
        <span className="font-medium">{value}</span> {label}
      </span>
    </div>
  )
}
