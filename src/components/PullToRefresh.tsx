import { useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowClockwise } from '@phosphor-icons/react'

const THRESHOLD = 70 // px of pull needed to trigger a refresh
const MAX = 110 // px the content can travel while pulling

/**
 * Drag-down-to-refresh for the phone column. On release past the threshold it
 * refetches every React Query (i.e. reloads the page's data) without a full
 * navigation, so you keep your place.
 *
 * Content is pushed with margin-top (not a transform) so it never creates a
 * containing block that would break the app's fixed/sticky bits (sheets, the
 * tab bar, the meal-detail edit button).
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const startY = useRef<number | null>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = window.scrollY <= 0 && !refreshing ? e.touches[0].clientY : null
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return
    const delta = e.touches[0].clientY - startY.current
    // Only when still at the top and pulling down; damp it for a rubber feel.
    setPull(delta > 0 && window.scrollY <= 0 ? Math.min(MAX, delta * 0.5) : 0)
  }

  const onTouchEnd = async () => {
    if (startY.current === null) return
    startY.current = null
    if (pull < THRESHOLD) {
      setPull(0)
      return
    }
    setRefreshing(true)
    setPull(THRESHOLD)
    try {
      // Small floor so the spinner doesn't just flash on a fast network.
      await Promise.all([qc.invalidateQueries(), new Promise((r) => setTimeout(r, 500))])
    } finally {
      setRefreshing(false)
      setPull(0)
    }
  }

  const offset = refreshing ? THRESHOLD : pull
  const active = startY.current !== null

  return (
    <div className="relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-end justify-center overflow-hidden"
        style={{ height: offset }}
      >
        <ArrowClockwise
          size={22}
          weight="bold"
          className={`mb-2 text-ink ${refreshing ? 'animate-spin' : ''}`}
          style={
            refreshing
              ? { opacity: 1 }
              : { opacity: Math.min(1, pull / 40), transform: `rotate(${(pull / THRESHOLD) * 270}deg)` }
          }
          aria-hidden
        />
      </div>
      <div style={{ marginTop: offset, transition: active ? 'none' : 'margin-top 0.2s ease-out' }}>{children}</div>
    </div>
  )
}
