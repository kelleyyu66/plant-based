import { dayOfYear } from './dates'
import type { DailyFact, DailyQuest } from './types'

export function activeQuest(quests: DailyQuest[], d: Date = new Date()): DailyQuest | null {
  if (quests.length === 0) return null
  return quests[dayOfYear(d) % quests.length] ?? null
}

export function activeFact(facts: DailyFact[], d: Date = new Date()): DailyFact | null {
  if (facts.length === 0) return null
  return facts[dayOfYear(d) % facts.length] ?? null
}
