import { useNavigate } from 'react-router-dom'
import { LeaderRow } from '@/components/LeaderRow'
import { useLeaderboard } from '@/hooks/useData'
import type { LeaderboardEntry, StartingDiet } from '@/lib/types'

export function Leaderboard() {
  const nav = useNavigate()
  const { data: entries, isLoading } = useLeaderboard()

  const section = (diet: StartingDiet) => (entries ?? []).filter((e) => e.profile.startingDiet === diet)

  return (
    <div className="min-h-full bg-forest-900 pb-28 text-paper">
      <header className="sticky top-0 z-10 border-b-2 border-ink bg-forest-800 px-5 py-4">
        <h1 className="font-pixel text-lg text-paper">🏆 Leaderboard</h1>
      </header>

      {isLoading ? (
        <p className="p-6 font-body text-paper/70">Tallying points…</p>
      ) : (
        <>
          <Section title="Previous vegetarians" entries={section('vegetarian')} onOpen={(id) => nav(`/profile/${id}`)} />
          <Section
            title="Previous meat-eaters & flexitarians"
            entries={section('meat_or_flexitarian')}
            onOpen={(id) => nav(`/profile/${id}`)}
          />
        </>
      )}
    </div>
  )
}

function Section({
  title,
  entries,
  onOpen,
}: {
  title: string
  entries: LeaderboardEntry[]
  onOpen: (id: string) => void
}) {
  return (
    <section className="mx-4 my-4">
      <h2 className="mb-1 font-body text-xs font-extrabold uppercase tracking-wide text-lime-400">{title}</h2>
      <div className="rounded-pixel border-2 border-black/30 bg-paper px-3 py-1 text-ink">
        {entries.length === 0 ? (
          <p className="py-3 font-body text-sm text-ink-soft">No one here yet.</p>
        ) : (
          entries.map((e, i) => (
            <LeaderRow
              key={e.profile.id}
              rank={i + 1}
              profile={e.profile}
              points={e.points}
              highlight={e.profile.id === 'me'}
              onClick={() => onOpen(e.profile.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}
