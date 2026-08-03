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