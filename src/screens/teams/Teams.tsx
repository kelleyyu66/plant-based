import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MooCow } from '@/components/MooCow'
import { Avatar } from '@/components/Avatar'
import { ProgressBar } from '@/components/ProgressBar'
import { useMyProfile, useTeamMembers, useTeamStandings } from '@/hooks/useData'
import { ACCESSORIES, TEAM_POINTS_GOAL, nextAccessory, topUnlockedAccessory } from '@/content/seed'
import type { TeamStanding } from '@/lib/types'

const ACCESSORY_BADGE: Record<string, string> = { regular: '🐄', hat: '🎉', balloon: '🎈' }

export function Teams() {
  const { data: profile } = useMyProfile()
  const { data: standings } = useTeamStandings()
  const [selected, setSelected] = useState<string | null>(null)

  // Default selection to your own team.
  useEffect(() => {
    if (!selected && profile?.teamId) setSelected(profile.teamId)
  }, [profile?.teamId, selected])

  const selectedStanding = standings?.find((s) => s.team.id === selected)

  return (
    <div className="min-h-full bg-forest-900 pb-28 text-paper">
      <header className="sticky top-0 z-10 border-b-2 border-ink bg-forest-800 px-5 py-4">
        <h1 className="font-pixel text-lg text-paper">🐄 Teams</h1>
      </header>

      {/* Farm view */}
      <section className="px-4 py-4">
        <h2 className="mb-2 font-body text-xs font-extrabold uppercase tracking-wide text-lime-400">The farm</h2>
        <div className="grid grid-cols-2 gap-3">
          {standings?.map((s) => (
            <FarmPen
              key={s.team.id}
              standing={s}
              selected={selected === s.team.id}
              isMine={profile?.teamId === s.team.id}
              onSelect={() => setSelected(s.team.id)}
            />
          ))}
        </div>
      </section>

      {/* Team leaderboard */}
      <section className="mx-4 my-3 rounded-pixel border-2 border-black/30 bg-paper p-3 text-ink">
        <h2 className="mb-1 font-pixel text-base text-ink">Team leaderboard</h2>
        {standings?.map((s, i) => (
          <button
            key={s.team.id}
            onClick={() => setSelected(s.team.id)}
            className={`flex w-full items-center gap-3 border-b border-black/10 px-1 py-2.5 text-left ${
              profile?.teamId === s.team.id ? 'rounded-pixel bg-lime-400/20' : ''
            }`}
          >
            <span className="w-6 text-center font-pixel text-sm text-ink-soft">{i + 1}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink" style={{ background: s.team.color }}>
              {ACCESSORY_BADGE[topUnlockedAccessory(s.points).spriteVariant]}
            </span>
            <div className="flex-1">
              <div className="font-body font-extrabold text-ink">{s.team.name}</div>
              <div className="font-body text-xs text-ink-soft">
                {s.points} points · {s.members} members
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Selected team detail: goal, accessory ladder, members */}
      {selectedStanding && <TeamDetail standing={selectedStanding} />}
    </div>
  )
}

function FarmPen({
  standing,
  selected,
  isMine,
  onSelect,
}: {
  standing: TeamStanding
  selected: boolean
  isMine: boolean
  onSelect: () => void
}) {
  const acc = topUnlockedAccessory(standing.points)
  const badge = acc.spriteVariant === 'regular' ? '' : ACCESSORY_BADGE[acc.spriteVariant]
  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center rounded-pixel border-2 p-2 transition-transform active:scale-95 ${
        selected ? 'border-lime-400 shadow-pixel' : 'border-black/30'
      }`}
    >
      <div className="relative grid h-20 w-full place-items-center overflow-hidden rounded-pixel-sm border-2 border-ink/40 bg-grass-500">
        <MooCow mood="idle" scale={4} />
        {badge && <span className="absolute right-1 top-1 text-lg">{badge}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-1 font-body text-sm font-extrabold text-paper">
        {standing.team.captainName}
        {isMine && <span className="rounded bg-lime-400 px-1 text-[9px] text-ink">YOU</span>}
      </div>
      <div className="font-body text-xs text-paper/60">{standing.points} pts</div>
    </button>
  )
}

function TeamDetail({ standing }: { standing: TeamStanding }) {
  const nav = useNavigate()
  const { data: members } = useTeamMembers(standing.team.id)
  const next = nextAccessory(standing.points)

  return (
    <section className="mx-4 my-3 space-y-4 rounded-pixel border-2 border-black/30 bg-forest-800 p-4">
      <div>
        <h2 className="font-pixel text-base text-paper">{standing.team.name}</h2>
        <div className="mb-1 mt-2 flex justify-between font-body text-sm">
          <span className="font-bold">Team goal</span>
          <span className="text-paper/70">
            {standing.points}/{TEAM_POINTS_GOAL}
          </span>
        </div>
        <ProgressBar value={standing.points} max={TEAM_POINTS_GOAL} />
        {next && (
          <p className="mt-1.5 font-body text-xs text-paper/70">
            {next.thresholdPoints - standing.points} points until <b>{next.name}</b> unlocks.
          </p>
        )}
      </div>

      {/* Accessory ladder */}
      <div>
        <h3 className="mb-2 font-body text-xs font-extrabold uppercase tracking-wide text-lime-400">
          Cow accessories
        </h3>
        <div className="space-y-2">
          {ACCESSORIES.map((a) => {
            const unlocked = standing.points >= a.thresholdPoints
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-pixel border-2 px-3 py-2 ${
                  unlocked ? 'border-lime-400 bg-lime-400/10' : 'border-black/30 bg-black/20 opacity-70'
                }`}
              >
                <span className="text-xl">{unlocked ? ACCESSORY_BADGE[a.spriteVariant] : '🔒'}</span>
                <div className="flex-1">
                  <div className="font-body text-sm font-extrabold text-paper">{a.name}</div>
                  <div className="font-body text-xs text-paper/60">{a.description}</div>
                </div>
                <span className="font-pixel text-xs text-paper/70">{a.thresholdPoints}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Members */}
      <div>
        <h3 className="mb-2 font-body text-xs font-extrabold uppercase tracking-wide text-lime-400">
          Herd ({members?.length ?? 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {members?.map((m) => (
            <button
              key={m.id}
              onClick={() => nav(`/profile/${m.id}`)}
              className="flex items-center gap-1.5 rounded-full border-2 border-black/30 bg-forest-700 py-1 pl-1 pr-3"
            >
              <Avatar index={m.avatarIndex} size="sm" />
              <span className="font-body text-xs text-paper">{m.displayName}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
