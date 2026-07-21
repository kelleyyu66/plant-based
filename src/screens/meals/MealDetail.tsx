import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { PixelButton } from '@/components/PixelButton'
import { useAddComment, useComments, useMeals, useProfiles, useReactions, useToggleReaction } from '@/hooks/useData'
import { TIER_LABEL, TIME_LABEL } from '@/lib/types'

const REACTION_CHOICES = ['🌱', '🔥', '😋', '👏', '🐄', '💚']

export function MealDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { data: meals } = useMeals()
  const { data: profiles } = useProfiles()
  const meal = meals?.find((m) => m.id === id)
  const byId = useMemo(() => new Map((profiles ?? []).map((p) => [p.id, p])), [profiles])

  const { data: comments } = useComments(id)
  const { data: reactions } = useReactions(id)
  const addComment = useAddComment(id)
  const toggleReaction = useToggleReaction(id)
  const [draft, setDraft] = useState('')

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
        <button onClick={() => nav(-1)} className="font-body text-ink-soft">
          ← Back
        </button>
        <p className="mt-6 font-body text-ink-soft">Moo can’t find that meal.</p>
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
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-ink bg-paper-2 px-4 py-3">
        <button onClick={() => nav(-1)} aria-label="Back" className="text-xl text-ink">
          ←
        </button>
        <span className="font-pixel text-base text-ink">Meal</span>
      </header>

      {meal.photoUrl && (
        <img src={meal.photoUrl} alt="" className="aspect-square w-full border-b-2 border-ink object-cover" />
      )}

      <div className="p-5">
        <div className="flex items-center gap-3">
          {author && <Avatar index={author.avatarIndex} size="sm" />}
          <div>
            <div className="font-body text-xs font-extrabold uppercase tracking-wide text-grass-700">
              {author?.displayName ?? 'Someone'}
            </div>
            <div className="font-body text-xs text-ink-soft">{meal.mealDate}</div>
          </div>
          <span className="ml-auto rounded-pixel-sm border-2 border-ink bg-lime-400 px-2 py-0.5 font-pixel text-xs text-ink">
            +{meal.points}
          </span>
        </div>

        <h1 className="mt-3 font-body text-xl font-extrabold text-ink">
          {TIER_LABEL[meal.tier]} · {TIME_LABEL[meal.mealTime]}
        </h1>
        {meal.caption && <p className="mt-1 font-body text-ink-soft">{meal.caption}</p>}

        {/* Reactions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {REACTION_CHOICES.map((emoji) => {
            const c = counts.get(emoji)
            return (
              <button
                key={emoji}
                onClick={() => toggleReaction.mutate(emoji)}
                className={`flex items-center gap-1 rounded-full border-2 px-2.5 py-1 font-body text-sm transition-transform active:scale-95 ${
                  c?.mine ? 'border-ink bg-lime-400' : 'border-ink/30 bg-paper-2'
                }`}
              >
                <span>{emoji}</span>
                {c && c.count > 0 && <span className="text-xs text-ink-soft">{c.count}</span>}
              </button>
            )
          })}
        </div>

        {/* Comments */}
        <h2 className="mt-6 font-pixel text-sm text-ink">Comments</h2>
        <div className="mt-2 space-y-3">
          {(comments ?? []).map((c) => {
            const cauthor = byId.get(c.userId)
            return (
              <div key={c.id} className="flex gap-2">
                {cauthor && <Avatar index={cauthor.avatarIndex} size="sm" />}
                <div className="rounded-pixel border-2 border-black/10 bg-paper-2 px-3 py-2">
                  <div className="font-body text-xs font-extrabold text-ink">{cauthor?.displayName ?? 'Someone'}</div>
                  <div className="font-body text-sm text-ink-soft">{c.body}</div>
                </div>
              </div>
            )
          })}
          {(comments?.length ?? 0) === 0 && (
            <p className="font-body text-sm text-muted">Say something nice. Moo is listening.</p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Write something…"
            className="flex-1 rounded-pixel border-2 border-ink bg-paper-2 px-3 py-2 font-body text-ink outline-none placeholder:text-muted"
          />
          <PixelButton variant="primary" onClick={submit} disabled={!draft.trim()}>
            Post
          </PixelButton>
        </div>
      </div>
    </div>
  )
}
