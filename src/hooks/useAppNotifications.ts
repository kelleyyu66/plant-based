import { useCallback, useMemo, useState } from 'react'
import { useAllComments, useDailyQuestProgress, useMeals, useMyProfile, useProfiles, useUserMeals } from './useData'
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
  const { data: me } = useMyProfile()
  const { data: allMeals } = useMeals()
  const { data: allComments } = useAllComments()
  const { data: profiles } = useProfiles()
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

    // Comment activity: tell a meal's poster when someone else comments on it,
    // and tell anyone else who has already commented when a new voice joins the
    // thread. Both read off every comment in the cohort, so they need the full
    // meal list (to find each comment's poster) and the full comment list.
    if (me) {
      const mealById = new Map((allMeals ?? []).map((m) => [m.id, m]))
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]))
      const commentedMealIds = new Set(
        (allComments ?? []).filter((c) => c.userId === me.id).map((c) => c.mealId),
      )
      const commenterName = (userId: string) => byId.get(userId)?.displayName ?? 'Someone'

      for (const c of allComments ?? []) {
        if (c.userId === me.id) continue // never notify yourself
        const meal = mealById.get(c.mealId)
        if (!meal) continue

        if (meal.userId === me.id) {
          out.push({
            id: `comment-mine-${c.id}`,
            title: `${commenterName(c.userId)} commented on your meal`,
            body: c.body,
            href: `/meals/${c.mealId}`,
          })
        } else if (commentedMealIds.has(c.mealId)) {
          out.push({
            id: `comment-thread-${c.id}`,
            title: `${commenterName(c.userId)} also commented on a meal you commented on`,
            body: c.body,
            href: `/meals/${c.mealId}`,
          })
        }
      }
    }

    return out
  }, [meals, quest, me, allMeals, allComments, profiles])

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
