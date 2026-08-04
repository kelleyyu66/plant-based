import { useCallback, useMemo, useState } from 'react'
import { useDailyQuestProgress, useUserMeals } from './useData'
import { challengeDayCount, latestUnlock } from '@/lib/scene'
import { loadReadIds, markAllRead, markRead } from '@/lib/notificationState'

export interface AppNotification {
  id: string
  title: string
  body?: string
  /** Where tapping it should go. Omit for notifications that are just clearable. */
  href?: string
}

/**
 * Notifications are derived, not stored: everything worth telling the user about
 * (a new pasture unlock, a quest that just completed) is already implied by their
 * food logs. Read/dismissed state is the only thing we persist.
 */
export function useAppNotifications() {
  const { data: meals } = useUserMeals('me')
  const { data: quest } = useDailyQuestProgress()
  const [readIds, setReadIds] = useState<string[]>(() => loadReadIds())

  const all = useMemo(() => {
    const out: AppNotification[] = []

    const days = challengeDayCount(meals ?? [])
    const latest = latestUnlock(meals ?? [])
    if (latest) {
      out.push({
        id: `unlock-${days}`,
        title: `New item unlocked: ${latest.name}`,
        body: `Tap to place your ${latest.name.toLowerCase()} in the pasture.`,
        // Deep link to Home and pop the "unlock elements daily" tray open.
        href: '/home?openTray=1',
      })
    }

    for (const task of quest?.tasks ?? []) {
      if (task.completed) {
        out.push({
          id: `quest-${task.id}`,
          title: `Quest complete: ${task.title}`,
          body: `+${task.bonusPoints} points banked.`,
          href: '/home#quest',
        })
      }
    }

    return out
  }, [meals, quest])

  const items = useMemo(() => all.filter((n) => !readIds.includes(n.id)), [all, readIds])

  const dismiss = useCallback((id: string) => {
    markRead(id)
    setReadIds(loadReadIds())
  }, [])

  const clearAll = useCallback(() => {
    markAllRead(all.map((n) => n.id))
    setReadIds(loadReadIds())
  }, [all])

  return { items, dismiss, clearAll }
}
