import { CaretRight } from '@phosphor-icons/react'
import { Avatar } from './Avatar'
import type { Profile } from '@/lib/types'

interface LeaderRowProps {
  rank?: number
  profile: Profile
  points: number
  onClick?: () => void
  highlight?: boolean
}

export function LeaderRow({ rank, profile, points, onClick, highlight }: LeaderRowProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-ink/12 py-2.5 text-left transition-transform last:border-0 active:scale-[0.99] ${
        highlight ? '-mx-1.5 rounded-card bg-grass-pale px-1.5' : ''
      }`}
    >
      {rank != null && <span className="w-5 shrink-0 text-center font-mono text-[13px] text-muted">{rank}</span>}
      <Avatar index={profile.avatarIndex} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-[15px] font-medium text-ink">{profile.displayName}</div>
        <div className="font-mono text-[12px] text-muted">{points} points</div>
      </div>
      {onClick && <CaretRight size={15} className="shrink-0 text-muted" aria-hidden />}
    </button>
  )
}
