import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'
import type { UserProfile, UserOperator, UserInventory, UserSettings, UserAuthSession } from '~/types'

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

    // Yostar Auth Session: persistent long-term token & UID for 1-click sync
    const authSession = ref<UserAuthSession | null>(null)

    // Restore saved auth session from localStorage on client load
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('arkcalc_yostar_session')
        if (cached && !authSession.value) {
          authSession.value = JSON.parse(cached)
        }
      } catch (e) {
        console.warn('[userStore] Failed to restore arkcalc_yostar_session:', e)
      }
    }

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

    const hasSyncedAccount = computed(() => {
      return Boolean(isSynced.value || lastSyncedAt.value !== null || Object.keys(roster.value).length > 0)
    })

    const hasSavedSession = computed(() => {
      return Boolean(authSession.value?.uid && authSession.value?.token)
    })

    const savedSessionEmail = computed(() => authSession.value?.email || '')
    const savedSessionServer = computed(() => authSession.value?.server || 'en')

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

    const setAuthSession = (session: UserAuthSession | null) => {
      authSession.value = session
      if (typeof window !== 'undefined') {
        if (session) {
          localStorage.setItem('arkcalc_yostar_session', JSON.stringify(session))
        } else {
          localStorage.removeItem('arkcalc_yostar_session')
        }
      }
    }

    const clearAuthSession = () => {
      setAuthSession(null)
    }

    const syncWithSavedSession = async () => {
      if (!authSession.value?.uid || !authSession.value?.token) {
        throw new Error('No active saved session found in PRTS terminal storage.')
      }

      isLoading.value = true
      syncError.value = null

      try {
        const res = await $fetch<any>('/api/sync_arkprts', {
          method: 'POST',
          body: {
            server: authSession.value.server || 'en',
            auth_type: 'token',
            uid: authSession.value.uid,
            token: authSession.value.token,
            email: authSession.value.email,
          },
        })

        if (!res || !res.success) {
          throw new Error(res?.error || 'Failed to authenticate with saved session token.')
        }

        await syncFromArkprtsData(res)
        return res
      } catch (err: any) {
        const msg = err?.data?.statusMessage || err?.message || 'Session synchronization failed'
        syncError.value = msg
        throw err
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
      session?: UserAuthSession
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

      if (data.session && data.session.uid && data.session.token) {
        setAuthSession({
          uid: String(data.session.uid),
          token: String(data.session.token),
          email: data.session.email || authSession.value?.email || '',
          server: (data.session.server || profile.value.server || 'en').toLowerCase(),
          savedAt: data.session.savedAt || new Date().toISOString(),
        })
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

    const loadDemoData = async () => {
      const demoData = {
        profile: {
          uid: '88492015',
          nickname: 'Doctor Amiya',
          level: 120,
          server: (settings.value.server || 'EN').toUpperCase(),
        },
        gacha: {
          orundum: 42600,
          originite_prime: 54,
          single_permits: 8,
          ten_permits: 3,
        },
        inventory: {
          '4001': 2450000,
          'orundum': 42600,
          'originite_prime': 54,
          'single_permit': 8,
          'ten_permit': 3,
          '7001': 8,
          '7002': 3,
          '30013': 85,
          '30014': 24,
          '30073': 42,
          '30074': 18,
          '30083': 36,
          '30084': 12,
          '30093': 29,
          '30094': 14,
          '31014': 16,
          '31024': 15,
          '32001': 10,
          '3303': 120,
          'mod_unlock_token': 14,
        },
        roster: [
          {
            operator_id: 'char_4025_aprot',
            elite: 2,
            level: 90,
            potential: 4,
            skill_level: 7,
            masteries: { skill_3: 3 },
            modules: { uniequip_002_aprot: 3 },
          },
          {
            operator_id: 'char_350_surtr',
            elite: 2,
            level: 90,
            potential: 3,
            skill_level: 7,
            masteries: { skill_3: 3 },
            modules: {},
          },
          {
            operator_id: 'char_1028_texas2',
            elite: 2,
            level: 80,
            potential: 5,
            skill_level: 7,
            masteries: { skill_2: 3, skill_3: 3 },
            modules: { uniequip_002_texas2: 3 },
          },
          {
            operator_id: 'char_1033_shu',
            elite: 2,
            level: 75,
            potential: 2,
            skill_level: 7,
            masteries: { skill_3: 3 },
            modules: {},
          },
          {
            operator_id: 'char_1032_virtuosa',
            elite: 2,
            level: 80,
            potential: 2,
            skill_level: 7,
            masteries: { skill_3: 3 },
            modules: {},
          },
          {
            operator_id: 'char_180_amgoat',
            elite: 2,
            level: 85,
            potential: 6,
            skill_level: 7,
            masteries: { skill_2: 3, skill_3: 3 },
            modules: {},
          },
          {
            operator_id: 'char_003_kalts',
            elite: 2,
            level: 90,
            potential: 4,
            skill_level: 7,
            masteries: { skill_3: 3 },
            modules: { uniequip_002_kalts: 3 },
          },
          {
            operator_id: 'char_222_bpipe',
            elite: 2,
            level: 80,
            potential: 5,
            skill_level: 7,
            masteries: { skill_3: 3 } as Record<string, number>,
            modules: { uniequip_002_bpipe: 3 } as Record<string, number>,
          },
        ] as Array<{
          operator_id: string
          elite: number
          level: number
          potential: number
          skill_level: number
          masteries: Record<string, number>
          modules: Record<string, number>
        }>,
      }

      await syncFromArkprtsData(demoData)
      return demoData
    }

    return {
      // State
      profile,
      inventory,
      roster,
      settings,
      authSession,
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
      hasSyncedAccount,
      hasSavedSession,
      savedSessionEmail,
      savedSessionServer,

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
      setAuthSession,
      clearAuthSession,
      syncWithSavedSession,
      fetchFromSupabase,
      syncToSupabase,
      syncFromArkprtsData,
      loadDemoData,
    }
  },
  {
    persist: {
      key: 'arkcalc_user_store',
      pick: ['profile', 'inventory', 'roster', 'settings', 'lastSyncedAt', 'isSynced', 'authSession'],
    },
  }
)
