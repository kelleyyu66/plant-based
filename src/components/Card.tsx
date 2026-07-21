import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'light' | 'dark' | 'forest'
  bevel?: boolean
}

const TONES = {
  light: 'bg-paper-2 text-ink border-ink',
  dark: 'bg-forest-800 text-paper border-black/30',
  forest: 'bg-forest-700 text-paper border-black/30',
}

export function Card({ tone = 'light', bevel, className, ...rest }: CardProps) {
  return (
    <div
      className={[
        'rounded-pixel border-2 p-4',
        TONES[tone],
        bevel ? 'shadow-pixel' : '',
        className ?? '',
      ].join(' ')}
      {...rest}
    />
  )
}
