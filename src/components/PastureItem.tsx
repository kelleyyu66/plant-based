import type { PastureItemId } from '@/lib/pasture'
import { itemDef } from '@/lib/pasture'

/**
 * ILLUSTRATION SLOT — one pasture decoration.
 *
 * These are neutral line placeholders drawn at each item's exact catalog size
 * (see PASTURE_ITEMS in lib/pasture.ts). To drop in real art, replace the <svg>
 * body for that id with an <img>/<video> filling the same viewBox — the drag,
 * sizing and persistence layers don't change.
 */
export function PastureItem({
  id,
  className,
  /** Fit the item inside a box of this many px (keeps aspect). Used by the tray. */
  fit,
}: {
  id: PastureItemId
  className?: string
  fit?: number
}) {
  const def = itemDef(id)
  const { name } = def
  // Scale the SVG box itself — a CSS transform would still occupy the full
  // natural size in layout and spill out of the tray row.
  const k = fit ? Math.min(fit / def.w, fit / def.h) : 1
  const w = Math.round(def.w * k)
  const h = Math.round(def.h * k)
  const S = { stroke: '#2E2F2C', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const ACCENT = '#5C7A45'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${def.w} ${def.h}`} className={className} role="img" aria-label={name}>
      {id === 'tree' && (
        <>
          <path d="M31 74 L31 50" {...S} />
          <path d="M31 8 C14 12 10 30 18 40 C10 46 16 58 31 56 C46 58 52 46 44 40 C52 30 48 12 31 8 Z" {...S} fill={ACCENT} fillOpacity={0.18} />
        </>
      )}
      {id === 'flowers' && (
        <>
          <path d="M10 32 L10 18 M22 32 L22 14 M34 32 L34 20" {...S} />
          <circle cx="10" cy="14" r="4.5" {...S} />
          <circle cx="22" cy="10" r="4.5" {...S} fill={ACCENT} fillOpacity={0.2} />
          <circle cx="34" cy="16" r="4.5" {...S} />
        </>
      )}
      {id === 'chicken' && (
        <>
          <path d="M12 30 C8 22 14 14 21 15 C25 9 32 12 31 18 L34 20 L31 22 C33 30 26 34 19 33 Z" {...S} />
          <path d="M16 33 L15 37 M25 33 L26 37" {...S} />
          <circle cx="27" cy="18" r="1" fill="#2E2F2C" />
        </>
      )}
      {id === 'pond' && (
        <>
          <ellipse cx="46" cy="28" rx="40" ry="20" {...S} fill={ACCENT} fillOpacity={0.14} />
          <path d="M26 26 q7 -4 14 0 M50 34 q7 -4 14 0" {...S} />
        </>
      )}
      {id === 'duck' && (
        <>
          <path d="M10 28 C8 20 16 15 22 18 C22 11 32 11 31 18 L35 20 L31 22 C33 29 24 34 16 32 Z" {...S} />
          <path d="M8 32 q14 5 24 0" {...S} />
          <circle cx="27" cy="18" r="1" fill="#2E2F2C" />
        </>
      )}
      {id === 'haystack' && (
        <>
          <path d="M8 38 C10 20 20 12 26 12 C32 12 42 20 44 38 Z" {...S} fill={ACCENT} fillOpacity={0.14} />
          <path d="M14 38 q6 -14 12 -20 M26 18 q8 8 12 20" {...S} />
        </>
      )}
      {id === 'bird' && (
        <>
          <path d="M4 18 q8 -12 14 -2 q6 -10 14 2" {...S} />
          <path d="M12 20 q5 4 10 0" {...S} />
        </>
      )}
      {id === 'windmill' && (
        <>
          <path d="M22 92 L28 40 L34 92 Z" {...S} />
          <path d="M30 36 L30 12 M30 22 L48 14 M30 22 L12 30" {...S} />
          <circle cx="30" cy="22" r="3" {...S} fill={ACCENT} fillOpacity={0.25} />
        </>
      )}
      {id === 'barn' && (
        <>
          <path d="M8 70 L8 34 L48 12 L88 34 L88 70 Z" {...S} fill={ACCENT} fillOpacity={0.12} />
          <path d="M38 70 L38 46 L58 46 L58 70" {...S} />
          <path d="M8 34 L88 34" {...S} />
        </>
      )}
      {id === 'rainbow' && (
        <>
          <path d="M8 56 a50 50 0 0 1 100 0" {...S} />
          <path d="M20 56 a38 38 0 0 1 76 0" {...S} stroke={ACCENT} />
          <path d="M32 56 a26 26 0 0 1 52 0" {...S} />
        </>
      )}
    </svg>
  )
}
