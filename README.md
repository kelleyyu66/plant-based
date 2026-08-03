# Moo — Plant-Based Challenge 2026

A mobile-first, pixel-art PWA for a 7-day plant-based eating challenge for the design cohort.
Log meals, earn points, grow your team's cow, and out-plant your friends. See [`design.md`](design.md)
for the design system + personality bible.

## Stack

React 18 · Vite 5 · TypeScript · Tailwind (custom pixel tokens) · React Router · TanStack Query ·
Zustand · framer-motion · vite-plugin-pwa · Supabase (Phase 8).

## Run it

> **Note:** the animal sprite sheets are **not in this repo** (see _Asset licensing_ below). Drop
> licensed `characters_regular.png` / `characters_hat.png` / `characters_balloon.png` into `Assets/`
> and run `npm run slice` to generate the avatars. Everything else runs without them; only the
> avatar images will be missing.

```bash
npm install
npm run slice      # generates public/avatars from the sheets in Assets/ (see note above)
npm run dev        # http://localhost:5180  (mock data — no backend needed)
npm test           # engine + mock-provider unit tests
npm run build      # production build + PWA service worker
```

The app runs entirely on **mock data** (`VITE_DATA_MODE=mock`, the default): ~45 seeded cohort
members, meals, comments, reactions, teams, and standings — persisted to `localStorage`. Every screen
works with no backend. Set `VITE_DATA_MODE=live` to use the configured Supabase auth/profile flow.

## Architecture

- **`src/lib/`** — pure engine (`points`, `streak`, `quests`, `impact`, `dates`) with unit tests;
  `dataProvider.ts` is the single data interface; `mock/` implements it in-memory.
- **`src/components/`** — the pixel UI kit (`Sprite`, `MooCow`, `ProgressBar`, `Chip`, `BottomSheet`,
  `TabBar`, `MealCard`, `LeaderRow`, …). Visit **`/kitchen-sink`** to see them all.
- **`src/screens/`** — `onboarding/` (10 steps), `home`, `meals`, `leaderboard`, `teams`, `profile`,
  `education`.
- **`src/content/`** — static data: `education.ts`, `seed.ts` (teams/facts/quests/accessories),
  `animals.ts`, `mooSprite.ts` (the mascot pixel grid).

Points/CO₂ constants live in `design.md §9` and are mirrored in `src/lib` **and** the DB trigger.

## Scoring

Vegan 10 · Vegetarian 8 · Fish 5 · Chicken 5 · Pork 2 · Beef 0. Photo +1 (flat). Max 3 meals/day
(one per breakfast/lunch/dinner slot). Quest days give 2× on the tier base (photo bonus not multiplied).
Streak = consecutive days with ≥1 meal, in America/Los_Angeles.

## Going live (Phase 8)

1. Create a free Supabase project.
2. Push the schema: run `supabase/migrations/0001_init.sql` then `0002_policies.sql` in the SQL editor
   (or via the Supabase CLI).
3. Seed reference data: `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/seed.mjs`.
4. Copy `.env.example` → `.env.local`, set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and
   `VITE_DATA_MODE=live`.
5. Deploy with `VITE_DATA_MODE=live`; the live provider sends the email OTP and upserts the onboarding profile using the authenticated user's ID.

## ⚠️ Asset licensing

The animal avatars carry a watermark (gold "crown" over the first cell, faint "…llc" on the balloon
sheet) — likely a paid/preview pack. **`Assets/` and the generated `public/avatars/` are therefore
gitignored and not distributed with this repo.** Confirm licensing (buy the pack or commission clean
sprites) before launch, then add the sheets locally and run `npm run slice`. The slicing script blanks
the watermark corner, but the underlying art still needs a license.

The **Moo mascot** (`src/content/mooSprite.ts`) is drawn from scratch and fully owned — no licensing
concern, and it renders everywhere without the pack.
