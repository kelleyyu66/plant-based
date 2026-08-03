import { useEffect, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { Chip } from '@/components/Chip'
import { PixelButton } from '@/components/PixelButton'
import { useUpdateMyProfile } from '@/hooks/useData'
import type { Profile } from '@/lib/types'

const FREQ = [
  { v: 'never', label: 'Never' },
  { v: 'rarely', label: 'Rarely' },
  { v: 'sometimes', label: 'Sometimes' },
  { v: 'often', label: 'Most days' },
  { v: 'mostly', label: 'Already veggie/vegan' },
] as const

const FAMILIARITY = [
  { v: 'new', label: 'New to this' },
  { v: 'somewhat', label: 'Somewhat familiar' },
  { v: 'very', label: 'Very familiar' },
] as const

const PROTEINS = ['Beef', 'Pork', 'Chicken', 'Fish', 'Eggs', 'Dairy', 'Tofu', 'Beans', 'Lentils', 'Nuts']

/**
 * "About you" — everything captured during onboarding, editable afterwards so a
 * wrong tap on day one isn't permanent. Reads as a plain summary until the user
 * hits Edit.
 */
export function AboutYou({ profile }: { profile: Profile }) {
  const update = useUpdateMyProfile()
  const [editing, setEditing] = useState(false)

  const [displayName, setDisplayName] = useState(profile.displayName)
  const [cowName, setCowName] = useState(profile.cowName ?? '')
  const [frequency, setFrequency] = useState(profile.onboarding?.plantFrequency ?? 'sometimes')
  const [familiarity, setFamiliarity] = useState(profile.onboarding?.climateFamiliarity ?? 'new')
  const [proteins, setProteins] = useState<string[]>(profile.onboarding?.proteins ?? [])

  // Re-seed the form whenever we (re)enter edit mode or the profile changes.
  useEffect(() => {
    if (editing) return
    setDisplayName(profile.displayName)
    setCowName(profile.cowName ?? '')
    setFrequency(profile.onboarding?.plantFrequency ?? 'sometimes')
    setFamiliarity(profile.onboarding?.climateFamiliarity ?? 'new')
    setProteins(profile.onboarding?.proteins ?? [])
  }, [profile, editing])

  const save = async () => {
    await update.mutateAsync({
      displayName: displayName.trim() || profile.displayName,
      cowName: cowName.trim() || null,
      streakGoal: profile.streakGoal,
      onboarding: {
        plantFrequency: frequency,
        climateFamiliarity: familiarity,
        proteins,
      },
    })
    setEditing(false)
  }

  if (!editing) {
    return (
      <section className="mx-6 my-5 rounded-card border border-ink bg-paper-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-[15px] text-ink">About you</h2>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-pill border border-ink px-3 py-1 font-mono text-[13px] text-ink transition-transform active:scale-95"
          >
            <PencilSimple size={14} aria-hidden />
            Edit
          </button>
        </div>
        <Row label="Your name" value={profile.displayName} />
        <Row label="Your cow" value={profile.cowName?.trim() || 'Moo'} />
        <Row label="Plant-based meals" value={FREQ.find((f) => f.v === frequency)?.label ?? '—'} />
        <Row label="Usual proteins" value={proteins.join(', ') || '—'} />
        <Row label="Climate familiarity" value={FAMILIARITY.find((f) => f.v === familiarity)?.label ?? '—'} />
      </section>
    )
  }

  return (
    <section className="mx-6 my-5 rounded-card border border-ink bg-paper-2 p-4">
      <h2 className="mb-3 font-mono text-[15px] text-ink">About you</h2>

      <Field label="Your name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-card border border-ink bg-paper-2 px-3 py-2 font-mono text-[14px] text-ink outline-none"
        />
      </Field>

      <Field label="Your cow’s name">
        <input
          value={cowName}
          onChange={(e) => setCowName(e.target.value)}
          placeholder="Moo"
          className="w-full rounded-card border border-ink bg-paper-2 px-3 py-2 font-mono text-[14px] text-ink outline-none placeholder:text-muted"
        />
      </Field>

      <Field label="How often do you eat plant-based meals?">
        <div className="flex flex-wrap gap-2">
          {FREQ.map((f) => (
            <Chip key={f.v} label={f.label} selected={frequency === f.v} onClick={() => setFrequency(f.v)} />
          ))}
        </div>
      </Field>

      <Field label="Usual proteins">
        <div className="flex flex-wrap gap-2">
          {PROTEINS.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={proteins.includes(p)}
              onClick={() => setProteins((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))}
            />
          ))}
        </div>
      </Field>

      <Field label="Climate familiarity">
        <div className="flex flex-wrap gap-2">
          {FAMILIARITY.map((f) => (
            <Chip key={f.v} label={f.label} selected={familiarity === f.v} onClick={() => setFamiliarity(f.v)} />
          ))}
        </div>
      </Field>

      <div className="mt-4 flex gap-2">
        <PixelButton variant="ghost" full onClick={() => setEditing(false)}>
          Cancel
        </PixelButton>
        <PixelButton variant="primary" full onClick={save} disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save'}
        </PixelButton>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 font-mono text-[13px] text-muted">{label}</div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink/12 py-2.5 last:border-0">
      <span className="font-mono text-[14px] text-muted">{label}</span>
      <span className="text-right font-mono text-[14px] text-ink">{value}</span>
    </div>
  )
}
