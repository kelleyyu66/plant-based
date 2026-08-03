import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { data, type LogMealInput, type OnboardingInput, type UpdateMealInput } from '@/lib/dataProvider'
import { toCohortDate } from '@/lib/dates'

// Query keys
export const qk = {
  me: ['me'] as const,
  profiles: ['profiles'] as const,
  profile: (id: string) => ['profile', id] as const,
  teams: ['teams'] as const,
  teamStandings: ['teamStandings'] as const,
  teamMembers: (id: string) => ['teamMembers', id] as const,
  leaderboard: ['leaderboard'] as const,
  meals: ['meals'] as const,
  userMeals: (id: string) => ['userMeals', id] as const,
  myMealsToday: ['myMealsToday'] as const,
  dailyQuest: (date: string) => ['dailyQuest', date] as const,
  impact: ['impact'] as const,
  comments: (id: string) => ['comments', id] as const,
  reactions: (id: string) => ['reactions', id] as const,
}

export const useMyProfile = () => useQuery({ queryKey: qk.me, queryFn: () => data.getMyProfile() })
export const useSignInWithEmail = () =>
  useMutation({ mutationFn: (email: string) => data.signInWithEmail(email) })
export const useSignUpWithEmail = () =>
  useMutation({ mutationFn: (email: string) => data.signUpWithEmail(email) })
export const useProfiles = () => useQuery({ queryKey: qk.profiles, queryFn: () => data.listProfiles() })
export const useProfile = (id: string) =>
  useQuery({ queryKey: qk.profile(id), queryFn: () => data.getProfile(id), enabled: !!id })
export const useTeams = () => useQuery({ queryKey: qk.teams, queryFn: () => data.listTeams() })
export const useTeamStandings = () => useQuery({ queryKey: qk.teamStandings, queryFn: () => data.teamStandings() })
export const useTeamMembers = (id: string) =>
  useQuery({ queryKey: qk.teamMembers(id), queryFn: () => data.teamMembers(id), enabled: !!id })
export const useLeaderboard = () => useQuery({ queryKey: qk.leaderboard, queryFn: () => data.leaderboard() })
export const useMeals = () => useQuery({ queryKey: qk.meals, queryFn: () => data.listMeals() })
export const useUserMeals = (id: string) =>
  useQuery({ queryKey: qk.userMeals(id), queryFn: () => data.listUserMeals(id), enabled: !!id })
export const useMyMealsToday = () =>
  useQuery({ queryKey: qk.myMealsToday, queryFn: () => data.myMealsForDate(toCohortDate()) })
export const useDailyQuestProgress = () => {
  const date = toCohortDate()
  return useQuery({ queryKey: qk.dailyQuest(date), queryFn: () => data.dailyQuestProgress(date) })
}
export const useChallengeImpact = () => useQuery({ queryKey: qk.impact, queryFn: () => data.challengeImpactKg() })
export const useUserPoints = (id: string) =>
  useQuery({ queryKey: ['userPoints', id], queryFn: () => data.userPoints(id), enabled: !!id })
export const useComments = (mealId: string) =>
  useQuery({ queryKey: qk.comments(mealId), queryFn: () => data.listComments(mealId), enabled: !!mealId })
export const useReactions = (mealId: string) =>
  useQuery({ queryKey: qk.reactions(mealId), queryFn: () => data.listReactions(mealId), enabled: !!mealId })

// Mutations
export function useCompleteOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: OnboardingInput) => data.completeOnboarding(input),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useLogMeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LogMealInput) => data.logMeal(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.meals })
      qc.invalidateQueries({ queryKey: qk.myMealsToday })
      qc.invalidateQueries({ queryKey: ['dailyQuest'] })
      qc.invalidateQueries({ queryKey: qk.leaderboard })
      qc.invalidateQueries({ queryKey: qk.teamStandings })
      qc.invalidateQueries({ queryKey: qk.impact })
      qc.invalidateQueries({ queryKey: qk.me })
      qc.invalidateQueries({ queryKey: ['userPoints'] })
      qc.invalidateQueries({ queryKey: ['userMeals'] })
    },
  })
}

/** Everything a meal touches: feed, quests, points, impact, streak. */
function useInvalidateMealData() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: qk.meals })
    qc.invalidateQueries({ queryKey: qk.myMealsToday })
    qc.invalidateQueries({ queryKey: ['dailyQuest'] })
    qc.invalidateQueries({ queryKey: qk.leaderboard })
    qc.invalidateQueries({ queryKey: qk.teamStandings })
    qc.invalidateQueries({ queryKey: qk.impact })
    qc.invalidateQueries({ queryKey: qk.me })
    qc.invalidateQueries({ queryKey: ['userPoints'] })
    qc.invalidateQueries({ queryKey: ['userMeals'] })
  }
}

export function useUpdateMeal() {
  const invalidate = useInvalidateMealData()
  return useMutation({
    mutationFn: (input: UpdateMealInput) => data.updateMeal(input),
    onSuccess: invalidate,
  })
}

export function useDeleteMeal() {
  const invalidate = useInvalidateMealData()
  return useMutation({
    mutationFn: (id: string) => data.deleteMeal(id),
    onSuccess: invalidate,
  })
}

export function useAddComment(mealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => data.addComment(mealId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.comments(mealId) }),
  })
}

export function useToggleReaction(mealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (emoji: string) => data.toggleReaction(mealId, emoji),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reactions(mealId) }),
  })
}

/** Edit your own profile (used by the editable "About you" panel). */
export const useUpdateMyProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Parameters<typeof data.updateMyProfile>[0]) => data.updateMyProfile(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me })
      qc.invalidateQueries({ queryKey: qk.profiles })
      qc.invalidateQueries({ queryKey: qk.leaderboard })
    },
  })
}
