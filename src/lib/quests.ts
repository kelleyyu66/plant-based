import { dayOfYear } from './dates'
import type { DailyFact } from './types'

export function activeFact(facts: DailyFact[], d: Date = new Date()): DailyFact | null {
  if (facts.length === 0) return null
  return facts[dayOfYear(d) % facts.length] ?? null
}

/** A random fact — call once per meal so the "Did you know?" changes every log. */
export function randomFact(facts: DailyFact[]): DailyFact | null {
  if (facts.length === 0) return null
  return facts[Math.floor(Math.random() * facts.length)] ?? null
}
