import { useState } from 'react'
import { PixelButton } from '@/components/PixelButton'
import { Chip } from '@/components/Chip'
import { ProgressBar } from '@/components/ProgressBar'
import { Card } from '@/components/Card'
import { StatRow } from '@/components/StatRow'
import { Avatar } from '@/components/Avatar'
import { MooCow } from '@/components/MooCow'
import { BottomSheet } from '@/components/BottomSheet'
import { EmptyState } from '@/components/EmptyState'
import { Confetti } from '@/components/Confetti'
import { AVATAR_COUNT, animalName } from '@/content/animals'
import { MEAL_TIERS, TIER_LABEL } from '@/lib/types'

/** Dev-only gallery for the pixel UI kit. Phase 0 verification. */
export function KitchenSink() {
  const [sheet, setSheet] = useState(false)
  const [sel, setSel] = useState('vegan')
  const [fire, setFire] = useState(false)
  const [n, setN] = useState(1)

  return (
    <div className="min-h-full w-full max-w-phone bg-forest-900 px-4 py-6 text-paper">
      <Confetti fire={fire} />
      <h1 className="mb-1 font-pixel text-2xl text-lime-400">Kitchen Sink</h1>
      <p className="mb-6 font-body text-sm text-paper/70">Pixel UI kit — Phase 0</p>

      <Section title="Moo">
        <div className="flex items-end gap-6">
          <div className="text-center">
            <MooCow mood="idle" />
            <div className="mt-1 text-xs">idle</div>
          </div>
          <div className="text-center">
            <MooCow mood="dance" />
            <div className="mt-1 text-xs">dance</div>
          </div>
          <div className="text-center">
            <MooCow mood="sleep" />
            <div className="mt-1 text-xs">sleep</div>
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <PixelButton variant="primary">Primary</PixelButton>
          <PixelButton variant="dark">Dark</PixelButton>
          <PixelButton variant="ghost" className="text-paper border-paper">
            Ghost
          </PixelButton>
          <PixelButton disabled>Disabled</PixelButton>
        </div>
      </Section>

      <Section title="Tier chips">
        <div className="flex flex-wrap gap-2">
          {MEAL_TIERS.map((t) => (
            <Chip key={t} label={TIER_LABEL[t]} tier={t} selected={sel === t} onClick={() => setSel(t)} />
          ))}
        </div>
      </Section>

      <Section title="Progress">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Plant Meals Today</span>
              <span>{n}/3 meals</span>
            </div>
            <ProgressBar value={n} max={3} segments={3} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Total Points</span>
              <span>{n * 40}/140</span>
            </div>
            <ProgressBar value={n * 40} max={140} />
          </div>
          <PixelButton variant="primary" onClick={() => setN((v) => (v % 3) + 1)}>
            Bump progress
          </PixelButton>
        </div>
      </Section>

      <Section title="Impact stats">
        <div className="space-y-2">
          <StatRow icon="🚗" label="fewer miles driven" value="739" />
          <StatRow icon="🌳" label="trees planted" value="13" />
          <StatRow icon="💧" label="showers saved (in water usage)" value="11,828" />
        </div>
      </Section>

      <Section title="Cards & sheet">
        <Card tone="forest" className="mb-3">
          <p className="font-body text-sm">A forest card sits on the Home canvas.</p>
        </Card>
        <div className="flex gap-3">
          <PixelButton variant="primary" onClick={() => setSheet(true)}>
            Open sheet
          </PixelButton>
          <PixelButton variant="dark" onClick={() => setFire((f) => !f)}>
            🎉 Confetti
          </PixelButton>
        </div>
      </Section>

      <Section title={`All ${AVATAR_COUNT} avatars`}>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: AVATAR_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Avatar index={i} size="md" />
              <span className="mt-0.5 text-[9px] text-paper/60">{animalName(i)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Empty state">
        <Card tone="light">
          <EmptyState message="No meals yet. Be the first — Moo is watching, hopefully." />
        </Card>
      </Section>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Add item">
        <p className="font-body text-ink-soft">The logging form lives here in Phase 3.</p>
      </BottomSheet>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-pixel text-sm uppercase tracking-wide text-paper/80">{title}</h2>
      {children}
    </section>
  )
}
