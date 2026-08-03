import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { H1 } from '@/components/H1'
import { ONBOARDING_TOTAL, useOnboarding } from './onboardingStore'

interface ShellProps {
  /** Retained for API compatibility — every step is on the neutral canvas now. */
  tone?: 'sunset' | 'field'
  title?: string
  subtitle?: string
  children: ReactNode
  footer: ReactNode
  hideBack?: boolean
}

/** Shared onboarding layout: progress dots, back, scrollable body, pinned footer. */
export function OnboardingShell({ title, subtitle, children, footer, hideBack }: ShellProps) {
  const { step, back } = useOnboarding()

  return (
    <div className="flex min-h-full w-full max-w-phone flex-col bg-paper">
      <header className="flex items-center gap-3 px-5 pb-2 pt-5">
        {!hideBack && step > 1 ? (
          <button
            onClick={back}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border border-ink bg-paper-2 text-ink"
          >
            <ArrowLeft size={16} aria-hidden />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {Array.from({ length: ONBOARDING_TOTAL }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-pill transition-all ${
                i + 1 === step ? 'w-5 bg-ink' : i + 1 < step ? 'w-1.5 bg-ink/60' : 'w-1.5 bg-ink/20'
              }`}
            />
          ))}
        </div>
        <div className="h-9 w-9" />
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto no-scrollbar px-6 pb-4">
        {title && <H1 className="mt-2 !text-[34px]">{title}</H1>}
        {subtitle && <p className="mt-2 font-mono text-[14px] leading-relaxed text-muted">{subtitle}</p>}
        <div className="mt-6 flex-1">{children}</div>
      </main>

      <footer className="px-6 pb-8 pt-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {footer}
      </footer>
    </div>
  )
}
