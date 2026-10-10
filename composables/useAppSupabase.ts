import type { Database } from '~/types/database.types'

/**
 * Typed Supabase composable helper for ArkCalc
 */
export const useAppSupabase = () => {
  const client = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  return {
    client,
    user,
    isAuthenticated: computed(() => Boolean(user.value)),
  }
}
