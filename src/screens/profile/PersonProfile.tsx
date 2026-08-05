import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { MealCard } from '@/components/MealCard'
import { EmptyState } from '@/components/EmptyState'
import { useAllComments, useProfile, useUserMeals, useUserPoints } from '@/hooks/useData'
import { commentCountsByMeal } from '@/lib/comments'

/** Read-only profile of any cohort member: header + their meal grid. */
export function PersonProfile() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { data: profile, isLoading } = useProfile(id)
  const { data: meals } = useUserMeals(id)
  const { data: points = 0 } = useUserPoints(id)
  const { data: allComments } = useAllComments()
  const commentCounts = useMemo(() => commentCountsByMeal(allComments ?? []), [allComments])

  if (isLoading) return <div className="min-h-full bg-paper p-6 font-mono text-muted">Loading…</div>
  if (!profile)
    return (
      <div className="min-h-full bg-paper p-6">
        <button onClick={() => nav(-1)} className="font-mono text-muted">
          ← Back
        </button>
        <p className="mt-6 font-mono text-muted">Moo can’t find that person.</p>
      </div>
    )

  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="flex items-center gap-3 border-b border-ink bg-paper-2 px-4 py-3">
        <button onClick={() => nav(-1)} aria-label="Back" className="text-xl text-ink">
          ←
        </button>
        <span className="font-mono text-base text-ink">{profile.displayName}</span>
      </header>

      <div className="flex items-center gap-4 px-5 py-5">
        <Avatar index={profile.avatarIndex} size="lg" />
        <div>
          <div className="font-mono text-lg text-ink">{profile.displayName}</div>
          <div className="mt-1 font-mono text-sm font-medium text-muted">{points} points</div>
        </div>
      </div>

      {meals && meals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {meals.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              author={profile}
              commentCount={commentCounts.get(m.id)}
              onClick={() => nav(`/meals/${m.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState message={`${profile.displayName} hasn’t logged a meal yet. The suspense!`} />
      )}
    </div>
  )
}
