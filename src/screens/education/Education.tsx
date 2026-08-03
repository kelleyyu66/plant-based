import { MapPin } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { DAILY_TIPS, PROTEINS, RESTAURANTS, TRADER_JOES_PICKS, YOUTUBE_CHANNELS } from '@/content/education'

export function Education() {
  const nav = useNavigate()
  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink bg-paper-2 px-4 py-3">
        <button onClick={() => nav(-1)} aria-label="Back" className="text-xl text-ink">
          ←
        </button>
        <span className="font-mono text-base text-ink">Moo’s little cookbook</span>
      </header>

      {/* A tip or two a day, easing into technique as the week goes on. */}
      <Section title="Tip of the day">
        <div className="space-y-3">
          {DAILY_TIPS.map((d) => (
            <div key={d.day} className="rounded-card border border-ink bg-paper-2 p-3">
              <div className="font-mono font-medium text-ink">Day {d.day}</div>
              <ul className="mt-1 space-y-1">
                {d.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 font-mono text-sm text-muted">
                    <span aria-hidden className="text-grass">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Protein table */}
      <Section title="Where to get your protein">
        <div className="overflow-hidden rounded-card border border-ink">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="bg-grass-pale text-ink">
                <th className="p-2 text-left font-medium">Protein</th>
                <th className="p-2 text-left font-medium">Allergen</th>
                <th className="p-2 text-left font-medium">Where</th>
              </tr>
            </thead>
            <tbody>
              {PROTEINS.map((p, i) => (
                <tr key={p.name} className={i % 2 ? 'bg-paper-2' : 'bg-cloud'}>
                  <td className="p-2 font-medium text-ink">{p.name}</td>
                  <td className="p-2 text-muted">{p.allergen}</td>
                  <td className="p-2 text-muted">{p.whereToBuy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="YouTube channels">
        <div className="space-y-2">
          {YOUTUBE_CHANNELS.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noreferrer" className="flex items-center justify-between rounded-card border border-ink bg-paper-2 p-3 font-mono font-medium text-ink transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <span>{channel.name}</span>
              <span aria-hidden="true" className="text-sm text-muted">▶</span>
            </a>
          ))}
        </div>
      </Section>

      {/* Trader Joe's */}
      <Section title="Trader Joe’s vegan picks">
        <div className="space-y-2">
          {TRADER_JOES_PICKS.map((t) => (
            <div key={t.item} className="rounded-card border border-ink bg-paper-2 p-3">
              <div className="font-mono font-medium text-ink">{t.item}</div>
              <p className="font-mono text-sm text-muted">{t.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Restaurants */}
      <Section title="Seattle vegan spots">
        <div className="space-y-2">
          {RESTAURANTS.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-card border border-ink bg-paper-2 p-3">
              <div>
                <div className="font-mono font-medium text-ink">{r.name}</div>
                <div className="font-mono text-xs text-muted">{r.cuisine}</div>
              </div>
              <span className="flex items-center gap-1 font-mono text-xs text-muted"><MapPin size={13} aria-hidden />{r.location}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-4">
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wide text-ink">{title}</h2>
      {children}
    </section>
  )
}
