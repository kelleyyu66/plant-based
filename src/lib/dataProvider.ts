import type {
  Comment,
  DailyQuestProgress,
  LeaderboardEntry,
  Meal,
  MealTier,
  MealTime,
  OnboardingAnswers,
  Profile,
  Reaction,
  StartingDiet,
  Team,
  TeamStanding,
  QuestTag,
} from './types'
import type { StreakResult } from './streak'
import { MockProvider } from './mock/mockClient'
import { SupabaseProvider } from './supabaseProvider'

export interface LogMealInput {
  tier: MealTier
  mealTime: MealTime
  mealDate: string
  caption: string | null
  hasPhoto: boolean
  photoDataUrl: string | null
  questTags?: QuestTag[]
  plantProteinGrams?: number
}

export interface LogMealResult {
  meal: Meal
  streak: StreakResult
  bonus: number // one-time streak-milestone bonus, 0 if none
  pointsEarned: number // meal points + bonus
}

/** Editable fields of an already-logged meal (own meals only). */
export interface UpdateMealInput {
  id: string
  tier: MealTier
  mealTime: MealTime
  mealDate: string
  caption: string | null
  photoDataUrl: string | null
  questTags?: QuestTag[]
  plantProteinGrams?: number
}

export interface OnboardingInput {
  displayName: string
  email?: string | null
  cowName: string | null
  avatarIndex: number
  teamId: string | null
  startingDiet: StartingDiet
  onboarding: OnboardingAnswers
  streakGoal: 3 | 5 | 7
}

/** The single data interface. Every hook talks to this, never to Supabase directly. */
export interface DataProvider {
  // session / auth
  getMyProfile(): Promise<Profile | null>
  signUpWithEmail(email: string): Promise<void>
  signInWithEmail(email: string): Promise<void>
  signOut(): Promise<void>
  completeOnboarding(input: OnboardingInput): Promise<Profile>
  updateMyProfile(patch: Partial<Profile>): Promise<Profile>

  // reads
  listProfiles(): Promise<Profile[]>
  getProfile(id: string): Promise<Profile | null>
  listTeams(): Promise<Team[]>
  teamStandings(): Promise<TeamStanding[]>
  teamMembers(teamId: string): Promise<Profile[]>
  leaderboard(): Promise<LeaderboardEntry[]>
  listMeals(): Promise<Meal[]>
  listUserMeals(userId: string): Promise<Meal[]>
  myMealsForDate(date: string): Promise<Meal[]>
  dailyQuestProgress(date: string): Promise<DailyQuestProgress | null>
  userPoints(userId: string): Promise<number>
  challengeImpactKg(): Promise<number>

  // meal social
  listComments(mealId: string): Promise<Comment[]>
  /** Every comment across every meal — powers comment-count badges and the
   *  "someone commented" notifications, which need to scan the whole cohort. */
  listAllComments(): Promise<Comment[]>
  addComment(mealId: string, body: string): Promise<Comment>
  listReactions(mealId: string): Promise<Reaction[]>
  toggleReaction(mealId: string, emoji: string): Promise<void>

  // writes
  logMeal(input: LogMealInput): Promise<LogMealResult>
  updateMeal(input: UpdateMealInput): Promise<Meal>
  deleteMeal(id: string): Promise<void>
}

const MODE = import.meta.env.VITE_DATA_MODE ?? 'mock'

let provider: DataProvider

export function getDataProvider(): DataProvider {
  if (!provider) {
    console.log("DATA MODE:", MODE)

    if (MODE === 'live') {
      provider = new SupabaseProvider()
      console.log("USING SUPABASE PROVIDER")
    } else {
      provider = new MockProvider()
      console.log("USING MOCK PROVIDER")
    }
  }

  console.log("PROVIDER:", provider.constructor.name)

  return provider
}

export const data = getDataProvider()
