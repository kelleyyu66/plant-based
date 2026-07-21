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
      className={`flex w-full items-center gap-3 border-b border-black/10 px-1 py-2.5 text-left transition-transform active:scale-[0.99] ${
        highlight ? 'rounded-pixel bg-lime-400/20' : ''
      }`}
    >
      {rank != null && <span className="w-6 text-center font-pixel text-sm text-ink-soft">{rank}</span>}
      <Avatar index={profile.avatarIndex} size="sm" />
      <div className="flex-1">
        <div className="font-body font-extrabold text-ink">{profile.displayName}</div>
        <div className="font-body text-xs text-ink-soft">{points} points</div>
      </div>
      {onClick && <span className="text-ink-soft">›</span>}
    </button>
  )
}
