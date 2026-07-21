import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { MealCard } from '@/components/MealCard'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { useMyProfile, useTeams, useUserMeals, useUserPoints } from '@/hooks/useData'
import { data } from '@/lib/dataProvider'
import { INDIVIDUAL_POINTS_GOAL } from '@/content/seed'

const FREQ_LABEL: Record<string, string> = {
  never: 'Never', rarely: 'Rarely', sometimes: 'A few times a week', often: 'Most days', mostly: 'Already veggie/vegan',
}
const FAM_LABEL: Record<string, string> = { new: 'New to this', somewhat: 'Somewhat familiar', very: 'Very familiar' }

export function Profile() {
  const nav = useNavigate()
  const { data: profile } = useMyProfile()
  const { data: meals } = useUserMeals('me')
  const { data: points = 0 } = useUserPoints('me')
  const { data: teams } = useTeams()

  if (!profile) return null
  const team = teams?.find((t) => t.id === profile.teamId)

  const signOut = async () => {
    await data.signOut()
    location.href = '/onboarding'
  }

  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="border-b-2 border-ink bg-paper-2 px-5 py-4">
        <h1 className="font-pixel text-lg text-ink">You</h1>
      </header>

      {/* Identity */}
      <div className="flex items-center gap-4 px-5 py-5">
        <Avatar index={profile.avatarIndex} size="lg" />
        <div>
          <div className="font-pixel text-lg text-ink">{profile.displayName}</div>
          <div className="font-body text-sm text-ink-soft">{team?.name}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 grid grid-cols-3 gap-3">
        <Stat value={`${points}`} label={`/ ${INDIVIDUAL_POINTS_GOAL} pts`} />
        <Stat value={`${profile.streakCurrent}🔥`} label="streak" />
        <Stat value={`${meals?.length ?? 0}`} label="meals" />
      </div>

      {/* Onboarding answers */}
      <section className="mx-5 my-4 rounded-pixel border-2 border-ink bg-paper-2 p-4">
        <h2 className="mb-2 font-pixel text-sm text-ink">About you</h2>
        <Row label="Plant-based meals" value={FREQ_LABEL[profile.onboarding?.plantFrequency ?? ''] ?? '—'} />
        <Row label="Usual proteins" value={profile.onboarding?.proteins.join(', ') || '—'} />
        <Row label="Climate familiarity" value={FAM_LABEL[profile.onboarding?.climateFamiliarity ?? ''] ?? '—'} />
        <Row label="Streak goal" value={`${profile.streakGoal} days`} />
      </section>

      {/* Cookbook link */}
      <div className="mx-5 my-4">
        <PixelButton full variant="primary" onClick={() => nav('/education')}>
          📖 Moo’s little cookbook
        </PixelButton>
      </div>

      {/* My meals */}
      <h2 className="mx-5 mb-2 font-pixel text-sm text-ink">Your meals</h2>
      {meals && meals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} author={profile} onClick={() => nav(`/meals/${m.id}`)} />
          ))}
        </div>
      ) : (
        <EmptyState message="No meals logged yet. Tap the Log button and wake Moo up!" />
      )}

      <div className="px-5 py-8">
        <button onClick={signOut} className="font-body text-sm text-berry-400 underline">
          Sign out
        </button>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-pixel border-2 border-ink bg-paper-2 px-2 py-3 text-center">
      <div className="font-pixel text-lg text-ink">{value}</div>
      <div className="font-body text-[11px] text-ink-soft">{label}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-black/10 py-2 last:border-0">
      <span className="font-body text-sm text-ink-soft">{label}</span>
      <span className="font-body text-sm font-bold text-ink">{value}</span>
    </div>
  )
}
