import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingAnswers, StartingDiet } from '@/lib/types'

export interface OnboardingState {
  step: number // 1..8
  /** The person's name (step 1) — becomes profile.displayName. */
  name: string
  email: string
  plantFrequency: OnboardingAnswers['plantFrequency'] | null
  proteins: string[]
  climateFamiliarity: OnboardingAnswers['climateFamiliarity'] | null
  streakGoal: 3 | 5 | 7 | null
  avatarIndex: number | null
  teamId: string | null
  /** What the user named their cow (step 10). */
  cowName: string

  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void
  toggleProtein: (p: string) => void
  next: () => void
  back: () => void
  goto: (step: number) => void
  reset: () => void
}

const TOTAL = 8

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      name: '',
      email: '',
      plantFrequency: null,
      proteins: [],
      climateFamiliarity: null,
      streakGoal: null,
      avatarIndex: null,
      teamId: null,
      cowName: '',

      setField: (key, value) => set({ [key]: value } as Partial<OnboardingState>),
      toggleProtein: (p) =>
        set((s) => ({
          proteins: s.proteins.includes(p) ? s.proteins.filter((x) => x !== p) : [...s.proteins, p],
        })),
      next: () => set((s) => ({ step: Math.min(TOTAL, s.step + 1) })),
      back: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
      goto: (step) => set({ step }),
      reset: () =>
        set({
          step: 1,
          name: '',
          email: '',
          plantFrequency: null,
          proteins: [],
          climateFamiliarity: null,
          streakGoal: null,
          avatarIndex: null,
          teamId: null,
          cowName: '',
        }),
    }),
    // v3: dropped streak-goal + team steps; flow is 8 steps.
    { name: 'moo.onboarding.v3' },
  ),
)

export const ONBOARDING_TOTAL = TOTAL

/** Derive the leaderboard cohort from survey answers. design.md §3. */
export function deriveStartingDiet(plantFrequency: string | null): StartingDiet {
  return plantFrequency === 'mostly' ? 'vegetarian' : 'meat_or_flexitarian'
}
