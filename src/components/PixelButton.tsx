import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'dark'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
}

const VARIANTS: Record<Variant, string> = {
  // Primary CTA: filled cow-spot black, as specified for "Log a meal".
  primary: 'bg-ink text-paper-2 border border-ink hover:bg-ink/90',
  // Outline on white.
  ghost: 'bg-transparent text-ink border border-ink hover:bg-paper-3',
  dark: 'bg-paper-2 text-ink border border-ink hover:bg-paper-3',
}

/** Pill button, hairline stroke. (Name kept so callers don't churn.) */
export function PixelButton({ variant = 'primary', full, className, disabled, ...rest }: PixelButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'font-mono text-[15px] font-medium rounded-pill px-6 py-3',
        'transition-transform active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        full ? 'w-full' : '',
        VARIANTS[variant],
        className ?? '',
      ].join(' ')}
      {...rest}
    />
  )
}
