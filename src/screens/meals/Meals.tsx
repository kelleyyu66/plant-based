import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MealCard } from '@/components/MealCard'
import { EmptyState } from '@/components/EmptyState'
import { useMeals, useProfiles } from '@/hooks/useData'

export function Meals() {
  const nav = useNavigate()
  const { data: meals, isLoading } = useMeals()
  const { data: profiles } = useProfiles()

  const byId = useMemo(() => new Map((profiles ?? []).map((p) => [p.id, p])), [profiles])

  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="sticky top-0 z-10 border-b-2 border-ink bg-paper-2 px-5 py-4">
        <h1 className="font-pixel text-lg text-ink">Meals</h1>
      </header>

      {isLoading ? (
        <p className="p-6 font-body text-ink-soft">Rounding up the herd…</p>
      ) : meals && meals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 p-4">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} author={byId.get(m.userId)} onClick={() => nav(`/meals/${m.id}`)} />
          ))}
        </div>
      ) : (
        <EmptyState message="No meals yet. Be the first — Moo is watching, hopefully." />
      )}
    </div>
  )
}
