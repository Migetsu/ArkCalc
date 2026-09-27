import { db, type UserInventory, type OperatorTargetPlan, type UserRosterOperator } from '@/services/db';
import { isCraftResource } from '@/data/materialTranslations';

export interface ArkCalcBackupData {
  app: 'ARK-Calc';
  version: 1 | 2;
  exportedAt: string;
  inventory: UserInventory[];
  plans: OperatorTargetPlan[];
  roster?: UserRosterOperator[];
}

const GIST_FILENAME = 'ark_calc_user_data.json';
const GIST_DESCRIPTION = 'ARK-Calc user data backup (Inventory & Plans & Roster)';

/**
 * 1-click Export all IndexedDB data to a downloadable .json file
 */
export async function exportDatabaseToJson(): Promise<void> {
  const inventory = await db.inventory.toArray();
  const plans = await db.plans.toArray();
  const roster = await db.roster.toArray();

  const backupData: ArkCalcBackupData = {
    app: 'ARK-Calc',
    version: 2,
    exportedAt: new Date().toISOString(),
    inventory,
    plans,
    roster,
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
 * 1-click Import IndexedDB data from a .json file or raw text
 */
export async function parseAndImportData(rawText: string): Promise<{
  success: boolean;
  message: string;
  inventoryCount?: number;
  plansCount?: number;
  rosterCount?: number;
}> {
  const text = rawText.trim();
  if (!text) {
    return { success: false, message: 'Данные для импорта пусты.' };
  }

  try {
    let parsedInventory: UserInventory[] = [];
    let parsedPlans: OperatorTargetPlan[] = [];
    let parsedRoster: UserRosterOperator[] = [];

    // Check if CSV format (Krooster items CSV)
    if (text.includes(',') && !text.startsWith('{') && !text.startsWith('[')) {
      const lines = text.split('\n');
      for (const line of lines) {
        const parts = line.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          const id = parts[0];
          const count = parseInt(parts[1], 10);
          if (id && !isNaN(count) && count > 0 && isCraftResource(id)) {
            parsedInventory.push({ itemId: id, amount: count });
          }
        }
      }
    } else {
      const data = JSON.parse(text);

      // 1. Native ARK-Calc backup format
      if (Array.isArray(data.inventory) || Array.isArray(data.plans) || Array.isArray(data.roster)) {
        if (Array.isArray(data.inventory)) {
          parsedInventory = data.inventory.filter((i: any) => isCraftResource(i.itemId));
        }
        if (Array.isArray(data.plans)) {
          parsedPlans = data.plans;
        }
        if (Array.isArray(data.roster)) {
          parsedRoster = data.roster;
        }
      }
      // 2. Penguin Statistics JSON: { items: [ { id: "30012", have: 15 } ] }
      else if (data.items && Array.isArray(data.items)) {
        for (const itm of data.items) {
          const id = String(itm.id || itm.itemId || '');
          const count = Number(itm.have ?? itm.count ?? itm.amount ?? 0);
          if (id && count > 0 && isCraftResource(id)) {
            parsedInventory.push({ itemId: id, amount: count });
          }
        }
      }
      // 3. ArkPRTS Full Raw Data (from Game packet or Skland)
      else {
        // Find inventory object
        const invSource = data.inventory || data.items || data.data?.inventory || data.data?.warehouse;
        if (invSource) {
          if (Array.isArray(invSource)) {
            for (const itm of invSource) {
              const id = String(itm.id || itm.itemId || '');
              const count = Number(itm.count ?? itm.amount ?? itm.have ?? 0);
              if (id && count > 0 && isCraftResource(id)) {
                parsedInventory.push({ itemId: id, amount: count });
              }
            }
          } else if (typeof invSource === 'object') {
            for (const [id, count] of Object.entries(invSource)) {
              const num = Number(count);
              if (id && num > 0 && isCraftResource(id)) {
                parsedInventory.push({ itemId: id, amount: num });
              }
            }
          }
        }

        // Find character troop (ArkPRTS player's owned roster)
        const charsSource = data.troop?.chars || data.chars || data.char || data.data?.troop?.chars;
        if (charsSource) {
          const charList = Array.isArray(charsSource) ? charsSource : Object.values(charsSource);
          for (const op of charList as any[]) {
            const charId = op.charId || op.operatorId || op.id;
            if (!charId) continue;

            const elite = op.evolvePhase ?? op.elite ?? 0;
            const level = op.level ?? 1;

            // Skills & masteries
            let skills = [7];
            let masteries: number[] = [];
            if (Array.isArray(op.skills)) {
              masteries = op.skills.map((s: any) => (typeof s === 'object' ? s.specializeLevel || 0 : 0));
              if (op.skills.length > 0 && typeof op.skills[0] === 'object') {
                skills = [op.skills[0].level || 7];
              }
            } else if (Array.isArray(op.masteries)) {
              masteries = op.masteries;
            }

            // Modules
            const modules: Record<string, number> = {};
            if (op.equip && typeof op.equip === 'object') {
              for (const [eqId, eqVal] of Object.entries(op.equip)) {
                const lvl = typeof eqVal === 'object' ? (eqVal as any).level || 0 : Number(eqVal) || 0;
                if (lvl > 0) modules[eqId] = lvl;
              }
            } else if (op.modules && typeof op.modules === 'object') {
              Object.assign(modules, op.modules);
            }

            // Save into owned characters Roster
            parsedRoster.push({
              charId,
              elite,
              level,
              skills,
              masteries,
              modules,
              potential: op.potentialRank ?? 0,
              favor: op.favorPoint ?? 0,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    if (parsedInventory.length === 0 && parsedPlans.length === 0 && parsedRoster.length === 0) {
      return {
        success: false,
        message: 'Не удалось распознать предметы или персонажей в переданных данных.',
      };
    }

    // Save to database
    await db.transaction('rw', [db.inventory, db.plans, db.roster], async () => {
      if (parsedInventory.length > 0) {
        await db.inventory.clear();
        await db.inventory.bulkPut(parsedInventory);
      }
      if (parsedRoster.length > 0) {
        await db.roster.clear();
        await db.roster.bulkPut(parsedRoster);
      }
      if (parsedPlans.length > 0) {
        await db.plans.clear();
        await db.plans.bulkPut(parsedPlans);
      } else if (parsedRoster.length > 0) {
        // Sync current levels of already existing plans with new account data
        const existingPlans = await db.plans.toArray();
        if (existingPlans.length > 0) {
          const rosterMap = new Map(parsedRoster.map((r) => [r.charId, r]));
          let updated = false;
          for (const plan of existingPlans) {
            const ro = rosterMap.get(plan.charId);
            if (ro) {
              plan.current = {
                elite: ro.elite,
                level: ro.level,
                skills: ro.skills,
                masteries: ro.masteries,
                modules: ro.modules,
              };
              updated = true;
            }
          }
          if (updated) {
            await db.plans.bulkPut(existingPlans);
          }
        }
      }
    });

    const parts = [];
    if (parsedInventory.length > 0) parts.push(`${parsedInventory.length} предметов склада`);
    if (parsedRoster.length > 0) parts.push(`${parsedRoster.length} оперативников в «Мой ростер»`);
    if (parsedPlans.length > 0) parts.push(`${parsedPlans.length} планов прокачки`);

    return {
      success: true,
      message: `Успешно импортировано: ${parts.join(', ')}.`,
      inventoryCount: parsedInventory.length,
      plansCount: parsedPlans.length,
      rosterCount: parsedRoster.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ошибка разбора данных: ${err.message || err}`,
    };
  }
}

export async function importDatabaseFromJson(file: File): Promise<{
  success: boolean;
  message: string;
  inventoryCount?: number;
  plansCount?: number;
}> {
  try {
    const text = await file.text();
    return await parseAndImportData(text);
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
    const roster = await db.roster.toArray();

    const backupData: ArkCalcBackupData = {
      app: 'ARK-Calc',
      version: 2,
      exportedAt: new Date().toISOString(),
      inventory,
      plans,
      roster,
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
