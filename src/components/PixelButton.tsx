import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'dark'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
}

const VARIANTS: Record<Variant, string> = {
  // lime CTA on dark surfaces / ink text
  primary: 'bg-lime-500 text-ink border-ink hover:bg-lime-400',
  // white on dark
  dark: 'bg-paper-2 text-forest-900 border-ink hover:bg-cloud',
  // outline
  ghost: 'bg-transparent text-ink border-ink hover:bg-black/5',
}

/** Chunky pixel-bevel button. Press collapses the bevel. design.md §5–§6. */
export function PixelButton({ variant = 'primary', full, className, disabled, ...rest }: PixelButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'font-body font-extrabold text-base rounded-pixel border-2 px-5 py-3',
        'transition-transform active:translate-y-[3px] active:shadow-none shadow-pixel',
        'disabled:opacity-50 disabled:shadow-none disabled:translate-y-[3px] disabled:cursor-not-allowed',
        full ? 'w-full' : '',
        VARIANTS[variant],
        className ?? '',
      ].join(' ')}
      {...rest}
    />
  )
}
