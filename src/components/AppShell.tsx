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

/** Floating "Log a meal" pill — filled cow-spot black. Home and Meals only. */
function FloatingLog() {
  const { pathname } = useLocation()
  const { openLog } = useLogMealFlow()
  if (pathname !== '/home' && pathname !== '/meals') return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[60px] z-40 flex justify-center pb-4 pt-10">
      <button
        onClick={openLog}
        className="pointer-events-auto rounded-pill bg-ink px-9 py-3.5 font-mono text-[15px] text-paper-2 transition-transform active:scale-[0.98]"
        style={{ maxWidth: '90%' }}
      >
        Log a meal
      </button>
    </div>
  )
}
