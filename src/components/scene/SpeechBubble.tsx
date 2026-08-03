import { useId } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Moo's speech bubble — a hand-drawn outline that never stops wobbling.
 *
 * The "squiggle" is a `feTurbulence` + `feDisplacementMap` filter applied to the
 * outline, with the turbulence seed swapped a few times a second. That's the
 * classic boiling-line trick from hand-drawn animation: one shape, redrawn with
 * slightly different distortion each frame, so it reads as re-inked by hand
 * rather than tweened. Three seeds cycling is enough — more just looks noisy.
 *
 * Drawn as SVG rather than an exported image so it can grow with the text; if
 * you'd rather use the exact bubble from your mock, drop it in as an asset and
 * swap the <path> for an <image>.
 */
export function SpeechBubble({ text, width }: { text: string; width: number }) {
  const id = useId().replace(/:/g, '')
  const reduced = useReducedMotion()

  return (
    <div className="relative" style={{ width }}>
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <filter id={`squiggle-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="noise" seed="1">
              {!reduced && (
                <animate attributeName="seed" values="1;7;13;1" dur="0.5s" repeatCount="indefinite" calcMode="discrete" />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* Bubble body + tail, in viewBox units so it stretches with the text. */}
        <g filter={`url(#squiggle-${id})`}>
          <path
            // The tail sits at the centre of the bottom edge, pointing straight
            // down — the bubble rides directly above the cow, so a centre tail
            // always points at her no matter which way she's walking.
            d="M6 22 Q6 6 26 6 L74 6 Q94 6 94 26 L94 62 Q94 82 74 82 L58 82 L50 97 L42 82 L26 82 Q6 82 6 62 Z"
            fill="#FFFFFF"
            stroke="#2E2F2C"
            strokeWidth="2.2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <p className="relative px-4 py-2.5 text-center font-hand text-[15px] leading-tight text-ink">{text}</p>
    </div>
  )
}
