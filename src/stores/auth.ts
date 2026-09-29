import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useRosterStore } from '@/stores/roster';
import { useGameDataStore } from '@/stores/gamedata';

const LAST_SYNC_KEY = 'ark_last_cloud_sync_time';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const isLoading = ref<boolean>(false);
  const isSyncing = ref<boolean>(false);
  const syncError = ref<string | null>(null);
  const syncMessage = ref<string | null>(null);
  const lastSyncTime = ref<string | null>(localStorage.getItem(LAST_SYNC_KEY) || null);

  const inventory = useInventoryStore();
  const planner = usePlannerStore();
  const roster = useRosterStore();
  const gameData = useGameDataStore();

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email || '');

  // Initialize auth state listener
  async function initAuth() {
    try {
      const { data } = await supabase.auth.getSession();
      session.value = data.session;
      user.value = data.session?.user || null;

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession;
        user.value = newSession?.user || null;
      });
    } catch (e: any) {
      console.warn('Failed to initialize Supabase session:', e);
    }
  }

  // Sign up with Email & Password
  async function signUp(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true;
    syncError.value = null;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) {
        syncError.value = error.message;
        return { success: false, error: error.message };
      }

      user.value = data.user;
      session.value = data.session;

      // Automatically sync local data to new account
      if (data.user) {
        await syncToCloud();
      }

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Ошибка регистрации';
      syncError.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  // Sign in with Email & Password
  async function signIn(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true;
    syncError.value = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        syncError.value = error.message;
        return { success: false, error: error.message };
      }

      user.value = data.user;
      session.value = data.session;

      // Automatically pull latest cloud data upon sign in
      if (data.user) {
        await pullFromCloud();
      }

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Ошибка авторизации';
      syncError.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  // Sign out
  async function signOut(): Promise<void> {
    isLoading.value = true;
    try {
      await supabase.auth.signOut();
      user.value = null;
      session.value = null;
      syncMessage.value = null;
      syncError.value = null;
    } catch (err: any) {
      console.warn('Sign out failed:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // Sync current local state (IndexedDB) to Supabase cloud
  async function syncToCloud(): Promise<{ success: boolean; error?: string }> {
    if (!user.value) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    isSyncing.value = true;
    syncError.value = null;
    syncMessage.value = 'Синхронизация данных с облаком...';

    try {
      const payload = {
        id: user.value.id,
        email: user.value.email,
        inventory_data: inventory.stock,
        plans_data: planner.plans,
        roster_data: roster.rosterList,
        settings_data: {
          itemLanguage: gameData.itemLanguage,
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('user_profiles').upsert(payload);

      if (error) {
        syncError.value = error.message;
        return { success: false, error: error.message };
      }

      const now = new Date().toISOString();
      lastSyncTime.value = now;
      try {
        localStorage.setItem(LAST_SYNC_KEY, now);
      } catch {
        // ignore
      }

      syncMessage.value = 'Данные успешно сохранены в облаке!';
      setTimeout(() => {
        if (syncMessage.value === 'Данные успешно сохранены в облаке!') {
          syncMessage.value = null;
        }
      }, 4000);

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Сбой синхронизации с облаком';
      syncError.value = msg;
      return { success: false, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

  // Pull latest cloud state from Supabase to local stores
  async function pullFromCloud(): Promise<{ success: boolean; error?: string }> {
    if (!user.value) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    isSyncing.value = true;
    syncError.value = null;
    syncMessage.value = 'Загрузка данных из облака...';

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle();

      if (error) {
        syncError.value = error.message;
        return { success: false, error: error.message };
      }

      if (data) {
        // Populate local stores
        if (data.inventory_data && typeof data.inventory_data === 'object') {
          await inventory.bulkSetStock(data.inventory_data);
        }

        if (data.plans_data && typeof data.plans_data === 'object') {
          await planner.bulkImportPlans(data.plans_data);
        }

        if (Array.isArray(data.roster_data)) {
          await roster.saveRoster(data.roster_data);
        }

        if (data.settings_data?.itemLanguage) {
          gameData.setItemLanguage(data.settings_data.itemLanguage);
        }

        const now = data.updated_at || new Date().toISOString();
        lastSyncTime.value = now;
        try {
          localStorage.setItem(LAST_SYNC_KEY, now);
        } catch {
          // ignore
        }
      }

      syncMessage.value = 'Данные успешно обновлены из облака!';
      setTimeout(() => {
        if (syncMessage.value === 'Данные успешно обновлены из облака!') {
          syncMessage.value = null;
        }
      }, 4000);

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Сбой загрузки данных из облака';
      syncError.value = msg;
      return { success: false, error: msg };
    } finally {
      isSyncing.value = false;
    }
  }

  return {
    user,
    session,
    isLoading,
    isSyncing,
    syncError,
    syncMessage,
    lastSyncTime,
    isAuthenticated,
    userEmail,
    initAuth,
    signUp,
    signIn,
    signOut,
    syncToCloud,
    pullFromCloud,
  };
});
