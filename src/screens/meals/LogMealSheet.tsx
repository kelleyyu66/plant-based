import { useRef, useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { Chip } from '@/components/Chip'
import { PixelButton } from '@/components/PixelButton'
import { MEAL_TIERS, MEAL_TIMES, TIER_LABEL, TIME_LABEL, type MealTier, type MealTime } from '@/lib/types'
import { toCohortDate } from '@/lib/dates'
import { compressToDataUrl } from '@/lib/photo'
import { useLogMeal } from '@/hooks/useData'
import type { LogMealResult } from '@/lib/dataProvider'

interface LogMealSheetProps {
  open: boolean
  onClose: () => void
  onLogged: (result: LogMealResult) => void
}

export function LogMealSheet({ open, onClose, onLogged }: LogMealSheetProps) {
  const [tier, setTier] = useState<MealTier | null>(null)
  const [time, setTime] = useState<MealTime | null>(null)
  const [date, setDate] = useState(toCohortDate())
  const [caption, setCaption] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const log = useLogMeal()

  const reset = () => {
    setTier(null); setTime(null); setDate(toCohortDate()); setCaption(''); setPhotoUrl(null); setError(null)
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
    try {
      const result = await log.mutateAsync({
        tier,
        mealTime: time,
        mealDate: date,
        caption: caption.trim() || null,
        hasPhoto: !!photoUrl,
        photoDataUrl: photoUrl,
      })
      reset()
      onClose()
      onLogged(result)
    } catch (err) {
      const code = (err as Error).message
      if (code === 'SLOT_TAKEN') setError('You already logged a meal for that time today. Try another slot!')
      else if (code === 'MEAL_CAP') setError('That’s 3 meals today — Moo is full. See you tomorrow!')
      else setError('Something went sideways. Poke it again in a sec.')
    }
  }

  const valid = tier && time

  return (
    <BottomSheet open={open} onClose={onClose} title="Add a meal">
      <div className="space-y-5">
        <Field label="Meal type" required>
          <div className="flex flex-wrap gap-2">
            {MEAL_TIERS.map((t) => (
              <Chip key={t} label={TIER_LABEL[t]} tier={t} selected={tier === t} onClick={() => setTier(t)} />
            ))}
          </div>
        </Field>

        <Field label="Time" required>
          <div className="flex gap-2">
            {MEAL_TIMES.map((t) => (
              <Chip key={t} label={TIME_LABEL[t]} selected={time === t} onClick={() => setTime(t)} />
            ))}
          </div>
        </Field>

        <Field label="Date" required>
          <input
            type="date"
            value={date}
            max={toCohortDate()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-pixel border-2 border-ink bg-paper-2 px-3 py-2.5 font-body text-ink outline-none"
          />
        </Field>

        <Field label="Photo (optional, +1 point 📸)">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
          {photoUrl ? (
            <div className="flex items-center gap-3">
              <img src={photoUrl} alt="meal" className="h-16 w-16 rounded-pixel border-2 border-ink object-cover" />
              <button className="font-body text-sm text-berry-400 underline" onClick={() => setPhotoUrl(null)}>
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="w-full rounded-pixel border-2 border-dashed border-ink/50 bg-paper-2 px-3 py-3 font-body text-ink-soft"
            >
              {photoBusy ? 'Compressing…' : '📷 Choose an image…'}
            </button>
          )}
        </Field>

        <Field label="Caption (optional)">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            placeholder="What did you eat? Brag a little."
            className="w-full resize-none rounded-pixel border-2 border-ink bg-paper-2 px-3 py-2.5 font-body text-ink outline-none placeholder:text-muted"
          />
        </Field>

        {error && <p className="rounded-pixel bg-berry-400/20 px-3 py-2 font-body text-sm text-ink">{error}</p>}

        <div className="flex gap-3 pt-1">
          <PixelButton variant="ghost" full onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton variant="primary" full disabled={!valid || log.isPending} onClick={submit}>
            {log.isPending ? 'Logging…' : 'Log it'}
          </PixelButton>
        </div>
      </div>
    </BottomSheet>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-body text-sm font-extrabold text-ink">{label}</span>
        {required && <span className="font-body text-xs text-muted">Required</span>}
      </div>
      {children}
    </div>
  )
}
