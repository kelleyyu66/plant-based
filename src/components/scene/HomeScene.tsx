import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Plus, X, ArrowsOutCardinal, Check } from '@phosphor-icons/react'
import { Sky } from './Sky'
import { Windmill } from './Windmill'
import { CowActor } from './CowActor'
import { playReward } from '@/lib/sound'
import type { Meal } from '@/lib/types'
import {
  BEHIND_COW,
  COW_BOTTOM,
  COW_CENTER_X,
  FRONT_OF_COW,
  GRASS_DROP,
  GRASS_SCALE,
  SCENE_H,
  SCENE_W,
  type Placement,
  type SceneItemDef,
  type SceneItemId,
  clamp01,
  cowPose,
  isNight,
  itemDef,
  loadPlacements,
  lockedItems,
  savePlacements,
  unlockedItems,
} from '@/lib/scene'

/**
 * The home-screen landscape.
 *
 * Paint order is fixed regardless of where things are dragged:
 *   clouds/sun → mountain → tree → windmill → barn → grass-lower → cow →
 *   grass-upper → flowers → chicken
 * so a tree dropped near the front still sits behind the cow, and the chicken
 * always reads as being in the foreground.
 *
 * Users adjust the X of an element only — every item's Y is fixed by design
 * (baked from the approved layout), which keeps buildings on the ground and
 * flowers in their bed no matter how things are rearranged.
 *
 * Geometry values were tuned live in the (now removed) adjust panel and baked
 * into scene.ts as constants.
 */

interface Props {
  meals: Meal[]
  /** Speech bubble copy. Suppressed while the cow is asleep. */
  says?: string
}

export function HomeScene({ meals, says }: Props) {
  const [placements, setPlacements] = useState<Placement[]>(() => loadPlacements())
  const [trayOpen, setTrayOpen] = useState(false)
  const [dragItem, setDragItem] = useState<SceneItemId | null>(null)
  const [ghost, setGhost] = useState<{ id: SceneItemId; x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const origin = useRef<{ x: number; fx: number } | null>(null)

  // Clock drives the sun, and whether the cow is awake.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  /** `?hour=14` forces the clock so day/night states can be previewed. */
  const forcedHour = (() => {
    if (typeof location === 'undefined') return null
    const raw = new URLSearchParams(location.search).get('hour')
    if (raw === null) return null
    const h = Number(raw)
    return Number.isFinite(h) && h >= 0 && h <= 23 ? h : null
  })()
  const hour = forcedHour ?? now.getHours()
  const pose = cowPose(hour)
  const asleep = isNight(hour)

  // Deep link from the "New item unlocked" notification: `?openTray=1` pops
  // the tray open once, then the param is stripped so a refresh doesn't redo it.
  useEffect(() => {
    if (typeof location === 'undefined') return
    const params = new URLSearchParams(location.search)
    if (!params.get('openTray')) return
    setTrayOpen(true)
    params.delete('openTray')
    const qs = params.toString()
    window.history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''))
  }, [])

  // Everything scales off the rendered width against the design canvas.
  const [width, setWidth] = useState(SCENE_W)
  useLayoutEffect(() => {
    const measure = () => setWidth(canvasRef.current?.clientWidth ?? SCENE_W)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const k = width / SCENE_W

  const unlocked = useMemo(() => unlockedItems(meals), [meals])
  const locked = useMemo(() => lockedItems(meals), [meals])
  const unlockedIds = useMemo(() => new Set(unlocked.map((i) => i.id)), [unlocked])
  const placedIds = useMemo(() => new Set(placements.map((p) => p.item)), [placements])

  // Only render placements the user has actually earned.
  const visible = useMemo(() => placements.filter((p) => unlockedIds.has(p.item)), [placements, unlockedIds])

  /**
   * Drop each newly-unlocked element into the scene at its designed spot, so
   * the landscape builds itself day by day. Users can then slide it along X.
   */
  useEffect(() => {
    const missing = unlocked.filter((def) => !placements.some((p) => p.item === def.id))
    if (missing.length === 0) return
    const next = [...placements, ...missing.map((def) => ({ item: def.id, x: def.x, y: def.y }))]
    savePlacements(next)
    setPlacements(next)
  }, [unlocked, placements])

  const persist = (next: Placement[]) => {
    savePlacements(next)
    setPlacements(next)
  }

  const capture = (el: Element, id: number) => {
    try {
      ;(el as HTMLElement).setPointerCapture(id)
    } catch {
      /* best effort */
    }
  }
  const release = (el: Element, id: number) => {
    try {
      ;(el as HTMLElement).releasePointerCapture(id)
    } catch {
      /* best effort */
    }
  }

  /** Drag = slide along X. Y is fixed by design (def.y), never user-set. */
  const moveExisting = (id: SceneItemId, clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const o = origin.current
    if (!rect || !o) return
    const def = itemDef(id)
    setPlacements((prev) =>
      prev.map((p) =>
        p.item === id ? { ...p, x: clamp01(o.fx + (clientX - o.x) / rect.width, def.w / SCENE_W) } : p,
      ),
    )
  }

  const dropGhost = (clientX: number, clientY: number) => {
    const g = ghost
    setGhost(null)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!g || !rect) return
    const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    if (!inside) return
    const def = itemDef(g.id)
    persist([
      ...placements.filter((p) => p.item !== g.id),
      {
        item: g.id,
        // X from where it was dropped; Y always the designed row.
        x: clamp01((clientX - rect.left - (def.w * k) / 2) / rect.width, def.w / SCENE_W),
        y: def.y,
      },
    ])
    playReward()
  }

  /** One placed element, at the right size and position for the current width. */
  const renderItem = (p: Placement) => {
    const def = itemDef(p.item)
    const w = def.w * k
    const h = def.h * k
    // Fixed items sit at their designed X; draggable ones at the user's.
    const left = (def.fixed ? def.x : p.x) * width
    // Y always comes from the design, even for placements saved before this rule.
    const top = def.y * (width * (SCENE_H / SCENE_W))

    return (
      <div
        key={p.item}
        onPointerDown={(e) => {
          if (def.fixed) return
          e.preventDefault()
          origin.current = { x: e.clientX, fx: p.x }
          setDragItem(p.item)
          capture(e.currentTarget, e.pointerId)
        }}
        onPointerMove={(e) => dragItem === p.item && moveExisting(p.item, e.clientX)}
        onPointerUp={(e) => {
          if (dragItem !== p.item) return
          release(e.currentTarget, e.pointerId)
          setDragItem(null)
          origin.current = null
          setPlacements((cur) => {
            savePlacements(cur)
            return cur
          })
        }}
        className={`absolute ${def.fixed ? '' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
          left,
          top,
          width: w,
          height: h,
          touchAction: def.fixed ? 'auto' : 'none',
        }}
      >
        <SceneSprite id={p.item} width={w} height={h} />
      </div>
    )
  }

  const sceneH = width * (SCENE_H / SCENE_W)
  // Grass geometry, baked from the approved adjust-panel values.
  const grassW = width * GRASS_SCALE
  const grassH = grassW * (243 / 1144)
  const grassOffset = grassH * (43 / 243)
  const grassDrop = grassH * GRASS_DROP

  return (
    <div>
      <div className="relative">
        <div ref={canvasRef} className="relative w-full overflow-hidden bg-paper" style={{ height: sceneH }}>
          <Sky hour={hour} minute={now.getMinutes()} />

          {/* Mountain — the back-most landscape layer; clouds (z2) drift in
              front of it but behind the tree and buildings. */}
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            {visible.filter((p) => p.item === 'mountain').map(renderItem)}
          </div>

          {/* Behind the cow, in front of the clouds — painted in BEHIND_COW
              order, not unlock order. */}
          <div className="absolute inset-0" style={{ zIndex: 3 }}>
            {visible
              .filter((p) => BEHIND_COW.includes(p.item) && p.item !== 'mountain')
              .sort((a, b) => BEHIND_COW.indexOf(a.item) - BEHIND_COW.indexOf(b.item))
              .map(renderItem)}
          </div>

          {/* Ground the cow stands on — bands overlap as on meet-your-cow. */}
          <img
            src="/home/grass-lower.webp"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 select-none"
            style={{ width: grassW, height: grassH, bottom: grassOffset - grassDrop, zIndex: 4 }}
          />

          {/* The cow — bubble and z's ride along with her. */}
          <div
            className="pointer-events-none absolute flex -translate-x-1/2 justify-center"
            style={{ left: `${COW_CENTER_X * 100}%`, bottom: grassH * COW_BOTTOM, zIndex: 5 }}
          >
            <CowActor pose={pose} k={k} says={asleep ? undefined : says} />
          </div>

          {/* Blades in front of the hooves. */}
          <img
            src="/home/grass-upper.webp"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 select-none"
            style={{ width: grassW, height: grassH, bottom: -grassDrop, zIndex: 6 }}
          />

          {/* In front of the cow. */}
          <div className="absolute inset-0" style={{ zIndex: 7 }}>
            {visible.filter((p) => FRONT_OF_COW.includes(p.item)).map(renderItem)}
          </div>

          {/* Add elements — always available; locked items preview in the tray. */}
          {!trayOpen && (
            <button
              onClick={() => setTrayOpen(true)}
              aria-label="Add elements to your pasture"
              className="absolute bottom-2 right-6 grid h-10 w-10 place-items-center rounded-full border border-ink bg-paper-2 text-ink transition-transform active:scale-95"
              style={{ zIndex: 30 }}
            >
              <Plus size={16} aria-hidden />
            </button>
          )}
        </div>

        {/* Ghost following the finger out of the tray. */}
        {ghost && (
          <div
            className="pointer-events-none fixed z-50 opacity-90"
            style={{
              left: ghost.x,
              top: ghost.y,
              width: itemDef(ghost.id).w * k,
              height: itemDef(ghost.id).h * k,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <SceneSprite id={ghost.id} width={itemDef(ghost.id).w * k} height={itemDef(ghost.id).h * k} />
          </div>
        )}
      </div>

      {/* Tray. Overlaps the foot of the scene; its close button straddles the
          panel's top-right corner, per the exported panel design. */}
      {trayOpen && (
        <div className="relative z-20 -mt-8 px-3">
          <div className="relative rounded-card border border-ink bg-paper px-3 pb-2.5 pt-3">
            <button
              onClick={() => setTrayOpen(false)}
              aria-label="Close elements"
              className="absolute -right-2.5 -top-2.5 grid h-7 w-7 place-items-center rounded-full border border-ink bg-paper-2 text-ink transition-transform active:scale-95"
            >
              <X size={13} aria-hidden />
            </button>

            <p className="mb-2 font-mono text-[11px] leading-tight text-ink">Unlock elements daily</p>

            <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
              <div className="flex w-max gap-2">
                {unlocked.map((def) => (
                  <TrayTile
                    key={def.id}
                    def={def}
                    placed={placedIds.has(def.id)}
                    onPointerDown={(e) => {
                      if (def.fixed) return
                      e.preventDefault()
                      setGhost({ id: def.id, x: e.clientX, y: e.clientY })
                      capture(e.currentTarget as Element, e.pointerId)
                    }}
                    onPointerMove={(e) =>
                      setGhost((g) => (g && g.id === def.id ? { ...g, x: e.clientX, y: e.clientY } : g))
                    }
                    onPointerUp={(e) => {
                      if (ghost?.id !== def.id) return
                      release(e.currentTarget as Element, e.pointerId)
                      dropGhost(e.clientX, e.clientY)
                    }}
                    onTap={() => {
                      if (!def.fixed || placedIds.has(def.id)) return
                      persist([...placements, { item: def.id, x: def.x, y: def.y }])
                      playReward()
                    }}
                  />
                ))}
                {locked.map((def) => (
                  <div key={def.id} className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-card border border-ink">
                    {/* Panel art with the exported grey overlay + lock, centred. */}
                    <img
                      src={`/home/panels/${def.id}.webp`}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="h-full w-full select-none object-cover"
                    />
                    <img
                      src="/home/panels/overlay.webp"
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute inset-0 h-full w-full select-none object-cover"
                    />
                    <img
                      src="/home/panels/lock.webp"
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute left-1/2 top-1/2 w-[17px] -translate-x-1/2 -translate-y-1/2 select-none"
                    />
                    <span className="sr-only">{def.name} — locked</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-muted">
              <ArrowsOutCardinal size={12} aria-hidden />
              Drag and drop into your pasture
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/** One tray tile: the exported panel image as-is, check-marked once placed. */
function TrayTile({
  def,
  placed,
  onTap,
  ...handlers
}: {
  def: SceneItemDef
  placed: boolean
  onTap: () => void
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}) {
  return (
    <div
      {...handlers}
      onClick={onTap}
      className="relative h-[66px] w-[66px] shrink-0 touch-none select-none overflow-hidden rounded-card border border-ink active:cursor-grabbing"
      role="button"
      aria-label={`${def.name}${placed ? ' (placed)' : ''}`}
    >
      <img
        src={`/home/panels/${def.id}.webp`}
        alt=""
        aria-hidden
        draggable={false}
        className="h-full w-full select-none object-cover"
      />
      {placed && (
        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-grass text-paper-2">
          <Check size={10} weight="bold" aria-hidden />
        </span>
      )}
    </div>
  )
}

/** Art for a scene element. Windmill spins; everything else is a still.
 *  The chicken is deliberately static (the watching rotation read as
 *  distraction) — one fixed view, facing the cow. */
function SceneSprite({ id, width, height }: { id: SceneItemId; width: number; height: number }) {
  if (id === 'windmill') return <Windmill width={width} height={height} />
  if (id === 'chicken')
    return (
      <img
        src="/home/chicken/a-15.webp"
        alt=""
        aria-hidden
        draggable={false}
        className="max-w-none select-none object-contain"
        // Mirrored so she faces the cow from her spot on the left.
        style={{ width, height, transform: 'scaleX(-1)' }}
      />
    )
  return (
    <img
      src={`/home/${id}.webp`}
      alt=""
      aria-hidden
      draggable={false}
      className="max-w-none select-none"
      style={{ width, height }}
    />
  )
}
