// Seed content shared by the mock backend and the Supabase seeder (scripts/seed.mjs).
// Teams, daily facts, daily quests, and the cow accessory ladder.
import type { Accessory, DailyFact, DailyQuest, Team } from '@/lib/types'

export const TEAMS: Team[] = [
  { id: 'team-kelley', name: 'Kelley’s Herd', captainName: 'Kelley', slug: 'kelley', capacity: 15, color: '#8FCB3C', sort: 0 },
  { id: 'team-vikram', name: 'Vikram’s Herd', captainName: 'Vikram', slug: 'vikram', capacity: 15, color: '#6FA8C7', sort: 1 },
  { id: 'team-chan', name: 'Chan’s Herd', captainName: 'Chan', slug: 'chan', capacity: 15, color: '#E0B15A', sort: 2 },
  { id: 'team-katarina', name: 'Katarina’s Herd', captainName: 'Katarina', slug: 'katarina', capacity: 15, color: '#D08080', sort: 3 },
]

export const DAILY_FACTS: DailyFact[] = [
  {
    dayIndex: 0,
    body: 'You don’t have to give up meat altogether to make a difference. Even small shifts — eating less meat and more plants, or switching from beef to chicken — can reduce your climate footprint.',
    sourceUrl: 'https://www.epa.gov/ghgemissions',
  },
  {
    dayIndex: 1,
    body: 'Beef produces roughly 6–10× the greenhouse gas of chicken per gram of protein, and dozens of times more than beans.',
    sourceUrl: 'https://ourworldindata.org/food-choice-vs-eating-local',
  },
  {
    dayIndex: 2,
    body: 'A single beef burger can take ~1,700 liters of water to produce, mostly to grow feed. A bean burger is a tiny fraction of that.',
    sourceUrl: 'https://waterfootprint.org',
  },
  {
    dayIndex: 3,
    body: 'Lentils fix nitrogen back into the soil as they grow — they literally help fertilize the field. Overachievers.',
    sourceUrl: 'https://www.fao.org/pulses-2016',
  },
  {
    dayIndex: 4,
    body: 'Tofu, tempeh, edamame, and soy curls all come from the same humble soybean — one of the most protein-dense plants on earth.',
    sourceUrl: 'https://fdc.nal.usda.gov',
  },
  {
    dayIndex: 5,
    body: 'If everyone in the US skipped meat and cheese one day a week, it would be like taking ~7.6 million cars off the road for a year.',
    sourceUrl: 'https://www.ewg.org/meateatersguide',
  },
  {
    dayIndex: 6,
    body: 'Plants can absolutely hit your protein goals: a cup of lentils has ~18g, a block of tofu ~20g, and a scoop of pea protein ~25g.',
    sourceUrl: 'https://fdc.nal.usda.gov',
  },
]

export const DAILY_QUESTS: DailyQuest[] = [
  { dayIndex: 0, title: 'Vegan Monday', tier: 'vegan', multiplier: 2, description: 'Log a vegan meal for double points.' },
  { dayIndex: 1, title: 'Tofu Tuesday', tier: 'vegan', multiplier: 2, description: 'Any vegan meal counts — bonus love for tofu.' },
  { dayIndex: 2, title: 'Meatless Midweek', tier: null, multiplier: 2, description: 'Any plant-based meal earns double.' },
  { dayIndex: 3, title: 'Veggie Thursday', tier: 'vegetarian', multiplier: 2, description: 'Vegetarian meals score double today.' },
  { dayIndex: 4, title: 'Plant Friday', tier: null, multiplier: 2, description: 'Any plant-based meal earns double.' },
  { dayIndex: 5, title: 'Green Weekend', tier: 'vegan', multiplier: 2, description: 'Vegan meals score double all weekend.' },
  { dayIndex: 6, title: 'Sunday Funday', tier: null, multiplier: 2, description: 'Any plant-based meal earns double.' },
]

// Cow accessory ladder — unlocks at team point thresholds (team points = sum of members).
// Names keep the playful energy of the old badges. spriteVariant hints the look.
export const ACCESSORIES: Accessory[] = [
  { id: 'acc-starter', sort: 0, name: 'Fresh Off the Farm', thresholdPoints: 0, spriteVariant: 'regular', description: 'Your cow, au naturel.' },
  { id: 'acc-party', sort: 1, name: 'Party Moo', thresholdPoints: 150, spriteVariant: 'hat', description: 'A tiny party hat. It’s a whole mood.' },
  { id: 'acc-balloon', sort: 2, name: 'Balloon Baron', thresholdPoints: 350, spriteVariant: 'balloon', description: 'Floating on good vibes and lentils.' },
  { id: 'acc-crown', sort: 3, name: 'Royal Ruminant', thresholdPoints: 600, spriteVariant: 'hat', description: 'A crown for a truly regal herd.' },
  { id: 'acc-legend', sort: 4, name: 'Lentil Legend', thresholdPoints: 1000, spriteVariant: 'balloon', description: 'Maximum drip. Cohort royalty.' },
]

export function nextAccessory(teamPoints: number): Accessory | null {
  return ACCESSORIES.find((a) => a.thresholdPoints > teamPoints) ?? null
}
export function unlockedAccessories(teamPoints: number): Accessory[] {
  return ACCESSORIES.filter((a) => a.thresholdPoints <= teamPoints)
}
export function topUnlockedAccessory(teamPoints: number): Accessory {
  const unlocked = unlockedAccessories(teamPoints)
  return unlocked[unlocked.length - 1] ?? ACCESSORIES[0]
}

// Challenge-wide shared goal (kg CO2 saved) and per-user / per-team goals (points).
export const CHALLENGE_CO2_GOAL_KG = 500
export const INDIVIDUAL_POINTS_GOAL = 140
export const TEAM_POINTS_GOAL = 1200
