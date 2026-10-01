// api/arknights/login-and-sync.ts
import { loginWithEmailCode, fetchArknightsGameData, type ArknightsServer } from './_yostarClient.ts';

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

    const email = body?.email;
    const code = body?.code;
    const server: ArknightsServer = body?.server || 'en';

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Укажите email и 6-значный код из письма' });
    }

    // 1. Exchange email code for permanent Yostar UID and Token
    const credentials = await loginWithEmailCode(email, code, server);

    // 2. Immediately fetch live account data (inventory & troop)
    const gameData = await fetchArknightsGameData(credentials.yostarUid, credentials.yostarToken, server);

    return res.status(200).json({
      success: true,
      yostarUid: credentials.yostarUid,
      yostarToken: credentials.yostarToken,
      email: credentials.email,
      server: credentials.server,
      playerInfo: gameData.playerInfo,
      rawSyncData: gameData.rawSyncData,
    });
  } catch (err: any) {
    console.error('login-and-sync error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Ошибка подключения к аккаунту Arknights',
    });
  }
}
