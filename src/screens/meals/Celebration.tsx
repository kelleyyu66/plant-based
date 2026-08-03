import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CelebrationCow } from '@/components/CelebrationCow'
import { H1 } from '@/components/H1'
import { PixelButton } from '@/components/PixelButton'
import { Confetti } from '@/components/Confetti'
import { randomFact } from '@/lib/quests'
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
  // Pick once per mount — a fresh random fact for every meal logged.
  const [fact] = useState(() => randomFact(DAILY_FACTS))
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
      {/* Confetti rides above the page content; the did-you-know box sits above it. */}
      <Confetti fire className="z-10" />
      <div className="flex w-full justify-end">
        <button onClick={onDone} aria-label="Close" className="text-2xl text-muted">
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <H1 className="text-center">Nice one!</H1>
        {/* gap-4 + mt-4 = the designed 32px between the title and the points. */}
        <motion.div
          className="mt-4 font-mono text-[34px] text-ink"
          initial={{ scale: 0.5, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          + {pointsEarned} points!
        </motion.div>
        <p className="max-w-[26ch] font-mono text-[13px] text-muted">
          {cowMessage('meal_logged', { points: pointsEarned }, pointsEarned)}
        </p>
        <CelebrationCow size={220} />
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
        <div className="relative z-20 w-full rounded-card border border-ink bg-paper-2 px-4 py-3">
          {/* Same size as the "Add a meal" sheet title. */}
          <h3 className="mb-1 font-hand text-[28px] text-ink">Did you know?</h3>
          <p className="font-mono text-[13px] leading-snug text-ink/90">{fact.body}</p>
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
