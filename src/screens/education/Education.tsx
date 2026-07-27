import { useNavigate } from 'react-router-dom'
import { BEGINNER_GUIDE, PROTEINS, RESTAURANTS, TRADER_JOES_PICKS, YOUTUBE_CHANNELS } from '@/content/education'

export function Education() {
  const nav = useNavigate()
  return (
    <div className="min-h-full bg-paper pb-28">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-ink bg-paper-2 px-4 py-3">
        <button onClick={() => nav(-1)} aria-label="Back" className="text-xl text-ink">
          ←
        </button>
        <span className="font-pixel text-base text-ink">Moo’s little cookbook</span>
      </header>

      {/* Beginner guide */}
      <Section title="Getting started">
        <div className="space-y-3">
          {BEGINNER_GUIDE.map((t) => (
            <div key={t.title} className="rounded-pixel border-2 border-ink bg-paper-2 p-3">
              <div className="font-body font-extrabold text-ink">{t.title}</div>
              <p className="mt-1 font-body text-sm text-ink-soft">{t.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Protein table */}
      <Section title="Where to get your protein">
        <div className="overflow-hidden rounded-pixel border-2 border-ink">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="bg-lime-400 text-ink">
                <th className="p-2 text-left font-extrabold">Protein</th>
                <th className="p-2 text-left font-extrabold">Allergen</th>
                <th className="p-2 text-left font-extrabold">Where</th>
              </tr>
            </thead>
            <tbody>
              {PROTEINS.map((p, i) => (
                <tr key={p.name} className={i % 2 ? 'bg-paper-2' : 'bg-cloud'}>
                  <td className="p-2 font-bold text-ink">{p.name}</td>
                  <td className="p-2 text-ink-soft">{p.allergen}</td>
                  <td className="p-2 text-ink-soft">{p.whereToBuy}</td>
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
              rel="noreferrer"
              className="flex items-center justify-between rounded-pixel border-2 border-ink bg-paper-2 p-3 font-body font-extrabold text-ink shadow-pixel-sm transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <span>{channel.name}</span>
              <span aria-hidden="true" className="text-sm text-berry-400">▶</span>
            </a>
          ))}
        </div>
      </Section>

      {/* Trader Joe's */}
      <Section title="Trader Joe’s vegan picks">
        <div className="space-y-2">
          {TRADER_JOES_PICKS.map((t) => (
            <div key={t.item} className="rounded-pixel border-2 border-ink bg-paper-2 p-3">
              <div className="font-body font-extrabold text-ink">{t.item}</div>
              <p className="font-body text-sm text-ink-soft">{t.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Restaurants */}
      <Section title="Seattle vegan spots">
        <div className="space-y-2">
          {RESTAURANTS.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-pixel border-2 border-ink bg-paper-2 p-3">
              <div>
                <div className="font-body font-extrabold text-ink">{r.name}</div>
                <div className="font-body text-xs text-ink-soft">{r.cuisine}</div>
              </div>
              <span className="font-body text-xs text-grass-700">📍 {r.location}</span>
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
      <h2 className="mb-3 font-pixel text-sm uppercase tracking-wide text-ink">{title}</h2>
      {children}
    </section>
  )
}
