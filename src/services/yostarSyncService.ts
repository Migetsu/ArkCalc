// src/services/yostarSyncService.ts
import { parseAndImportData } from '@/services/syncService';
import { useInventoryStore } from '@/stores/inventory';
import { useRosterStore } from '@/stores/roster';
import { usePlannerStore } from '@/stores/planner';
import { useAuthStore } from '@/stores/auth';

export type ArknightsServer = 'en' | 'jp' | 'kr';

export interface YostarLinkedAccount {
  email: string;
  server: ArknightsServer;
  yostarUid: string;
  yostarToken: string;
  nickName?: string;
  nickNumber?: string;
  level?: number;
  linkedAt: string;
  lastSyncAt: string;
}

const STORAGE_KEY = 'ark_yostar_account_v1';

export function getLinkedAccount(): YostarLinkedAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLinkedAccount(account: YostarLinkedAccount | null): void {
  try {
    if (!account) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    }
  } catch {
    // ignore
  }
}

/**
 * Step 1: Request 6-digit verification code from Yostar
 */
export async function requestVerificationCode(
  email: string,
  server: ArknightsServer = 'en'
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/arknights/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, server }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Не удалось отправить код подтверждения' };
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Сбой сети при запросе кода' };
  }
}

/**
 * Step 2: Submit 6-digit code, obtain permanent token, and immediately sync game data
 */
export async function linkAndSync(
  email: string,
  code: string,
  server: ArknightsServer = 'en'
): Promise<{
  success: boolean;
  account?: YostarLinkedAccount;
  error?: string;
  inventoryCount?: number;
  rosterCount?: number;
}> {
  try {
    const res = await fetch('/api/arknights/login-and-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, server }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Ошибка входа в аккаунт Yostar' };
    }

    // Save linked credentials
    const now = new Date().toISOString();
    const account: YostarLinkedAccount = {
      email: data.email,
      server: data.server,
      yostarUid: data.yostarUid,
      yostarToken: data.yostarToken,
      nickName: data.playerInfo?.nickName,
      nickNumber: data.playerInfo?.nickNumber,
      level: data.playerInfo?.level,
      linkedAt: now,
      lastSyncAt: now,
    };
    saveLinkedAccount(account);

    // Apply raw game data into IndexedDB & state
    const rawSyncData = data.rawSyncData;
    const importRes = await parseAndImportData(JSON.stringify(rawSyncData));

    if (importRes.success) {
      const inventory = useInventoryStore();
      const rosterStore = useRosterStore();
      const planner = usePlannerStore();
      const auth = useAuthStore();

      await inventory.loadInventory();
      await rosterStore.loadRoster();
      await planner.loadPlans();

      if (auth.isAuthenticated) {
        auth.triggerAutoSync(300);
      }
    }

    return {
      success: true,
      account,
      inventoryCount: importRes.inventoryCount,
      rosterCount: importRes.rosterCount,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Сбой при синхронизации с игрой' };
  }
}

/**
 * 1-Click Fast Sync: uses the saved persistent token (NO email code needed!)
 */
export async function syncDirect(): Promise<{
  success: boolean;
  error?: string;
  account?: YostarLinkedAccount;
  inventoryCount?: number;
  rosterCount?: number;
}> {
  const account = getLinkedAccount();
  if (!account || !account.yostarUid || !account.yostarToken) {
    return { success: false, error: 'Аккаунт Yostar еще не привязан' };
  }

  try {
    const res = await fetch('/api/arknights/sync-with-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yostarUid: account.yostarUid,
        yostarToken: account.yostarToken,
        server: account.server || 'en',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Ошибка обновления данных аккаунта' };
    }

    // Update lastSyncAt and playerInfo
    account.lastSyncAt = new Date().toISOString();
    if (data.playerInfo?.nickName) account.nickName = data.playerInfo.nickName;
    if (data.playerInfo?.nickNumber) account.nickNumber = data.playerInfo.nickNumber;
    if (data.playerInfo?.level) account.level = data.playerInfo.level;
    saveLinkedAccount(account);

    // Apply data
    const rawSyncData = data.rawSyncData;
    const importRes = await parseAndImportData(JSON.stringify(rawSyncData));

    if (importRes.success) {
      const inventory = useInventoryStore();
      const rosterStore = useRosterStore();
      const planner = usePlannerStore();
      const auth = useAuthStore();

      await inventory.loadInventory();
      await rosterStore.loadRoster();
      await planner.loadPlans();

      if (auth.isAuthenticated) {
        auth.triggerAutoSync(300);
      }
    }

    return {
      success: true,
      account,
      inventoryCount: importRes.inventoryCount,
      rosterCount: importRes.rosterCount,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Сбой связи с сервером Arknights' };
  }
}

/**
 * Unlink Yostar account
 */
export function unlinkAccount(): void {
  saveLinkedAccount(null);
}
