import { db, type UserInventory } from '@/services/db';

export interface PrtsSyncResult {
  success: boolean;
  message: string;
  syncedItemsCount?: number;
  syncedOperatorsCount?: number;
}

/**
 * Module for manual PRTS / HyperGryph account synchronization.
 * Strictly adheres to security rules:
 * - Never asks for or stores passwords.
 * - Only runs when manually triggered by the user.
 * - NEVER uses background intervals (setInterval) to prevent disconnecting active sessions.
 */
export async function syncWithPrtsAccount(token: string): Promise<PrtsSyncResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return {
      success: false,
      message: 'Токен не указан. Пожалуйста, введите HG / OAuth токен.',
    };
  }

  try {
    // Attempt to query PRTS / Skland API using the user-provided token
    // Standard Skland / Hypergryph warehouse endpoint:
    // https://zonai.skland.com/api/v1/game/player/info or similar proxy
    const res = await fetch('https://zonai.skland.com/api/v1/game/player/info', {
      headers: {
        cred: cleanToken,
        'User-Agent': 'ARK-Calc/1.0',
      },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Неверный или просроченный токен (401/403). Проверьте актуальность токена.',
      };
    }

    if (!res.ok) {
      // If direct CORS blocks browser fetch to Skland from localhost:
      return {
        success: false,
        message:
          'Сервер Skland/PRTS отклонил запрос или ограничен политикой CORS браузера. Для импорта вы также можете использовать резервную копию JSON или GitHub Gist.',
      };
    }

    const data = await res.json();
    if (data.code !== 0) {
      return {
        success: false,
        message: data.message || 'Ошибка ответа PRTS/Skland API.',
      };
    }

    // Parse warehouse items if available in payload
    const inventoryList: UserInventory[] = [];
    const items = data.data?.inventory || data.data?.warehouse || [];
    for (const item of items) {
      if (item.id && item.count > 0) {
        inventoryList.push({ itemId: String(item.id), amount: Number(item.count) });
      }
    }

    if (inventoryList.length > 0) {
      await db.inventory.bulkPut(inventoryList);
    }

    return {
      success: true,
      message: `Синхронизация успешна! Обновлено предметов: ${inventoryList.length}`,
      syncedItemsCount: inventoryList.length,
    };
  } catch (err: any) {
    console.warn('PRTS sync error:', err);
    return {
      success: false,
      message:
        'Не удалось связаться с сервером PRTS (возможно, ограничение CORS браузера). Используйте импорт через JSON или GitHub Gist.',
    };
  }
}
