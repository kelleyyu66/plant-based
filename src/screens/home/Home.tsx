import { useNavigate } from 'react-router-dom'
import { H1 } from '@/components/H1'
import { ProgressBar } from '@/components/ProgressBar'
import { LeaderRow } from '@/components/LeaderRow'
import { QuestList } from '@/components/QuestList'
import { CarbonEquivalent } from '@/components/CarbonEquivalent'
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
import { Pasture } from '@/components/Pasture'
import { impactEquivalents } from '@/lib/impact'
import { INDIVIDUAL_POINTS_GOAL } from '@/content/seed'
import { cowMessage, greetingTrigger } from '@/content/cowMessages'
import { unlockedCount } from '@/lib/pasture'
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
  const unlocked = unlockedCount(myMeals ?? [])

  // The cow greets by time of day, and nags after 10pm if dinner is missing.
  const now = new Date()
  const dinnerLogged = (mealsToday ?? []).some((m) => m.mealTime === 'dinner')
  const greeting = cowMessage(
    mealsCount >= 3 ? 'all_done' : greetingTrigger(now.getHours(), dinnerLogged),
    { name: profile?.displayName },
    now.getDate(),
  )

  return (
    <div className="min-h-full bg-paper pb-52">
      {/* Greeting + notifications */}
      <header className="flex items-start justify-between px-6 pt-7">
        <H1>hi {profile?.displayName ?? 'friend'}</H1>
        <NotificationBell items={notifications.items} dismiss={notifications.dismiss} clearAll={notifications.clearAll} />
      </header>

      {/* Hero illustration slot */}
      {/* Hero = the pasture. Read-only here; arranging happens on the You page. */}
      <Pasture unlocked={unlocked} mode="hero" mood={mealsCount > 0 ? 'idle' : 'sleep'} says={greeting} />
      <div className="flex justify-end px-6 pt-1">
        <button className="font-mono text-[12px] text-muted underline" onClick={() => nav('/profile#pasture')}>
          edit pasture
        </button>
      </div>

      {/* Meters — the progress fill is the app's only color. */}
      <section className="space-y-4 px-6 pt-7">
        <Meter label="Plant based meals today" value={`${mealsCount} of 3`}>
          <ProgressBar value={mealsCount} max={3} />
        </Meter>
        <Meter label="Your points" value={`${myPoints}/${INDIVIDUAL_POINTS_GOAL}`}>
          <ProgressBar value={myPoints} max={INDIVIDUAL_POINTS_GOAL} />
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
      <section className="px-6 pt-9">
        <H1 as="h2" className="!text-[30px] text-center leading-[1.25]">
          Together we’ve saved {impact.kg.toLocaleString()} kilograms of carbon dioxide.
        </H1>

        <p className="mt-5 text-center font-mono text-[14px] text-ink">That means…</p>

        <div className="mt-3 grid grid-cols-3 gap-[11px]">
          <CarbonEquivalent kind="car" value={impact.miles.toLocaleString()} label="fewer miles driven" />
          <CarbonEquivalent kind="tree" value={impact.trees.toLocaleString()} label="trees’ worth of carbon" />
          <CarbonEquivalent kind="shower" value={impact.showers.toLocaleString()} label="showers of water saved" />
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
          <div className="mt-2.5 rounded-card border border-ink bg-paper-2 px-3">
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
