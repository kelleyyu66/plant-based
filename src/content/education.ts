// "Moo's little cookbook" — static reference content (works offline). design.md §10.
// Sourced from the planning PDF.

export interface ProteinRow {
  name: string
  allergen: string
  whereToBuy: string
}

export const PROTEINS: ProteinRow[] = [
  { name: 'Tofu', allergen: 'Soy', whereToBuy: "Trader Joe's" },
  { name: 'Tempeh', allergen: 'Soy', whereToBuy: "Trader Joe's" },
  { name: 'Edamame', allergen: 'Soy', whereToBuy: 'Amazon / grocery' },
  { name: 'Soy curls', allergen: 'Soy', whereToBuy: "Butler's / Amazon" },
  { name: 'Seitan', allergen: 'Wheat (gluten)', whereToBuy: 'DIY (YouTube) / grocery' },
  { name: 'Lentils', allergen: 'None', whereToBuy: 'Any grocery store' },
  { name: 'Chickpeas', allergen: 'None', whereToBuy: 'Amazon / any grocery' },
  { name: 'Pea protein powder', allergen: 'None', whereToBuy: 'Amazon / any grocery' },
]

export interface YouTubeChannel {
  name: string
  url: string
}

export const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  { name: 'Yeung Man Cooking', url: 'https://www.youtube.com/@YEUNGMANCOOKING' },
  { name: 'Pick Up Limes', url: 'https://www.youtube.com/@PickUpLimes' },
  { name: 'Gaz Oakley (Avant Garde Vegan)', url: 'https://www.youtube.com/@gazoakleychef' },
  { name: 'Mark Stache (Sauce Stache)', url: 'https://www.youtube.com/@Mark_Stache' },
  { name: 'TheeBurgerDude', url: 'https://www.youtube.com/@TheeBurgerDude' },
  { name: 'Rainbow Plant Life', url: 'https://www.youtube.com/@RainbowPlantLife' },
  { name: 'Max La Manna', url: 'https://www.youtube.com/@Max_LaManna/' },
  { name: 'Alfie Cooks', url: 'https://www.youtube.com/@alfiecooks/' },
  { name: 'Julius Fiedler (Hermann)', url: 'https://www.youtube.com/@BakingHermann' },
  { name: 'Andrew Bernard', url: 'https://www.youtube.com/@thenarddogcooks' },
]

export interface Restaurant {
  name: string
  cuisine: string
  location: string
}

export const RESTAURANTS: Restaurant[] = [
  { name: "Araya's Place", cuisine: 'Thai', location: 'U District' },
  { name: 'The Wayward Cafe', cuisine: 'American breakfast', location: 'Roosevelt' },
  { name: 'Kati Vegan Thai', cuisine: 'Thai', location: 'South Lake Union' },
  { name: 'Cocoa Legato', cuisine: 'Chocolate / dessert', location: 'West of Green Lake' },
  { name: 'Vital Creations Vegan Bistro', cuisine: 'Fusion', location: 'Fremont' },
  { name: 'Pi Vegan Pizzeria', cuisine: 'Pizza', location: 'Roosevelt' },
]

export interface TjPick {
  item: string
  note: string
}

export const TRADER_JOES_PICKS: TjPick[] = [
  { item: 'Soy Chorizo', note: 'Smoky, cheap, great in tacos & scrambles.' },
  { item: 'High Protein Tofu', note: 'Firmer than most — crisps up beautifully.' },
  { item: 'Vegan Tikka Masala', note: 'Freezer aisle hero for a lazy dinner.' },
  { item: 'Cauliflower Gnocchi', note: 'Pan-fry, don’t boil. Trust Moo.' },
  { item: 'Vegan Kale, Cashew & Basil Pesto', note: 'Toss with pasta or roasted veg.' },
  { item: 'Banana Almond Non-Dairy Frozen Dessert', note: 'Two ingredients, weirdly good.' },
]

export interface DailyTip {
  day: number
  tips: string[]
}

// One or two short tips per day, easing from "just start" into technique as the
// week goes on. Kept punchy on purpose — a cookbook you actually read.
export const DAILY_TIPS: DailyTip[] = [
  { day: 1, tips: ['You don’t have to go all-in. Swapping one meal a day already makes a real dent.'] },
  { day: 2, tips: ['Aim for a palm-sized protein each meal: tofu, lentils, chickpeas, or edamame.'] },
  {
    day: 3,
    tips: [
      'Plants love salt, acid, and fat — soy sauce, lemon, and a little oil go a long way.',
      'Firmer (high-protein) tofu packs more protein and crisps up better.',
    ],
  },
  { day: 4, tips: ['Stock a lazy shelf: canned beans, frozen edamame, pre-cooked lentils, a jar of curry sauce.'] },
  {
    day: 5,
    tips: [
      'Eating all your leftovers is one of the easiest ways to fight climate change.',
      'Press tofu 10 minutes before cooking for a chewier, less watery bite.',
    ],
  },
  {
    day: 6,
    tips: [
      'Blend soaked cashews or silken tofu for creamy, dairy-free sauces.',
      'Batch-cook a pot of beans or lentils to carry three meals.',
    ],
  },
  {
    day: 7,
    tips: [
      'Build a bowl: grain + bean + roasted veg + a punchy sauce. Endlessly remixable.',
      'A spoon of nutritional yeast adds a savory, cheesy hit to almost anything.',
    ],
  },
]
