// Seed content shared by the mock backend and the Supabase seeder (scripts/seed.mjs).
// Teams, daily facts, daily quests, and the cow accessory ladder.
import type { Accessory, DailyChallenge, DailyFact, Team } from '@/lib/types'

export const TEAMS: Team[] = [
  { id: 'team-kelley', name: 'Kelley’s Herd', captainName: 'Kelley', slug: 'kelley', capacity: 15, color: '#8FCB3C', sort: 0 },
  { id: 'team-vikram', name: 'Vikram’s Herd', captainName: 'Vikram', slug: 'vikram', capacity: 15, color: '#6FA8C7', sort: 1 },
  { id: 'team-chan', name: 'Chan’s Herd', captainName: 'Chan', slug: 'chan', capacity: 15, color: '#E0B15A', sort: 2 },
  { id: 'team-katarina', name: 'Katarina’s Herd', captainName: 'Katarina', slug: 'katarina', capacity: 15, color: '#D08080', sort: 3 },
]

export const DAILY_FACTS: DailyFact[] = [
  { dayIndex: 0, body: 'Food production is responsible for about one-third of global greenhouse gas emissions.', sourceUrl: null },
  { dayIndex: 1, body: 'Producing 1 kg of beef emits over 60× more greenhouse gases than producing 1 kg of lentils.', sourceUrl: null },
  { dayIndex: 2, body: 'It takes around 15,000 liters of water to produce 1 kg of beef.', sourceUrl: null },
  { dayIndex: 3, body: 'A plant-based diet can cut your food-related carbon footprint by around half.', sourceUrl: null },
  { dayIndex: 4, body: 'Livestock uses nearly 80% of the world’s agricultural land, but provides less than 20% of our calories.', sourceUrl: null },
  { dayIndex: 5, body: 'Beans are among the most sustainable sources of protein on the planet.', sourceUrl: null },
  { dayIndex: 6, body: 'Eating 30 different plant foods each week is associated with a more diverse gut microbiome.', sourceUrl: null },
  { dayIndex: 7, body: 'Most adults don’t eat enough fiber, and plants are its richest natural source.', sourceUrl: null },
  { dayIndex: 8, body: 'Lentils contain more protein per acre than beef while requiring a fraction of the land.', sourceUrl: null },
  { dayIndex: 9, body: 'Reducing demand for animal agriculture helps protect forests, wildlife habitats, and biodiversity.', sourceUrl: null },
  { dayIndex: 10, body: 'If everyone adopted a plant-rich diet, global agricultural land use could be reduced dramatically while still feeding the world’s population.', sourceUrl: null },
  { dayIndex: 11, body: 'Eating a variety of colorful fruits and vegetables helps you consume a wider range of vitamins and antioxidants.', sourceUrl: null },
  { dayIndex: 12, body: 'Many elite endurance athletes include predominantly plant-based diets because carbohydrates are the body’s preferred fuel for endurance exercise.', sourceUrl: null },
  { dayIndex: 13, body: 'Nuts and seeds provide healthy fats, protein, fiber, and important minerals like magnesium and zinc.', sourceUrl: null },
  { dayIndex: 14, body: 'Whole plant foods feed the beneficial bacteria in your gut, which produce compounds linked to better digestive and metabolic health.', sourceUrl: null },
  { dayIndex: 15, body: 'You don’t have to be 100% plant-based to make a difference—even replacing a few meat-based meals each week lowers your environmental impact.', sourceUrl: null },
  { dayIndex: 16, body: 'The environmental impact of what you eat is often greater than where your food comes from.', sourceUrl: null },
  { dayIndex: 17, body: 'Dark leafy greens like spinach and kale are packed with vitamins A, C, K, folate, and iron.', sourceUrl: null },
  { dayIndex: 18, body: 'Legumes like beans, peas, and lentils naturally add nitrogen to the soil, reducing the need for synthetic fertilizers.', sourceUrl: null },
  { dayIndex: 19, body: 'Plant-based eating isn’t all-or-nothing—every plant-based meal contributes to lower emissions, reduced resource use, and better diet quality.', sourceUrl: null },
]

// The first two tasks are always the same; this third task rotates daily.
export const DAILY_CHALLENGES: DailyChallenge[] = [
  { dayIndex: 0, kind: 'tofu', title: 'Eat tofu' },
  { dayIndex: 1, kind: 'edamame', title: 'Eat edamame' },
  { dayIndex: 2, kind: 'five_colours', title: 'Eat 5 colours today' },
  { dayIndex: 3, kind: 'green_vegetables', title: 'Eat green vegetables' },
  { dayIndex: 4, kind: 'cooked_at_home', title: 'Eat or cook all three meals at home' },
  { dayIndex: 5, kind: 'all_plant_meals', title: 'Make all meals plant-based' },
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

/** Length of the cohort challenge, in days. */
export const CHALLENGE_DAYS = 7
/**
 * The cohort's real start date (YYYY-MM-DD), used to label meals "Day 1"…"Day 7"
 * and to sequence the daily challenges in dayIndex order (start = dayIndex 0).
 * When null it's derived from the earliest logged meal.
 */
export const CHALLENGE_START_DATE: string | null = '2026-08-03'
