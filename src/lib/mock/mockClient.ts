import type {
  DataProvider,
  LogMealInput,
  LogMealResult,
  OnboardingInput,
  UpdateMealInput,
} from '../dataProvider'
import type { Comment, DailyQuestProgress, LeaderboardEntry, Meal, Profile, Reaction, Team, TeamStanding } from '../types'
import { TEAMS } from '@/content/seed'
import { DAILY_QUESTS } from '@/content/seed'
import { computeMealPoints } from '../points'
import { co2SavedKg } from '../impact'
import { applyLog, streakBonus } from '../streak'
import { activeQuest } from '../quests'
import { toCohortDate } from '../dates'
import { activeDailyChallenge, dailyQuestProgress } from '../dailyQuest'
import { buildMockData, type MockData } from './fixtures'

const LS_KEY = 'moo.mock.v1'
const ME_ID = 'me'

interface Persisted {
  me: Profile | null
  pendingEmail: string | null
  myMeals: Meal[]
  myComments: Comment[]
  // reactions the current user has added (mealId -> set of emojis)
  myReactions: Reaction[]
}

function loadPersisted(): Persisted {
  if (typeof localStorage === 'undefined') return blank()
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return blank()
    return { ...blank(), ...JSON.parse(raw) }
  } catch {
    return blank()
  }
}
function blank(): Persisted {
  return { me: null, pendingEmail: null, myMeals: [], myComments: [], myReactions: [] }
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

/** In-memory mock backend: deterministic fixtures + a localStorage overlay for "me". */
export class MockProvider implements DataProvider {
  private base: MockData = buildMockData()
  private p: Persisted = loadPersisted()

  private save() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(this.p))
  }

  private allProfiles(): Profile[] {
    return this.p.me ? [...this.base.profiles, this.p.me] : this.base.profiles
  }
  private allMeals(): Meal[] {
    return [...this.base.meals, ...this.p.myMeals]
  }
  private allComments(): Comment[] {
    return [...this.base.comments, ...this.p.myComments]
  }
  private allReactions(): Reaction[] {
    return [...this.base.reactions, ...this.p.myReactions]
  }

  // ---- session ----
  async getMyProfile() {
    await delay(50)
    return this.p.me
  }
  async signInWithEmail(email: string) {
    await delay()
    this.p.pendingEmail = email
    this.save()
  }
  async signOut() {
    this.p = blank()
    this.save()
  }
  async completeOnboarding(input: OnboardingInput): Promise<Profile> {
    await delay()
    const me: Profile = {
      id: ME_ID,
      displayName: input.displayName,
      email: input.email ?? this.p.pendingEmail ?? null,
      cowName: input.cowName,
      avatarIndex: input.avatarIndex,
      teamId: input.teamId,
      startingDiet: input.startingDiet,
      onboarding: input.onboarding,
      streakGoal: input.streakGoal,
      streakCurrent: 0,
      streakBest: 0,
      lastLoggedDate: null,
      createdAt: new Date().toISOString(),
    }
    this.p.me = me
    this.save()
    return me
  }
  async updateMyProfile(patch: Partial<Profile>): Promise<Profile> {
    if (!this.p.me) throw new Error('not onboarded')
    this.p.me = { ...this.p.me, ...patch }
    this.save()
    return this.p.me
  }

  // ---- reads ----
  async listProfiles() {
    await delay(40)
    return this.allProfiles()
  }
  async getProfile(id: string) {
    await delay(30)
    return this.allProfiles().find((p) => p.id === id) ?? null
  }
  async listTeams(): Promise<Team[]> {
    return [...TEAMS].sort((a, b) => a.sort - b.sort)
  }
  async userPoints(userId: string) {
    return this.allMeals()
      .filter((m) => m.userId === userId)
      .reduce((s, m) => s + m.points, 0)
  }
  async leaderboard(): Promise<LeaderboardEntry[]> {
    await delay(60)
    const byUser = new Map<string, { points: number; meals: number }>()
    for (const m of this.allMeals()) {
      const e = byUser.get(m.userId) ?? { points: 0, meals: 0 }
      e.points += m.points
      e.meals += 1
      byUser.set(m.userId, e)
    }
    return this.allProfiles()
      .map((profile) => ({
        profile,
        points: byUser.get(profile.id)?.points ?? 0,
        meals: byUser.get(profile.id)?.meals ?? 0,
      }))
      .sort((a, b) => b.points - a.points)
  }
  async teamStandings(): Promise<TeamStanding[]> {
    await delay(50)
    const teams = await this.listTeams()
    const profiles = this.allProfiles()
    const meals = this.allMeals()
    return teams
      .map((team) => {
        const members = profiles.filter((p) => p.teamId === team.id)
        const memberIds = new Set(members.map((m) => m.id))
        const points = meals.filter((m) => memberIds.has(m.userId)).reduce((s, m) => s + m.points, 0)
        return { team, points, members: members.length }
      })
      .sort((a, b) => b.points - a.points)
  }
  async teamMembers(teamId: string) {
    return this.allProfiles().filter((p) => p.teamId === teamId)
  }
  async listMeals() {
    await delay(60)
    return [...this.allMeals()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }
  async listUserMeals(userId: string) {
    return this.allMeals()
      .filter((m) => m.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }
  async myMealsForDate(date: string) {
    if (!this.p.me) return []
    return this.p.myMeals.filter((m) => m.userId === ME_ID && m.mealDate === date)
  }
  async dailyQuestProgress(date: string): Promise<DailyQuestProgress | null> {
    if (!this.p.me) return null
    return dailyQuestProgress(
      this.p.myMeals.filter((meal) => meal.userId === ME_ID && meal.mealDate === date),
      activeDailyChallenge(new Date(`${date}T12:00:00`)),
    )
  }
  async challengeImpactKg() {
    return this.allMeals().reduce((s, m) => s + m.co2SavedKg, 0)
  }

  // ---- meal social ----
  async listComments(mealId: string) {
    await delay(30)
    return this.allComments()
      .filter((c) => c.mealId === mealId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  }
  async addComment(mealId: string, body: string): Promise<Comment> {
    if (!this.p.me) throw new Error('not onboarded')
    const c: Comment = {
      id: `mc${Date.now()}`,
      mealId,
      userId: ME_ID,
      body,
      createdAt: new Date().toISOString(),
    }
    this.p.myComments.push(c)
    this.save()
    return c
  }
  async listReactions(mealId: string) {
    return this.allReactions().filter((r) => r.mealId === mealId)
  }
  async toggleReaction(mealId: string, emoji: string) {
    if (!this.p.me) throw new Error('not onboarded')
    const idx = this.p.myReactions.findIndex((r) => r.mealId === mealId && r.userId === ME_ID && r.emoji === emoji)
    if (idx >= 0) {
      this.p.myReactions.splice(idx, 1)
    } else {
      this.p.myReactions.push({
        id: `mr${Date.now()}`,
        mealId,
        userId: ME_ID,
        emoji,
        createdAt: new Date().toISOString(),
      })
    }
    this.save()
  }

  // ---- writes ----
  async logMeal(input: LogMealInput): Promise<LogMealResult> {
    await delay()
    if (!this.p.me) throw new Error('not onboarded')

    // Enforce the 3-meals/day cap (one per time slot).
    const existing = this.p.myMeals.filter((m) => m.mealDate === input.mealDate)
    if (existing.length >= 3) throw new Error('MEAL_CAP')
    if (existing.some((m) => m.mealTime === input.mealTime)) throw new Error('SLOT_TAKEN')

    const quest = activeQuest(DAILY_QUESTS)
    const points = computeMealPoints(input.tier, input.hasPhoto, quest)
    const meal: Meal = {
      id: `mm${Date.now()}`,
      userId: ME_ID,
      tier: input.tier,
      mealTime: input.mealTime,
      mealDate: input.mealDate,
      photoUrl: input.photoDataUrl,
      caption: input.caption,
      questTags: input.questTags ?? [],
      plantProteinGrams: input.plantProteinGrams ?? 0,
      points,
      co2SavedKg: co2SavedKg(input.tier),
      createdAt: new Date().toISOString(),
    }
    this.p.myMeals.push(meal)

    // Update streak.
    const today = toCohortDate()
    const streak = applyLog(
      { current: this.p.me.streakCurrent, best: this.p.me.streakBest, lastDate: this.p.me.lastLoggedDate },
      input.mealDate === today ? today : input.mealDate,
      this.p.me.streakGoal,
    )
    const bonus = streak.hitGoal ? streakBonus(this.p.me.streakGoal) : 0
    this.p.me = {
      ...this.p.me,
      streakCurrent: streak.current,
      streakBest: streak.best,
      lastLoggedDate: streak.lastDate,
    }
    this.save()

    return { meal, streak, bonus, pointsEarned: points + bonus }
  }

  /** Edit one of my own meals. Points are recomputed from the new fields. */
  async updateMeal(input: UpdateMealInput): Promise<Meal> {
    await delay()
    const idx = this.p.myMeals.findIndex((m) => m.id === input.id)
    if (idx === -1) throw new Error('NOT_FOUND')

    // Same slot rules as logging, ignoring the meal being edited.
    const others = this.p.myMeals.filter((m) => m.id !== input.id && m.mealDate === input.mealDate)
    if (others.length >= 3) throw new Error('MEAL_CAP')
    if (others.some((m) => m.mealTime === input.mealTime)) throw new Error('SLOT_TAKEN')

    const quest = activeQuest(DAILY_QUESTS)
    const meal: Meal = {
      ...this.p.myMeals[idx],
      tier: input.tier,
      mealTime: input.mealTime,
      mealDate: input.mealDate,
      caption: input.caption,
      photoUrl: input.photoDataUrl,
      questTags: input.questTags ?? [],
      plantProteinGrams: input.plantProteinGrams ?? 0,
      points: computeMealPoints(input.tier, !!input.photoDataUrl, quest),
      co2SavedKg: co2SavedKg(input.tier),
    }
    this.p.myMeals[idx] = meal
    this.save()
    return meal
  }

  async deleteMeal(id: string): Promise<void> {
    await delay()
    this.p.myMeals = this.p.myMeals.filter((m) => m.id !== id)
    this.save()
  }
}
