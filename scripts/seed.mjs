// Idempotent Supabase seeder — run locally with the service-role key (Phase 8).
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
// Seeds teams, daily facts, daily quests, and the accessory ladder.
// (Education content lives in src/content/education.ts — it is static, not seeded.)
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const sb = createClient(url, key)

const TEAMS = [
  { slug: 'kelley', name: 'Kelley’s Herd', captain_name: 'Kelley', capacity: 15, color: '#8FCB3C', sort: 0 },
  { slug: 'vikram', name: 'Vikram’s Herd', captain_name: 'Vikram', capacity: 15, color: '#6FA8C7', sort: 1 },
  { slug: 'chan', name: 'Chan’s Herd', captain_name: 'Chan', capacity: 15, color: '#E0B15A', sort: 2 },
  { slug: 'katarina', name: 'Katarina’s Herd', captain_name: 'Katarina', capacity: 15, color: '#D08080', sort: 3 },
]

// Keep in sync with src/content/seed.ts
const FACTS = [
  { day_index: 0, body: 'You don’t have to give up meat altogether to make a difference. Even small shifts can reduce your climate footprint.', source_url: 'https://www.epa.gov/ghgemissions' },
  { day_index: 1, body: 'Beef produces roughly 6–10× the greenhouse gas of chicken per gram of protein, and dozens of times more than beans.', source_url: 'https://ourworldindata.org/food-choice-vs-eating-local' },
  { day_index: 2, body: 'A single beef burger can take ~1,700 liters of water to produce. A bean burger is a tiny fraction of that.', source_url: 'https://waterfootprint.org' },
  { day_index: 3, body: 'Lentils fix nitrogen back into the soil as they grow — they literally help fertilize the field.', source_url: 'https://www.fao.org/pulses-2016' },
  { day_index: 4, body: 'Tofu, tempeh, edamame, and soy curls all come from the same humble soybean.', source_url: 'https://fdc.nal.usda.gov' },
  { day_index: 5, body: 'If everyone in the US skipped meat and cheese one day a week, it would be like taking ~7.6 million cars off the road for a year.', source_url: 'https://www.ewg.org/meateatersguide' },
  { day_index: 6, body: 'A cup of lentils has ~18g protein, a block of tofu ~20g, and a scoop of pea protein ~25g.', source_url: 'https://fdc.nal.usda.gov' },
]

const QUESTS = [
  { day_index: 0, title: 'Vegan Monday', tier: 'vegan', multiplier: 2, description: 'Log a vegan meal for double points.' },
  { day_index: 1, title: 'Tofu Tuesday', tier: 'vegan', multiplier: 2, description: 'Any vegan meal counts.' },
  { day_index: 2, title: 'Meatless Midweek', tier: null, multiplier: 2, description: 'Any plant-based meal earns double.' },
  { day_index: 3, title: 'Veggie Thursday', tier: 'vegetarian', multiplier: 2, description: 'Vegetarian meals score double.' },
  { day_index: 4, title: 'Plant Friday', tier: null, multiplier: 2, description: 'Any plant-based meal earns double.' },
  { day_index: 5, title: 'Green Weekend', tier: 'vegan', multiplier: 2, description: 'Vegan meals score double.' },
  { day_index: 6, title: 'Sunday Funday', tier: null, multiplier: 2, description: 'Any plant-based meal earns double.' },
]

const DAILY_CHALLENGES = [
  { day_index: 0, kind: 'tofu', title: 'Eat tofu' },
  { day_index: 1, kind: 'edamame', title: 'Eat edamame' },
  { day_index: 2, kind: 'five_colours', title: 'Eat 5 colours today' },
  { day_index: 3, kind: 'tempeh', title: 'Eat tempeh' },
  { day_index: 4, kind: 'cooked_at_home', title: 'Eat or cook all three meals at home' },
  { day_index: 5, kind: 'plant_protein_50g', title: 'Get at least 50g of plant-based protein' },
  { day_index: 6, kind: 'all_plant_meals', title: 'Make all meals plant-based' },
]

const ACCESSORIES = [
  { sort: 0, name: 'Fresh Off the Farm', threshold_points: 0, sprite_variant: 'regular', description: 'Your cow, au naturel.' },
  { sort: 1, name: 'Party Moo', threshold_points: 150, sprite_variant: 'hat', description: 'A tiny party hat.' },
  { sort: 2, name: 'Balloon Baron', threshold_points: 350, sprite_variant: 'balloon', description: 'Floating on good vibes.' },
  { sort: 3, name: 'Royal Ruminant', threshold_points: 600, sprite_variant: 'hat', description: 'A crown for a regal herd.' },
  { sort: 4, name: 'Lentil Legend', threshold_points: 1000, sprite_variant: 'balloon', description: 'Maximum drip.' },
]

async function upsert(table, rows, onConflict) {
  const { error } = await sb.from(table).upsert(rows, { onConflict })
  if (error) throw error
  console.log(`seeded ${table}: ${rows.length}`)
}

await upsert('teams', TEAMS, 'slug')
await upsert('daily_facts', FACTS, 'day_index')
await upsert('daily_quests', QUESTS, 'day_index')
await upsert('daily_challenges', DAILY_CHALLENGES, 'day_index')
await upsert('accessories', ACCESSORIES, 'sort')
console.log('seed complete.')
