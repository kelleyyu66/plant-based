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
  useUserPoints,
} from '@/hooks/useData'
import { impactEquivalents } from '@/lib/impact'
import { cowNameOr } from '@/content/cowNames'

export function Home() {
  const nav = useNavigate()
  const { data: profile } = useMyProfile()
  const { data: mealsToday } = useMyMealsToday()
  const { data: myPoints = 0 } = useUserPoints('me')
  const { data: impactKg = 0 } = useChallengeImpact()
  const { data: leaderboard } = useLeaderboard()
  const { data: dailyQuest } = useDailyQuestProgress()

  const impact = impactEquivalents(impactKg)
  const mealsCount = mealsToday?.length ?? 0
  const cowName = cowNameOr(profile?.cowName)

  const top = leaderboard?.slice(0, 5) ?? []

  return (
    <div className="min-h-full bg-forest-900 pb-28 text-paper">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <div className="font-pixel text-lg text-paper">Hi, {profile?.displayName ?? 'friend'}</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-lime-400/60 bg-black/20 px-3 py-1.5">
            <span aria-hidden>⭐</span>
            <span className="font-pixel text-sm text-lime-400">{myPoints}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-sun-400/60 bg-black/20 px-3 py-1.5">
            <span aria-hidden>🔥</span>
            <span className="font-pixel text-sm text-sun-400">{profile?.streakCurrent ?? 0}</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <section className="px-5 py-3">
        <div className="mb-1.5 flex justify-between font-body text-sm">
          <span className="font-bold">Plant meals today</span>
          <span className="text-paper/70">{mealsCount}/3 meals</span>
        </div>
        <ProgressBar value={mealsCount} max={3} segments={3} />
      </section>

      {/* Cow stage */}
      <section className="mx-5 my-3 flex flex-col items-center rounded-pixel border-2 border-black/30 bg-gradient-to-b from-forest-800 to-forest-700 py-6">
        <MooCow mood={mealsCount > 0 ? 'idle' : 'sleep'} scale={11} />
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
