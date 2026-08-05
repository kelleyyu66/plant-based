import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MealCard } from '@/components/MealCard'
import { EmptyState } from '@/components/EmptyState'
import { H1 } from '@/components/H1'
import { NotificationBell } from '@/components/Notifications'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import { useAllComments, useMeals, useMyProfile, useProfiles } from '@/hooks/useData'
import { challengeDay, shortDate, toCohortDate } from '@/lib/dates'
import { earnedPointsByMeal } from '@/lib/dailyQuest'
import { commentCountsByMeal } from '@/lib/comments'
import { cowNameOr } from '@/content/cowNames'
import { CHALLENGE_START_DATE } from '@/content/seed'
import { MEAL_TIMES, TIME_LABEL, type MealTime } from '@/lib/types'

/**
 * Two-layer browse: day first, then meal slot.
 *
 * A 25-person, 7-day cohort logging 3 meals a day is ~525 clickable cards, so a
 * single feed is unusable. Filtering by (day → breakfast/lunch/dinner) keeps any
 * one bucket at roughly cohort-size (~25 cards) and makes a meal findable by
 * when it was eaten rather than by scrolling.
 */
export function Meals() {
  const nav = useNavigate()
  const notifications = useAppNotifications()
  const { data: meals, isLoading } = useMeals()
  const { data: profiles } = useProfiles()
  const { data: myProfile } = useMyProfile()
  const { data: allComments } = useAllComments()

  const byId = useMemo(() => new Map((profiles ?? []).map((p) => [p.id, p])), [profiles])

  // Badge points include each meal's share of the day's quest bonuses.
  const earned = useMemo(() => earnedPointsByMeal(meals ?? []), [meals])
  const commentCounts = useMemo(() => commentCountsByMeal(allComments ?? []), [allComments])

  // Day 1 is the cohort start when known, else the earliest meal on record.
  const startDate = useMemo(() => {
    if (CHALLENGE_START_DATE) return CHALLENGE_START_DATE
    const dates = (meals ?? []).map((m) => m.mealDate).sort()
    return dates[0] ?? toCohortDate()
  }, [meals])

  /** Every day that actually has meals, ascending. */
  const days = useMemo(() => {
    const set = new Set((meals ?? []).map((m) => m.mealDate))
    return [...set].sort()
  }, [meals])

  const [day, setDay] = useState<string | null>(null)
  // null = no slot filter: show every meal logged that day.
  const [slot, setSlot] = useState<MealTime | null>(null)
  const activePill = useRef<HTMLButtonElement>(null)

  // Land on the most recent day once data arrives.
  useEffect(() => {
    if (!day && days.length) setDay(days[days.length - 1])
  }, [days, day])

  // The strip scrolls, and the default day is the newest — so bring it on screen.
  useEffect(() => {
    activePill.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [day])

  const dayMeals = useMemo(() => (meals ?? []).filter((m) => m.mealDate === day), [meals, day])

  const counts = useMemo(
    () =>
      MEAL_TIMES.reduce<Record<MealTime, number>>(
        (acc, t) => ({ ...acc, [t]: dayMeals.filter((m) => m.mealTime === t).length }),
        { breakfast: 0, lunch: 0, dinner: 0 },
      ),
    [dayMeals],
  )

  // Meals for the selected day, filtered by slot only when one is chosen,
  // most recently logged first.
  const visible = useMemo(() => {
    const list = slot ? dayMeals.filter((m) => m.mealTime === slot) : dayMeals
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [dayMeals, slot])

  return (
    <div className="min-h-full bg-paper pb-40">
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <H1>meals</H1>
        <NotificationBell items={notifications.items} dismiss={notifications.dismiss} clearAll={notifications.clearAll} />
      </header>

      {isLoading ? (
        <p className="p-6 font-mono text-[13px] text-muted">Rounding up the herd…</p>
      ) : days.length === 0 ? (
        <EmptyState message={`No meals yet. Be the first — ${cowNameOr(myProfile?.cowName)} is watching, hopefully.`} />
      ) : (
        <>
          {/* Layer 1 — the day of the challenge. */}
          <div className="no-scrollbar overflow-x-auto pt-3">
            <div className="flex w-max gap-2 px-6">
              {days.map((d) => {
                const n = challengeDay(d, startDate)
                const active = d === day
                return (
                  <button
                    key={d}
                    ref={active ? activePill : undefined}
                    onClick={() => setDay(d)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-pill border border-ink px-3.5 py-1.5 font-mono text-[13px] transition-transform active:scale-95 ${
                      active ? 'bg-ink text-paper-2' : 'bg-paper-2 text-ink'
                    }`}
                  >
                    Day {n}
                  </button>
                )
              })}
            </div>
          </div>

          {day && <p className="px-6 pt-2 font-mono text-[12px] text-muted">{shortDate(day)}</p>}

          {/* Layer 2 — optional breakfast / lunch / dinner filter. Tapping a slot
              filters to it; tapping it again shows every meal. */}
          <div className="mt-3 flex items-stretch gap-2 px-6">
            {MEAL_TIMES.map((t) => {
              const active = t === slot
              return (
                <button
                  key={t}
                  onClick={() => setSlot(active ? null : t)}
                  aria-pressed={active}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-card border px-2 py-2.5 font-mono text-[13px] transition-transform active:scale-95 ${
                    active ? 'border-ink bg-grass-pale text-ink' : 'border-ink/35 bg-paper-2 text-muted'
                  }`}
                >
                  {TIME_LABEL[t]}
                  <span className={active ? 'text-ink' : 'text-muted'}>{counts[t]}</span>
                </button>
              )
            })}
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 px-6 pt-4">
              {visible.map((m) => (
                <MealCard
                  key={m.id}
                  meal={m}
                  author={byId.get(m.userId)}
                  points={earned.get(m.id)}
                  commentCount={commentCounts.get(m.id)}
                  onClick={() => nav(`/meals/${m.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="px-6 pt-10 text-center font-mono text-[14px] text-muted">
              {slot ? `No ${TIME_LABEL[slot].toLowerCase()} logged on this day yet.` : 'No meals logged on this day yet.'}
            </p>
          )}
        </>
      )}
    </div>
  )
}
