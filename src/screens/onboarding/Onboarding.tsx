import { useNavigate } from 'react-router-dom'
import { OnboardingShell } from './OnboardingShell'
import { deriveStartingDiet, useOnboarding } from './onboardingStore'
import { PixelButton } from '@/components/PixelButton'
import { Chip } from '@/components/Chip'
import { MooCow } from '@/components/MooCow'
import { Sprite } from '@/components/Sprite'
import { Avatar } from '@/components/Avatar'
import { AVATAR_COUNT, animalName } from '@/content/animals'
import { startingImpact, usAverageImpact } from '@/lib/impact'
import { useCompleteOnboarding } from '@/hooks/useData'

export function Onboarding() {
  const s = useOnboarding()
  switch (s.step) {
    case 1: return <Step1 />
    case 2: return <Step2 />
    case 3: return <Step3 />
    case 4: return <Step4 />
    case 5: return <Step5 />
    case 6: return <Step6 />
    case 7: return <Step7 />
    case 8: return <Step8 />
    default: return <Step1 />
  }
}

// 1 — Headline + name + magic-link
function Step1() {
  const { name, email, setField, next } = useOnboarding()
  const validEmail = /.+@.+\..+/.test(email)
  const valid = name.trim().length > 0 && validEmail
  return (
    <OnboardingShell
      hideBack
      footer={
        <PixelButton full disabled={!valid} onClick={next}>
          Join the challenge
        </PixelButton>
      }
    >
      <div className="flex flex-col items-center pt-4 text-center">
        <MooCow mood="idle" scale={11} />
        <h1 className="mt-5 max-w-[16ch] font-pixel text-[26px] leading-tight text-ink">Small meals. Big moo-ves.</h1>
        <p className="mt-3 max-w-[32ch] font-body text-[16px] leading-relaxed text-ink-soft">
          Join the cohort’s 7-day plant-based challenge. Every meal makes your cow a little happier and our shared
          world a little greener.
        </p>
        <label className="mt-6 w-full text-left">
          <span className="font-body text-sm font-extrabold text-ink">Name</span>
          <input
            autoComplete="name"
            value={name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="What should the herd call you?"
            className="mt-1 w-full rounded-pixel border-2 border-ink bg-paper-2 px-4 py-3 font-body text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </label>
        <label className="mt-4 w-full text-left">
          <span className="font-body text-sm font-extrabold text-ink">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="you@email.com"
            className="mt-1 w-full rounded-pixel border-2 border-ink bg-paper-2 px-4 py-3 font-body text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </label>
        <p className="mt-2 self-start font-body text-sm text-ink-soft">
          We’ll send a magic link — no password to forget.
        </p>
      </div>
    </OnboardingShell>
  )
}

// 2 — Why this matters
function Step2() {
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
        <p className="font-pixel text-xl leading-tight text-ink">Food is ~1/4 of global emissions.</p>
        <p className="font-body text-[17px] leading-relaxed text-ink-soft">
          The good news: what’s on your plate is one of the fastest things you can change. Every plant-based meal helps
          the whole ecosystem — and your cow — thrive.
        </p>
      </div>
    </OnboardingShell>
  )
}

function EcosystemScene() {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-pixel border-2 border-ink bg-gradient-to-b from-sky-gold to-grass-300">
      <div className="absolute inset-x-0 bottom-0 h-14 bg-grass-500" />
      <div className="absolute bottom-8 left-6">
        <MooCow mood="idle" scale={5} />
      </div>
      <span className="absolute bottom-9 right-8 text-3xl">🌳</span>
      <span className="absolute bottom-10 right-20 text-2xl">🌱</span>
      <span className="absolute right-6 top-4 text-2xl">☀️</span>
      <span className="absolute left-8 top-6 text-xl">☁️</span>
    </div>
  )
}

// 3 — plant frequency
const FREQ = [
  { v: 'never', label: 'Never' },
  { v: 'rarely', label: 'Rarely' },
  { v: 'sometimes', label: 'Sometimes' },
  { v: 'often', label: 'Most days' },
  { v: 'mostly', label: 'I’m already veggie/vegan' },
] as const
function Step3() {
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

// 4 — proteins, grouped
const PROTEIN_GROUPS = [
  { label: 'Meat & seafood', items: ['Beef', 'Pork', 'Chicken', 'Fish'] },
  { label: 'Vegetarian', items: ['Eggs', 'Dairy'] },
  { label: 'Plant-based', items: ['Tofu', 'Beans', 'Lentils', 'Nuts'] },
]
function Step4() {
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
            <h2 className="mb-2 font-body text-sm font-extrabold uppercase tracking-wide text-ink">{g.label}</h2>
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

// 5 — climate familiarity
const FAMILIARITY = [
  { v: 'new', label: 'New to this', sub: 'Teach me everything.' },
  { v: 'somewhat', label: 'Somewhat familiar', sub: 'I know the basics.' },
  { v: 'very', label: 'Very familiar', sub: 'I could give the talk.' },
] as const
function Step5() {
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

// 6 — Your Starting Impact
function Step6() {
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
        <div className="rounded-pixel border-2 border-ink bg-paper-2 px-6 py-5 text-center">
          <div className="font-pixel text-[34px] leading-none text-ink">{impact.weeklyLbs}</div>
          <div className="mt-1 font-body text-[15px] text-ink-soft">lbs CO₂ / week from your meals</div>
        </div>

        <ImpactBars mine={impact.weeklyLbs} avg={usAvg.weeklyLbs} />
        <p className="font-body text-[16px] leading-relaxed text-ink-soft">{comparison}</p>

        <div className="w-full rounded-pixel border-2 border-ink bg-lime-400/60 px-5 py-4">
          <p className="font-body text-[16px] text-ink">
            Swapping just <b>3 meals</b> to plant-based could cut that by about{' '}
            <b className="font-pixel">{impact.swap3ReductionPct}%</b>.
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
    { label: 'You', value: mine, fill: 'bg-lime-400' },
    { label: 'Average American', value: avg, fill: 'bg-ink/25' },
  ]
  return (
    <div className="flex flex-col gap-3" role="img" aria-label={`You ${mine} lbs, average American ${avg} lbs per week`}>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-body text-sm font-extrabold text-ink">{r.label}</span>
            <span className="font-pixel text-xs text-ink-soft">{r.value} lbs</span>
          </div>
          <div className="h-6 w-full rounded-pixel-sm border-2 border-ink bg-paper-2">
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

// 7 — choose avatar
function Step7() {
  const { avatarIndex, setField, next } = useOnboarding()
  return (
    <OnboardingShell
      tone="field"
      title="Pick your critter"
      subtitle="This is you on the leaderboard. (Placeholders for now.)"
      footer={
        <PixelButton full disabled={avatarIndex === null} onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: AVATAR_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setField('avatarIndex', i)}
            aria-label={animalName(i)}
            className={`grid place-items-center rounded-pixel border-2 p-1 transition-transform active:scale-95 ${
              avatarIndex === i ? 'border-ink bg-lime-400 shadow-pixel-sm' : 'border-ink/30 bg-paper-2/70'
            }`}
          >
            <Sprite index={i} size={54} />
          </button>
        ))}
      </div>
    </OnboardingShell>
  )
}

// 8 — meet your cow
function Step8() {
  const nav = useNavigate()
  const s = useOnboarding()
  const complete = useCompleteOnboarding()
  const avatar = s.avatarIndex ?? 0

  const start = async () => {
    await complete.mutateAsync({
      displayName: s.name.trim() || s.email.split('@')[0] || 'Cohort Cow',
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
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid h-44 w-full place-items-center rounded-pixel border-2 border-ink bg-gradient-to-b from-grass-300 to-grass-500">
          <MooCow mood="idle" scale={10} />
        </div>
        <div className="flex items-center gap-3 rounded-pixel border-2 border-ink bg-paper-2 px-4 py-3">
          <Avatar index={avatar} size="md" />
          <p className="text-left font-body text-[15px] leading-relaxed text-ink-soft">
            This is Moo. Every plant-based meal you log keeps Moo happy — and the planet a little greener all week.
          </p>
        </div>
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
      className={`flex w-full items-center justify-between rounded-pixel border-2 border-ink px-4 py-4 text-left transition-transform active:scale-[0.98] ${
        selected ? 'bg-lime-400 shadow-pixel' : 'bg-paper-2'
      }`}
    >
      <span>
        <span className="block font-body text-[17px] font-extrabold text-ink">{label}</span>
        {sub && <span className="block font-body text-sm text-ink-soft">{sub}</span>}
      </span>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full border-2 border-ink ${selected ? 'bg-ink text-paper' : ''}`}
      >
        {selected ? '✓' : ''}
      </span>
    </button>
  )
}
