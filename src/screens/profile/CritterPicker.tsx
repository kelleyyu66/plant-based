import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Sprite } from '@/components/Sprite'
import { AVATAR_COUNT, animalName } from '@/content/animals'
import { useUpdateMyProfile } from '@/hooks/useData'

interface CritterPickerProps {
  open: boolean
  /** The currently-chosen critter, so it starts highlighted. */
  current: number
  onClose: () => void
}

/**
 * Change the critter that represents you on the leaderboard and in the menu bar.
 * Same 4-up grid as onboarding's "Pick your critter"; tapping one saves it and
 * closes the sheet.
 */
export function CritterPicker({ open, current, onClose }: CritterPickerProps) {
  const update = useUpdateMyProfile()
  const [pending, setPending] = useState<number | null>(null)

  const pick = async (i: number) => {
    if (i === current) return onClose()
    setPending(i)
    try {
      await update.mutateAsync({ avatarIndex: i })
      onClose()
    } finally {
      setPending(null)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Pick your critter">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: AVATAR_COUNT }).map((_, i) => {
          const selected = (pending ?? current) === i
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={pending !== null}
              aria-label={animalName(i)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1 rounded-card border px-1 py-2 transition-transform active:scale-95 disabled:opacity-60 ${
                selected ? 'border-ink bg-grass-pale' : 'border-ink/30 bg-paper-2'
              }`}
            >
              <Sprite index={i} size={44} />
              <span className="w-full truncate text-center font-mono text-[9px] leading-none text-muted">
                {animalName(i)}
              </span>
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
