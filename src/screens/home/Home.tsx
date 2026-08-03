import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { H1 } from '@/components/H1'
import { ProgressBar } from '@/components/ProgressBar'
import { LeaderRow } from '@/components/LeaderRow'
import { QuestList } from '@/components/QuestList'
import { NotificationBell } from '@/components/Notifications'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import {
  useChallengeImpact,
  useDailyQuestProgress,
  useLeaderboard,
  useMyMealsToday,
  useMyProfile,
  useUserPoints,
} from '@/hooks/useData'
import { HomeScene } from '@/components/scene/HomeScene'
import { impactEquivalents } from '@/lib/impact'
import { cowMessage, greetingTrigger } from '@/content/cowMessages'
import { cowNameOr } from '@/content/cowNames'
import { useUserMeals } from '@/hooks/useData'

export function Home() {
  const nav = useNavigate()
  const { data: profile } = useMyProfile()
  const { data: mealsToday } = useMyMealsToday()
  const { data: myPoints = 0 } = useUserPoints('me')
  const { data: impactKg = 0 } = useChallengeImpact()
  const { data: leaderboard } = useLeaderboard()
  const { data: dailyQuest } = useDailyQuestProgress()
  const notifications = useAppNotifications()
  const { data: myMeals } = useUserMeals('me')

  const impact = impactEquivalents(impactKg)
  const mealsCount = mealsToday?.length ?? 0
  const top = leaderboard?.slice(0, 5) ?? []

  // The cow speaks in moments, not constantly: the bubble shows for a few
  // seconds on arrival, then again periodically.
  const BUBBLE_SHOW_MS = 8_000
  const BUBBLE_EVERY_MS = 120_000
  const [bubbleVisible, setBubbleVisible] = useState(true)
  useEffect(() => {
    let hide = setTimeout(() => setBubbleVisible(false), BUBBLE_SHOW_MS)
    const cycle = setInterval(() => {
      setBubbleVisible(true)
      clearTimeout(hide)
      hide = setTimeout(() => setBubbleVisible(false), BUBBLE_SHOW_MS)
    }, BUBBLE_EVERY_MS)
    return () => {
      clearTimeout(hide)
      clearInterval(cycle)
    }
  }, [])

  // Nothing logged today → Moo is hungry. Otherwise greet by time of day,
  // nagging after 10pm if dinner is missing.
  const now = new Date()
  const dinnerLogged = (mealsToday ?? []).some((m) => m.mealTime === 'dinner')
  const greeting = cowMessage(
    mealsCount === 0
      ? 'hungry'
      : mealsCount >= 3
        ? 'all_done'
        : greetingTrigger(now.getHours(), dinnerLogged),
    { name: profile?.displayName, cow: cowNameOr(profile?.cowName) },
    now.getDate(),
  )

  const firstName = (profile?.displayName ?? 'friend').trim().split(/\s+/)[0]

  return (
    <div className="min-h-full bg-paper pb-52">
      {/* Greeting + running points + notifications */}
      <header className="flex items-start justify-between px-6 pt-7">
        <H1>hi {firstName}</H1>
        <div className="flex items-center gap-3 pt-1">
          <span className="font-mono text-[15px] text-ink">{myPoints} pts</span>
          <NotificationBell items={notifications.items} dismiss={notifications.dismiss} clearAll={notifications.clearAll} />
        </div>
      </header>

      {/* Hero = the landscape. Elements are added and arranged right here. */}
      <HomeScene meals={myMeals ?? []} says={bubbleVisible ? greeting : undefined} />

      {/* Meter — the progress fill is the app's only color. */}
      <section className="space-y-4 px-6 pt-7">
        <Meter label="Plant based meals today" value={`${mealsCount} of 3`}>
          <ProgressBar value={mealsCount} max={3} />
        </Meter>
      </section>

      {/* Today's quest — completion is derived from food logs, never tapped. */}
      {dailyQuest && dailyQuest.tasks.length > 0 && (
        <section className="px-6 pt-7">
          <h2 className="mb-2.5 font-mono text-[15px] text-ink">Today’s quest</h2>
          <QuestList progress={dailyQuest} />
        </section>
      )}

      {/* Carbon savings */}
      <section className="px-6 pt-10">
        <H1 as="h2" className="!text-[28px] text-center leading-[1.15]">
          Together we’ve saved
        </H1>
        <div className="mt-1 text-center font-hand text-[54px] leading-none text-ink">
          {impact.kg.toLocaleString()}
        </div>
        <div className="mt-1 text-center font-hand text-[20px] text-ink">kg of CO₂</div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Metric img="miles" value={impact.miles.toLocaleString()} label="fewer miles driven" />
          <Metric img="showers" value={impact.showers.toLocaleString()} label="showers of water saved" />
          <Metric img="trees" value={impact.trees.toLocaleString()} label="trees’ worth of carbon" />
        </div>
      </section>

      {/* Leaderboard preview */}
      {top.length > 0 && (
        <section className="px-6 pt-9">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[15px] text-ink">Leaderboard</h2>
            <button className="font-mono text-[12px] text-muted underline" onClick={() => nav('/leaderboard')}>
              See all
            </button>
          </div>
          <div className="mt-2.5 overflow-hidden rounded-card border border-ink bg-paper-2 px-3">
            {top.map((e, i) => (
              <LeaderRow
                key={e.profile.id}
                rank={i + 1}
                profile={e.profile}
                points={e.points}
                highlight={e.profile.id === 'me'}
                onClick={() => nav(`/profile/${e.profile.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Impact equivalence: hand-drawn art with the figure beneath. No frame.
 *  Every tile shares one box height so the numbers align; the trees art is
 *  drawn 1.5x per design review. */
function Metric({ img, value, label }: { img: string; value: string; label: string }) {
  const imgH = img === 'trees' ? 111 : 74
  return (
    <div className="flex flex-col items-center text-center">
      {/* items-end: all three graphics share one bottom baseline. */}
      <div className="flex h-[111px] w-full items-end justify-center">
        <img
          src={`/home/metrics/${img}.webp`}
          alt=""
          aria-hidden
          draggable={false}
          className="w-full select-none object-contain"
          style={{ height: imgH }}
        />
      </div>
      <div className="mt-1 font-mono text-[16px] text-ink">{value}</div>
      <div className="font-mono text-[13px] leading-tight text-muted">{label}</div>
    </div>
  )
}

function Meter({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between font-mono text-[15px] text-ink">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      {children}
    </div>
  )
}
