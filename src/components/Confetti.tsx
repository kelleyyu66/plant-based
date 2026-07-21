import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** One-shot celebratory burst. No-op under reduced motion. design.md §7. */
export function Confetti({ fire }: { fire: boolean }) {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!fire || reduced) return
    const colors = ['#B7E06A', '#8FCB3C', '#F0D090', '#E39B9B', '#6FA8C7']
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors })
    confetti({ particleCount: 40, spread: 100, startVelocity: 45, origin: { y: 0.65 }, colors })
  }, [fire, reduced])
  return null
}
