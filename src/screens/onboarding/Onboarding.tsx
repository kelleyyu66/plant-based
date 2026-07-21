import { useNavigate } from 'react-router-dom'
import { OnboardingShell } from './OnboardingShell'
import { deriveStartingDiet, useOnboarding } from './onboardingStore'
import { PixelButton } from '@/components/PixelButton'
import { Chip } from '@/components/Chip'
import { MooCow } from '@/components/MooCow'
import { Sprite } from '@/components/Sprite'
import { Avatar } from '@/components/Avatar'
import { AVATAR_COUNT, animalName } from '@/content/animals'
import { startingImpact } from '@/lib/impact'
import { useCompleteOnboarding, useTeams, useTeamMembers } from '@/hooks/useData'

const APP_NAME = 'Moo'

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
    case 9: return <Step9 />
    case 10: return <Step10 />
    default: return <Step1 />
  }
}

// 1 — App name + headline + magic-link
function Step1() {
  const { email, setField, next } = useOnboarding()
  const valid = /.+@.+\..+/.test(email)
  return (
    <OnboardingShell
      hideBack
      footer={
        <PixelButton full disabled={!valid} onClick={next}>
          Join the challenge
        </PixelButton>
      }
    >
      <div className="flex flex-col items-center pt-6 text-center">
        <MooCow mood="idle" scale={12} />
        <h1 className="mt-6 font-pixel text-[30px] leading-none text-ink">{APP_NAME}</h1>
        <p className="mt-3 max-w-[26ch] font-body text-[17px] font-semibold text-ink">
          Take care of a cow. Save the planet. Sort of.
        </p>
        <p className="mt-2 max-w-[28ch] font-body text-sm text-ink-soft">
          A 7-day plant-based challenge for the cohort. Log meals, grow your herd, out-plant your friends.
        </p>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="you@email.com"
          className="mt-7 w-full rounded-pixel border-2 border-ink bg-paper-2 px-4 py-3 font-body text-ink outline-none placeholder:text-muted"
        />
        <p className="mt-2 font-body text-xs text-ink-soft">We’ll send a magic link — no password to forget.</p>
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
      <div className="flex flex-col items-center gap-5 text-center">
        <EcosystemScene />
        <p className="font-pixel text-lg text-ink">Food is ~1/4 of global emissions.</p>
        <p className="max-w-[30ch] font-body text-[15px] text-ink-soft">
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
  { v: 'sometimes', label: 'A few times a week' },
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

// 4 — proteins
const PROTEIN_OPTIONS = ['Beef', 'Pork', 'Chicken', 'Fish', 'Eggs', 'Dairy', 'Tofu', 'Beans', 'Lentils', 'Nuts']
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
      <div className="flex flex-wrap gap-2">
        {PROTEIN_OPTIONS.map((p) => (
          <Chip key={p} label={p} selected={proteins.includes(p)} onClick={() => toggleProtein(p)} />
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
  return (
    <OnboardingShell
      title="Your starting impact"
      footer={
        <PixelButton full onClick={next}>
          Set my goal
        </PixelButton>
      }
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="rounded-pixel border-2 border-ink bg-paper-2 px-6 py-5">
          <div className="font-pixel text-[34px] leading-none text-ink">{impact.weeklyLbs}</div>
          <div className="mt-1 font-body text-sm text-ink-soft">lbs CO₂ / week from your meals</div>
        </div>
        <div className="w-full rounded-pixel border-2 border-ink bg-lime-400/60 px-5 py-4">
          <p className="font-body text-[15px] text-ink">
            Swapping just <b>3 meals</b> to plant-based could cut that by about{' '}
            <b className="font-pixel">{impact.swap3ReductionPct}%</b>.
          </p>
        </div>
        <p className="max-w-[28ch] font-body text-sm text-ink-soft">That’s the whole game. Small swaps, real dent.</p>
      </div>
    </OnboardingShell>
  )
}

// 7 — streak goal
const GOALS = [3, 5, 7] as const
function Step7() {
  const { streakGoal, setField, next } = useOnboarding()
  return (
    <OnboardingShell
      title="How many days in a row will you take care of Moo?"
      subtitle="Hit your goal for a bonus. Miss a day? Moo just naps — no guilt."
      footer={
        <PixelButton full disabled={!streakGoal} onClick={next}>
          Continue
        </PixelButton>
      }
    >
      <div className="flex justify-center gap-4">
        {GOALS.map((g) => (
          <button
            key={g}
            onClick={() => setField('streakGoal', g)}
            className={`flex h-28 w-24 flex-col items-center justify-center rounded-pixel border-2 border-ink transition-transform active:scale-95 ${
              streakGoal === g ? 'bg-lime-400 shadow-pixel' : 'bg-paper-2'
            }`}
          >
            <span className="font-pixel text-[32px] text-ink">{g}</span>
            <span className="font-body text-xs text-ink-soft">days</span>
          </button>
        ))}
      </div>
    </OnboardingShell>
  )
}

// 8 — choose avatar
function Step8() {
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

// 9 — join a team (farm view)
function Step9() {
  const { teamId, setField, next } = useOnboarding()
  const { data: teams } = useTeams()
  return (
    <OnboardingShell
      tone="field"
      title="Join a herd"
      subtitle="Tap a pen to meet the team. You’ll compete together for cow accessories."
      footer={
        <PixelButton full disabled={!teamId} onClick={next}>
          Join this herd
        </PixelButton>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {teams?.map((t) => (
          <TeamPen key={t.id} teamId={t.id} selected={teamId === t.id} onSelect={() => setField('teamId', t.id)} />
        ))}
      </div>
    </OnboardingShell>
  )
}

function TeamPen({ teamId, selected, onSelect }: { teamId: string; selected: boolean; onSelect: () => void }) {
  const { data: teams } = useTeams()
  const { data: members } = useTeamMembers(teamId)
  const team = teams?.find((t) => t.id === teamId)
  if (!team) return null
  const spots = Math.max(0, team.capacity - (members?.length ?? 0))
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center rounded-pixel border-2 p-3 transition-transform active:scale-95 ${
        selected ? 'border-ink shadow-pixel' : 'border-ink/40'
      }`}
      style={{ background: selected ? team.color : '#ffffffcc' }}
    >
      <div className="grid h-16 w-full place-items-center rounded-pixel-sm border-2 border-ink/30 bg-grass-500">
        <MooCow mood="idle" scale={3} />
      </div>
      <div className="mt-2 font-body text-sm font-extrabold text-ink">{team.captainName}’s Herd</div>
      <div className="font-body text-xs text-ink-soft">{spots} spots left</div>
    </button>
  )
}

// 10 — meet your cow
function Step10() {
  const nav = useNavigate()
  const s = useOnboarding()
  const complete = useCompleteOnboarding()
  const avatar = s.avatarIndex ?? 0

  const start = async () => {
    await complete.mutateAsync({
      displayName: s.displayName.trim() || s.email.split('@')[0] || 'Cohort Cow',
      avatarIndex: avatar,
      teamId: s.teamId!,
      startingDiet: deriveStartingDiet(s.plantFrequency),
      onboarding: {
        plantFrequency: s.plantFrequency ?? 'sometimes',
        proteins: s.proteins,
        climateFamiliarity: s.climateFamiliarity ?? 'new',
      },
      streakGoal: s.streakGoal ?? 7,
    })
    s.reset()
    nav('/home', { replace: true })
  }

  return (
    <OnboardingShell
      title="Meet your cow"
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
        <label className="w-full text-left">
          <span className="font-body text-sm font-bold text-ink">Your name</span>
          <input
            value={s.displayName}
            onChange={(e) => s.setField('displayName', e.target.value)}
            placeholder="What should the herd call you?"
            className="mt-1 w-full rounded-pixel border-2 border-ink bg-paper-2 px-4 py-3 font-body text-ink outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex items-center gap-3 rounded-pixel border-2 border-ink bg-paper-2 px-4 py-3">
          <Avatar index={avatar} size="md" />
          <p className="text-left font-body text-sm text-ink-soft">
            Every plant-based meal helps your cow thrive. Your team’s points unlock accessories — hats, balloons, a
            crown if you really commit.
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
        <span className="block font-body font-extrabold text-ink">{label}</span>
        {sub && <span className="block font-body text-xs text-ink-soft">{sub}</span>}
      </span>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full border-2 border-ink ${selected ? 'bg-ink text-paper' : ''}`}
      >
        {selected ? '✓' : ''}
      </span>
    </button>
  )
}
