import type { DataProvider, OnboardingInput } from './dataProvider'
import { MockProvider } from './mock/mockClient'
import type { Profile } from './types'
import { supabase } from './supabase'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

function toProfile(row: Record<string, unknown>): Profile {
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

/** Live auth/profile operations. Other app operations still inherit the mock until they are migrated. */
export class SupabaseProvider extends MockProvider implements DataProvider {
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

  async signInWithEmail(email: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) {
      console.error('[supabase] auth signup/login failed', { email, error })
      throw error
    }
  }

  // Supabase's email OTP flow supports both first-time signup and returning-user login.
  // The profile write is gated separately in completeOnboarding.
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
      throw authError ?? new Error('You must verify your email before starting the challenge.')
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
      console.error('[supabase] failed to upsert profile after signup', {
        userId: user.id,
        table: 'profiles',
        error,
      })
      throw error
    }

    console.info('[supabase] profile upserted after signup', { userId: user.id, table: 'profiles' })
    return toProfile(data)
  }
}
