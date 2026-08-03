/**
 * Which notifications the user has already dealt with.
 *
 * Notifications themselves are derived from food logs (see useAppNotifications),
 * so "read" can't live on the notification — it lives here, as a set of stable
 * notification ids. Anything in the set is filtered out of the bell.
 */

const LS_KEY = 'moo.notifications.read.v1'

export function loadReadIds(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function saveReadIds(ids: string[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(ids))
}

export function markRead(id: string) {
  const ids = loadReadIds()
  if (!ids.includes(id)) saveReadIds([...ids, id])
}

export function markAllRead(ids: string[]) {
  saveReadIds([...new Set([...loadReadIds(), ...ids])])
}
