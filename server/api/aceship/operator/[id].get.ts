import { defineEventHandler, getRouterParam, createError, setResponseHeaders } from 'h3'
import fallbackOperators from '~/assets/data/operators.json'
import type { OperatorDetailedData, OperatorData } from '~/types'

const ACESHIP_CHAR_TABLE_CDN =
  'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/character_table.json'
const ACESHIP_CHAR_TABLE_GITHUB =
  'https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/excel/character_table.json'

const ACESHIP_SKILL_TABLE_CDN =
  'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/skill_table.json'
const ACESHIP_SKILL_TABLE_GITHUB =
  'https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/excel/skill_table.json'

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
  return 'Rhodes Island'
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
  return text.replace(/<[^>]+>/g, '').trim()
}

/**
 * Replaces blackboard placeholder variables in skill and talent descriptions
 * (e.g. {attack@atk_scale:0%}, {-def:0%}, {stun}) with actual calculated values.
 */
function formatSkillDescription(template: string, blackboard: Array<{ key: string; value: any; valueStr?: any }>): string {
  if (!template) return ''
  const bbMap: Record<string, any> = {}
  if (Array.isArray(blackboard)) {
    for (const b of blackboard) {
      if (b && b.key) {
        bbMap[b.key.toLowerCase()] = b.value !== null && b.value !== undefined ? b.value : b.valueStr
      }
    }
  }

  // Strip rich-text tags
  let res = template.replace(/<[^>]+>/g, '')

  // Replace {expr}
  res = res.replace(/\{([a-zA-Z0-9_@\.:%+-\s]+)\}/g, (match, expr) => {
    let [rawKey, fmt] = expr.split(':')
    rawKey = rawKey.trim()
    let isNegative = false
    if (rawKey.startsWith('-')) {
      isNegative = true
      rawKey = rawKey.substring(1)
    }
    const key = rawKey.toLowerCase()
    let val = bbMap[key]
    if (val === undefined) return match
    if (typeof val === 'number') {
      if (isNegative) val = -val
      if (fmt && fmt.includes('%')) {
        return Math.round(val * 100) + '%'
      }
      return String(val)
    }
    return String(val)
  })

  return res.trim()
}

// Global cached tables in server runtime
let cachedCharTable: Record<string, any> | null = null
let cachedSkillTable: Record<string, any> | null = null
let charTableTimestamp = 0
let skillTableTimestamp = 0
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

async function getCharTable(): Promise<Record<string, any> | null> {
  const now = Date.now()
  if (cachedCharTable && now - charTableTimestamp < CACHE_TTL_MS) {
    return cachedCharTable
  }

  try {
    const data = await $fetch<Record<string, any>>(ACESHIP_CHAR_TABLE_CDN, {
      timeout: 8000,
      headers: { Accept: 'application/json' },
    })
    cachedCharTable = data
    charTableTimestamp = now
    return cachedCharTable
  } catch (err) {
    console.warn('[Operator Detail] jsDelivr char table fetch failed, trying GitHub:', err)
    try {
      const data = await $fetch<Record<string, any>>(ACESHIP_CHAR_TABLE_GITHUB, {
        timeout: 10000,
        headers: { Accept: 'application/json' },
      })
      cachedCharTable = data
      charTableTimestamp = now
      return cachedCharTable
    } catch (err2) {
      console.warn('[Operator Detail] GitHub char table fetch failed:', err2)
      return cachedCharTable
    }
  }
}

async function getSkillTable(): Promise<Record<string, any> | null> {
  const now = Date.now()
  if (cachedSkillTable && now - skillTableTimestamp < CACHE_TTL_MS) {
    return cachedSkillTable
  }

  try {
    const data = await $fetch<Record<string, any>>(ACESHIP_SKILL_TABLE_CDN, {
      timeout: 8000,
      headers: { Accept: 'application/json' },
    })
    cachedSkillTable = data
    skillTableTimestamp = now
    return cachedSkillTable
  } catch (err) {
    console.warn('[Operator Detail] jsDelivr skill table fetch failed, trying GitHub:', err)
    try {
      const data = await $fetch<Record<string, any>>(ACESHIP_SKILL_TABLE_GITHUB, {
        timeout: 10000,
        headers: { Accept: 'application/json' },
      })
      cachedSkillTable = data
      skillTableTimestamp = now
      return cachedSkillTable
    } catch (err2) {
      console.warn('[Operator Detail] GitHub skill table fetch failed:', err2)
      return cachedSkillTable
    }
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    'Content-Type': 'application/json',
  })

  const targetId = getRouterParam(event, 'id')
  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'Operator ID is required' })
  }

  const [charTable, skillTable] = await Promise.all([getCharTable(), getSkillTable()])

  let rawChar: any = null
  let actualId = targetId

  if (charTable) {
    if (charTable[targetId]) {
      rawChar = charTable[targetId]
      actualId = targetId
    } else {
      // Find case-insensitive or by partial match
      const lower = targetId.toLowerCase()
      const foundKey = Object.keys(charTable).find(
        (k) => k.toLowerCase() === lower || charTable[k].name?.toLowerCase() === lower
      )
      if (foundKey) {
        rawChar = charTable[foundKey]
        actualId = foundKey
      }
    }
  }

  if (rawChar) {
    const rarity = parseRarity(rawChar.rarity)
    const profession = PROFESSION_MAP[rawChar.profession] || rawChar.profession
    const faction = resolveFaction(rawChar.nationId, rawChar.groupId)
    const avatar = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${actualId}.png`
    const portrait = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/portraits/${actualId}_1.png`

    // 1. Phases & Attributes
    const phases = Array.isArray(rawChar.phases)
      ? rawChar.phases.map((p: any, idx: number) => {
          const kfs = p.attributesKeyFrames || []
          const minD = kfs[0]?.data || {}
          const maxD = kfs[kfs.length - 1]?.data || minD

          return {
            phase: idx,
            maxLevel: p.maxLevel || (idx === 0 ? 50 : idx === 1 ? 70 : 90),
            rangeId: p.rangeId || undefined,
            minAttributes: {
              maxHp: minD.maxHp || 0,
              atk: minD.atk || 0,
              def: minD.def || 0,
              magicResistance: minD.magicResistance || 0,
              cost: minD.cost || 0,
              blockCnt: minD.blockCnt || 0,
              attackSpeed: minD.attackSpeed || 100,
              baseAttackTime: minD.baseAttackTime || 1,
              respawnTime: minD.respawnTime || 70,
            },
            maxAttributes: {
              maxHp: maxD.maxHp || 0,
              atk: maxD.atk || 0,
              def: maxD.def || 0,
              magicResistance: maxD.magicResistance || 0,
              cost: maxD.cost || 0,
              blockCnt: maxD.blockCnt || 0,
              attackSpeed: maxD.attackSpeed || 100,
              baseAttackTime: maxD.baseAttackTime || 1,
              respawnTime: maxD.respawnTime || 70,
            },
            evolveCost: Array.isArray(p.evolveCost)
              ? p.evolveCost.map((ec: any) => ({
                  id: ec.id,
                  count: ec.count,
                }))
              : [],
          }
        })
      : []

    // 2. Detailed Skills
    const detailedSkills: any[] = []
    if (Array.isArray(rawChar.skills)) {
      for (const sk of rawChar.skills) {
        const skillId = sk.skillId
        const rawSkill = skillTable ? skillTable[skillId] : null
        const iconId: string = rawSkill?.iconId || sk.overrideTokenKey || skillId || ''
        const icon = `https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/img/skills/${iconId}.png`

        const levels: any[] = []
        if (rawSkill && Array.isArray(rawSkill.levels)) {
          for (let l = 0; l < rawSkill.levels.length; l++) {
            const lvlData = rawSkill.levels[l]
            levels.push({
              level: l + 1,
              name: lvlData.name || sk.overridePrefabKey || skillId,
              description: formatSkillDescription(lvlData.description, lvlData.blackboard),
              skillType: lvlData.skillType || 'AUTO',
              spType: lvlData.spData?.spType || 'INCREASE_WITH_TIME',
              spCost: lvlData.spData?.spCost || 0,
              initSp: lvlData.spData?.initSp || 0,
              duration: lvlData.duration || 0,
            })
          }
        } else {
          // Basic placeholder level
          levels.push({
            level: 1,
            name: sk.overridePrefabKey || skillId,
            description: 'Skill details available in combat.',
            skillType: 'AUTO',
            spType: 'INCREASE_WITH_TIME',
            spCost: 30,
            initSp: 0,
            duration: 0,
          })
        }

        const unlockPhaseStr = sk.unlockCond?.phase || 'PHASE_0'
        const unlockPhase = unlockPhaseStr === 'PHASE_2' ? 2 : unlockPhaseStr === 'PHASE_1' ? 1 : 0

        detailedSkills.push({
          skillId,
          iconId,
          name: levels[0]?.name || sk.overridePrefabKey || skillId,
          icon,
          unlockPhase,
          unlockLevel: sk.unlockCond?.level || 1,
          levels,
        })
      }
    }

    // 3. Talents
    const talents: any[] = []
    if (Array.isArray(rawChar.talents)) {
      for (const t of rawChar.talents) {
        if (!t || !Array.isArray(t.candidates)) continue
        // Pick best candidate without high potential requirements (requiredPotentialRank 0)
        const cand =
          t.candidates.find((c: any) => c.requiredPotentialRank === 0) ||
          t.candidates[0]
        if (cand && cand.name) {
          const unlockPhaseStr = cand.unlockCondition?.phase || 'PHASE_0'
          const unlockPhase =
            unlockPhaseStr === 'PHASE_2' ? 2 : unlockPhaseStr === 'PHASE_1' ? 1 : 0
          talents.push({
            name: cand.name,
            description: cleanDescription(cand.description),
            unlockPhase,
            unlockLevel: cand.unlockCondition?.level || 1,
          })
        }
      }
    }

    const result: OperatorDetailedData = {
      id: actualId,
      name: rawChar.name,
      appellation: rawChar.appellation || rawChar.name,
      rarity,
      profession,
      subProfessionId: rawChar.subProfessionId,
      position: rawChar.position === 'RANGED' ? 'RANGED' : 'MELEE',
      tagList: Array.isArray(rawChar.tagList) ? rawChar.tagList : [],
      nationId: rawChar.nationId || null,
      groupId: rawChar.groupId || null,
      teamId: rawChar.teamId || null,
      faction,
      itemUsage: rawChar.itemUsage || undefined,
      itemDesc: rawChar.itemDesc ? cleanDescription(rawChar.itemDesc) : undefined,
      description: rawChar.description ? cleanDescription(rawChar.description) : undefined,
      avatar,
      portrait,
      phases,
      detailedSkills,
      talents,
    }

    return result
  }

  // Fallback to bundled operators if Aceship not reachable
  const bundled = (fallbackOperators as OperatorData[]).find((op) => op.id === targetId)
  if (bundled) {
    const phases = [
      {
        phase: 0,
        maxLevel: 50,
        minAttributes: {
          maxHp: 800,
          atk: 300,
          def: 100,
          magicResistance: 0,
          cost: 15,
          blockCnt: 1,
          attackSpeed: 100,
          baseAttackTime: 1,
          respawnTime: 70,
        },
        maxAttributes: {
          maxHp: 1200,
          atk: 450,
          def: 160,
          magicResistance: 0,
          cost: 15,
          blockCnt: 1,
          attackSpeed: 100,
          baseAttackTime: 1,
          respawnTime: 70,
        },
      },
    ]

    const detailedSkills = (bundled.skills || []).map((sk) => ({
      skillId: sk.skillId,
      iconId: sk.icon || sk.skillId || '',
      name: sk.name,
      icon: `https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/img/skills/${sk.icon || sk.skillId}.png`,
      unlockPhase: 0,
      unlockLevel: 1,
      levels: [
        {
          level: 1,
          name: sk.name,
          description: 'Tactical deployment skill.',
          skillType: 'AUTO',
          spType: 'INCREASE_WITH_TIME',
          spCost: 30,
          initSp: 0,
          duration: 20,
        },
      ],
    }))

    const fallbackResult: OperatorDetailedData = {
      id: bundled.id,
      name: bundled.name,
      appellation: bundled.name,
      rarity: (bundled.rarity || 6) as any,
      profession: bundled.profession || 'Guard',
      position: 'MELEE',
      tagList: [],
      faction: 'Rhodes Island',
      avatar: bundled.avatar,
      phases,
      detailedSkills,
      talents: [],
    }

    return fallbackResult
  }

  throw createError({
    statusCode: 404,
    statusMessage: `Operator "${targetId}" not found in database`,
  })
})
