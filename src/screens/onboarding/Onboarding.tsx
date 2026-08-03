import { useNavigate } from 'react-router-dom'
import { OnboardingShell } from './OnboardingShell'
import { deriveStartingDiet, useOnboarding } from './onboardingStore'
import { PixelButton } from '@/components/PixelButton'
import { Chip } from '@/components/Chip'
import { H1 } from '@/components/H1'
import { MeetMooScene } from '@/components/MeetMooScene'
import { Sprite } from '@/components/Sprite'
import { AVATAR_COUNT, animalName } from '@/content/animals'
import { startingImpact, usAverageImpact } from '@/lib/impact'
import { useCompleteOnboarding, useSignUpWithEmail } from '@/hooks/useData'

export function Onboarding() {
  const s = useOnboarding()

  switch (s.step) {
    // Name/email first, then pick a critter, then the eating questionnaire.
    case 1: return <BasicInfo />
    case 2: return <PickCritter />
    case 3: return <WhyThisMatters />
    case 4: return <PlantFrequency />
    case 5: return <Proteins />
    case 6: return <ClimateFamiliarity />
    case 7: return <StartingImpact />
    case 8: return <MeetYourCow />
    default: return <PickCritter />
  }
}

// 2 — Basic info: name + magic-link
function BasicInfo() {
  const { name, email, setField, next } = useOnboarding()
  const auth = useSignUpWithEmail()
  const validEmail = /.+@.+\..+/.test(email)
  const valid = name.trim().length > 0 && validEmail
  const join = async () => {
    try {
      await auth.mutateAsync(email.trim())
      next()
    } catch {
      // The mutation logs the Supabase error; keep the user on this step so they can retry.
    }
  }
  return (
    <OnboardingShell
      footer={
        <PixelButton full disabled={!valid || auth.isPending} onClick={join}>
          {auth.isPending ? 'Sending link…' : 'Join the challenge'}
        </PixelButton>
      }
    >
      <div className="flex flex-col items-center text-center">
        <H1 className="max-w-[16ch]">Small meals. Big moo-ves.</H1>
        <p className="mt-3 max-w-[34ch] font-mono text-[14px] leading-relaxed text-muted">
          Join the cohort’s 7-day plant-based challenge. Every meal makes your cow a little happier and our shared
          world a little greener.
        </p>
        <label className="mt-6 w-full text-left">
          <span className="font-mono text-sm font-medium text-ink">Name</span>
          <input
            autoComplete="name"
            value={name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="What should the herd call you?"
            className="mt-1 w-full rounded-card border border-ink bg-paper-2 px-4 py-3 font-mono text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </label>
        <label className="mt-4 w-full text-left">
          <span className="font-mono text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="you@email.com"
            className="mt-1 w-full rounded-card border border-ink bg-paper-2 px-4 py-3 font-mono text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </label>
        <p className="mt-2 self-start font-mono text-sm text-muted">
          We’ll send a magic link — no password to forget.
        </p>
        {auth.isError && (
          <p className="mt-2 self-start font-mono text-sm text-red-700" role="alert">
            We couldn’t send the sign-in link. Please check your email and try again.
          </p>
        )}
      </div>
    </OnboardingShell>
  )
}

// 3 — Why this matters
function WhyThisMatters() {
  const { next } = useOnboarding()
  return (
    <OnboardingShell
      title="Why this matters"
      footer={
        <PixelButton full onClick={next}>
          Count me in
        </PixelButton>
      }
    >
      <div className="flex flex-col items-start gap-5 text-left">
        <EcosystemScene />
        <p className="font-mono text-[17px] leading-snug text-ink">Food is ~1/4 of global emissions.</p>
        <p className="font-mono text-[14px] leading-relaxed text-muted">
          The good news: what’s on your plate is one of the fastest things you can change. Every plant-based meal helps
          the whole ecosystem — and your cow — thrive.
        </p>
      </div>
    </OnboardingShell>
  )
}

/** Hand-drawn cow at the dinner table. */
function EcosystemScene() {
  return (
    <img
      src="/onboarding/cow-eating.png"
      alt="Moo the cow sitting down to a plate of vegetables"
      className="mx-auto w-[min(78%,300px)] object-contain"
      draggable={false}
    />
  )
}

// 4 — plant frequency
const FREQ = [
  { v: 'never', label: 'Never' },
  { v: 'rarely', label: 'Rarely' },
  { v: 'sometimes', label: 'Sometimes' },
  { v: 'often', label: 'Most days' },
  { v: 'mostly', label: 'I’m already veggie/vegan' },
] as const
function PlantFrequency() {
  const { plantFrequency, setField, next } = useOnboarding()
  return (
    <OnboardingShell
      tone="field"
      title="How often do you eat plant-based meals?"
      footer={
        <PixelButton full disabled={!plantFrequency} onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="flex flex-col gap-3">
        {FREQ.map((f) => (
          <SelectRow
            key={f.v}
            label={f.label}
            selected={plantFrequency === f.v}
            onClick={() => setField('plantFrequency', f.v)}
          />
        ))}
      </div>
    </OnboardingShell>
  )
}

// 5 — proteins, grouped
const PROTEIN_GROUPS = [
  { label: 'Meat & seafood', items: ['Beef', 'Pork', 'Chicken', 'Fish'] },
  { label: 'Vegetarian', items: ['Eggs', 'Dairy'] },
  { label: 'Plant-based', items: ['Tofu', 'Beans', 'Lentils', 'Nuts'] },
]
function Proteins() {
  const { proteins, toggleProtein, next } = useOnboarding()
  return (
    <OnboardingShell
      tone="field"
      title="What proteins do you usually eat?"
      subtitle="Pick all that apply — Moo won’t judge."
      footer={
        <PixelButton full disabled={proteins.length === 0} onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="flex flex-col gap-5">
        {PROTEIN_GROUPS.map((g) => (
          <div key={g.label}>
            <h2 className="mb-2 font-mono text-[12px] uppercase tracking-wide text-muted">{g.label}</h2>
            <div className="flex flex-wrap gap-2">
              {g.items.map((p) => (
                <Chip key={p} label={p} selected={proteins.includes(p)} onClick={() => toggleProtein(p)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </OnboardingShell>
  )
}

// 6 — climate familiarity
const FAMILIARITY = [
  { v: 'new', label: 'New to this', sub: 'Teach me everything.' },
  { v: 'somewhat', label: 'Somewhat familiar', sub: 'I know the basics.' },
  { v: 'very', label: 'Very familiar', sub: 'I could give the talk.' },
] as const
function ClimateFamiliarity() {
  const { climateFamiliarity, setField, next } = useOnboarding()
  return (
    <OnboardingShell
      tone="field"
      title="How familiar are you with food’s climate impact?"
      footer={
        <PixelButton full disabled={!climateFamiliarity} onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="flex flex-col gap-3">
        {FAMILIARITY.map((f) => (
          <SelectRow
            key={f.v}
            label={f.label}
            sub={f.sub}
            selected={climateFamiliarity === f.v}
            onClick={() => setField('climateFamiliarity', f.v)}
          />
        ))}
      </div>
    </OnboardingShell>
  )
}

// 7 — Your Starting Impact
function StartingImpact() {
  const { plantFrequency, next } = useOnboarding()
  const impact = startingImpact(plantFrequency ?? 'sometimes')
  const usAvg = usAverageImpact()

  // Never guilt: a user can land above the average, so the framing has three states.
  const diffPct = (impact.weeklyLbs - usAvg.weeklyLbs) / usAvg.weeklyLbs
  const comparison =
    diffPct < -0.02
      ? 'You’re already under the US average. Nice start.'
      : diffPct > 0.02
        ? 'You’re a bit above the US average — which means you’ve got the most to gain here.'
        : 'You’re right around the US average.'

  return (
    <OnboardingShell
      title="Your starting impact"
      footer={
        <PixelButton full onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-card border border-ink bg-paper-2 px-6 py-5 text-center">
          <div className="font-mono text-[34px] leading-none text-ink">{impact.weeklyLbs}</div>
          <div className="mt-1 font-mono text-[15px] text-muted">lbs CO₂ / week from your meals</div>
        </div>

        <ImpactBars mine={impact.weeklyLbs} avg={usAvg.weeklyLbs} />
        <p className="font-mono text-[16px] leading-relaxed text-muted">{comparison}</p>

        <div className="w-full rounded-card border border-ink bg-grass-pale/60 px-5 py-4">
          <p className="font-mono text-[16px] text-ink">
            Swapping just <b>3 meals</b> to plant-based could cut that by about{' '}
            <b className="font-mono">{impact.swap3ReductionPct}%</b>.
          </p>
        </div>
      </div>
    </OnboardingShell>
  )
}

/** Two pixel bars: you vs the average American. design.md tokens, no chart lib. */
function ImpactBars({ mine, avg }: { mine: number; avg: number }) {
  const max = Math.max(mine, avg)
  const rows = [
    { label: 'You', value: mine, fill: 'bg-grass-pale' },
    { label: 'Average American', value: avg, fill: 'bg-ink/25' },
  ]
  return (
    <div className="flex flex-col gap-3" role="img" aria-label={`You ${mine} lbs, average American ${avg} lbs per week`}>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-sm font-medium text-ink">{r.label}</span>
            <span className="font-mono text-xs text-muted">{r.value} lbs</span>
          </div>
          <div className="h-6 w-full rounded-card border border-ink bg-paper-2">
            <div
              className={`h-full ${r.fill}`}
              style={{ width: `${Math.max(4, Math.round((r.value / max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// 1 — choose avatar (first: pick who you are)
function PickCritter() {
  const { avatarIndex, setField, next } = useOnboarding()
  return (
    <OnboardingShell
      tone="field"
      title="Pick your critter"
      subtitle="This is you on the leaderboard and in the menu bar."
      footer={
        <PixelButton full disabled={avatarIndex === null} onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: AVATAR_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setField('avatarIndex', i)}
            aria-label={animalName(i)}
            className={`flex flex-col items-center gap-1 rounded-card border px-1 py-2 transition-transform active:scale-95 ${
              avatarIndex === i ? 'border-ink bg-grass-pale' : 'border-ink/30 bg-paper-2'
            }`}
          >
            <Sprite index={i} size={44} />
            <span className="w-full truncate text-center font-mono text-[9px] leading-none text-muted">
              {animalName(i)}
            </span>
          </button>
        ))}
      </div>
    </OnboardingShell>
  )
}

// 8 — meet your cow
function MeetYourCow() {
  const nav = useNavigate()
  const s = useOnboarding()
  const complete = useCompleteOnboarding()
  const avatar = s.avatarIndex ?? 0

  const start = async () => {
    await complete.mutateAsync({
      displayName: s.name.trim() || s.email.split('@')[0] || 'Cohort Cow',
      email: s.email.trim() || null,
      cowName: null, // the cow is just Moo
      avatarIndex: avatar,
      teamId: null,
      startingDiet: deriveStartingDiet(s.plantFrequency),
      onboarding: {
        plantFrequency: s.plantFrequency ?? 'sometimes',
        proteins: s.proteins,
        climateFamiliarity: s.climateFamiliarity ?? 'new',
      },
      streakGoal: 7,
    })
    s.reset()
    nav('/home', { replace: true })
  }

  return (
    <OnboardingShell
      title="Meet your cow, Moo"
      footer={
        <PixelButton full onClick={start} disabled={complete.isPending}>
          {complete.isPending ? 'Waking Moo…' : 'Start challenge'}
        </PixelButton>
      }
    >
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Sits straight on the canvas — no frame, no backdrop. */}
        <MeetMooScene size={320} />
        <p className="max-w-[34ch] font-mono text-[15px] leading-relaxed text-muted">
          This is Moo. Every plant-based meal you log keeps Moo happy — and the planet a little greener all week.
        </p>
      </div>
    </OnboardingShell>
  )
}

// shared select row
function SelectRow({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string
  sub?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-card border border-ink px-4 py-4 text-left transition-transform active:scale-[0.98] ${
        selected ? 'bg-grass-pale ' : 'bg-paper-2'
      }`}
    >
      <span>
        <span className="block font-mono text-[17px] font-medium text-ink">{label}</span>
        {sub && <span className="block font-mono text-sm text-muted">{sub}</span>}
      </span>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full border border-ink ${selected ? 'bg-ink text-ink' : ''}`}
      >
        {selected ? '✓' : ''}
      </span>
    </button>
  )
}
