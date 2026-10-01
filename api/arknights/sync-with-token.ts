// api/arknights/sync-with-token.ts
import { fetchArknightsGameData, type ArknightsServer } from './_yostarClient.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const yostarUid = body?.yostarUid;
    const yostarToken = body?.yostarToken;
    const server: ArknightsServer = body?.server || 'en';

    if (!yostarUid || !yostarToken) {
      return res.status(400).json({ success: false, error: 'Отсутствуют сохраненные учетные данные Yostar' });
    }

    // Directly fetch live account data using the saved persistent token
    const gameData = await fetchArknightsGameData(yostarUid, yostarToken, server);

    return res.status(200).json({
      success: true,
      server,
      playerInfo: gameData.playerInfo,
      rawSyncData: gameData.rawSyncData,
    });
  } catch (err: any) {
    console.error('sync-with-token error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Ошибка синхронизации с игровым сервером Arknights',
    });
  }
}
