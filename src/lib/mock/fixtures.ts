// Deterministic mock data: ~45 cohort members with logged meals, comments, reactions.
// Seeded RNG so leaderboard numbers are stable across reloads. design.md / plan Phase 1.
import { TEAMS } from '@/content/seed'
import { computeMealPoints } from '../points'
import { co2SavedKg } from '../impact'
import { toCohortDate } from '../dates'
import type { Comment, Meal, MealTier, MealTime, Profile, Reaction, StartingDiet } from '../types'

// Cohort roster from the planning PDF.
const ROSTER = [
  'Alexander Akande', 'Angela Clemente', 'Angela Shen', 'Anna Rodriguez', 'Anson Choi',
  'Autumn Goodrum-Davis', 'Bernice Sun', 'Caleb Aguiar', 'Catherine Fu', 'Chandana Mekala',
  'Charlotte Truong', 'Cindy Kim Ly', 'Clarisse Sicat', 'Elaine Jin', 'Emily Wong',
  'Hannah Hatchett', 'Jacquelyn Powell', 'Jiayi Sun', 'Jimmy Huang', 'Jinmao Wang',
  'Josephine Waliman', 'Kaiyo Fan', 'Kanishka Baskar', 'Katarina Blind', 'Keila Braden',
  'Layomi Akinrinade', 'Madeleine Iribarren', 'Madhurima Chatterjee', 'Malik Zhang', 'Marlyn Reed',
  'Meera Divecha', 'Naomi Boruchowicz', 'Nivedha Shanmugam', 'Nono Sun', 'Peggy Shen',
  'Prerna Kashyap', 'Rakshit Keswani', 'Shannon Han', 'Sophia Guild', 'Stella Sun',
  'Tarlitha Napitupulu', 'Umi Chen', 'Vikram SM', 'Winnie Cheng', 'Yu-Cheng Yang', 'Yun Cho',
]

// Small deterministic RNG (mulberry32).
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TIERS: MealTier[] = ['vegan', 'vegan', 'vegetarian', 'vegetarian', 'fish', 'chicken', 'pork', 'beef']
const TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner']
const CAPTIONS = [
  'Garbanzo arugula bowl!', 'vegan shawarma wrap from Falafel Inc', 'teriyaki tempura tofu and rice',
  'spinach onion tomato avocado harissa spread', 'decaf mocha soy milk', 'pastries & coffee',
  'lentil soup that slaps', 'cauliflower gnocchi, pan-fried', 'chickpea curry over rice',
  'big salad, bigger vibes', 'tofu scramble tacos', 'peanut noodles', 'miso ramen (no egg)',
]
const EMOJIS = ['🌱', '🔥', '😋', '👏', '🐄', '💚']

// Challenge started 7 days ago in the mock so there's history to show.
function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toCohortDate(d)
}

export interface MockData {
  profiles: Profile[]
  meals: Meal[]
  comments: Comment[]
  reactions: Reaction[]
}

/**
 * Real launch: the cohort starts from zero — no fabricated members, meals,
 * points, or photos. Flip to true to bring back the demo cohort (handy for
 * screenshots and layout work).
 */
const DEMO_DATA = false

export function buildMockData(): MockData {
  if (!DEMO_DATA) return { profiles: [], meals: [], comments: [], reactions: [] }
  const rand = rng(20260629)
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)]

  const profiles: Profile[] = ROSTER.map((name, i) => {
    const team = TEAMS[i % TEAMS.length]
    const startingDiet: StartingDiet = rand() < 0.4 ? 'vegetarian' : 'meat_or_flexitarian'
    return {
      id: `u${i}`,
      displayName: name,
      cowName: null,
      avatarIndex: i % 20,
      teamId: team.id,
      startingDiet,
      onboarding: {
        plantFrequency: startingDiet === 'vegetarian' ? 'mostly' : pick(['never', 'rarely', 'sometimes', 'often']),
        proteins: startingDiet === 'vegetarian' ? ['Tofu', 'Beans'] : ['Chicken', 'Beef'],
        climateFamiliarity: pick(['new', 'somewhat', 'very']),
      },
      streakGoal: pick([3, 5, 7]) as 3 | 5 | 7,
      streakCurrent: Math.floor(rand() * 6),
      streakBest: Math.floor(rand() * 7),
      lastLoggedDate: dateNDaysAgo(Math.floor(rand() * 2)),
      createdAt: dateNDaysAgo(7),
    }
  })

  const meals: Meal[] = []
  const comments: Comment[] = []
  const reactions: Reaction[] = []
  let mealSeq = 0
  let cSeq = 0
  let rSeq = 0

  for (const p of profiles) {
    // Vegetarians log more plant-based meals; everyone logs over ~6 days.
    const days = 6
    for (let d = 0; d < days; d++) {
      const mealsToday = Math.floor(rand() * 4) // 0–3
      const times = [...TIMES].sort(() => rand() - 0.5).slice(0, mealsToday)
      for (const time of times) {
        let tier = pick(TIERS)
        if (p.startingDiet === 'vegetarian' && (tier === 'beef' || tier === 'pork' || tier === 'chicken' || tier === 'fish')) {
          tier = rand() < 0.85 ? (rand() < 0.6 ? 'vegan' : 'vegetarian') : tier
        }
        const hasPhoto = rand() < 0.5
        const id = `m${mealSeq++}`
        meals.push({
          id,
          userId: p.id,
          tier,
          mealTime: time,
          mealDate: dateNDaysAgo(days - 1 - d),
          photoUrl: hasPhoto ? photoFor(tier, mealSeq) : null,
          caption: rand() < 0.7 ? pick(CAPTIONS) : null,
          questTags: [],
          plantProteinGrams: 0,
          points: computeMealPoints(tier, hasPhoto),
          co2SavedKg: co2SavedKg(tier),
          createdAt: dateNDaysAgo(days - 1 - d),
        })
        // A few comments / reactions on some meals.
        if (rand() < 0.3) {
          const commenter = pick(profiles)
          comments.push({
            id: `c${cSeq++}`,
            mealId: id,
            userId: commenter.id,
            body: pick(['looks amazing!', 'recipe?? 👀', 'so good', 'moo approves', 'making this tonight']),
            createdAt: dateNDaysAgo(days - 1 - d),
          })
        }
        const reactCount = Math.floor(rand() * 4)
        const used = new Set<string>()
        for (let k = 0; k < reactCount; k++) {
          const reactor = pick(profiles)
          const emoji = pick(EMOJIS)
          const key = `${reactor.id}:${emoji}`
          if (used.has(key)) continue
          used.add(key)
          reactions.push({ id: `r${rSeq++}`, mealId: id, userId: reactor.id, emoji, createdAt: dateNDaysAgo(d) })
        }
      }
    }
  }

  return { profiles, meals, comments, reactions }
}

// Deterministic food photos (Unsplash source-style ids) so the feed looks alive in mock mode.
const PHOTOS = [
  'photo-1512621776951-a57141f2eefd', // salad
  'photo-1467003909585-2f8a72700288', // bowl
  'photo-1540189549336-e6e99c3679fe', // veggies
  'photo-1490645935967-10de6ba17061', // healthy plate
  'photo-1543339308-43e59d6b73a6', // tacos
  'photo-1546069901-ba9599a7e63c', // buddha bowl
  'photo-1512852939750-1305098529bf', // noodles
  'photo-1476224203421-9ac39bcb3327', // curry
]
function photoFor(_tier: MealTier, seq: number): string {
  const id = PHOTOS[seq % PHOTOS.length]
  return `https://images.unsplash.com/${id}?w=400&h=400&fit=crop`
}
