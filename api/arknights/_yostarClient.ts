// api/arknights/_yostarClient.ts
import crypto from 'node:crypto';

export type ArknightsServer = 'en' | 'jp' | 'kr';

export interface ServerConfig {
  networkRoute: string;
  yostarUrl: string;
  pid: string;
  lang: string;
  channelId: string;
}

export const SERVER_CONFIG: Record<ArknightsServer, ServerConfig> = {
  en: {
    networkRoute: 'https://ak-conf.arknights.global/config/prod/official/network_config',
    yostarUrl: 'https://en-sdk-api.yostarplat.com',
    pid: 'US-ARKNIGHTS',
    lang: 'en',
    channelId: '3',
  },
  jp: {
    networkRoute: 'https://ak-conf.arknights.jp/config/prod/official/network_config',
    yostarUrl: 'https://jp-sdk-api.yostarplat.com',
    pid: 'JP-AK',
    lang: 'jp',
    channelId: '3',
  },
  kr: {
    networkRoute: 'https://ak-conf.arknights.kr/config/prod/official/network_config',
    yostarUrl: 'https://jp-sdk-api.yostarplat.com',
    pid: 'KR-ARKNIGHTS',
    lang: 'ko',
    channelId: '3',
  },
};

export function generateYostarplatHeaders(
  body: string,
  uid: string = '',
  token: string = '',
  deviceId: string = '',
  server: ArknightsServer = 'en'
): Record<string, string> {
  const conf = SERVER_CONFIG[server] || SERVER_CONFIG.en;
  const linkedHashMap = {
    PID: conf.pid,
    Channel: 'googleplay',
    Platform: 'android',
    Version: '4.10.0',
    GVersionNo: '2000112',
    GBuildNo: '',
    Lang: conf.lang,
    DeviceID: deviceId || crypto.randomUUID(),
    DeviceModel: 'F9',
    UID: uid || '',
    Token: token || '',
    Time: Math.floor(Date.now() / 1000),
  };

  const jsonString = JSON.stringify(linkedHashMap);
  const md5Hash = crypto
    .createHash('md5')
    .update(jsonString + body + '886c085e4a8d30a703367b120dd8353948405ec2')
    .digest('hex')
    .toUpperCase();

  const headerAuth = { Head: linkedHashMap, Sign: md5Hash };

  return {
    Authorization: JSON.stringify(headerAuth),
    'Content-Type': 'application/json',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
  };
}

export function generateU8Sign(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort();
  const query = sortedKeys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(data[key]))}`)
    .join('&');

  const hmac = crypto.createHmac('sha1', '91240f70c09a08a6bc72af1a5c8d4670');
  hmac.update(query);
  return hmac.digest('hex').toLowerCase();
}

export function createRandomDeviceIds(): [string, string, string] {
  const id1 = crypto.randomUUID().replace(/-/g, '');
  const id2 = '86' + Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
  const id3 = crypto.randomUUID().replace(/-/g, '');
  return [id1, id2, id3];
}

const configCache: {
  [K in ArknightsServer]?: {
    gs: string;
    u8: string;
    resVersion: string;
    clientVersion: string;
    cachedAt: number;
  };
} = {};

export async function getNetworkConfig(server: ArknightsServer = 'en') {
  const now = Date.now();
  const cached = configCache[server];
  if (cached && now - cached.cachedAt < 1000 * 60 * 15) {
    return cached;
  }

  const conf = SERVER_CONFIG[server] || SERVER_CONFIG.en;
  const res = await fetch(conf.networkRoute, {
    headers: { 'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)' },
  });
  if (!res.ok) throw new Error(`Failed to load network route: ${res.status}`);
  const data: any = await res.json();
  const content = JSON.parse(data.content);
  const net = content.configs[content.funcVer].network;

  const hvUrl = net.hv.replace('{0}', 'Android');
  const vRes = await fetch(hvUrl, {
    headers: { 'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)' },
  });
  if (!vRes.ok) throw new Error(`Failed to load version config: ${vRes.status}`);
  const vData: any = await vRes.json();

  const resolved = {
    gs: net.gs,
    u8: net.u8,
    resVersion: vData.resVersion,
    clientVersion: vData.clientVersion,
    cachedAt: now,
  };
  configCache[server] = resolved;
  return resolved;
}

export async function sendYostarCode(email: string, server: ArknightsServer = 'en') {
  const conf = SERVER_CONFIG[server] || SERVER_CONFIG.en;
  const bodyObj = { Account: email.trim(), Randstr: '', Ticket: '' };
  const body = JSON.stringify(bodyObj);
  const headers = generateYostarplatHeaders(body, '', '', '', server);

  const res = await fetch(`${conf.yostarUrl}/yostar/send-code`, {
    method: 'POST',
    headers,
    body,
  });

  const data: any = await res.json();
  if (data.Code !== 200) {
    throw new Error(data.Msg || `Ошибка отправки кода Yostar (код ${data.Code})`);
  }
  return data;
}

export async function loginWithEmailCode(
  email: string,
  code: string,
  server: ArknightsServer = 'en'
): Promise<{ yostarUid: string; yostarToken: string; email: string; server: ArknightsServer }> {
  const conf = SERVER_CONFIG[server] || SERVER_CONFIG.en;
  const cleanEmail = email.trim();
  const cleanCode = code.trim();

  // 1. Submit email code
  const authBodyObj = { Account: cleanEmail, Code: cleanCode };
  const authBody = JSON.stringify(authBodyObj);
  const authHeaders = generateYostarplatHeaders(authBody, '', '', '', server);

  const authRes = await fetch(`${conf.yostarUrl}/yostar/get-auth`, {
    method: 'POST',
    headers: authHeaders,
    body: authBody,
  });
  const authData: any = await authRes.json();
  if (authData.Code !== 200 || !authData.Data?.Token) {
    throw new Error(authData.Msg || 'Неверный код подтверждения Yostar');
  }
  const emailToken = authData.Data.Token;

  // 2. Exchange for persistent credentials
  const loginBodyObj = {
    CheckAccount: 0,
    Geetest: {
      CaptchaID: null,
      CaptchaOutput: null,
      GenTime: null,
      LotNumber: null,
      PassToken: null,
    },
    OpenID: cleanEmail,
    Secret: '',
    Token: emailToken,
    Type: 'yostar',
    UserName: cleanEmail,
  };
  const loginBody = JSON.stringify(loginBodyObj);
  const loginHeaders = generateYostarplatHeaders(loginBody, '', '', '', server);

  const loginRes = await fetch(`${conf.yostarUrl}/user/login`, {
    method: 'POST',
    headers: loginHeaders,
    body: loginBody,
  });
  const loginData: any = await loginRes.json();
  if (loginData.Code !== 200 || !loginData.Data?.UserInfo?.Token) {
    throw new Error(loginData.Msg || 'Не удалось получить токен аккаунта Yostar');
  }

  const yostarUid = String(loginData.Data.UserInfo.ID);
  const yostarToken = String(loginData.Data.UserInfo.Token);

  return {
    yostarUid,
    yostarToken,
    email: cleanEmail,
    server,
  };
}

export async function fetchArknightsGameData(
  yostarUid: string,
  yostarToken: string,
  server: ArknightsServer = 'en'
) {
  const conf = SERVER_CONFIG[server] || SERVER_CONFIG.en;
  const net = await getNetworkConfig(server);
  const deviceIds = createRandomDeviceIds();

  // 1. Get u8 token
  const extension = JSON.stringify({ type: 1, uid: yostarUid, token: yostarToken });
  const u8Body: Record<string, any> = {
    appId: '1',
    platform: 1,
    channelId: conf.channelId,
    subChannel: conf.channelId,
    extension,
    worldId: conf.channelId,
    deviceId: deviceIds[0],
    deviceId2: deviceIds[1],
    deviceId3: deviceIds[2],
  };
  u8Body.sign = generateU8Sign(u8Body);

  const u8Res = await fetch(`${net.u8}/user/v1/getToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Unity-Version': '2017.4.39f1',
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
      Connection: 'Keep-Alive',
    },
    body: JSON.stringify(u8Body),
  });
  const u8Data: any = await u8Res.json();
  if (!u8Data.uid || !u8Data.token) {
    throw new Error(u8Data.message || 'Ошибка авторизации на шлюзе игры (u8 token)');
  }
  const arknightsUid = String(u8Data.uid);
  const u8Token = String(u8Data.token);

  // 2. Login to game server
  const gsLoginBody = {
    platform: 1,
    networkVersion: '1',
    assetsVersion: net.resVersion,
    clientVersion: net.clientVersion,
    token: u8Token,
    uid: arknightsUid,
    deviceId: deviceIds[0],
    deviceId2: deviceIds[1],
    deviceId3: deviceIds[2],
  };

  const gsLoginRes = await fetch(`${net.gs}/account/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Unity-Version': '2017.4.39f1',
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
      secret: '',
      seqnum: '1',
      uid: arknightsUid,
    },
    body: JSON.stringify(gsLoginBody),
  });
  const gsLoginData: any = await gsLoginRes.json();
  if (gsLoginData.result !== 0 || !gsLoginData.secret) {
    if (gsLoginData.result === 3) {
      throw new Error('Сессия Yostar истекла. Пожалуйста, запросите код подтверждения повторно.');
    }
    throw new Error(`Ошибка входа на игровой сервер (result: ${gsLoginData.result})`);
  }
  const secret = String(gsLoginData.secret);

  // 3. syncData to get inventory and troop
  const syncRes = await fetch(`${net.gs}/account/syncData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Unity-Version': '2017.4.39f1',
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
      secret,
      seqnum: '2',
      uid: arknightsUid,
    },
    body: JSON.stringify({ platform: 1 }),
  });
  const syncData: any = await syncRes.json();
  if (syncData.result !== 0 || !syncData.user) {
    throw new Error(`Ошибка получения данных аккаунта (result: ${syncData.result})`);
  }

  return {
    uid: arknightsUid,
    server,
    playerInfo: {
      nickName: syncData.user.status?.nickName,
      nickNumber: syncData.user.status?.nickNumber,
      level: syncData.user.status?.level,
    },
    rawSyncData: syncData,
  };
}
