import { motion } from 'framer-motion'
import { MooCow } from '@/components/MooCow'
import { PixelButton } from '@/components/PixelButton'
import { Confetti } from '@/components/Confetti'
import { activeFact } from '@/lib/quests'
import { DAILY_FACTS } from '@/content/seed'
import type { LogMealResult } from '@/lib/dataProvider'

interface CelebrationProps {
  result: LogMealResult
  onDone: () => void
}

/** Full-screen "Nice one!" overlay after logging. Old-app parity + pixel restyle. */
export function Celebration({ result, onDone }: CelebrationProps) {
  const fact = activeFact(DAILY_FACTS)
  const { pointsEarned, meal, bonus, streak } = result

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex w-full max-w-phone flex-col items-center justify-between bg-forest-900 px-6 py-10 text-paper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Confetti fire />
      <div className="flex w-full items-center justify-between">
        <span className="font-pixel text-lg text-lime-400">Nice one!</span>
        <button onClick={onDone} aria-label="Close" className="text-2xl text-paper/70">
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <motion.div
          className="font-pixel text-[34px] text-lime-400"
          initial={{ scale: 0.5, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          + {pointsEarned} points!
        </motion.div>
        <MooCow mood="dance" scale={12} />
        {bonus > 0 && (
          <div className="rounded-pixel border-2 border-lime-400 bg-lime-400/15 px-4 py-2 font-body text-sm">
            🔥 Streak goal hit — {streak.current} days! +{bonus} bonus.
          </div>
        )}
        {meal.tier === 'beef' && (
          <p className="max-w-[28ch] font-body text-sm text-paper/70">
            Beef’s a big one — but you logged it, and that honesty counts. Tomorrow’s a fresh pasture. 🌱
          </p>
        )}
      </div>

      {fact && (
        <div className="w-full">
          <h3 className="mb-1 font-pixel text-sm text-paper">Did you know?</h3>
          <p className="font-body text-[15px] leading-snug text-paper/90">{fact.body}</p>
          {fact.sourceUrl && (
            <a
              href={fact.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-body text-xs text-lime-400 underline"
            >
              ↗ Source
            </a>
          )}
        </div>
      )}

      <PixelButton full variant="primary" onClick={onDone} className="mt-6">
        Done
      </PixelButton>
    </motion.div>
  )
}
