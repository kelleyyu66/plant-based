import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MooCow } from '@/components/MooCow'
import { ProgressBar } from '@/components/ProgressBar'
import { StatRow } from '@/components/StatRow'
import { LeaderRow } from '@/components/LeaderRow'
import { DailyQuestCard } from '@/components/DailyQuestCard'
import {
  useChallengeImpact,
  useDailyQuestProgress,
  useLeaderboard,
  useMyMealsToday,
  useMyProfile,
  useTeams,
  useTeamStandings,
  useUserPoints,
} from '@/hooks/useData'
import { impactEquivalents } from '@/lib/impact'
import { activeFact } from '@/lib/quests'
import { DAILY_FACTS, INDIVIDUAL_POINTS_GOAL, topUnlockedAccessory } from '@/content/seed'
import { cowNameOr } from '@/content/cowNames'

const ACCESSORY_BADGE: Record<string, string> = { regular: '', hat: '🎉', balloon: '🎈' }

export function Home() {
  const nav = useNavigate()
  const { data: profile } = useMyProfile()
  const { data: mealsToday } = useMyMealsToday()
  const { data: myPoints = 0 } = useUserPoints('me')
  const { data: impactKg = 0 } = useChallengeImpact()
  const { data: leaderboard } = useLeaderboard()
  const { data: standings } = useTeamStandings()
  const { data: teams } = useTeams()
  const { data: dailyQuest } = useDailyQuestProgress()

  const dailyFact = activeFact(DAILY_FACTS)
  const [factIndex, setFactIndex] = useState(() => Math.max(0, DAILY_FACTS.indexOf(dailyFact ?? DAILY_FACTS[0])))
  const fact = DAILY_FACTS[factIndex]
  const impact = impactEquivalents(impactKg)
  const mealsCount = mealsToday?.length ?? 0

  const myTeam = teams?.find((t) => t.id === profile?.teamId)
  const myStanding = standings?.find((s) => s.team.id === profile?.teamId)
  const accessory = topUnlockedAccessory(myStanding?.points ?? 0)
  const badge = ACCESSORY_BADGE[accessory.spriteVariant] ?? ''
  const cowName = cowNameOr(profile?.cowName)

  const top = leaderboard?.slice(0, 5) ?? []

  return (
    <div className="min-h-full bg-forest-900 pb-28 text-paper">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <div>
          <div className="font-pixel text-lg text-paper">Hi, {profile?.displayName ?? 'friend'}</div>
          <div className="font-body text-xs text-paper/60">{myTeam?.name}</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border-2 border-sun-400/60 bg-black/20 px-3 py-1.5">
          <span aria-hidden>🔥</span>
          <span className="font-pixel text-sm text-sun-400">{profile?.streakCurrent ?? 0}</span>
        </div>
      </header>

      {/* Progress */}
      <section className="space-y-3 px-5 py-3">
        <div>
          <div className="mb-1.5 flex justify-between font-body text-sm">
            <span className="font-bold">Plant meals today</span>
            <span className="text-paper/70">{mealsCount}/3 meals</span>
          </div>
          <ProgressBar value={mealsCount} max={3} segments={3} />
        </div>
        <div>
          <div className="mb-1.5 flex justify-between font-body text-sm">
            <span className="font-bold">Your points</span>
            <span className="text-paper/70">
              {myPoints}/{INDIVIDUAL_POINTS_GOAL}
            </span>
          </div>
          <ProgressBar value={myPoints} max={INDIVIDUAL_POINTS_GOAL} />
        </div>
      </section>

      {/* Cow stage */}
      <section className="mx-5 my-3 flex flex-col items-center rounded-pixel border-2 border-black/30 bg-gradient-to-b from-forest-800 to-forest-700 py-6">
        <div className="relative">
          <MooCow mood={mealsCount > 0 ? 'idle' : 'sleep'} scale={11} />
          {badge && <span className="absolute -right-2 -top-3 text-2xl">{badge}</span>}
        </div>
        <p className="mt-3 px-6 text-center font-body text-sm text-paper/80">
          {mealsCount > 0
            ? `${cowName} is thriving today. Keep it going!`
            : `${cowName} is napping. Log a meal to wake them up!`}
        </p>
      </section>

      {/* Daily quest */}
      {dailyQuest && <DailyQuestCard progress={dailyQuest} />}

      {/* Challenge-wide impact */}
      <section className="mx-5 my-3 rounded-pixel border-2 border-black/30 bg-forest-800 p-4">
        <h2 className="font-pixel text-base text-paper">🌍 Challenge-wide impact</h2>
        <div className="my-2 font-pixel text-[26px] text-lime-400">{impact.kg} kg</div>
        <div className="mb-3 font-body text-xs text-paper/70">CO₂ equivalent saved, approximately equal to…</div>
        <div className="space-y-2">
          <StatRow icon="🚗" label="fewer miles driven" value={impact.miles.toLocaleString()} />
          <StatRow icon="🌳" label="trees planted" value={impact.trees.toLocaleString()} />
          <StatRow icon="💧" label="showers saved (in water usage)" value={impact.showers.toLocaleString()} />
        </div>
      </section>

      {/* Daily fact */}
      {fact && (
        <section className="mx-5 my-3 h-36 rounded-pixel border-2 border-black/30 bg-forest-700 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-pixel text-sm text-paper">Did you know?</h3>
            <div className="ml-auto flex shrink-0 items-center gap-[0.5em]">
              <button
                type="button"
                aria-label="Previous fact"
                onClick={() => setFactIndex((index) => (index - 1 + DAILY_FACTS.length) % DAILY_FACTS.length)}
                className="grid h-8 w-8 place-items-center rounded-pixel border-2 border-paper/40 font-pixel text-lg text-paper transition-transform active:translate-y-[2px] active:shadow-pixel-inset"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next fact"
                onClick={() => setFactIndex((index) => (index + 1) % DAILY_FACTS.length)}
                className="grid h-8 w-8 place-items-center rounded-pixel border-2 border-paper/40 font-pixel text-lg text-paper transition-transform active:translate-y-[2px] active:shadow-pixel-inset"
              >
                ›
              </button>
            </div>
          </div>
          <p className="mt-2 font-body text-sm text-paper/90">{fact.body}</p>
        </section>
      )}

      {/* Leaderboard preview */}
      <section className="mx-5 my-3 rounded-pixel border-2 border-black/30 bg-paper p-3 text-ink">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-pixel text-base text-ink">🏆 Leaderboard</h2>
          <button className="font-body text-xs text-ink-soft underline" onClick={() => nav('/leaderboard')}>
            See all
          </button>
        </div>
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
      </section>
    </div>
  )
}
