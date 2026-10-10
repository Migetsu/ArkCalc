import crypto from 'node:crypto'

export interface YostarDomainConfig {
  yostarDomain: string
  networkConfigUrl: string
  versionUrl: string
  pid: string
  lang: string
}

export const SERVER_CONFIGS: Record<string, YostarDomainConfig> = {
  en: {
    yostarDomain: 'https://en-sdk-api.yostarplat.com',
    networkConfigUrl: 'https://ak-conf.arknights.global/config/prod/official/network_config',
    versionUrl: 'https://ark-us-static-online.yo-star.com/assetbundle/official/Android/version',
    pid: 'US-ARKNIGHTS',
    lang: 'en',
  },
  jp: {
    yostarDomain: 'https://jp-sdk-api.yostarplat.com',
    networkConfigUrl: 'https://ak-conf.arknights.jp/config/prod/official/network_config',
    versionUrl: 'https://ark-jp-static-online.yo-star.com/assetbundle/official/Android/version',
    pid: 'JP-AK',
    lang: 'jp',
  },
  kr: {
    yostarDomain: 'https://jp-sdk-api.yostarplat.com',
    networkConfigUrl: 'https://ak-conf.arknights.kr/config/prod/official/network_config',
    versionUrl: 'https://ark-kr-static-online.yo-star.com/assetbundle/official/Android/version',
    pid: 'KR-ARKNIGHTS',
    lang: 'ko',
  },
}

export const DEFAULT_SERVER_CONFIG: YostarDomainConfig = {
  yostarDomain: 'https://en-sdk-api.yostarplat.com',
  networkConfigUrl: 'https://ak-conf.arknights.global/config/prod/official/network_config',
  versionUrl: 'https://ark-us-static-online.yo-star.com/assetbundle/official/Android/version',
  pid: 'US-ARKNIGHTS',
  lang: 'en',
}

export function getServerConfig(server?: string): YostarDomainConfig {
  if (!server) return DEFAULT_SERVER_CONFIG
  return SERVER_CONFIGS[server.toLowerCase()] ?? DEFAULT_SERVER_CONFIG
}

/**
 * Creates random Arknights device IDs matching Android hardware identifiers.
 */
export function createRandomDeviceIds(): { id1: string; id2: string; id3: string } {
  const id1 = crypto.randomUUID().replace(/-/g, '')
  const id2 = '86' + Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('')
  const id3 = crypto.randomUUID().replace(/-/g, '')
  return { id1, id2, id3 }
}

/**
 * Generates MD5 signature and Authorization headers required by Yostar Platform SDK.
 */
export function generateYostarplatHeaders(
  bodyString: string,
  server: string = 'en',
  deviceId?: string,
  uid: string = '',
  token: string = ''
): Record<string, string> {
  const cfg = getServerConfig(server)
  const devId = deviceId || crypto.randomUUID()

  const head = {
    PID: cfg.pid,
    Channel: 'googleplay',
    Platform: 'android',
    Version: '4.10.0',
    GVersionNo: '2000112',
    GBuildNo: '',
    Lang: cfg.lang,
    DeviceID: devId,
    DeviceModel: 'F9',
    UID: uid,
    Token: token,
    Time: Math.floor(Date.now() / 1000),
  }

  const headJson = JSON.stringify(head)
  const rawSign = headJson + bodyString + '886c085e4a8d30a703367b120dd8353948405ec2'
  const sign = crypto.createHash('md5').update(rawSign).digest('hex').toUpperCase()

  const headerAuth = { Head: head, Sign: sign }
  return {
    Authorization: JSON.stringify(headerAuth),
    'Content-Type': 'application/json',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
  }
}

/**
 * Generates HMAC-SHA1 signature for Arknights U8 authentication gateway.
 */
export function generateU8Sign(data: Record<string, any>): string {
  const sortedKeys = Object.keys(data).sort()
  const query = sortedKeys
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&')
  return crypto
    .createHmac('sha1', '91240f70c09a08a6bc72af1a5c8d4670')
    .update(query)
    .digest('hex')
    .toLowerCase()
}

/**
 * Requests official Yostar verification code to be sent to user's email.
 */
export async function sendYostarEmailCode(email: string, server: string = 'en'): Promise<{ success: boolean; message: string }> {
  const cfg = getServerConfig(server)
  const bodyObj = { Account: email.trim(), Randstr: '', Ticket: '' }
  const bodyString = JSON.stringify(bodyObj)
  const headers = generateYostarplatHeaders(bodyString, server)

  const response = await fetch(`${cfg.yostarDomain}/yostar/send-code`, {
    method: 'POST',
    headers,
    body: bodyString,
  })

  if (!response.ok) {
    throw new Error(`Yostar server returned HTTP ${response.status}`)
  }

  const data: any = await response.json()
  if (data.Code === 200) {
    return {
      success: true,
      message: `Verification code successfully sent to ${email}.`,
    }
  }

  const msg = data.Msg || 'Yostar verification code request failed.'
  throw new Error(`Yostar error: ${msg}`)
}

/**
 * Submits 6-digit verification code and returns authenticated Yostar Channel UID & Token.
 */
export async function loginWithYostarEmailCode(
  email: string,
  code: string,
  server: string = 'en'
): Promise<{ channelUid: string; token: string }> {
  const cfg = getServerConfig(server)

  // 1. Submit Code to get Auth Token
  const authBody = JSON.stringify({ Account: email.trim(), Code: code.trim() })
  const authHeaders = generateYostarplatHeaders(authBody, server)

  const authRes = await fetch(`${cfg.yostarDomain}/yostar/get-auth`, {
    method: 'POST',
    headers: authHeaders,
    body: authBody,
  })

  const authData: any = await authRes.json()
  if (authData.Code !== 200 || !authData.Data?.Token) {
    const msg = authData.Msg || 'Verification code is invalid or has expired.'
    throw new Error(`Yostar Auth Error: ${msg}`)
  }

  const emailToken = authData.Data.Token

  // 2. Login to Yostar Platform to obtain Account UID & Access Token
  const loginBodyObj = {
    CheckAccount: 0,
    Geetest: {
      CaptchaID: null,
      CaptchaOutput: null,
      GenTime: null,
      LotNumber: null,
      PassToken: null,
    },
    OpenID: email.trim(),
    Secret: '',
    Token: emailToken,
    Type: 'yostar',
    UserName: email.trim(),
  }
  const loginBody = JSON.stringify(loginBodyObj)
  const loginHeaders = generateYostarplatHeaders(loginBody, server)

  const loginRes = await fetch(`${cfg.yostarDomain}/user/login`, {
    method: 'POST',
    headers: loginHeaders,
    body: loginBody,
  })

  const loginData: any = await loginRes.json()
  if (loginData.Code !== 200 || !loginData.Data?.UserInfo?.ID) {
    const msg = loginData.Msg || 'Failed to authenticate Yostar account session.'
    throw new Error(`Yostar Platform Login Error: ${msg}`)
  }

  const channelUid = String(loginData.Data.UserInfo.ID)
  const token = String(loginData.Data.UserInfo.Token)

  return { channelUid, token }
}

/**
 * Connects to official Arknights game servers using Yostar credentials
 * and synchronizes live account data (Profile, Inventory, Roster).
 */
export async function fetchLiveArknightsData(
  server: string,
  channelUid: string,
  token: string,
  accountEmail?: string
): Promise<any> {
  const cfg = getServerConfig(server)
  const device = createRandomDeviceIds()

  // 1. Fetch Network Configuration & Server URLs
  let gsUrl = 'https://gs.arknights.global:8443'
  let u8Url = 'https://as.arknights.global/u8'
  try {
    const netConfRes = await fetch(cfg.networkConfigUrl, { signal: AbortSignal.timeout(6000) })
    if (netConfRes.ok) {
      const netConf: any = await netConfRes.json()
      const content = typeof netConf.content === 'string' ? JSON.parse(netConf.content) : netConf.content
      const funcVer = content?.funcVer || 'V072'
      const net = content?.configs?.[funcVer]?.network || content?.configs?.V072?.network
      if (net?.gs) gsUrl = net.gs
      if (net?.u8) u8Url = net.u8
    }
  } catch (e: any) {
    console.warn('[Yostar Sync] network_config fallback applied:', e.message)
  }

  // 2. Fetch Assets & Client Version
  let resVersion = '26-09-23-17-49-43_b9cc4a'
  let clientVersion = '36.7.22'
  try {
    const verRes = await fetch(cfg.versionUrl, { signal: AbortSignal.timeout(6000) })
    if (verRes.ok) {
      const verData: any = await verRes.json()
      if (verData.resVersion) resVersion = verData.resVersion
      if (verData.clientVersion) clientVersion = verData.clientVersion
    }
  } catch (e: any) {
    console.warn('[Yostar Sync] version fallback applied:', e.message)
  }

  // 3. Obtain Arknights Player UID & U8 Token
  const extension = JSON.stringify({ type: 1, uid: channelUid, token })
  const u8Body: Record<string, any> = {
    appId: '1',
    channelId: '3',
    deviceId: device.id1,
    deviceId2: device.id2,
    deviceId3: device.id3,
    extension,
    platform: 1,
    subChannel: '3',
    worldId: '3',
  }
  u8Body.sign = generateU8Sign(u8Body)

  const u8Res = await fetch(`${u8Url}/user/v1/getToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(u8Body),
    signal: AbortSignal.timeout(10000),
  })

  if (!u8Res.ok) {
    const errText = await u8Res.text()
    throw new Error(`Arknights U8 Auth failed (${u8Res.status}): ${errText}`)
  }

  const u8Data: any = await u8Res.json()
  const akUid = u8Data.uid
  const u8Token = u8Data.token
  if (!akUid || !u8Token) {
    throw new Error('Failed to retrieve Arknights player identity token.')
  }

  // 4. Authenticate with Game Server (obtain session secret)
  const gsLoginBody = {
    assetsVersion: resVersion,
    clientVersion,
    deviceId: device.id1,
    deviceId2: device.id2,
    deviceId3: device.id3,
    networkVersion: '1',
    platform: 1,
    token: u8Token,
    uid: akUid,
  }

  const gsHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; KB2000 Build/RP1A.201005.001)',
    'X-Unity-Version': '2017.4.39f1',
    secret: '',
    seqnum: '1',
    uid: akUid,
  }

  const gsLoginRes = await fetch(`${gsUrl}/account/login`, {
    method: 'POST',
    headers: gsHeaders,
    body: JSON.stringify(gsLoginBody),
    signal: AbortSignal.timeout(12000),
  })

  if (!gsLoginRes.ok) {
    const errText = await gsLoginRes.text()
    throw new Error(`Game server login failed (${gsLoginRes.status}): ${errText}`)
  }

  const gsLoginData: any = await gsLoginRes.json()
  const secret = gsLoginData.secret
  if (!secret) {
    throw new Error('Game server did not return a session secret.')
  }

  // 5. Synchronize Full Account Data (account/syncData)
  const syncHeaders: Record<string, string> = {
    ...gsHeaders,
    secret,
    seqnum: '2',
  }

  const syncRes = await fetch(`${gsUrl}/account/syncData`, {
    method: 'POST',
    headers: syncHeaders,
    body: JSON.stringify({ platform: 1 }),
    signal: AbortSignal.timeout(15000),
  })

  if (!syncRes.ok) {
    const errText = await syncRes.text()
    throw new Error(`Game server sync failed (${syncRes.status}): ${errText}`)
  }

  const rawData: any = await syncRes.json()
  return parseArknightsRawData(rawData, server, akUid, accountEmail)
}

/**
 * Transforms raw Arknights syncData payload into clean ArkCalc structures.
 */
export function parseArknightsRawData(
  data: any,
  server: string,
  akUid: string,
  accountEmail?: string
): any {
  const status = data?.user?.status || data?.status || {}
  const troop = data?.user?.troop || data?.troop || {}
  const inventoryRaw = data?.user?.inventory || data?.inventory || {}

  // 1. Doctor Profile
  const profile = {
    uid: akUid || status.uid || '',
    nickname: status.nickName || status.nickname || (accountEmail ? accountEmail.split('@')[0] : 'Doctor'),
    level: Number(status.level) || 120,
    server: server.toUpperCase(),
    resume: status.resume || '',
    secretary: status.secretary || '',
  }

  // 2. Currencies & Gacha War Chest
  const orundum = Number(status.diamondShard) || 0
  const payPrime = Number(status.payDiamond) || 0
  const freePrime = Number(status.freeDiamond) || 0
  const originitePrime = payPrime + freePrime
  const lmd = Number(status.gold) || 0

  const cleanInventory: Record<string, number> = {}
  for (const [k, v] of Object.entries(inventoryRaw)) {
    const count = Number(v)
    if (!Number.isNaN(count) && count > 0) {
      cleanInventory[String(k)] = count
    }
  }

  cleanInventory['4001'] = lmd
  cleanInventory['orundum'] = orundum
  cleanInventory['originite_prime'] = originitePrime

  const singlePermits = cleanInventory['7001'] || 0
  const tenPermits = cleanInventory['7002'] || 0

  const pullsFromOrundum = Math.floor(orundum / 600)
  const pullsFromPermits = singlePermits + tenPermits * 10
  const pullsFromOp = Math.floor((originitePrime * 180) / 600)

  const gacha = {
    orundum,
    originite_prime: originitePrime,
    single_permits: singlePermits,
    ten_permits: tenPermits,
    lmd,
    pulls_without_op: pullsFromOrundum + pullsFromPermits,
    pulls_with_op: pullsFromOrundum + pullsFromPermits + pullsFromOp,
  }

  // 3. Operator Roster
  const rawChars = troop.chars || {}
  const charList = Array.isArray(rawChars) ? rawChars : Object.values(rawChars)

  const roster: any[] = []
  for (const char of charList as any[]) {
    const charId = char.charId || char.char_id || char.id
    if (!charId) continue

    const elite = Number(char.evolvePhase ?? char.elite ?? 0) || 0
    const level = Number(char.level) || 1
    const potential = (Number(char.potentialRank ?? 0) || 0) + 1
    const mainSkill = Number(char.mainSkillLvl ?? 1) || 1
    const favorPercent = Number(char.favorPercent ?? 0) || 0

    // Masteries
    const masteries: Record<string, number> = {}
    const skills = char.skills || []
    for (const s of skills) {
      const sId = s.skillId || s.skill_id
      const spec = Number(s.specializeLevel ?? 0) || 0
      if (sId && spec > 0) {
        masteries[sId] = spec
      }
    }

    // Combat Modules
    const modules: Record<string, number> = {}
    const equip = char.equip || {}
    for (const [eqId, eqData] of Object.entries(equip as Record<string, any>)) {
      const eqLvl = Number(eqData?.level ?? 0) || 0
      if (eqLvl > 0) {
        modules[eqId] = eqLvl
      }
    }

    roster.push({
      operator_id: charId,
      elite,
      level,
      potential,
      skill_level: mainSkill,
      masteries,
      modules,
      favor_percent: favorPercent,
    })
  }

  return {
    success: true,
    source: 'prts-live-gateway',
    timestamp: new Date().toISOString(),
    profile,
    gacha,
    inventory: cleanInventory,
    roster,
    total_operators: roster.length,
  }
}
