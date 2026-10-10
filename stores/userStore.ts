import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'
import type { UserProfile, UserOperator, UserInventory, UserSettings } from '~/types'

export const useUserStore = defineStore(
  'user',
  () => {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const profile = ref<UserProfile>({
      username: 'Doctor',
      doctor_id: null,
      avatar_url: null,
      level: 1,
      server: 'EN',
    })

    // Material & currency inventory: { [item_id]: quantity }
    const inventory = ref<UserInventory>({})

    // Owned operators: { [operator_id]: UserOperator }
    const roster = ref<Record<string, UserOperator>>({})

    // Application preferences
    const settings = ref<UserSettings>({
      theme: 'dark',
      server: 'EN',
      language: 'en',
      show_unreleased: false,
      monthly_card: true,
      preferences: {},
    })

    // Sync status indicators
    const isLoading = ref(false)
    const isSynced = ref(false)
    const lastSyncedAt = ref<string | null>(null)
    const syncError = ref<string | null>(null)

    // -------------------------------------------------------------------------
    // Getters / Computed
    // -------------------------------------------------------------------------
    const totalOperators = computed(() => Object.keys(roster.value).length)

    const favoriteOperators = computed(() =>
      Object.values(roster.value).filter((op) => op.is_favorite)
    )

    const rosterList = computed(() => Object.values(roster.value))

    const getItemQuantity = (itemId: string): number =>
      inventory.value[itemId] ?? 0

    const getOperator = (operatorId: string): UserOperator | undefined =>
      roster.value[operatorId]

    const isOperatorOwned = (operatorId: string): boolean =>
      Boolean(roster.value[operatorId])

    // -------------------------------------------------------------------------
    // Actions (Mutations)
    // -------------------------------------------------------------------------
    const setProfile = (data: Partial<UserProfile>) => {
      profile.value = { ...profile.value, ...data }
      isSynced.value = false
    }

    const setItemQuantity = (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        delete inventory.value[itemId]
      } else {
        inventory.value[itemId] = Math.floor(quantity)
      }
      isSynced.value = false
    }

    const adjustItemQuantity = (itemId: string, delta: number) => {
      const current = inventory.value[itemId] ?? 0
      const next = Math.max(0, current + delta)
      setItemQuantity(itemId, next)
    }

    const setInventory = (newInv: UserInventory) => {
      inventory.value = { ...newInv }
      isSynced.value = false
    }

    const setOperator = (operator: UserOperator) => {
      roster.value[operator.operator_id] = { ...operator }
      isSynced.value = false
    }

    const removeOperator = (operatorId: string) => {
      if (roster.value[operatorId]) {
        delete roster.value[operatorId]
        isSynced.value = false
      }
    }

    const toggleFavorite = (operatorId: string) => {
      const op = roster.value[operatorId]
      if (op) {
        op.is_favorite = !op.is_favorite
        isSynced.value = false
      }
    }

    const updateOperatorSkill = (operatorId: string, skillLevel: number) => {
      const op = roster.value[operatorId]
      if (op) {
        op.skill_level = skillLevel
        isSynced.value = false
      }
    }

    const updateOperatorMastery = (
      operatorId: string,
      skillIndex: number,
      masteryLevel: number
    ) => {
      const op = roster.value[operatorId]
      if (op) {
        op.masteries = {
          ...op.masteries,
          [`skill_${skillIndex}`]: masteryLevel,
        }
        isSynced.value = false
      }
    }

    const updateOperatorModule = (
      operatorId: string,
      moduleType: string,
      stage: number
    ) => {
      const op = roster.value[operatorId]
      if (op) {
        op.modules = {
          ...op.modules,
          [moduleType]: stage,
        }
        isSynced.value = false
      }
    }

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
      settings.value = { ...settings.value, ...newSettings }
      isSynced.value = false

      // Apply theme attribute to document html root for instant styling
      if (typeof document !== 'undefined' && settings.value.theme) {
        document.documentElement.setAttribute('data-theme', settings.value.theme)
      }

      // If user is authenticated with Supabase, sync immediately
      const client = useSupabaseClient<Database>()
      const user = useSupabaseUser()

      if (user.value) {
        try {
          const preferences = {
            ...(settings.value.preferences || {}),
            monthly_card: settings.value.monthly_card,
          }

          const { error: settingsErr } = await client.from('user_settings').upsert({
            user_id: user.value.id,
            theme: settings.value.theme,
            server: settings.value.server,
            language: settings.value.language,
            show_unreleased: settings.value.show_unreleased,
            preferences,
          })
          if (!settingsErr) {
            isSynced.value = true
          }
        } catch (err) {
          console.warn('[userStore] Failed to auto-sync user_settings to Supabase:', err)
        }
      }
    }

    const clearUserData = () => {
      profile.value = {
        username: 'Doctor',
        doctor_id: null,
        avatar_url: null,
        level: 1,
        server: 'EN',
      }
      inventory.value = {}
      roster.value = {}
      isSynced.value = false
      lastSyncedAt.value = null
      syncError.value = null
    }

    // -------------------------------------------------------------------------
    // Supabase Synchronization Actions
    // -------------------------------------------------------------------------
    const fetchFromSupabase = async () => {
      const client = useSupabaseClient<Database>()
      const user = useSupabaseUser()

      if (!user.value) {
        return { success: false, error: 'User is not authenticated' }
      }

      isLoading.value = true
      syncError.value = null

      try {
        const userId = user.value.id

        // 1. Fetch Profile
        const { data: profileData, error: profileErr } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (profileErr) throw profileErr
        if (profileData) {
          profile.value = {
            id: profileData.id,
            username: profileData.username || profile.value.username,
            doctor_id: profileData.doctor_id,
            avatar_url: profileData.avatar_url,
            level: profileData.level || 1,
            server: profileData.server || 'EN',
          }
        }

        // 2. Fetch Settings
        const { data: settingsData, error: settingsErr } = await client
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (settingsErr) throw settingsErr
        if (settingsData) {
          const prefs = (settingsData.preferences as Record<string, any>) || {}
          settings.value = {
            theme: settingsData.theme || 'dark',
            server: settingsData.server || 'EN',
            language: settingsData.language || 'en',
            show_unreleased: settingsData.show_unreleased ?? false,
            monthly_card: prefs.monthly_card !== undefined ? Boolean(prefs.monthly_card) : true,
            preferences: prefs,
          }
          if (typeof document !== 'undefined' && settings.value.theme) {
            document.documentElement.setAttribute('data-theme', settings.value.theme)
          }
        }

        // 3. Fetch Inventories
        const { data: invData, error: invErr } = await client
          .from('user_inventories')
          .select('item_id, quantity')
          .eq('user_id', userId)

        if (invErr) throw invErr
        if (invData) {
          const loadedInv: UserInventory = {}
          for (const item of invData) {
            loadedInv[item.item_id] = item.quantity
          }
          inventory.value = loadedInv
        }

        // 4. Fetch Rosters
        const { data: rosterData, error: rosterErr } = await client
          .from('user_rosters')
          .select('*')
          .eq('user_id', userId)

        if (rosterErr) throw rosterErr
        if (rosterData) {
          const loadedRoster: Record<string, UserOperator> = {}
          for (const op of rosterData) {
            loadedRoster[op.operator_id] = {
              operator_id: op.operator_id,
              elite: op.elite,
              level: op.level,
              potential: op.potential,
              skill_level: op.skill_level,
              masteries: (op.masteries as Record<string, number>) || {},
              modules: (op.modules as Record<string, number>) || {},
              is_favorite: op.is_favorite,
            }
          }
          roster.value = loadedRoster
        }

        isSynced.value = true
        lastSyncedAt.value = new Date().toISOString()
        return { success: true }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        syncError.value = message
        return { success: false, error: message }
      } finally {
        isLoading.value = false
      }
    }

    const syncToSupabase = async () => {
      const client = useSupabaseClient<Database>()
      const user = useSupabaseUser()

      if (!user.value) {
        return { success: false, error: 'User is not authenticated' }
      }

      isLoading.value = true
      syncError.value = null

      try {
        const userId = user.value.id

        // 1. Upsert Profile
        const { error: profileErr } = await client.from('profiles').upsert({
          id: userId,
          username: profile.value.username,
          doctor_id: profile.value.doctor_id,
          avatar_url: profile.value.avatar_url,
          level: profile.value.level,
          server: profile.value.server,
        })
        if (profileErr) throw profileErr

        // 2. Upsert Settings
        const preferences = {
          ...(settings.value.preferences || {}),
          monthly_card: settings.value.monthly_card,
        }

        const { error: settingsErr } = await client.from('user_settings').upsert({
          user_id: userId,
          theme: settings.value.theme,
          server: settings.value.server,
          language: settings.value.language,
          show_unreleased: settings.value.show_unreleased,
          preferences,
        })
        if (settingsErr) throw settingsErr

        // 3. Upsert Inventories
        const inventoryRows = Object.entries(inventory.value).map(
          ([item_id, quantity]) => ({
            user_id: userId,
            item_id,
            quantity,
          })
        )

        if (inventoryRows.length > 0) {
          const { error: invErr } = await client
            .from('user_inventories')
            .upsert(inventoryRows, { onConflict: 'user_id, item_id' })
          if (invErr) throw invErr
        }

        // 4. Upsert Rosters
        const rosterRows = Object.values(roster.value).map((op) => ({
          user_id: userId,
          operator_id: op.operator_id,
          elite: op.elite,
          level: op.level,
          potential: op.potential,
          skill_level: op.skill_level,
          masteries: op.masteries,
          modules: op.modules,
          is_favorite: op.is_favorite,
        }))

        if (rosterRows.length > 0) {
          const { error: rosterErr } = await client
            .from('user_rosters')
            .upsert(rosterRows, { onConflict: 'user_id, operator_id' })
          if (rosterErr) throw rosterErr
        }

        isSynced.value = true
        lastSyncedAt.value = new Date().toISOString()
        return { success: true }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        syncError.value = message
        return { success: false, error: message }
      } finally {
        isLoading.value = false
      }
    }

    const syncFromArkprtsData = async (data: {
      profile?: { uid?: string; nickname?: string; level?: number; server?: string }
      inventory?: Record<string, number>
      roster?: Array<{
        operator_id: string
        elite: number
        level: number
        potential: number
        skill_level: number
        masteries?: Record<string, number>
        modules?: Record<string, number>
      }>
      gacha?: {
        orundum?: number
        originite_prime?: number
        single_permits?: number
        ten_permits?: number
      }
    }) => {
      if (data.profile) {
        if (data.profile.nickname) profile.value.username = data.profile.nickname
        if (data.profile.uid) profile.value.doctor_id = data.profile.uid
        if (data.profile.level) profile.value.level = data.profile.level
        if (data.profile.server) profile.value.server = data.profile.server
      }

      if (data.inventory) {
        inventory.value = {
          ...inventory.value,
          ...data.inventory,
        }
      }

      if (data.roster && Array.isArray(data.roster)) {
        for (const op of data.roster) {
          roster.value[op.operator_id] = {
            operator_id: op.operator_id,
            elite: op.elite ?? 0,
            level: op.level ?? 1,
            potential: op.potential ?? 1,
            skill_level: op.skill_level ?? 1,
            masteries: op.masteries || {},
            modules: op.modules || {},
            is_favorite: roster.value[op.operator_id]?.is_favorite || false,
          }
        }
      }

      lastSyncedAt.value = new Date().toISOString()
      isSynced.value = true

      // If user is authenticated in Supabase, push changes to cloud database
      try {
        const client = useSupabaseClient<Database>()
        const user = useSupabaseUser()
        if (user.value) {
          await syncToSupabase()
        }
      } catch (err) {
        // Local mode fallback
      }
    }

    return {
      // State
      profile,
      inventory,
      roster,
      settings,
      isLoading,
      isSynced,
      lastSyncedAt,
      syncError,

      // Getters
      totalOperators,
      favoriteOperators,
      rosterList,
      getItemQuantity,
      getOperator,
      isOperatorOwned,

      // Actions
      setProfile,
      setItemQuantity,
      adjustItemQuantity,
      setInventory,
      setOperator,
      removeOperator,
      toggleFavorite,
      updateOperatorSkill,
      updateOperatorMastery,
      updateOperatorModule,
      updateSettings,
      clearUserData,
      fetchFromSupabase,
      syncToSupabase,
      syncFromArkprtsData,
    }
  },
  {
    persist: {
      key: 'arkcalc_user_store',
      pick: ['profile', 'inventory', 'roster', 'settings', 'lastSyncedAt'],
    },
  }
)
