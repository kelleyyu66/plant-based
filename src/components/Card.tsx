import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `plain` has no stroke — for sections that only need padding. */
  tone?: 'outline' | 'plain' | 'light' | 'dark' | 'forest'
  bevel?: boolean
}

/**
 * Every container in the hand-drawn pass is the same thing: a hairline
 * cow-spot-black stroke on white with a soft corner. Tone aliases are kept so
 * un-migrated callers still render correctly.
 */
const TONES: Record<string, string> = {
  outline: 'bg-paper-2 text-ink border border-ink',
  plain: 'bg-transparent text-ink border-0',
  light: 'bg-paper-2 text-ink border border-ink',
  dark: 'bg-paper-2 text-ink border border-ink',
  forest: 'bg-paper-3 text-ink border border-ink',
}

export function Card({ tone = 'outline', className, ...rest }: CardProps) {
  return <div className={['rounded-card p-4', TONES[tone] ?? TONES.outline, className ?? ''].join(' ')} {...rest} />
}
