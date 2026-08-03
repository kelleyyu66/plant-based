# Moo — Plant-Based Challenge (context for Claude sessions)

7-day cohort challenge app: log plant-based meals, earn points, keep Moo the cow
happy, build your pasture. React 18 + Vite 8 + TypeScript + Tailwind 3 + Zustand
+ React Query. Mock backend by default (`VITE_DATA_MODE=mock`); Supabase wiring
exists but is unused. Working branch: `chan-edits` (repo kelleyyu66/plant-based).

## Run

- `npm install` (a `.npmrc` sets `legacy-peer-deps` — main pins vite@8 while
  plugin-react@4 peers to vite@7; install fails without it)
- `npm run dev` → http://localhost:5180 (`host: true`, so phones on the same
  Wi-Fi can open http://<lan-ip>:5180). `.claude/launch.json` has the config.
- `npm run build` passes; `npm test` has 6 pre-existing failures (Node 26
  localStorage missing in vitest env — NOT app bugs).
- `/home?hour=N` (0–23) forces the scene clock for day/night testing.

## Design system (hand-drawn pass)

- Background `#FAF9F5` (paper). Ink/black for ALL text+icons: `#2E2F2C`.
  Only accent: grass green `#5C7A45` (progress fills, checkmarks). Alert red
  `#B23B32` for sign-out only.
- Type: **Schoolbell** for H1s ONLY (self-hosted `public/fonts/`, via `H1`
  component + `font-hand`); **IBM Plex Mono** for everything else (via
  @fontsource). `font-hand` also used for cow speech bubble + big carbon number.
- Containers: 1px ink stroke, 10px radius (`rounded-card`), white fill.
  Buttons: pill, filled ink (`PixelButton` — name is legacy, style is not).
- Icons: Phosphor (`@phosphor-icons/react`).

## Key screens / flows

- **Splash** (`src/screens/onboarding/Splash.tsx`): shows EVERY app launch
  (state lives in `App.tsx`, deliberately not persisted — prototype behavior).
  Two-frame wave, instant swap (no crossfade), frames body-aligned at export.
- **Onboarding** (8 steps): name/email → pick critter → why → questionnaire →
  starting impact → meet Moo (24-frame turntable, `MooSequence`, 5s/turn,
  grass layers overlap −200 per Figma → `MeetMooScene`).
- **Home** (`src/screens/home/Home.tsx` + `src/components/scene/`): hero IS the
  pasture (`HomeScene`). Fixed paint order back→front: clouds/sun → mountain →
  tree → windmill → barn → grass-lower → cow → grass-upper → flowers → chicken.
  One element unlocks per logged DAY (order in `src/lib/scene.ts SCENE_ITEMS`),
  auto-places at designed spot; users drag X ONLY (Y fixed by design).
  `+` button (aligned with bell) opens tray using exported panel images
  (`public/home/panels/`), locked = grey overlay + lock icon, placed = green
  check circle. Windmill spokes spin 10s/turn about the X hub. Two clouds,
  15s crossings. Sun arcs 6am–8pm. Cow paces/stands by day; sleeps 11pm–6am
  (3 growing z's, no speech bubble). Speech bubble = squiggling SVG
  (feTurbulence boil), center-bottom tail pointing at the cow, Schoolbell text,
  conforms to page padding. Chicken is STATIC, mirrored (faces cow), left side.
- **Meals**: two-layer filter — Day pills (from `CHALLENGE_START_DATE` in
  `src/content/seed.ts`, currently null → derived from earliest meal) then
  Breakfast/Lunch/Dinner tabs with counts.
- **Celebration**: 22-frame disco cow (`CelebrationCow`), 6s/rotation, plays
  reward chime (`src/lib/sound.ts`, synthesized WebAudio; respects
  reduced-motion; mute flag in localStorage).
- **You**: standing critter (no circle) + stacked name/email/"Cohort
  challenger"; editable About you; centered red sign-out. Pasture section
  REMOVED from this page (scene edits happen on Home now).
- **Quests**: no checkboxes — completion derived purely from food logs
  (`src/lib/dailyQuest.ts`); struck-through + green numbered circle when done.
- **Notifications**: derived from logs (`useAppNotifications`), bell + panel,
  per-item dismiss + clear all, unlock notifications deep-link
  `/profile?highlight=<id>` (NOTE: pasture moved to Home — this deep link needs
  rewiring), read-state in localStorage.

## Asset pipeline (important)

Source art lives in `assets/` (NOT shipped); exported to `public/` as WebP via
sharp one-off scripts. Conventions learned the hard way:
- Frame sequences must share ONE canvas/scale (bottom-aligned feet line) or the
  subject pulses between frames. Applied to: moo turntable
  (`public/onboarding/moo/`), chicken angles (`public/home/chicken/aN.webp`),
  celebration (`public/celebration/`), splash wave (`public/cow/hi-*.png`).
- Sequences play via refs toggling `style.opacity` (never React state per tick).
- Critter avatars: `public/critters/NN.png` (standing) +
  `public/critters/profile/NN.webp` (circle art, has its OWN drawn ring — no
  border on top). **Index 19 Duck has NO profile image** — falls back to framed
  standing art. Names in `src/content/animals.ts` (re-derived from art; old
  list was wrong from index 10).
- Grass bands: 1144×243, stacked with tops 43/243 apart (Figma −200 overlap).

## Scene geometry (src/lib/scene.ts)

Design canvas 390×214. All values baked from live-tuned adjust panel (panel was
removed before ship): GRASS_SCALE 1.32, GRASS_DROP 0.34, COW_CENTER_X 0.55,
COW_BOTTOM 0.22, COW_SLEEPING_LIFT 16 (32 floated, 0 sank). Chicken x 0.219
(20px left of 0.27), y 0.725. Sleeping cow sized by BODY width not canvas
(1.18×0.9 of standing). Metrics graphics: shared 111px box, bottom-aligned
baseline; trees drawn 1.5× (111px vs 74px).

## State (all localStorage, prototype-only)

`moo.mock.v1` (profile+meals) · `moo.onboarding.v4` · `moo.scene.v1`
(placements) · `moo.notifications.read.v1` · `moo.sound.muted.v1`.
No cross-device sync; sign-out does NOT clear scene/notification keys (known
leak). Cohort timezone: America/Los_Angeles (`src/lib/dates.ts`).

## Known issues / open items

1. Quest notification ids lack a date → once dismissed, never reappear.
2. Backfilling N days yields only 1 unlock notification.
3. Sign-out leaks pasture + read-state to next user.
4. `LATE_GRACE_DAYS` declared, never enforced; no lower bound on log date.
5. Unlock deep-link still points at /profile#pasture (pasture now on Home).
6. Duck (index 19) profile image missing.
7. Reference-mock notes not yet actioned: "remove points progress bar, move to
   top as a number" and "resolve Get more information tooltip".
8. Old pasture components (`Pasture.tsx`, `PastureItem.tsx`, `GrassBand.tsx`,
   `CowStage.tsx`, `MooCow`/pixel sprite, `ChickenSequence`, `ChickenWatcher`)
   still exist; some unused after the HomeScene rewrite — candidates to delete.
9. `graphify-out/` holds a queryable knowledge graph of the codebase
   (`/graphify query "..."`).

## Etiquette for edits

Typecheck (`npx tsc -b`) + `npm run build` after changes; verify visually via
the running dev server (browser tools) before reporting done. Keep the one-ink
palette; only H1s in Schoolbell. Never reintroduce per-frame React re-renders
for sequences.
