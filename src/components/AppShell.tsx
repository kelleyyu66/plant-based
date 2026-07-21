import { Outlet, useLocation } from 'react-router-dom'
import { TabBar } from './TabBar'
import { LogMealProvider, useLogMealFlow } from '@/screens/meals/LogMealProvider'

/** Phone-column frame with the bottom tab bar + global log-meal flow. */
export function AppShell() {
  return (
    <LogMealProvider>
      <div className="relative flex min-h-screen w-full max-w-phone flex-col bg-paper">
        <div className="flex-1">
          <Outlet />
        </div>
        <FloatingLog />
        <TabBar />
      </div>
    </LogMealProvider>
  )
}

/** Floating "Log meal" button, shown on Home and Meals. */
function FloatingLog() {
  const { pathname } = useLocation()
  const { openLog } = useLogMealFlow()
  if (pathname !== '/home' && pathname !== '/meals') return null
  return (
    <button
      onClick={openLog}
      className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-ink bg-lime-500 px-6 py-3 font-body font-extrabold text-ink shadow-pixel transition-transform active:translate-y-[3px] active:shadow-none"
      style={{ maxWidth: '90%' }}
    >
      🍴 Log meal
    </button>
  )
}
