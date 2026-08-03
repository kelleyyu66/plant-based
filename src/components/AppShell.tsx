import { Outlet, useLocation } from 'react-router-dom'
import { TabBar } from './TabBar'
import { LogMealProvider, useLogMealFlow } from '@/screens/meals/LogMealProvider'

/** Phone-column frame with the bottom tab bar + global log-meal flow. */
export function AppShell() {
  return (
    <LogMealProvider>
      <div className="relative flex min-h-[100dvh] w-full max-w-phone flex-col bg-paper">
        <div className="flex-1">
          <Outlet />
        </div>
        <FloatingLog />
        <TabBar />
      </div>
    </LogMealProvider>
  )
}

/** Floating "Log a meal" pill — filled cow-spot black. Home and Meals only. */
function FloatingLog() {
  const { pathname } = useLocation()
  const { openLog } = useLogMealFlow()
  if (pathname !== '/home' && pathname !== '/meals') return null
  return (
    // Sits above the tab bar (nav height + the iOS home-indicator inset) so it
    // never overlaps it, on any device.
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-6 pb-3 pt-10"
      style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
    >
      <button
        onClick={openLog}
        className="pointer-events-auto w-full max-w-[90%] rounded-pill bg-ink px-9 py-4 font-mono text-[16px] text-paper-2 transition-transform active:scale-[0.98]"
      >
        Log a meal
      </button>
    </div>
  )
}
