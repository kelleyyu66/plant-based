import { NavLink } from 'react-router-dom'
import { House, ForkKnife, Ranking, Cow } from '@phosphor-icons/react'

// Phosphor line icons; the active tab switches to the filled weight.
const TABS = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/meals', label: 'Meals', Icon: ForkKnife },
  { to: '/leaderboard', label: 'Boards', Icon: Ranking },
  { to: '/profile', label: 'You', Icon: Cow },
]

/** Bottom navigation, safe-area padded. */
export function TabBar() {
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
              <Icon size={24} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
