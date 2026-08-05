import type {
  DataProvider,
  LogMealInput,
  LogMealResult,
  OnboardingInput,
  UpdateMealInput,
} from './dataProvider'
import { MockProvider } from './mock/mockClient'
import type {
  Comment,
  DailyQuestProgress,
  LeaderboardEntry,
  Meal,
  MealTier,
  MealTime,
  Profile,
  QuestTag,
  Reaction,
  Team,
  TeamStanding,
} from './types'
import { supabase } from './supabase'
import { computeMealPoints } from './points'
import { co2SavedKg } from './impact'
import { applyLog, streakBonus } from './streak'
import { activeDailyChallenge, dailyQuestBonus, dailyQuestProgress as computeQuestProgress } from './dailyQuest'

const PHOTO_BUCKET = 'meal-photos'

type Row = Record<string, unknown>

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

function toProfile(row: Row): Profile {
  return {
    id: row.id as string,
    displayName: row.display_name as string,
    cowName: (row.cow_name as string | null) ?? null,
    avatarIndex: row.avatar_index as number,
    teamId: (row.team_id as string | null) ?? null,
    startingDiet: row.starting_diet as Profile['startingDiet'],
    onboarding: row.onboarding as Profile['onboarding'],
    streakGoal: row.streak_goal as Profile['streakGoal'],
    streakCurrent: row.streak_current as number,
    streakBest: row.streak_best as number,
    lastLoggedDate: (row.last_logged_date as string | null) ?? null,
    createdAt: row.created_at as string,
  }
}

function toTeam(row: Row): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    captainName: row.captain_name as string,
    slug: row.slug as string,
    capacity: row.capacity as number,
    color: row.color as string,
    sort: row.sort as number,
  }
}

/**
 * The live data layer. Auth + all reads/writes go to Supabase.
 *
 * Scoring note: the DB's meals.points column is set by a trigger that still uses
 * the old point multiplier, so we DELIBERATELY ignore it on read and recompute
 * points on the client (tier base + photo), then layer the once-per-day
 * daily-quest bonuses on top via pointsForMeals — keeping live scoring identical
 * to the mock and to what the app displays.
 */
export class SupabaseProvider extends MockProvider implements DataProvider {
  // ---- helpers ----

  private photoUrl(path: string | null | undefined): string | null {
    if (!path) return null
    return requireClient().storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
  }

  private toMeal(row: Row): Meal {
    const tier = row.tier as MealTier
    const photoPath = (row.photo_path as string | null) ?? null
    return {
      id: row.id as string,
      userId: row.user_id as string,
      tier,
      mealTime: row.meal_time as MealTime,
      mealDate: row.meal_date as string,
      photoUrl: this.photoUrl(photoPath),
      caption: (row.caption as string | null) ?? null,
      questTags: ((row.quest_tags as QuestTag[] | null) ?? []) as QuestTag[],
      plantProteinGrams: (row.plant_protein_grams as number) ?? 0,
      points: computeMealPoints(tier, !!photoPath),
      co2SavedKg: co2SavedKg(tier),
      createdAt: row.created_at as string,
    }
  }

  private async currentUserId(): Promise<string | null> {
    const { data } = await requireClient().auth.getUser()
    return data.user?.id ?? null
  }

  /** The app passes 'me' for the current user; resolve it to the auth uid. */
  private async resolveUserId(userId: string): Promise<string | null> {
    return userId === 'me' ? this.currentUserId() : userId
  }

  private async uploadPhoto(uid: string, dataUrl: string): Promise<string> {
    const client = requireClient()
    const blob = await (await fetch(dataUrl)).blob()
    const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    const path = `${uid}/${Date.now()}.${ext}`
    const { error } = await client.storage.from(PHOTO_BUCKET).upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    })
    if (error) {
      console.error('[supabase] photo upload failed', { path, error })
      throw error
    }
    return path
  }

  // ---- session / auth ----

  async getMyProfile(): Promise<Profile | null> {
    const client = requireClient()
    const { data: authData, error: authError } = await client.auth.getUser()
    if (authError || !authData.user) return null

    const { data, error } = await client.from('profiles').select('*').eq('id', authData.user.id).maybeSingle()
    if (error) {
      console.error('[supabase] failed to load profile', { userId: authData.user.id, error })
      throw error
    }
    return data ? toProfile(data) : null
  }

  /**
   * "Your email is your login" — no password, no email verification.
   *
   * We derive a deterministic password from the email, so the same email always
   * resolves to the same account, even after a hard reset (server-side profile).
   * Existing email → sign in; new email → sign up (which, with email confirmation
   * OFF in Supabase Auth settings, returns a session immediately).
   *
   * Trade-off, accepted for this low-stakes cohort app: the password is
   * derivable from the email, so knowing an email is enough to sign in.
   * REQUIRES "Confirm email" to be disabled in the Supabase dashboard
   * (Auth → Providers → Email), otherwise signup won't return a session.
   */
  private passwordFor(email: string): string {
    return `pbc-2026::${email.trim().toLowerCase()}`
  }

  async signInWithEmail(email: string): Promise<void> {
    const client = requireClient()
    const normalized = email.trim().toLowerCase()
    const password = this.passwordFor(normalized)

    const { error } = await client.auth.signInWithPassword({ email: normalized, password })
    if (!error) return

    // No account for this email yet → create one and get a session back.
    const { data: signUp, error: signUpError } = await client.auth.signUp({ email: normalized, password })
    if (signUpError) {
      console.error('[supabase] passwordless signup failed', { email: normalized, error: signUpError })
      throw signUpError
    }
    if (!signUp.session) {
      const { error: retry } = await client.auth.signInWithPassword({ email: normalized, password })
      if (retry) {
        console.error('[supabase] login after signup failed — is "Confirm email" disabled?', {
          email: normalized,
          error: retry,
        })
        throw retry
      }
    }
  }

  async signUpWithEmail(email: string): Promise<void> {
    return this.signInWithEmail(email)
  }

  async signOut(): Promise<void> {
    const client = requireClient()
    const { error } = await client.auth.signOut()
    if (error) {
      console.error('[supabase] sign out failed', { error })
      throw error
    }
  }

  async completeOnboarding(input: OnboardingInput): Promise<Profile> {
    const client = requireClient()
    const { data: authData, error: authError } = await client.auth.getUser()
    const user = authData.user
    if (authError || !user) {
      console.error('[supabase] cannot create profile without an authenticated user', { authError })
      throw authError ?? new Error('Couldn’t sign you in. Please re-enter your email and try again.')
    }

    const profile = {
      id: user.id,
      display_name: input.displayName,
      cow_name: input.cowName,
      avatar_index: input.avatarIndex,
      team_id: input.teamId,
      starting_diet: input.startingDiet,
      onboarding: input.onboarding,
      streak_goal: input.streakGoal,
    }

    const { data, error } = await client.from('profiles').upsert(profile, { onConflict: 'id' }).select('*').single()
    if (error) {
      console.error('[supabase] failed to upsert profile after signup', { userId: user.id, error })
      throw error
    }
    return toProfile(data)
  }

  async updateMyProfile(patch: Partial<Profile>): Promise<Profile> {
    const client = requireClient()
    const uid = await this.currentUserId()
    if (!uid) throw new Error('not authenticated')

    const row: Row = {}
    if (patch.displayName !== undefined) row.display_name = patch.displayName
    if (patch.cowName !== undefined) row.cow_name = patch.cowName
    if (patch.avatarIndex !== undefined) row.avatar_index = patch.avatarIndex
    if (patch.teamId !== undefined) row.team_id = patch.teamId
    if (patch.startingDiet !== undefined) row.starting_diet = patch.startingDiet
    if (patch.onboarding !== undefined) row.onboarding = patch.onboarding
    if (patch.streakGoal !== undefined) row.streak_goal = patch.streakGoal

    const { data, error } = await client.from('profiles').update(row).eq('id', uid).select('*').single()
    if (error) {
      console.error('[supabase] failed to update profile', { uid, error })
      throw error
    }
    return toProfile(data)
  }

  // ---- reads ----

  async listProfiles(): Promise<Profile[]> {
    const client = requireClient()
    const { data, error } = await client.from('profiles').select('*')
    if (error) {
      console.error('[supabase] failed to list profiles', { error })
      throw error
    }
    return ((data ?? []) as Row[]).map(toProfile)
  }

  async getProfile(id: string): Promise<Profile | null> {
    const client = requireClient()
    const realId = await this.resolveUserId(id)
    if (!realId) return null
    const { data, error } = await client.from('profiles').select('*').eq('id', realId).maybeSingle()
    if (error) {
      console.error('[supabase] failed to load profile', { id, error })
      throw error
    }
    return data ? toProfile(data) : null
  }

  async listTeams(): Promise<Team[]> {
    const client = requireClient()
    const { data, error } = await client.from('teams').select('*').order('sort')
    if (error) {
      console.error('[supabase] failed to list teams', { error })
      throw error
    }
    return ((data ?? []) as Row[]).map(toTeam)
  }

  async teamMembers(teamId: string): Promise<Profile[]> {
    const client = requireClient()
    const { data, error } = await client.from('profiles').select('*').eq('team_id', teamId)
    if (error) {
      console.error('[supabase] failed to load team members', { teamId, error })
      throw error
    }
    return ((data ?? []) as Row[]).map(toProfile)
  }

  private async mealsByUser(): Promise<Map<string, Meal[]>> {
    const client = requireClient()
    const { data, error } = await client.from('meals').select('*')
    if (error) {
      console.error('[supabase] failed to load meals', { error })
      throw error
    }
    const byUser = new Map<string, Meal[]>()
    for (const row of (data ?? []) as Row[]) {
      const meal = this.toMeal(row)
      const arr = byUser.get(meal.userId) ?? []
      arr.push(meal)
      byUser.set(meal.userId, arr)
    }
    return byUser
  }

  async leaderboard(): Promise<LeaderboardEntry[]> {
    const client = requireClient()
    const [profilesRes, byUser] = await Promise.all([client.from('profiles').select('*'), this.mealsByUser()])
    if (profilesRes.error) {
      console.error('[supabase] leaderboard: failed to load profiles', { error: profilesRes.error })
      throw profilesRes.error
    }
    return ((profilesRes.data ?? []) as Row[])
      .map(toProfile)
      .map((profile) => {
        const meals = byUser.get(profile.id) ?? []
        return { profile, points: this.pointsForMeals(meals), meals: meals.length }
      })
      .sort((a, b) => b.points - a.points)
  }

  async teamStandings(): Promise<TeamStanding[]> {
    const client = requireClient()
    const [teams, profilesRes, byUser] = await Promise.all([
      this.listTeams(),
      client.from('profiles').select('id, team_id'),
      this.mealsByUser(),
    ])
    if (profilesRes.error) {
      console.error('[supabase] teamStandings: failed to load profiles', { error: profilesRes.error })
      throw profilesRes.error
    }
    const profiles = (profilesRes.data ?? []) as Row[]
    return teams
      .map((team) => {
        const memberIds = profiles.filter((p) => (p.team_id as string | null) === team.id).map((p) => p.id as string)
        const points = memberIds.reduce((sum, id) => sum + this.pointsForMeals(byUser.get(id) ?? []), 0)
        return { team, points, members: memberIds.length }
      })
      .sort((a, b) => b.points - a.points)
  }

  async listMeals(): Promise<Meal[]> {
    const client = requireClient()
    const { data, error } = await client.from('meals').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('[supabase] failed to list meals', { error })
      throw error
    }
    return ((data ?? []) as Row[]).map((r) => this.toMeal(r))
  }

  async listUserMeals(userId: string): Promise<Meal[]> {
    const client = requireClient()
    const realId = await this.resolveUserId(userId)
    if (!realId) return []
    const { data, error } = await client
      .from('meals')
      .select('*')
      .eq('user_id', realId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[supabase] failed to list user meals', { userId, error })
      throw error
    }
    return ((data ?? []) as Row[]).map((r) => this.toMeal(r))
  }

  async myMealsForDate(date: string): Promise<Meal[]> {
    const client = requireClient()
    const uid = await this.currentUserId()
    if (!uid) return []
    const { data, error } = await client.from('meals').select('*').eq('user_id', uid).eq('meal_date', date)
    if (error) {
      console.error('[supabase] failed to load meals for date', { date, error })
      throw error
    }
    return ((data ?? []) as Row[]).map((r) => this.toMeal(r))
  }

  async userPoints(userId: string): Promise<number> {
    return this.pointsForMeals(await this.listUserMeals(userId))
  }

  async challengeImpactKg(): Promise<number> {
    const client = requireClient()
    const { data, error } = await client.from('meals').select('tier')
    if (error) {
      console.error('[supabase] failed to load challenge impact', { error })
      throw error
    }
    return ((data ?? []) as Row[]).reduce((sum, r) => sum + co2SavedKg(r.tier as MealTier), 0)
  }

  async dailyQuestProgress(date: string): Promise<DailyQuestProgress | null> {
    // Computed client-side (like the scoring) so it doesn't depend on the DB's
    // daily_challenges seed and always shows all three tasks with bonus points.
    if (!(await this.currentUserId())) return null
    const meals = await this.myMealsForDate(date)
    return computeQuestProgress(meals, activeDailyChallenge(new Date(`${date}T12:00:00`)))
  }

  // ---- meal social ----

  async listComments(mealId: string): Promise<Comment[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('comments')
      .select('*')
      .eq('meal_id', mealId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('[supabase] failed to list comments', { mealId, error })
      throw error
    }
    return ((data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      mealId: r.meal_id as string,
      userId: r.user_id as string,
      body: r.body as string,
      createdAt: r.created_at as string,
    }))
  }

  async listAllComments(): Promise<Comment[]> {
    const client = requireClient()
    const { data, error } = await client.from('comments').select('*').order('created_at', { ascending: true })
    if (error) {
      console.error('[supabase] failed to list all comments', { error })
      throw error
    }
    return ((data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      mealId: r.meal_id as string,
      userId: r.user_id as string,
      body: r.body as string,
      createdAt: r.created_at as string,
    }))
  }

  async addComment(mealId: string, body: string): Promise<Comment> {
    const client = requireClient()
    const uid = await this.currentUserId()
    if (!uid) throw new Error('not authenticated')
    const { data, error } = await client
      .from('comments')
      .insert({ meal_id: mealId, user_id: uid, body })
      .select('*')
      .single()
    if (error) {
      console.error('[supabase] failed to add comment', { mealId, error })
      throw error
    }
    return {
      id: data.id as string,
      mealId: data.meal_id as string,
      userId: data.user_id as string,
      body: data.body as string,
      createdAt: data.created_at as string,
    }
  }

  async listReactions(mealId: string): Promise<Reaction[]> {
    const client = requireClient()
    const { data, error } = await client.from('reactions').select('*').eq('meal_id', mealId)
    if (error) {
      console.error('[supabase] failed to list reactions', { mealId, error })
      throw error
    }
    return ((data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      mealId: r.meal_id as string,
      userId: r.user_id as string,
      emoji: r.emoji as string,
      createdAt: r.created_at as string,
    }))
  }

  async toggleReaction(mealId: string, emoji: string): Promise<void> {
    const client = requireClient()
    const uid = await this.currentUserId()
    if (!uid) throw new Error('not authenticated')
    const { data: existing, error: findError } = await client
      .from('reactions')
      .select('id')
      .eq('meal_id', mealId)
      .eq('user_id', uid)
      .eq('emoji', emoji)
      .maybeSingle()
    if (findError) {
      console.error('[supabase] failed to check reaction', { mealId, emoji, error: findError })
      throw findError
    }
    if (existing) {
      const { error } = await client.from('reactions').delete().eq('id', (existing as Row).id as string)
      if (error) throw error
    } else {
      const { error } = await client.from('reactions').insert({ meal_id: mealId, user_id: uid, emoji })
      if (error) throw error
    }
  }

  // ---- writes ----

  async logMeal(input: LogMealInput): Promise<LogMealResult> {
    const client = requireClient()
    const uid = await this.currentUserId()
    if (!uid) throw new Error('not authenticated')

    // Snapshot the profile first so we can report the streak result (the RPC
    // updates it server-side, we mirror the same computation for the UI).
    const before = await this.getMyProfile()
    if (!before) throw new Error('not onboarded')

    const photoPath = input.photoDataUrl ? await this.uploadPhoto(uid, input.photoDataUrl) : null

    const { data, error } = await client.rpc('fn_log_meal', {
      p_tier: input.tier,
      p_time: input.mealTime,
      p_date: input.mealDate,
      p_photo_path: photoPath,
      p_caption: input.caption,
      p_quest_tags: input.questTags ?? [],
      p_plant_protein_grams: input.plantProteinGrams ?? 0,
    })
    if (error) {
      console.error('[supabase] failed to log meal', { error })
      // The unique(user_id, meal_date, meal_time) constraint = slot already used.
      if (error.code === '23505') throw new Error('SLOT_TAKEN')
      throw error
    }
    const meal = this.toMeal((Array.isArray(data) ? data[0] : data) as Row)

    const streak = applyLog(
      { current: before.streakCurrent, best: before.streakBest, lastDate: before.lastLoggedDate },
      input.mealDate,
      before.streakGoal,
    )
    const bonus = streak.hitGoal ? streakBonus(before.streakGoal) : 0

    // Daily-quest bonus this meal newly unlocked (once-per-day).
    const dayMeals = await this.myMealsForDate(input.mealDate)
    const challenge = activeDailyChallenge(new Date(`${input.mealDate}T12:00:00`))
    const before2 = dayMeals.filter((m) => m.id !== meal.id)
    const questGain =
      dailyQuestBonus(computeQuestProgress(dayMeals, challenge)) -
      dailyQuestBonus(computeQuestProgress(before2, challenge))

    return { meal, streak, bonus, pointsEarned: meal.points + questGain + bonus }
  }

  async updateMeal(input: UpdateMealInput): Promise<Meal> {
    const client = requireClient()
    const uid = await this.currentUserId()
    if (!uid) throw new Error('not authenticated')

    const photoPath = input.photoDataUrl ? await this.uploadPhoto(uid, input.photoDataUrl) : null
    const { data, error } = await client
      .from('meals')
      .update({
        tier: input.tier,
        meal_time: input.mealTime,
        meal_date: input.mealDate,
        caption: input.caption,
        photo_path: photoPath,
        quest_tags: input.questTags ?? [],
        plant_protein_grams: input.plantProteinGrams ?? 0,
      })
      .eq('id', input.id)
      .select('*')
      .single()
    if (error) {
      console.error('[supabase] failed to update meal', { id: input.id, error })
      if (error.code === '23505') throw new Error('SLOT_TAKEN')
      throw error
    }
    return this.toMeal(data)
  }

  async deleteMeal(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('meals').delete().eq('id', id)
    if (error) {
      console.error('[supabase] failed to delete meal', { id, error })
      throw error
    }
  }
}
