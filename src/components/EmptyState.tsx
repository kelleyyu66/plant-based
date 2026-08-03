import type { ReactNode } from 'react'
import { MooCow } from './MooCow'

interface EmptyStateProps {
  message: string
  mood?: 'idle' | 'sleep'
  children?: ReactNode
}

/** ILLUSTRATION SLOT — the cow here is a placeholder for the final art. */
export function EmptyState({ message, mood = 'idle', children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <MooCow mood={mood} scale={5} />
      <p className="max-w-[28ch] font-mono text-[13px] leading-relaxed text-muted">{message}</p>
      {children}
    </div>
  )
}
