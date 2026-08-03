import { PASTURE_W } from '@/lib/pasture'

/**
 * The grass the cow stands on, shared by the Home hero and the You-page editor
 * so the two never drift apart. Fills the bottom of whatever box it's given.
 *
 * ILLUSTRATION SLOT — hand-wobbled SVG standing in for the final art.
 */
export function GrassBand({ height }: { height: number }) {
  return (
    <>
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0"
        height={height}
        viewBox={`0 0 ${PASTURE_W} ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={`M0 20 C 30 10 54 24 86 16 S 142 6 174 17 S 232 25 264 14 S 324 8 356 18 S ${PASTURE_W} 24 ${PASTURE_W} 14 L${PASTURE_W} ${height} L0 ${height} Z`}
          fill="#5C7A45"
          fillOpacity={0.9}
        />
      </svg>

      {/* Scribbled tufts, in the reference's doodle spirit. */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0"
        height={height}
        viewBox={`0 0 ${PASTURE_W} ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <g stroke="#7C9460" strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
          <path d="M38 46 q4 -7 8 0 M52 48 q4 -7 8 0" />
          <path d="M232 44 q4 -7 8 0" />
          <path d="M320 47 q4 -7 8 0" />
        </g>
        <g stroke="#415B31" strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
          <path d="M124 49 q4 -7 8 0" />
          <path d="M176 46 q4 -7 8 0" />
        </g>
      </svg>
    </>
  )
}
