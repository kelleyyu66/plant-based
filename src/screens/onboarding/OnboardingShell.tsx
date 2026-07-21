import type { ReactNode } from 'react'
import { ONBOARDING_TOTAL, useOnboarding } from './onboardingStore'

interface ShellProps {
  /** Sunset gradient (hero) vs light field background. */
  tone?: 'sunset' | 'field'
  title?: string
  subtitle?: string
  children: ReactNode
  footer: ReactNode
  hideBack?: boolean
}

/** Shared onboarding layout: progress dots, back, scrollable body, pinned footer. */
export function OnboardingShell({ tone = 'sunset', title, subtitle, children, footer, hideBack }: ShellProps) {
  const { step, back } = useOnboarding()
  const bg =
    tone === 'sunset'
      ? 'bg-gradient-to-b from-sky-mauve via-sky-rose to-sky-peach'
      : 'bg-gradient-to-b from-grass-300 to-grass-500'

  return (
    <div className={`flex min-h-full w-full max-w-phone flex-col ${bg}`}>
      <header className="flex items-center gap-3 px-4 pb-2 pt-4">
        {!hideBack && step > 1 ? (
          <button
            onClick={back}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-paper-2 text-ink"
          >
            ←
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {Array.from({ length: ONBOARDING_TOTAL }).map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full border border-ink/40 transition-all ${
                i + 1 === step ? 'w-5 bg-ink' : i + 1 < step ? 'w-2 bg-ink/70' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
        <div className="h-9 w-9" />
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto no-scrollbar px-6 pb-4">
        {title && <h1 className="mt-2 font-pixel text-[22px] leading-tight text-ink">{title}</h1>}
        {subtitle && <p className="mt-2 font-body text-[15px] text-ink-soft">{subtitle}</p>}
        <div className="mt-5 flex-1">{children}</div>
      </main>

      <footer className="px-6 pb-8 pt-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {footer}
      </footer>
    </div>
  )
}
