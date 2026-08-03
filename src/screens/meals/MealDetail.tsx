import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ForkKnife, PencilSimple } from '@phosphor-icons/react'
import { Avatar } from '@/components/Avatar'
import { PixelButton } from '@/components/PixelButton'
import {
  useAddComment,
  useComments,
  useMeals,
  useMyProfile,
  useProfiles,
  useReactions,
  useToggleReaction,
} from '@/hooks/useData'
import { TIER_LABEL, TIME_LABEL } from '@/lib/types'
import { earnedPointsByMeal } from '@/lib/dailyQuest'
import { LogMealSheet } from './LogMealSheet'

const REACTION_CHOICES = ['🌱', '🔥', '😋', '👏', '🐄', '💚']

export function MealDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { data: meals } = useMeals()
  const { data: profiles } = useProfiles()
  const meal = meals?.find((m) => m.id === id)
  const byId = useMemo(() => new Map((profiles ?? []).map((p) => [p.id, p])), [profiles])
  const earned = useMemo(() => earnedPointsByMeal(meals ?? []), [meals])

  const { data: comments } = useComments(id)
  const { data: reactions } = useReactions(id)
  const { data: me } = useMyProfile()
  const addComment = useAddComment(id)
  const toggleReaction = useToggleReaction(id)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)

  const counts = useMemo(() => {
    const map = new Map<string, { count: number; mine: boolean }>()
    for (const r of reactions ?? []) {
      const e = map.get(r.emoji) ?? { count: 0, mine: false }
      e.count += 1
      if (r.userId === 'me') e.mine = true
      map.set(r.emoji, e)
    }
    return map
  }, [reactions])

  if (!meal) {
    return (
      <div className="min-h-full bg-paper p-6">
        <button onClick={() => nav(-1)} className="font-mono text-muted">
          ← Back
        </button>
        <p className="mt-6 font-mono text-muted">Moo can’t find that meal.</p>
      </div>
    )
  }

  const author = byId.get(meal.userId)

  const submit = () => {
    if (!draft.trim()) return
    addComment.mutate(draft.trim())
    setDraft('')
  }

  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink bg-paper-2 px-4 py-3">
        <button onClick={() => nav(-1)} aria-label="Back" className="text-xl text-ink">
          ←
        </button>
        <span className="font-mono text-base text-ink">Meal</span>
      </header>

      {meal.photoUrl ? (
        <img src={meal.photoUrl} alt="" className="aspect-square w-full border-b border-ink object-cover" />
      ) : (
        <div className="grid aspect-square w-full place-items-center border-b border-ink bg-paper-3">
          <ForkKnife size={44} className="text-ink-faint" aria-hidden />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-3">
          {author && <Avatar index={author.avatarIndex} size="sm" />}
          <div>
            <div className="font-mono text-xs font-medium uppercase tracking-wide text-muted">
              {author?.displayName ?? 'Someone'}
            </div>
            <div className="font-mono text-xs text-muted">{meal.mealDate}</div>
          </div>
          <span className="ml-auto rounded-card border border-ink bg-grass-pale px-2 py-0.5 font-mono text-xs text-ink">
            +{earned.get(meal.id) ?? meal.points}
          </span>
        </div>

        <h1 className="mt-3 font-mono text-xl font-medium text-ink">
          {TIER_LABEL[meal.tier]} · {TIME_LABEL[meal.mealTime]}
        </h1>
        {meal.caption && <p className="mt-1 font-mono text-muted">{meal.caption}</p>}

        {/* Reactions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {REACTION_CHOICES.map((emoji) => {
            const c = counts.get(emoji)
            return (
              <button
                key={emoji}
                onClick={() => toggleReaction.mutate(emoji)}
                className={`flex items-center gap-1 rounded-pill border px-2.5 py-1 font-mono text-[13px] transition-transform active:scale-95 ${
                  c?.mine ? 'border-ink bg-grass-pale' : 'border-ink/30 bg-paper-2'
                }`}
              >
                <span>{emoji}</span>
                {c && c.count > 0 && <span className="text-xs text-muted">{c.count}</span>}
              </button>
            )
          })}
        </div>

        {/* Comments */}
        <h2 className="mt-6 font-mono text-sm text-ink">Comments</h2>
        <div className="mt-2 space-y-3">
          {(comments ?? []).map((c) => {
            const cauthor = byId.get(c.userId)
            return (
              <div key={c.id} className="flex gap-2">
                {cauthor && <Avatar index={cauthor.avatarIndex} size="sm" />}
                <div className="rounded-card border border-ink/15 bg-paper-2 px-3 py-2">
                  <div className="font-mono text-xs font-medium text-ink">{cauthor?.displayName ?? 'Someone'}</div>
                  <div className="font-mono text-sm text-muted">{c.body}</div>
                </div>
              </div>
            )
          })}
          {(comments?.length ?? 0) === 0 && (
            <p className="font-mono text-sm text-muted">Say something nice. Moo is listening.</p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Write something…"
            className="flex-1 rounded-card border border-ink bg-paper-2 px-3 py-2 font-mono text-ink outline-none placeholder:text-muted"
          />
          <PixelButton variant="primary" onClick={submit} disabled={!draft.trim()}>
            Post
          </PixelButton>
        </div>
      </div>

      {/* Edit — own meals only. Floats 48px above the menu bar (~60px tall),
          centred over the You tab (last of four, so 12.5% in from the right). */}
      {me && meal.userId === me.id && (
        <>
          <div className="pointer-events-none fixed inset-x-0 bottom-[108px] z-40 mx-auto w-full max-w-phone">
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit meal"
              className="pointer-events-auto absolute bottom-0 right-[12.5%] grid h-12 w-12 translate-x-1/2 place-items-center rounded-full border border-ink bg-paper-2 text-ink transition-transform active:scale-95"
            >
              <PencilSimple size={20} aria-hidden />
            </button>
          </div>
          <LogMealSheet
            open={editing}
            meal={meal}
            onClose={() => setEditing(false)}
            onDeleted={() => nav('/meals')}
          />
        </>
      )}
    </div>
  )
}
