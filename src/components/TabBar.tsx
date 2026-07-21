import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/home', label: 'Home', icon: '🏠' },
  { to: '/meals', label: 'Meals', icon: '🍴' },
  { to: '/leaderboard', label: 'Board', icon: '🏆' },
  { to: '/teams', label: 'Teams', icon: '🐄' },
  { to: '/profile', label: 'You', icon: '⭐' },
]

/** Bottom navigation, safe-area padded. design.md §6. */
export function TabBar() {
  return (
    <nav
      className="sticky bottom-0 z-30 flex border-t-2 border-ink bg-paper-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center gap-0.5 py-2 font-body text-[11px] font-bold transition-transform active:scale-95',
              isActive ? 'text-forest-900' : 'text-muted',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span className={`text-lg ${isActive ? '' : 'grayscale opacity-70'}`} aria-hidden>
                {t.icon}
              </span>
              {t.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
