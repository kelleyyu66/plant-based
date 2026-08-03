import { NavLink } from 'react-router-dom'
import { House, ForkKnife, Ranking, type Icon } from '@phosphor-icons/react'
import { Avatar } from './Avatar'
import { useMyProfile } from '@/hooks/useData'

// Phosphor line icons; the active tab switches to the filled weight.
const TABS: Array<{ to: string; label: string; Icon?: Icon }> = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/meals', label: 'Meals', Icon: ForkKnife },
  { to: '/leaderboard', label: 'Boards', Icon: Ranking },
  // No icon — "You" shows the user's own critter instead.
  { to: '/profile', label: 'You' },
]

/** Bottom navigation, safe-area padded. */
export function TabBar() {
  const { data: profile } = useMyProfile()

  return (
    <nav
      className="sticky bottom-0 z-30 flex border-t border-ink bg-paper-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[11px] transition-transform active:scale-95',
              isActive ? 'text-ink' : 'text-muted',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              {Icon ? (
                <Icon size={24} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              ) : (
                // The user's chosen critter, circle-cropped. Dimmed when inactive
                // so it carries the same selected/unselected read as the icons.
                <Avatar
                  index={profile?.avatarIndex ?? 0}
                  size="xs"
                  className={isActive ? '' : 'opacity-40 grayscale'}
                />
              )}
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
