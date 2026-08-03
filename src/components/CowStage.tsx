import { MooCow } from './MooCow'
import type { MooMood } from '@/content/mooSprite'

/**
 * ILLUSTRATION SLOT — the hero cow-on-grass band from the reference.
 *
 * Everything inside is a placeholder: the pixel cow stands in for the final
 * hand-drawn illustration, and the grass is a hand-wobbled SVG edge. To drop in
 * real art later, replace the <MooCow> with an <img> and delete the SVG.
 */
export function CowStage({
  mood = 'idle',
  className,
  says,
}: {
  mood?: MooMood
  className?: string
  /** Short templated line shown in a speech bubble. See content/cowMessages.ts. */
  says?: string
}) {
  return (
    <div className={`relative h-[190px] w-full ${className ?? ''}`}>
      {/* Grass band with an uneven, drawn-looking top edge */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[74px] w-full"
        viewBox="0 0 430 74"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 16 C 34 7, 58 20, 92 13 S 150 4, 184 14 S 244 22, 278 12 S 342 5, 376 15 S 412 21, 430 12 L430 74 L0 74 Z"
          fill="#5C7A45"
        />
      </svg>

      {/* Scribbled tufts + a small flower, in the reference's doodle spirit */}
      <svg className="absolute inset-x-0 bottom-0 h-[74px] w-full" viewBox="0 0 430 74" fill="none">
        <g stroke="#7C9460" strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
          <path d="M42 52 q4 -7 8 0 M56 54 q4 -7 8 0" />
          <path d="M250 50 q4 -7 8 0" />
          <path d="M336 53 q4 -7 8 0" />
        </g>
        <g stroke="#415B31" strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
          <path d="M132 55 q4 -7 8 0" />
          <path d="M186 52 q4 -7 8 0" />
        </g>
        <g stroke="#FAF9F5" strokeWidth="1.4" strokeLinecap="round" opacity="0.75">
          <path d="M394 38 l0 10 M394 38 q-5 -3.5 -1.5 -6.5 M394 38 q5 -3.5 1.5 -6.5 M394 41 q-6 0.5 -5.5 4.5 M394 41 q6 0.5 5.5 4.5" />
        </g>
      </svg>

      {/* The cow speaks: fixed templates, no AI. */}
      {says && (
        <div className="absolute left-1/2 top-1 z-10 w-[min(280px,88%)] -translate-x-1/2">
          <div className="relative rounded-card border border-ink bg-paper-2 px-3 py-2 text-center">
            <p className="font-mono text-[12px] leading-snug text-ink">{says}</p>
            <span
              className="absolute -bottom-[5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-ink bg-paper-2"
              aria-hidden
            />
          </div>
        </div>
      )}

      {/* The cow — swap for the final illustration. Feet land on the grass line. */}
      <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2">
        <MooCow mood={mood} scale={6} />
      </div>
    </div>
  )
}
