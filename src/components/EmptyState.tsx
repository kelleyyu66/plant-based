import type { ReactNode } from 'react'
import { HomeCow } from './HomeCow'

interface EmptyStateProps {
  message: string
  children?: ReactNode
}

/** Empty-meals illustration — the hand-drawn home cow, matching the Home scene. */
export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <HomeCow size={160} />
      <p className="max-w-[28ch] font-mono text-[14px] leading-relaxed text-muted">{message}</p>
      {children}
    </div>
  )
}
