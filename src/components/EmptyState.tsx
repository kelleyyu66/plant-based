import type { ReactNode } from 'react'
import { MooCow } from './MooCow'

interface EmptyStateProps {
  message: string
  mood?: 'idle' | 'sleep'
  children?: ReactNode
}

export function EmptyState({ message, mood = 'idle', children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <MooCow mood={mood} scale={7} />
      <p className="max-w-[24ch] font-body text-ink-soft">{message}</p>
      {children}
    </div>
  )
}
