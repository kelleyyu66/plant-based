interface StatRowProps {
  icon: string
  label: string
  value: string
}

/** Impact equivalence row: 🚗 / 🌳 / 💧. design.md §6. */
export function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-pixel border-2 border-black/20 bg-black/15 px-3 py-2.5">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="font-body text-[15px] text-paper">
        <span className="font-extrabold">{value}</span> {label}
      </span>
    </div>
  )
}
