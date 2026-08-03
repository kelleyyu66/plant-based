export type EquivalentKind = 'car' | 'tree' | 'shower'

/**
 * ILLUSTRATION SLOT — one "that means…" carbon equivalent.
 *
 * ── ARTWORK SPEC ───────────────────────────────────────────────────────────
 *   Canvas          120 × 120 px  (1×, square)
 *   Export          360 × 360 px  (3×)   or 240 × 240 px (2×)
 *   Format          transparent PNG, or SVG/Lottie/MP4 if you animate later
 *   Safe area       keep art inside a 104 × 104 centred box (8px padding all
 *                   round) — on a 375px-wide phone the tile renders ~102px, so
 *                   anything in the outer 8px can crop.
 *   Baseline        art should sit on the bottom edge of the safe area so the
 *                   three tiles optically line up.
 *
 * The tile scales fluidly from ~102px (iPhone SE/13 mini) to 120px (max width)
 * and never renders larger than 120px, so a 3× export is always sharp.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * The numbers change daily; the artwork does not. Only the caption below the
 * box is data-bound, so a static asset (or a looping animation) drops straight
 * in — replace the <svg> with <img>/<video> at the same 120×120 box.
 */

const STROKE = {
  stroke: '#1C1B19',
  strokeWidth: 1.6,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CarbonEquivalent({
  kind,
  value,
  label,
}: {
  kind: EquivalentKind
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid aspect-square w-full max-w-[120px] place-items-center rounded-card border border-ink bg-paper-2">
        {/* 120×120 artwork box — swap this <svg> for the final asset. */}
        <svg width="100%" height="100%" viewBox="0 0 120 120" role="img" aria-label={label}>
          {kind === 'car' && (
            <>
              <path d="M26 74 L32 56 C33 53 35 52 38 52 L82 52 C85 52 87 53 88 56 L94 74" {...STROKE} />
              <path d="M22 74 L98 74 L98 84 L22 84 Z" {...STROKE} />
              <circle cx="38" cy="86" r="7" {...STROKE} />
              <circle cx="82" cy="86" r="7" {...STROKE} />
              <path d="M44 54 L44 72 M76 54 L76 72" {...STROKE} />
            </>
          )}
          {kind === 'tree' && (
            <>
              <path d="M60 92 L60 62" {...STROKE} />
              <path d="M52 92 q8 -6 16 0" {...STROKE} />
              <path d="M60 26 C36 32 30 56 42 68 C30 76 40 92 60 88 C80 92 90 76 78 68 C90 56 84 32 60 26 Z" {...STROKE} />
            </>
          )}
          {kind === 'shower' && (
            <>
              <path d="M60 24 L60 40" {...STROKE} />
              <path d="M40 40 L80 40 L74 50 L46 50 Z" {...STROKE} />
              <path d="M48 60 L48 68 M60 62 L60 72 M72 60 L72 68" {...STROKE} />
              <path d="M42 80 L42 86 M54 82 L54 90 M66 82 L66 90 M78 80 L78 86" {...STROKE} />
            </>
          )}
        </svg>
      </div>
      <div className="mt-2 font-mono text-[11px] leading-[1.35] text-ink">{value}</div>
      <div className="font-mono text-[11px] leading-[1.35] text-muted">{label}</div>
    </div>
  )
}
