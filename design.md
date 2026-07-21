# Moo — Design System & Personality Bible

> The single source of truth for how the Plant-Based Challenge 2026 app looks, moves, and talks.
> Keep this in sync with `tailwind.config.ts` — tokens defined here must match tokens in code.

---

## 0. What this app is

A mobile-first PWA for a **7-day plant-based eating challenge** run for a ~45-person design cohort. It keeps the flow of the previous (Glide) app — log meals, earn points, climb a leaderboard, watch collective CO₂ impact grow — and restyles everything as a cozy **Tamagotchi-style pixel world** with teams and a cow you take care of.

Mascot & working title: **Moo** (a little black-and-white cow). App name is a placeholder — see §8.

---

## 1. Personality

The app is **a tiny friend** living in your phone. Not a coach, not an app — a creature.

**Five traits:** optimistic · slightly chaotic · encouraging · funny · surprisingly knowledgeable.

**Tone dial** — somewhere between:
- **Tamagotchi** — you're caring for a small creature that depends on you
- **Animal Crossing** — warm, unhurried, gently silly, never demanding
- **Duolingo (minus the passive-aggressive owl)** — motivating, but it never guilt-trips
- **Pokémon** — collecting, leveling, unlocking, a world that rewards curiosity

**Hard rules**
1. **Never guilt.** A missed streak, a beef meal, a slow day — Moo is unbothered and kind. Guilt is the owl's job, and we fired the owl.
2. **Every stumble reframes forward.** "Tomorrow's a fresh pasture," never "you failed."
3. **Facts are delivered with delight, not homework.** Moo is smart but wears it lightly.
4. **Chaos is affectionate, never mean.** Moo may be a little unhinged; it is never sarcastic at the user's expense.

### Voice per surface (use these strings or ones in this spirit)

| Surface | Copy |
|---|---|
| App headline (onboarding 1) | "Take care of a cow. Save the planet. Sort of." |
| Join CTA | "Join the challenge" |
| Why-it-matters CTA (onboarding 2) | "Count me in" |
| Log success (celebration) | "Nice one!" / "Moo did a little dance." |
| Points popped | "+{n} points!" |
| Photo bonus hint | "Add a pic for a bonus point 📸" |
| Beef / 0-point meal | "Logged! Every step counts — tomorrow's a fresh pasture." |
| Streak building | "{n} days in a row. Moo remembers." |
| Streak missed | "Moo took a nap. Come back and feed the vibe." |
| Streak milestone | "You hit your goal! Moo is emotional about it. +{n} bonus." |
| Empty meals feed | "No meals yet. Be the first — Moo is watching, hopefully." |
| Empty comments | "Say something nice. Moo is listening." |
| Daily quest banner | "DOUBLE POINTS today: log a {tier} meal. Moo believes in you." |
| Meal cap reached | "That's 3 meals today — Moo is full. See you tomorrow!" |
| Team accessory unlocked | "New drip unlocked: your cow now has a {accessory}. Iconic." |
| Education section title | "Moo's little cookbook" |
| Fact card lead-in | "Did you know?" |
| Generic loading | "Moo is thinking…" / "Rounding up the herd…" |
| Error / offline | "Moo lost the signal. Poke it again in a sec." |

---

## 2. Visual style

Cozy, warm, chunky pixel art. Sampled from `References/pixel_art.png` (sunset farm) and `References/cow.png` (top-down grass).

- **Chunky near-black outlines** on everything (creatures, cards, buttons) — the `ink` token, ~2px at 1× scale.
- **Warm sunset gradients** behind onboarding / hero moments (peach → pink → lavender, dithered clouds).
- **Grassy greens** for the in-app "field" surfaces and the farm/Teams view.
- **Deep forest canvas** on the Home tab (matches the previous app's dark-green home, but warmer).
- `image-rendering: pixelated` on **all** sprite art. No anti-aliased scaling, ever.
- Small corner radii (2–4px) — keep the chunk. No soft/blurred shadows; shadows are **hard pixel bevels**.

---

## 3. Color tokens

Sampled hexes below; mirror exactly in `tailwind.config.ts`. (Eyedropper-confirmed against the reference PNGs.)

### Core surfaces (in-app)
| Token | Hex | Use |
|---|---|---|
| `forest-900` | `#123524` | Home canvas (deepest) |
| `forest-800` | `#1B4D3E` | Home cards / sheets on dark |
| `forest-700` | `#2A6049` | raised cards on Home |
| `ink` | `#2A2320` | outlines, primary text on light |
| `ink-soft` | `#4A4038` | secondary text on light |
| `paper` | `#FBF6EC` | light screen bg (feed, education, profile) |
| `paper-2` | `#FFFFFF` | cards on light |
| `muted` | `#9BB0A6` | tertiary text / disabled |

### Grass ramp (field / farm / Teams)
| Token | Hex |
|---|---|
| `grass-300` | `#A0B070` |
| `grass-500` | `#708040` |
| `grass-700` | `#406030` |
| `grass-900` | `#203020` |
| `mint-100` | `#E0F0D0` (flower/sparkle highlights) |

### Sunset ramp (onboarding skies / hero)
| Token | Hex |
|---|---|
| `sky-cream` | `#F0E0D0` |
| `sky-gold` | `#E0D090` |
| `sky-peach` | `#E0A080` |
| `sky-coral` | `#E09080` |
| `sky-rose` | `#D08080` |
| `sky-mauve` | `#907080` |
| `cloud` | `#F6ECD8` |

### Accents / progress
| Token | Hex | Use |
|---|---|---|
| `lime-400` | `#B7E06A` | progress fill, positive accent |
| `lime-500` | `#8FCB3C` | progress fill (deeper), CTA on dark |
| `sun-400` | `#F0D090` | streak flame, highlights |
| `berry-400` | `#D08080` | reactions/hearts |

### Meal-tier semantic colors (chips + feed titles)
| Tier | Points | Token | Hex |
|---|---|---|---|
| Vegan | 10 | `tier-vegan` | `#8FCB3C` |
| Vegetarian | 8 | `tier-veg` | `#7FB77E` |
| Fish | 5 | `tier-fish` | `#6FA8C7` |
| Chicken | 5 | `tier-chicken` | `#E0B15A` |
| Pork | 2 | `tier-pork` | `#E39B9B` |
| Beef | 0 | `tier-beef` | `#B3736B` |

**Contrast rule:** body text must hit WCAG AA (4.5:1). On `forest-900`, use `paper`/`lime-400`/white. On `paper`, use `ink`/`ink-soft`. Tier colors are decorative — never the only signal; always pair with the tier label.

---

## 4. Typography

Two families only.

- **Display / numbers:** `Silkscreen` (self-hosted, `public/fonts`) — used for the wordmark, big point counts, tab-less headers, streak numbers. **Never** for running body text (pixel fonts are unreadable at paragraph size).
- **Body / UI:** `Nunito` (self-hosted, rounded, friendly) — everything else: captions, comments, buttons, education tables.

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Wordmark / hero number | Silkscreen | 28–40 / 700 | tracking normal |
| Screen title | Silkscreen | 18 / 400 | e.g. "Home", "Meals" |
| Points ("+10 points!") | Silkscreen | 24 / 400 | |
| H1 (in body) | Nunito | 20 / 800 | |
| Body | Nunito | 16 / 500 | line-height 1.5 |
| Caption / poster name | Nunito | 13 / 700 | UPPERCASE, tracking +0.04em, colored per context |
| Button label | Nunito | 16 / 800 | |

---

## 5. Spacing, shape, elevation

- **Spacing scale (8px base):** 4, 8, 12, 16, 24, 32, 48. Tailwind default scale is fine; prefer `2/3/4/6/8/12`.
- **Radius:** `pixel` = 4px (cards, buttons), `pixel-sm` = 2px (chips), `full` only for avatars.
- **Pixel bevel (elevation):** hard, no blur. Two shadow recipes:
  - `shadow-pixel`: `0 3px 0 0 {ink}` (raised button / card lip)
  - `shadow-pixel-inset`: pressed state, `inset 0 2px 0 0 rgba(0,0,0,.2)`
- **Borders:** 2px solid `ink` on interactive/framed elements.
- **Touch targets:** ≥ 44×44px. Bottom tab bar respects `env(safe-area-inset-bottom)`.
- **App frame:** content maxes at a phone column (max-width ~430px), centered on larger screens with a warm backdrop.

---

## 6. Component inventory

Built in `src/components/`. Each lists its states.

| Component | States / props |
|---|---|
| `TabBar` | 5 tabs (Home · Meals · Leaderboard · Teams · Profile); active/inactive; safe-area padded |
| `PixelButton` | primary (lime on dark / ink on light) · ghost · disabled · pressed (bevel collapses) |
| `Chip` | idle · selected · disabled; tier variant tints to the tier color |
| `ProgressBar` | determinate; segmented option (meals x/3); over-goal glow; animated fill (spring) |
| `Card` | on-dark (forest) · on-light (paper); optional pixel bevel |
| `BottomSheet` | slide-up 250ms; scrim; drag handle; "Add item" logging form lives here |
| `Sprite` | `index` (0–19) · `variant` (regular/hat/balloon) · `size`; renders pre-sliced PNG, pixelated |
| `Avatar` | wraps Sprite in a round frame + ink border; size sm/md/lg |
| `MooCow` | `mood` (idle/dance/sleep); idle bob loop; dance on log; reduced-motion → static |
| `Confetti` | one-shot burst (canvas-confetti); reduced-motion → no-op |
| `StatRow` | icon + label + value (impact rows: 🚗/🌳/💧) |
| `LeaderRow` | rank · Avatar · name · points · chevron; tap → Person Profile |
| `MealCard` | photo (or photoless fallback) · poster caps · "{Tier} · {Time}" · caption · points badge |
| `FarmPen` | a team's grass plot with its cow (+ unlocked accessories); tappable → team info |
| `AccessoryLadder` | list of accessories, locked/unlocked at team-point thresholds |
| `EmptyState` | Moo illustration + voice copy + optional CTA |
| `Toast` | transient bottom message, voice copy |

---

## 7. Motion

Playful, springy, "hoppy" — nothing glides slowly.

| Element | Motion |
|---|---|
| Moo idle | gentle vertical bob, ~2s ease-in-out loop |
| Moo on log | quick dance (frame swap + slight rotate/bounce), ~1.2s one-shot |
| Confetti | burst on successful log, ~1.2s |
| Progress fill | spring to new value (stiffness ~180) |
| Bottom sheet | slide up 250ms ease-out; scrim fade |
| Tab press | scale to 0.94, snap back |
| Chip select | quick pop (scale 1.06 → 1) |
| Accessory unlock | cow does a spin + sparkle |

**Accessibility:** every loop/one-shot checks `prefers-reduced-motion: reduce` → render the static end-state (no bob, no confetti, instant fill). Store this in a `useReducedMotion` hook.

---

## 8. Assets & sprite strategy

**Source sheets** (`Assets/`): `characters_regular.png` (20 animals), `characters_hat.png` (party-hat variants), `characters_balloon.png` (balloon variants). `References/cow.png` = top-down cow for the farm view.

### ⚠️ Known asset issues
- A **gold "crown" watermark** overlaps the top-left cell (bear) on all three sheets; a faint "…llc" mark appears on the balloon sheet. These indicate a **paid/preview pack** — licensing must be confirmed before public launch (buy the pack or commission clean sprites). The crown corrupts avatar index 0.
- Sheets are **non-uniform** (824×808, 832×800, 788×800; non-integer cell math; animals vary in size/placement). Runtime `background-position` will misalign.

### Strategy: pre-slice, don't background-position
`scripts/slice-sprites.mjs` (Node + `sharp`), run once at setup:
1. Split each sheet using a **per-sheet calibrated grid map** (hand-tuned cell boxes, since cells aren't uniform).
2. `.trim()` each cell to its alpha bounding box.
3. Composite onto a **uniform 128×128 transparent canvas**, bottom-centered.
4. Export `public/avatars/{regular,hat,balloon}/00.png … 19.png`. Commit the outputs.

`<Sprite index variant size>` renders `<img src=".../{variant}/{index}.png" className="[image-rendering:pixelated]">`. **Render only at integer multiples** of the native slice size to avoid shimmer. The animal index → name map lives in `src/content/animals.ts` (for alt text + avatar picker labels).

The hat/balloon variants double as **cow accessory states** conceptually; the actual team cow uses `public/sprites/moo/` frames with layered accessory sprites.

---

## 9. Scoring, streaks & impact (design-locked constants)

These numbers are the product spec; the engine (`src/lib`) and the DB trigger both implement them.

**Meal points:** Vegan 10 · Vegetarian 8 · Fish 5 · Chicken 5 · Pork 2 · Beef 0.
**Photo bonus:** +1, flat, max 1 per meal. **Quest multiplier applies to the tier base only; the photo +1 is added after and never multiplied.** → `points = round(base × questMult) + (hasPhoto ? 1 : 0)`.
**Meal cap:** 3 per day (one per Breakfast/Lunch/Dinner slot).
**Streak:** consecutive calendar days (America/Los_Angeles) with ≥1 logged meal; any tier counts. Hitting your chosen goal (3/5/7) grants a one-time milestone bonus, surfaced in the celebration.
**Daily quest:** `quests[dayOfYear % 7]`; 2× on a target tier (null target = any plant-based meal).

**CO₂ impact** (motivational estimate, not audited LCA — kept in one file for easy recalibration):
- Per-meal footprint (kg CO₂e): beef 6.6 · pork 1.7 · fish 1.5 · chicken 1.3 · vegetarian 0.9 · vegan 0.4.
- Baseline omnivore meal: 2.9 kg. `co2SavedKg(tier) = max(0, 2.9 − footprint[tier])` (beef → 0 saved, mirrors 0 points).
- Equivalence ratios, calibrated to the previous app (296 kg ≈ 739 miles ≈ 13 trees ≈ 11,828 showers):
  `MILES_PER_KG = 2.5`, `TREES_PER_KG = 0.0439`, `SHOWERS_PER_KG = 39.96`.

---

## 10. Information architecture

**Onboarding (10 steps):** name+headline+join → why-it-matters → survey: plant-meal frequency → survey: usual proteins → survey: climate familiarity → Your Starting Impact → streak goal (3/5/7) → choose avatar → join team (spots left, farm view) → meet your cow → Start.

**Bottom tabs (5):**
- **Home** — meals-today + points progress bars, resting Moo, Log Meal, Challenge-Wide Impact, leaderboard preview.
- **Meals** — 2-col community feed, floating log, detail page (comments + emoji reactions).
- **Leaderboard** — one ranked list split into "Previous Vegetarians" / "Previous Meat-eaters & Flexitarians"; row → Person Profile.
- **Teams** — team leaderboard, farm view of the 4 team cows, per-team accessory ladder, team goal vs individual goal.
- **Profile** — name, avatar, team, onboarding answers, total points, streak, personal meal grid. Entry point to "Moo's little cookbook" (Education).

Teams (captains, editable): Kelley · Vikram · Chan · Katarina.

---

## 11. Naming shortlist (pick one)

Placeholder in code: **"Moo."** Candidates: **Moo Crew** · **MooLog** · **Cowabunga** · **Herd** · **Pasture** · **Moo-ve**. Update the wordmark + PWA manifest name once chosen.
