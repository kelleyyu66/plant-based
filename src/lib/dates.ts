// All "today" logic runs in the cohort timezone so midnight rollovers are consistent.
// design.md §9.
export const COHORT_TZ = 'America/Los_Angeles'

/** YYYY-MM-DD for a Date in the cohort timezone. */
export function toCohortDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: COHORT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** Difference in whole days between two YYYY-MM-DD strings (b - a). */
export function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const ua = Date.UTC(ay, am - 1, ad)
  const ub = Date.UTC(by, bm - 1, bd)
  return Math.round((ub - ua) / 86_400_000)
}

/** Day-of-year (0-based) in the cohort timezone — drives daily fact/quest rotation. */
export function dayOfYear(d: Date = new Date()): number {
  const iso = toCohortDate(d)
  const [y, m, day] = iso.split('-').map(Number)
  const start = Date.UTC(y, 0, 0)
  const now = Date.UTC(y, m - 1, day)
  return Math.floor((now - start) / 86_400_000)
}
