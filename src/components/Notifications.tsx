import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CaretRight, X } from '@phosphor-icons/react'
import { BottomSheet } from './BottomSheet'
import type { AppNotification } from '@/hooks/useAppNotifications'

interface Props {
  items: AppNotification[]
  dismiss: (id: string) => void
  clearAll: () => void
}

/**
 * Bell + panel. Tapping a notification with an `href` deep-links to the relevant
 * screen AND marks it read, so it's gone when the user comes back. Everything
 * can also be cleared individually or all at once.
 */
export function NotificationBell({ items, dismiss, clearAll }: Props) {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const count = items.length

  const follow = (n: AppNotification) => {
    dismiss(n.id)
    setOpen(false)
    if (n.href) nav(n.href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink bg-paper-2 transition-transform active:scale-95"
      >
        <Bell size={19} weight={count > 0 ? 'fill' : 'regular'} className="text-ink" aria-hidden />
        {count > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-grass px-1 font-mono text-[9px] leading-none text-paper-2"
            aria-hidden
          >
            {count}
          </span>
        )}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Notifications">
        {items.length === 0 ? (
          <p className="py-6 text-center font-mono text-[13px] text-muted">
            You’re all caught up. Log a meal to get things moving.
          </p>
        ) : (
          <>
            <div className="mb-3 flex justify-end">
              <button
                onClick={clearAll}
                className="rounded-pill border border-ink px-3 py-1 font-mono text-[12px] text-ink transition-transform active:scale-95"
              >
                Clear all
              </button>
            </div>
            <ul className="space-y-2.5">
              {items.map((n) => (
                <li key={n.id} className="flex items-stretch gap-2">
                  {/* Body: deep-links when there's somewhere to go. */}
                  <button
                    onClick={() => follow(n)}
                    disabled={!n.href}
                    className={`flex flex-1 items-center gap-2 rounded-card border border-ink bg-paper-2 px-4 py-3 text-left ${
                      n.href ? 'transition-transform active:scale-[0.99]' : 'cursor-default'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[14px] text-ink">{n.title}</span>
                      {n.body && <span className="mt-0.5 block font-mono text-[12px] text-muted">{n.body}</span>}
                    </span>
                    {n.href && <CaretRight size={15} className="shrink-0 text-muted" aria-hidden />}
                  </button>

                  {/* Dismiss just this one. */}
                  <button
                    onClick={() => dismiss(n.id)}
                    aria-label={`Dismiss: ${n.title}`}
                    className="grid w-11 shrink-0 place-items-center rounded-card border border-ink bg-paper-2 text-ink transition-transform active:scale-95"
                  >
                    <X size={15} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </BottomSheet>
    </>
  )
}
