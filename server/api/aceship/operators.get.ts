import { defineEventHandler, setResponseHeaders } from 'h3'
import fallbackOperators from '~/assets/data/operators.json'
import type { CatalogOperator, OperatorData } from '~/types'

const ACESHIP_PRIMARY_URL =
  'https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/excel/character_table.json'
const ACESHIP_CDN_URL =
  'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/character_table.json'

const NATION_NAMES: Record<string, string> = {
  rhodes: 'Rhodes Island',
  lungmen: 'Lungmen',
  victoria: 'Victoria',
  kazimierz: 'Kazimierz',
  columbia: 'Columbia',
  laterano: 'Laterano',
  leithanien: 'Leithanien',
  siracusa: 'Siracusa',
  yan: 'Yan',
  iberia: 'Iberia',
  ursus: 'Ursus',
  higashi: 'Higashi',
  sargon: 'Sargon',
  kjerag: 'Kjerag',
  minos: 'Minos',
  sami: 'Sami',
  bolivar: 'Bolívar',
  egir: 'Aegir',
  rim: 'Rim Billiton',
}

const GROUP_NAMES: Record<string, string> = {
  karlan: 'Karlan Commercial',
  penguin: 'Penguin Logistics',
  rhine: 'Rhine Lab',
  blacksteel: 'Blacksteel Worldwide',
  abyssal: 'Abyssal Hunters',
  glasgow: 'Glasgow Gang',
  pinus: 'Pinus Sylvestris',
  sweep: 'S.W.E.E.P.',
  lgd: 'Lungmen Guard Dept.',
  babel: 'Babel',
  sui: 'Sui Siblings',
  siesta: 'Siesta',
  dublinn: 'Dublinn',
  elite: 'Rhodes Island Elite',
}

const PROFESSION_MAP: Record<string, string> = {
  WARRIOR: 'Guard',
  PIONEER: 'Vanguard',
  SNIPER: 'Sniper',
  TANK: 'Defender',
  MEDIC: 'Medic',
  SUPPORT: 'Supporter',
  CASTER: 'Caster',
  SPECIAL: 'Specialist',
}

function resolveFaction(nationId?: string | null, groupId?: string | null): string {
  if (groupId && GROUP_NAMES[groupId.toLowerCase()]) {
    return GROUP_NAMES[groupId.toLowerCase()]!
  }
  if (nationId && NATION_NAMES[nationId.toLowerCase()]) {
    return NATION_NAMES[nationId.toLowerCase()]!
  }
  if (groupId) {
    return groupId.charAt(0).toUpperCase() + groupId.slice(1)
  }
  if (nationId) {
    return nationId.charAt(0).toUpperCase() + nationId.slice(1)
  }
  return 'Independent'
}

function parseRarity(tier: string | number): 1 | 2 | 3 | 4 | 5 | 6 {
  if (typeof tier === 'number') {
    return Math.min(6, Math.max(1, tier)) as any
  }
  const match = String(tier).match(/\d+/)
  if (match) {
    const num = parseInt(match[0]!, 10)
    return Math.min(6, Math.max(1, num)) as any
  }
  return 6
}

function cleanDescription(text?: string): string {
  if (!text) return ''
  // Strip game rich-text tags like <@ba.kw> ... </>, <$ba.talpu> ... </>
  return text.replace(/<[^>]+>/g, '').trim()
}

// In-memory cache
let cachedCatalog: CatalogOperator[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    'Content-Type': 'application/json',
  })

  const now = Date.now()
  if (cachedCatalog && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCatalog
  }

  let rawTable: Record<string, any> | null = null

  // Try 1: jsDelivr CDN (fastest, unblocked, high bandwidth)
  try {
    rawTable = await $fetch<Record<string, any>>(ACESHIP_CDN_URL, {
      timeout: 7000,
      headers: { Accept: 'application/json' },
    })
  } catch (err1) {
    console.warn('[Aceship API] jsDelivr CDN fetch failed, trying raw GitHub:', err1)
    // Try 2: Raw GitHub
    try {
      rawTable = await $fetch<Record<string, any>>(ACESHIP_PRIMARY_URL, {
        timeout: 9000,
        headers: { Accept: 'application/json' },
      })
    } catch (err2) {
      console.warn('[Aceship API] GitHub fetch failed, falling back to local bundle:', err2)
    }
  }

  if (rawTable && typeof rawTable === 'object') {
    const operatorsList: CatalogOperator[] = []

    for (const [id, op] of Object.entries(rawTable)) {
      // Exclude traps, enemy tokens, dummy placeholders, or unobtainable characters
      if (
        !op ||
        !op.name ||
        !op.profession ||
        op.isNotObtainable ||
        id.startsWith('trap_') ||
        id.startsWith('token_')
      ) {
        continue
      }

      const rarity = parseRarity(op.rarity)
      const profession = PROFESSION_MAP[op.profession] || op.profession
      const faction = resolveFaction(op.nationId, op.groupId)
      const avatar = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${id}.png`
      const portrait = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/portraits/${id}_1.png`

      // Extract skills summary
      const skills = Array.isArray(op.skills)
        ? op.skills.map((sk: any) => ({
            skillId: sk.skillId || '',
            name: sk.overridePrefabKey || sk.skillId || 'Skill',
            icon: sk.skillId || '',
          }))
        : undefined

      operatorsList.push({
        id,
        name: op.name,
        appellation: op.appellation || op.name,
        rarity,
        profession,
        subProfessionId: op.subProfessionId,
        position: op.position === 'RANGED' ? 'RANGED' : 'MELEE',
        tagList: Array.isArray(op.tagList) ? op.tagList : [],
        nationId: op.nationId || null,
        groupId: op.groupId || null,
        teamId: op.teamId || null,
        faction,
        itemUsage: op.itemUsage || undefined,
        itemDesc: op.itemDesc ? cleanDescription(op.itemDesc) : undefined,
        description: op.description ? cleanDescription(op.description) : undefined,
        avatar,
        portrait,
        skills,
      })
    }

    if (operatorsList.length > 0) {
      cachedCatalog = operatorsList
      cacheTimestamp = now
      return cachedCatalog
    }
  }

  // Fallback to bundled operators if Aceship remote request failed
  const fallbackList: CatalogOperator[] = (fallbackOperators as OperatorData[]).map((op) => ({
    id: op.id,
    name: op.name,
    appellation: op.name,
    rarity: op.rarity as any,
    profession: op.profession,
    position: 'MELEE',
    tagList: [],
    faction: 'Rhodes Island',
    avatar: op.avatar,
    skills: op.skills?.map((s) => ({
      skillId: s.skillId,
      name: s.name,
      icon: s.icon,
    })),
  }))

  cachedCatalog = fallbackList
  cacheTimestamp = now
  return cachedCatalog
})
