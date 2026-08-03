import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { H1 } from '@/components/H1'
import { PixelButton } from '@/components/PixelButton'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Splash. No logo — the title, then the cow waving hello.
 *
 * The wave is two hand-drawn frames swapped INSTANTLY, like traditional 2s
 * animation. Crossfading them looked wrong: both arm positions are visible at
 * once mid-fade, so the cow appears to grow a translucent second arm. A hard cut
 * reads as a real wave.
 *
 * Both frames stay mounted and are toggled with opacity 1/0 (no transition)
 * rather than swapping `src`, so the second frame is already decoded and the
 * first swap can't flash. The frames are pre-aligned on the cow's legs at export
 * time so only the arm moves between them.
 *
 * Layout mirrors OnboardingShell — same page padding and the same pinned footer
 * — so "Get started" sits exactly where "Join the challenge" does on the next
 * screen and the CTA doesn't jump when you advance.
 */
const FRAME_MS = 380

export function Splash({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), FRAME_MS)
    return () => clearInterval(id)
  }, [reduced])

  return (
    <div className="flex min-h-full w-full max-w-phone flex-col bg-paper">
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <H1 className="max-w-[12ch] text-center !text-[46px]">Plant Based Challenge</H1>

        <motion.div
          className="relative mt-16 w-[min(72vw,300px)]"
          style={{ aspectRatio: '560 / 609' }}
          animate={reduced ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Frame 1: arm raised */}
          <img
            src="/cow/hi-1.png"
            alt="Moo the cow waving hello"
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: frame === 0 ? 1 : 0 }}
            draggable={false}
          />
          {/* Frame 2: arm lowered */}
          <img
            src="/cow/hi-2.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: frame === 1 ? 1 : 0 }}
            draggable={false}
          />
        </motion.div>
      </main>

      <footer className="px-6 pb-8 pt-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <PixelButton full onClick={onStart}>
          Get started
        </PixelButton>
      </footer>
    </div>
  )
}
