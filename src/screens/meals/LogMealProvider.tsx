import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { LogMealSheet } from './LogMealSheet'
import { Celebration } from './Celebration'
import type { LogMealResult } from '@/lib/dataProvider'

interface LogMealContextValue {
  openLog: () => void
}

const Ctx = createContext<LogMealContextValue | null>(null)

/** Provides a global "log a meal" flow: the Add-item sheet + celebration overlay. */
export function LogMealProvider({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [celebration, setCelebration] = useState<LogMealResult | null>(null)

  const openLog = useCallback(() => setSheetOpen(true), [])

  return (
    <Ctx.Provider value={{ openLog }}>
      {children}
      <LogMealSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onLogged={(r) => setCelebration(r)} />
      {celebration && <Celebration result={celebration} onDone={() => setCelebration(null)} />}
    </Ctx.Provider>
  )
}

export function useLogMealFlow() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLogMealFlow must be used within LogMealProvider')
  return ctx
}
