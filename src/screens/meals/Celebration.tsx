import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MooCow } from '@/components/MooCow'
import { PixelButton } from '@/components/PixelButton'
import { Confetti } from '@/components/Confetti'
import { activeFact } from '@/lib/quests'
import { DAILY_FACTS } from '@/content/seed'
import { playReward } from '@/lib/sound'
import { cowMessage } from '@/content/cowMessages'
import type { LogMealResult } from '@/lib/dataProvider'

interface CelebrationProps {
  result: LogMealResult
  onDone: () => void
}

/** Full-screen "Nice one!" overlay after logging. Old-app parity + pixel restyle. */
export function Celebration({ result, onDone }: CelebrationProps) {
  const fact = activeFact(DAILY_FACTS)
  const { pointsEarned, meal, bonus, streak } = result

  // The one reward sound, on the app's biggest positive moment.
  useEffect(() => {
    playReward()
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex w-full max-w-phone flex-col items-center justify-between bg-paper px-6 py-10 text-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Confetti fire />
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-lg text-ink">Nice one!</span>
        <button onClick={onDone} aria-label="Close" className="text-2xl text-muted">
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <motion.div
          className="font-mono text-[34px] text-ink"
          initial={{ scale: 0.5, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          + {pointsEarned} points!
        </motion.div>
        <p className="max-w-[26ch] font-mono text-[13px] text-muted">
          {cowMessage('meal_logged', { points: pointsEarned }, pointsEarned)}
        </p>
        <MooCow mood="dance" scale={12} />
        {bonus > 0 && (
          <div className="rounded-card border border-ink bg-grass-pale px-4 py-2 font-mono text-sm">
            Streak goal hit — {streak.current} days! +{bonus} bonus.
          </div>
        )}
        {meal.tier === 'beef' && (
          <p className="max-w-[28ch] font-mono text-sm text-muted">
            Beef’s a big one — but you logged it, and that honesty counts. Tomorrow’s a fresh pasture.
          </p>
        )}
      </div>

      {fact && (
        <div className="w-full">
          <h3 className="mb-1 font-mono text-sm text-ink">Did you know?</h3>
          <p className="font-mono text-[15px] leading-snug text-ink/90">{fact.body}</p>
          {fact.sourceUrl && (
            <a
              href={fact.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-mono text-xs text-ink underline"
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
