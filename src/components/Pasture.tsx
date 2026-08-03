import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Plus, X, Lock } from '@phosphor-icons/react'
import { MooCow } from './MooCow'
import { GrassBand } from './GrassBand'
import { PastureItem } from './PastureItem'
import { playReward } from '@/lib/sound'
import type { MooMood } from '@/content/mooSprite'
import {
  GRASS_TOP,
  PASTURE_H,
  PASTURE_W,
  clamp01,
  daysUntil,
  itemDef,
  loadPlacements,
  lockedItems,
  savePlacements,
  unlockedInstances,
  type Placement,
} from '@/lib/pasture'

interface PastureProps {
  unlocked: number
  /**
   * `hero` is the full-bleed scene at the top of Home — the pasture IS the hero.
   * `edit` is the arrangeable copy on the You page. Same scene, same coordinates.
   */
  mode?: 'hero' | 'edit'
  mood?: MooMood
  /** Speech bubble copy (hero only). See content/cowMessages.ts. */
  says?: string
  /** Item id to ring after arriving from a "new item unlocked" notification. */
  highlight?: string | null
}

/**
 * The pasture: a cow standing in a landscape the user builds.
 *
 * There is only ONE pasture per user. Home renders it full-bleed and read-only;
 * the You page renders the same scene with dragging and an item tray. Placements
 * are fractions of the canvas and both modes share the PASTURE_W:PASTURE_H
 * aspect ratio, so an arrangement made in the editor is faithful on Home.
 *
 * Dragging is hand-rolled on Pointer Events: it's the one input model that
 * covers mouse, iOS touch and Android touch identically, and it avoids the
 * transform-vs-left/top double-offset of framer-motion's `drag`.
 *
 * ILLUSTRATION SLOT — cow, grass and items are placeholders. See PastureItem.tsx.
 */
export function Pasture({ unlocked, mode = 'edit', mood = 'idle', says, highlight }: PastureProps) {
  const editable = mode === 'edit'
  const [placements, setPlacements] = useState<Placement[]>(() => loadPlacements())
  const [trayOpen, setTrayOpen] = useState(false)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const origin = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null)
  const [ghost, setGhost] = useState<{ key: string; id: string; x: number; y: number } | null>(null)

  // Everything scales off the canvas width so the hero and the editor stay
  // WYSIWYG despite being different sizes on screen.
  const [width, setWidth] = useState(PASTURE_W)
  useLayoutEffect(() => {
    const measure = () => setWidth(canvasRef.current?.clientWidth ?? PASTURE_W)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const k = width / PASTURE_W

  const inventory = useMemo(() => unlockedInstances(unlocked), [unlocked])
  const locked = useMemo(() => lockedItems(unlocked), [unlocked])
  const placedKeys = useMemo(() => new Set(placements.map((p) => p.key)), [placements])

  // Pick up edits made on the other screen.
  useEffect(() => {
    const sync = () => setPlacements(loadPlacements())
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('focus', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Arriving from a "new item unlocked" notification: if the item isn't on the
  // field yet, open the tray so it's one drag away.
  const highlightPlaced = highlight ? placements.some((p) => p.item === highlight) : false
  useEffect(() => {
    if (highlight && !highlightPlaced && editable) setTrayOpen(true)
  }, [highlight, highlightPlaced, editable])

  /** Capture is best-effort — a rejected pointer id must not abort the drag. */
  const capture = (el: Element, id: number) => {
    try {
      ;(el as HTMLElement).setPointerCapture(id)
    } catch {
      /* no-op */
    }
  }
  const release = (el: Element, id: number) => {
    try {
      ;(el as HTMLElement).releasePointerCapture(id)
    } catch {
      /* no-op */
    }
  }

  const persist = (next: Placement[]) => {
    savePlacements(next)
    setPlacements(next)
  }

  const moveExisting = (key: string, clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const o = origin.current
    if (!rect || !o) return
    setPlacements((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p
        const def = itemDef(p.item)
        return {
          ...p,
          x: clamp01(o.fx + (clientX - o.x) / rect.width, def.w / PASTURE_W),
          y: clamp01(o.fy + (clientY - o.y) / rect.height, def.h / PASTURE_H),
        }
      }),
    )
  }

  const dropGhost = (clientX: number, clientY: number) => {
    const g = ghost
    setGhost(null)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!g || !rect) return
    const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    if (!inside) return
    const def = itemDef(g.id as Placement['item'])
    persist([
      ...placements.filter((p) => p.key !== g.key),
      {
        key: g.key,
        item: g.id as Placement['item'],
        x: clamp01((clientX - rect.left - (def.w * k) / 2) / rect.width, def.w / PASTURE_W),
        y: clamp01((clientY - rect.top - (def.h * k) / 2) / rect.height, def.h / PASTURE_H),
      },
    ])
    playReward()
  }

  const grassH = Math.round(width * (PASTURE_H / PASTURE_W) * (1 - GRASS_TOP))

  return (
    <div>
      <div className="relative">
        <div
          ref={canvasRef}
          className={`relative w-full overflow-hidden ${
            editable ? 'rounded-card border border-ink bg-paper-2' : 'bg-paper'
          }`}
          style={{ aspectRatio: `${PASTURE_W} / ${PASTURE_H}` }}
        >
          <GrassBand height={grassH} />

          {/* Speech bubble (hero only) — fixed templates, no AI. */}
          {says && (
            <div className="absolute right-2 top-3 z-30 w-[min(52%,210px)]">
              <div className="relative rounded-card border border-ink bg-paper-2 px-3 py-2">
                <p className="font-mono text-[11px] leading-snug text-ink">{says}</p>
                <span
                  className="absolute -bottom-[5px] left-6 h-2 w-2 rotate-45 border-b border-r border-ink bg-paper-2"
                  aria-hidden
                />
              </div>
            </div>
          )}

          {/* Decorations — the landscape around the cow. */}
          {placements.map((p) => (
            <div
              key={p.key}
              onPointerDown={(e) => {
                if (!editable) return
                e.preventDefault()
                origin.current = { x: e.clientX, y: e.clientY, fx: p.x, fy: p.y }
                setDragKey(p.key)
                capture(e.currentTarget, e.pointerId)
              }}
              onPointerMove={(e) => dragKey === p.key && moveExisting(p.key, e.clientX, e.clientY)}
              onPointerUp={(e) => {
                if (dragKey !== p.key) return
                release(e.currentTarget, e.pointerId)
                setDragKey(null)
                origin.current = null
                setPlacements((cur) => {
                  savePlacements(cur)
                  return cur
                })
              }}
              className={`absolute ${editable ? 'cursor-grab active:cursor-grabbing' : ''} ${
                dragKey === p.key ? 'z-30' : 'z-10'
              }`}
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: `scale(${k})`,
                transformOrigin: 'top left',
                touchAction: editable ? 'none' : 'auto',
              }}
            >
              <div
                className={
                  highlight === p.item ? 'rounded-[6px] outline outline-2 outline-offset-2 outline-grass' : ''
                }
              >
                <PastureItem id={p.item} />
              </div>
            </div>
          ))}

          {/* The cow — always centre stage, never draggable. */}
          <div
            className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
            style={{ bottom: `${(1 - GRASS_TOP) * 42}%` }}
          >
            <MooCow mood={mood} scale={Math.max(3, Math.round(5.6 * k))} />
          </div>

          {editable && placements.length === 0 && (
            <p className="absolute inset-x-0 top-3 z-30 px-6 text-center font-mono text-[11px] text-muted">
              {unlocked === 0 ? 'Log a meal to unlock your first item.' : 'Tap + to decorate your pasture.'}
            </p>
          )}
        </div>

        {/* Circular add button, bottom-centre of the pasture. */}
        {editable && unlocked > 0 && (
          <button
            onClick={() => setTrayOpen((o) => !o)}
            aria-label={trayOpen ? 'Close item tray' : 'Add items to pasture'}
            aria-expanded={trayOpen}
            className="absolute -bottom-5 left-1/2 z-40 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-ink bg-ink text-paper-2 transition-transform active:scale-95"
          >
            {trayOpen ? <X size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
          </button>
        )}
      </div>

      {/* Ghost following the finger while dragging out of the tray. */}
      {ghost && (
        <div
          className="pointer-events-none fixed z-50 opacity-90"
          style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%, -50%)' }}
        >
          <PastureItem id={ghost.id as Placement['item']} />
        </div>
      )}

      {editable && (
        <p className="mt-7 font-mono text-[12px] text-muted">
          {unlocked === 0
            ? 'Log a meal to unlock your first item.'
            : `${placements.length} placed · ${unlocked} unlocked`}
        </p>
      )}

      {/* Tray: unlocked first, then locked. */}
      {editable && trayOpen && (
        <div className="mt-2 rounded-card border border-ink bg-paper-2 p-3">
          <h3 className="mb-2 font-mono text-[12px] text-ink">Unlocked — drag onto the pasture</h3>
          <ul className="space-y-1.5">
            {inventory.map((inst) => {
              const isPlaced = placedKeys.has(inst.key)
              return (
                <li
                  key={inst.key}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    setGhost({ key: inst.key, id: inst.def.id, x: e.clientX, y: e.clientY })
                    capture(e.currentTarget, e.pointerId)
                  }}
                  onPointerMove={(e) =>
                    setGhost((g) => (g && g.key === inst.key ? { ...g, x: e.clientX, y: e.clientY } : g))
                  }
                  onPointerUp={(e) => {
                    if (ghost?.key !== inst.key) return
                    release(e.currentTarget, e.pointerId)
                    dropGhost(e.clientX, e.clientY)
                  }}
                  className={`flex touch-none select-none items-center gap-3 rounded-card border bg-paper-2 px-3 py-2 active:cursor-grabbing ${
                    highlight === inst.def.id && !isPlaced
                      ? 'border-grass outline outline-2 outline-offset-1 outline-grass'
                      : 'border-ink/30'
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center">
                    <PastureItem id={inst.def.id} fit={34} />
                  </span>
                  <span className="flex-1 font-mono text-[13px] text-ink">{inst.def.name}</span>
                  {isPlaced && (
                    <span className="rounded-pill border border-grass bg-grass-pale px-2 py-0.5 font-mono text-[10px] text-ink">
                      Placed
                    </span>
                  )}
                </li>
              )
            })}
          </ul>

          {locked.length > 0 && (
            <>
              <h3 className="mb-2 mt-4 font-mono text-[12px] text-muted">Locked</h3>
              <ul className="space-y-1.5">
                {locked.map((def) => (
                  <li
                    key={def.id}
                    className="flex items-center gap-3 rounded-card border border-ink/15 bg-paper-3 px-3 py-2 opacity-70"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center">
                      <Lock size={16} className="text-muted" aria-hidden />
                    </span>
                    <span className="flex-1 font-mono text-[13px] text-muted">{def.name}</span>
                    <span className="font-mono text-[10px] text-muted">
                      {daysUntil(def, unlocked)} more day{daysUntil(def, unlocked) === 1 ? '' : 's'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
