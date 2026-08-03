import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PencilSimple } from '@phosphor-icons/react'
import { MealCard } from '@/components/MealCard'
import { Sprite } from '@/components/Sprite'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { H1 } from '@/components/H1'
import { AboutYou } from './AboutYou'
import { CritterPicker } from './CritterPicker'
import { NotificationBell } from '@/components/Notifications'
import { useAppNotifications } from '@/hooks/useAppNotifications'
import { useMyProfile, useUserMeals, useUserPoints } from '@/hooks/useData'
import { earnedPointsByMeal } from '@/lib/dailyQuest'
import { data } from '@/lib/dataProvider'
import { cowNameOr } from '@/content/cowNames'

export function Profile() {
  const nav = useNavigate()
  const { data: profile } = useMyProfile()
  const { data: meals } = useUserMeals('me')
  const { data: points = 0 } = useUserPoints('me')
  const notifications = useAppNotifications()
  const earned = useMemo(() => earnedPointsByMeal(meals ?? []), [meals])
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!profile) return null

  const signOut = async () => {
    await data.signOut()
    location.href = '/onboarding'
  }

  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <H1>you</H1>
        <NotificationBell items={notifications.items} dismiss={notifications.dismiss} clearAll={notifications.clearAll} />
      </header>

      {/* Identity — the standing critter (no circle crop), details stacked.
          The critter is tappable to swap it, with a pencil badge to signal that. */}
      <div className="flex flex-col items-center gap-2 px-6 py-5 text-center">
        <button
          onClick={() => setPickerOpen(true)}
          aria-label="Change your critter"
          className="relative transition-transform active:scale-95"
        >
          <Sprite index={profile.avatarIndex} size={96} />
          <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border border-ink bg-paper-2 text-ink">
            <PencilSimple size={14} aria-hidden />
          </span>
        </button>
        <div className="flex flex-col gap-0.5">
          <div className="font-mono text-[19px] text-ink">{profile.displayName}</div>
          {profile.email && <div className="font-mono text-[14px] text-muted">{profile.email}</div>}
          <div className="font-mono text-[14px] text-muted">Cohort challenger</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-6 grid grid-cols-2 gap-3">
        <Stat value={`${points}`} label="points" />
        <Stat value={`${meals?.length ?? 0}`} label="meals" />
      </div>

      {/* Editable so a wrong tap during onboarding isn't permanent. */}
      <AboutYou profile={profile} />

      {/* Cookbook link */}
      <div className="mx-6 my-5">
        <PixelButton full variant="primary" onClick={() => nav('/education')}>
          Moo’s little cookbook
        </PixelButton>
      </div>

      {/* My meals */}
      <h2 className="mx-6 mb-2 font-mono text-[15px] text-ink">Your meals</h2>
      {meals && meals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-6">
          {meals.map((m) => (
            <MealCard key={m.id} meal={m} author={profile} points={earned.get(m.id)} onClick={() => nav(`/meals/${m.id}`)} />
          ))}
        </div>
      ) : (
        <EmptyState message={`No meals logged yet. Tap the Log button and wake ${cowNameOr(profile.cowName)} up!`} />
      )}

      <div className="flex justify-center px-6 py-10">
        <button
          onClick={signOut}
          className="rounded-pill border border-alert bg-alert-pale px-8 py-2.5 font-mono text-[13px] text-alert transition-transform active:scale-95"
        >
          Sign out
        </button>
      </div>

      <CritterPicker open={pickerOpen} current={profile.avatarIndex} onClose={() => setPickerOpen(false)} />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-ink bg-paper-2 px-2 py-3 text-center">
      <div className="font-mono text-[20px] text-ink">{value}</div>
      <div className="font-mono text-[12px] text-muted">{label}</div>
    </div>
  )
}

