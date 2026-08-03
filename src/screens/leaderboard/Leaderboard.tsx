import { useNavigate } from 'react-router-dom'
import { LeaderRow } from '@/components/LeaderRow'
import { H1 } from '@/components/H1'
import { NotificationBell } from '@/components/Notifications'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import { useLeaderboard } from '@/hooks/useData'
import type { LeaderboardEntry, StartingDiet } from '@/lib/types'

export function Leaderboard() {
  const nav = useNavigate()
  const notifications = useAppNotifications()
  const { data: entries, isLoading } = useLeaderboard()

  const section = (diet: StartingDiet) => (entries ?? []).filter((e) => e.profile.startingDiet === diet)

  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <H1>boards</H1>
        <NotificationBell items={notifications.items} dismiss={notifications.dismiss} clearAll={notifications.clearAll} />
      </header>

      {isLoading ? (
        <p className="p-6 font-mono text-[13px] text-muted">Tallying points…</p>
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
    <section className="mx-6 my-5">
      <h2 className="mb-2 font-mono text-[13px] text-ink">{title}</h2>
      <div className="overflow-hidden rounded-card border border-ink bg-paper-2 px-3">
        {entries.length === 0 ? (
          <p className="py-3 font-mono text-[13px] text-muted">No one here yet.</p>
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
