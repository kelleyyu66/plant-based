import { useEffect, useRef, useState } from 'react'
import { Camera } from '@phosphor-icons/react'
import { BottomSheet } from '@/components/BottomSheet'
import { Chip } from '@/components/Chip'
import { PixelButton } from '@/components/PixelButton'
import { MEAL_TIERS, MEAL_TIMES, TIER_LABEL, TIME_LABEL, type Meal, type MealTier, type MealTime } from '@/lib/types'
import { toCohortDate } from '@/lib/dates'
import { activeDailyChallenge, challengeTag } from '@/lib/dailyQuest'
import { compressToDataUrl } from '@/lib/photo'
import { useDeleteMeal, useLogMeal, useUpdateMeal } from '@/hooks/useData'
import type { LogMealResult } from '@/lib/dataProvider'

interface LogMealSheetProps {
  open: boolean
  onClose: () => void
  /** Fires on a NEW log (celebration). Not called when editing. */
  onLogged?: (result: LogMealResult) => void
  /** When set, the sheet edits this existing meal instead of logging a new one. */
  meal?: Meal | null
  /** Fires after the edited meal is deleted (the meal's page is gone too). */
  onDeleted?: () => void
}

export function LogMealSheet({ open, onClose, onLogged, meal, onDeleted }: LogMealSheetProps) {
  const [tier, setTier] = useState<MealTier | null>(null)
  const [time, setTime] = useState<MealTime | null>(null)
  const [date, setDate] = useState(toCohortDate())
  const [caption, setCaption] = useState('')
  const [questTagSelected, setQuestTagSelected] = useState(false)
  const [plantProteinGrams, setPlantProteinGrams] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Two-tap delete: first tap arms it, second tap actually deletes.
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const log = useLogMeal()
  const update = useUpdateMeal()
  const del = useDeleteMeal()

  // Editing: load the meal's current values each time the sheet opens.
  useEffect(() => {
    if (!open || !meal) return
    setTier(meal.tier)
    setTime(meal.mealTime)
    setDate(meal.mealDate)
    setCaption(meal.caption ?? '')
    setQuestTagSelected(meal.questTags.length > 0)
    setPlantProteinGrams(meal.plantProteinGrams ? String(meal.plantProteinGrams) : '')
    setPhotoUrl(meal.photoUrl)
    setError(null)
    setConfirmDelete(false)
  }, [open, meal])

  const reset = () => {
    setTier(null); setTime(null); setDate(toCohortDate()); setCaption(''); setQuestTagSelected(false); setPlantProteinGrams(''); setPhotoUrl(null); setError(null)
  }

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoBusy(true)
    try {
      setPhotoUrl(await compressToDataUrl(file))
    } catch {
      setError('Moo couldn’t read that photo. Try another?')
    } finally {
      setPhotoBusy(false)
    }
  }

  const submit = async () => {
    if (!tier || !time) return
    setError(null)
    const fields = {
      tier,
      mealTime: time,
      mealDate: date,
      caption: caption.trim() || null,
      photoDataUrl: photoUrl,
      questTags: tag && questTagSelected ? [tag] : [],
      plantProteinGrams: Math.max(0, Number(plantProteinGrams) || 0),
    }
    try {
      if (meal) {
        // Edit: save quietly, no celebration.
        await update.mutateAsync({ id: meal.id, ...fields })
        reset()
        onClose()
      } else {
        const result = await log.mutateAsync({ ...fields, hasPhoto: !!photoUrl })
        reset()
        onClose()
        onLogged?.(result)
      }
    } catch (err) {
      const code = (err as Error).message
      if (code === 'SLOT_TAKEN') setError('You already logged a meal for that time today. Try another slot!')
      else if (code === 'MEAL_CAP') setError('That’s 3 meals today — Moo is full. See you tomorrow!')
      else setError('Something went sideways. Poke it again in a sec.')
    }
  }

  const remove = async () => {
    if (!meal) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setError(null)
    try {
      await del.mutateAsync(meal.id)
      reset()
      setConfirmDelete(false)
      onClose()
      onDeleted?.()
    } catch {
      setError('Couldn’t delete that meal. Try again in a sec.')
    }
  }

  const valid = tier && time
  const challenge = activeDailyChallenge(new Date(`${date}T12:00:00`))
  const tag = challenge ? challengeTag(challenge.kind) : null
  const questTagLabel: Record<NonNullable<typeof tag>, string> = {
    tofu: 'Includes tofu',
    edamame: 'Includes edamame',
    five_colours: 'Includes 5 colours',
    green_vegetables: 'Includes green vegetables',
    cooked_at_home: 'Cooked or eaten at home',
  }

  const busy = log.isPending || update.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title={meal ? 'Edit meal' : 'Add a meal'}>
      <div className="space-y-5">
        <Field label="Meal type">
          <div className="flex flex-wrap gap-2">
            {MEAL_TIERS.map((t) => (
              <Chip key={t} label={TIER_LABEL[t]} tier={t} selected={tier === t} onClick={() => setTier(t)} />
            ))}
          </div>
        </Field>

        <Field label="Time">
          <div className="flex gap-2">
            {MEAL_TIMES.map((t) => (
              <Chip key={t} label={TIME_LABEL[t]} selected={time === t} onClick={() => setTime(t)} />
            ))}
          </div>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            max={toCohortDate()}
            onChange={(e) => {
              setDate(e.target.value)
              setQuestTagSelected(false)
              setPlantProteinGrams('')
            }}
            className="w-full rounded-card border border-ink bg-paper-2 px-3 py-2.5 font-mono text-ink outline-none"
          />
        </Field>

        {tag && (
          <Field label={`Today’s quest: ${challenge?.title}`} optional>
            <Chip label={questTagLabel[tag]} selected={questTagSelected} onClick={() => setQuestTagSelected((selected) => !selected)} />
          </Field>
        )}

        {challenge?.kind === 'plant_protein_50g' && (
          <Field label="Plant-based protein (grams)" optional>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={plantProteinGrams}
              onChange={(e) => setPlantProteinGrams(e.target.value)}
              placeholder="e.g. 18"
              className="w-full rounded-card border border-ink bg-paper-2 px-3 py-2.5 font-mono text-ink outline-none placeholder:text-muted"
            />
          </Field>
        )}

        <Field label="Photo (+1 point)" optional>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
          {photoUrl ? (
            <div className="flex items-center gap-3">
              <img src={photoUrl} alt="meal" className="h-16 w-16 rounded-card border border-ink object-cover" />
              <button className="font-mono text-sm text-muted underline" onClick={() => setPhotoUrl(null)}>
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="w-full rounded-card border border-dashed border-ink/40 bg-paper-2 px-3 py-3 font-mono text-muted"
            >
              <span className="flex items-center justify-center gap-2"><Camera size={18} aria-hidden />{photoBusy ? 'Compressing…' : 'Choose an image…'}</span>
            </button>
          )}
        </Field>

        <Field label="Caption" optional>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="What did you eat? Brag a little."
            className="w-full resize-none rounded-card border border-ink bg-paper-2 px-3 py-2.5 font-mono text-ink outline-none placeholder:text-muted"
          />
        </Field>

        {error && <p className="rounded-card bg-paper-3 px-3 py-2 font-mono text-sm text-ink">{error}</p>}

        <div className="flex gap-3 pt-1">
          <PixelButton variant="ghost" full onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton variant="primary" full disabled={!valid || busy} onClick={submit}>
            {busy ? 'Saving…' : meal ? 'Save changes' : 'Log it'}
          </PixelButton>
        </div>

        {meal && (
          <button
            onClick={remove}
            disabled={del.isPending}
            className="mx-auto block font-mono text-sm text-alert underline"
          >
            {del.isPending ? 'Deleting…' : confirmDelete ? 'Tap again to delete — points go with it' : 'Delete meal'}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-ink">{label}</span>
        {/* Only optional fields are marked; required is the unstated default. */}
        {optional && <span className="font-mono text-xs text-muted">Optional</span>}
      </div>
      {children}
    </div>
  )
}
