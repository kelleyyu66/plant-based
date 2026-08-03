import type { ReactNode } from 'react'

interface H1Props {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2'
}

/**
 * The ONLY hand-lettered type in the app (Schoolbell). Everything else is
 * IBM Plex Mono. Schoolbell ships a single 400 weight, so no bold here —
 * synthesised bold muddies the hand-drawn stroke.
 */
export function H1({ children, className, as: Tag = 'h1' }: H1Props) {
  return (
    <Tag className={`font-hand text-[42px] font-normal leading-[1.1] text-ink ${className ?? ''}`}>{children}</Tag>
  )
}
