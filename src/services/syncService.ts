import { db, type UserInventory, type OperatorTargetPlan } from '@/services/db';

export interface ArkCalcBackupData {
  app: 'ARK-Calc';
  version: 1;
  exportedAt: string;
  inventory: UserInventory[];
  plans: OperatorTargetPlan[];
}

const GIST_FILENAME = 'ark_calc_user_data.json';
const GIST_DESCRIPTION = 'ARK-Calc user data backup (Inventory & Plans)';

/**
 * 1-click Export all IndexedDB data to a downloadable .json file
 */
export async function exportDatabaseToJson(): Promise<void> {
  const inventory = await db.inventory.toArray();
  const plans = await db.plans.toArray();

  const backupData: ArkCalcBackupData = {
    app: 'ARK-Calc',
    version: 1,
    exportedAt: new Date().toISOString(),
    inventory,
    plans,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ark_calc_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1-click Import IndexedDB data from a .json file
 */
export async function importDatabaseFromJson(file: File): Promise<{
  success: boolean;
  message: string;
  inventoryCount?: number;
  plansCount?: number;
}> {
try {
  const text = await file.text();
  const data = JSON.parse(text) as Partial<ArkCalcBackupData>;

  // Support ArkPRTS raw export format
  if (!data.inventory && !data.plans) {
    const raw = data as any;
    if (raw.char && raw.items) {
      const transformed: ArkCalcBackupData = {
        app: 'ARK-Calc',
        version: 1,
        exportedAt: new Date().toISOString(),
        inventory: raw.items.map((itm: any) => ({ itemId: itm.itemId, count: itm.count })),
        plans: raw.char.map((op: any) => ({
          charId: op.charId || op.operatorId || op.id,
          current: {
            elite: op.elite ?? 0,
            level: op.level ?? 1,
            skills: (op.skills ?? []).map((s: any) => s.level ?? 1),
            masteries: op.masteries ?? [],
            modules: op.modules ?? {},
          },
          target: {
            elite: op.targetElite ?? op.elite ?? 0,
            level: op.targetLevel ?? op.level ?? 1,
            skills: (op.targetSkills ?? []).map((s: any) => s.level ?? 1),
            masteries: op.targetMasteries ?? [],
            modules: op.targetModules ?? {},
          },
        })),
      };
      data.inventory = transformed.inventory;
      data.plans = transformed.plans;
    } else {
      return {
        success: false,
        message: 'Файл не содержит корректных данных ARK-Calc.',
      };
    }
  }

    await db.transaction('rw', [db.inventory, db.plans], async () => {
      if (Array.isArray(data.inventory)) {
        await db.inventory.clear();
        if (data.inventory.length > 0) {
          await db.inventory.bulkPut(data.inventory);
        }
      }
      if (Array.isArray(data.plans)) {
        await db.plans.clear();
        if (data.plans.length > 0) {
          await db.plans.bulkPut(data.plans);
        }
      }
    });

    return {
      success: true,
      message: 'База данных успешно восстановлена!',
      inventoryCount: data.inventory?.length || 0,
      plansCount: data.plans?.length || 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ошибка чтения файла: ${err.message || err}`,
    };
  }
}

/**
 * Upload current database to GitHub Gist using Personal Access Token
 */
export async function uploadToGitHubGist(pat: string, gistId?: string): Promise<{
  success: boolean;
  message: string;
  gistId?: string;
  url?: string;
}> {
  if (!pat.trim()) {
    return { success: false, message: 'GitHub Personal Access Token не указан.' };
  }

  try {
    const inventory = await db.inventory.toArray();
    const plans = await db.plans.toArray();

    const backupData: ArkCalcBackupData = {
      app: 'ARK-Calc',
      version: 1,
      exportedAt: new Date().toISOString(),
      inventory,
      plans,
    };

    const payload = {
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(backupData, null, 2),
        },
      },
    };

    const isUpdate = !!gistId && gistId.trim().length > 0;
    const endpoint = isUpdate && gistId
      ? `https://api.github.com/gists/${gistId.trim()}`
      : 'https://api.github.com/gists';

    const res = await fetch(endpoint, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${pat.trim()}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        success: false,
        message: `Ошибка GitHub API (${res.status}): ${errBody.message || res.statusText}`,
      };
    }

    const resData = await res.json();
    return {
      success: true,
      message: isUpdate
        ? 'Данные успешно обновлены в GitHub Gist!'
        : 'Создан новый приватный Gist с резервной копией!',
      gistId: resData.id,
      url: resData.html_url,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ошибка отправки в Gist: ${err.message || err}`,
    };
  }
}

/**
 * Download database from GitHub Gist using Personal Access Token or Gist ID
 */
export async function downloadFromGitHubGist(
  pat: string,
  gistId: string
): Promise<{
  success: boolean;
  message: string;
  inventoryCount?: number;
  plansCount?: number;
}> {
  if (!gistId.trim()) {
    return { success: false, message: 'Gist ID не указан.' };
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (pat.trim()) {
      headers['Authorization'] = `Bearer ${pat.trim()}`;
    }

    const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, { headers });
    if (!res.ok) {
      return {
        success: false,
        message: `Не удалось загрузить Gist (${res.status}): проверьте Gist ID и токен.`,
      };
    }

    const gist = await res.json();
    const fileObj = gist.files?.[GIST_FILENAME];
    if (!fileObj || !fileObj.content) {
      return {
        success: false,
        message: `В Gist не найден файл ${GIST_FILENAME}.`,
      };
    }

    const data = JSON.parse(fileObj.content) as Partial<ArkCalcBackupData>;

    await db.transaction('rw', [db.inventory, db.plans], async () => {
      if (Array.isArray(data.inventory)) {
        await db.inventory.clear();
        if (data.inventory.length > 0) {
          await db.inventory.bulkPut(data.inventory);
        }
      }
      if (Array.isArray(data.plans)) {
        await db.plans.clear();
        if (data.plans.length > 0) {
          await db.plans.bulkPut(data.plans);
        }
      }
    });

    return {
      success: true,
      message: 'Данные успешно загружены из GitHub Gist!',
      inventoryCount: data.inventory?.length || 0,
      plansCount: data.plans?.length || 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ошибка загрузки из Gist: ${err.message || err}`,
    };
  }
}
