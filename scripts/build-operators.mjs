import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_FILE = path.resolve(__dirname, '../assets/data/operators.json')

const PROFESSION_MAP = {
  PIONEER: 'Vanguard',
  WARRIOR: 'Guard',
  SNIPER: 'Sniper',
  TANK: 'Defender',
  MEDIC: 'Medic',
  SUPPORT: 'Supporter',
  CASTER: 'Caster',
  SPECIAL: 'Specialist',
}

const RARITY_MAP = {
  TIER_1: 1,
  TIER_2: 2,
  TIER_3: 3,
  TIER_4: 4,
  TIER_5: 5,
  TIER_6: 6,
}

// Elite Promotion LMD & EXP standard tables
const ELITE_LMD = {
  3: { e1: 10000 },
  4: { e1: 15000, e2: 60000 },
  5: { e1: 20000, e2: 120000 },
  6: { e1: 30000, e2: 180000 },
}

const ELITE_EXP = {
  3: { e1: 42200 },
  4: { e1: 67200, e2: 180000 },
  5: { e1: 89000, e2: 215000 },
  6: { e1: 111100, e2: 247000 },
}

async function main() {
  console.log('Fetching Arknights GameData tables from YoStar EN repository...')

  const [charRes, skillRes, equipRes] = await Promise.all([
    fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/character_table.json'),
    fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/skill_table.json'),
    fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/uniequip_table.json'),
  ])

  if (!charRes.ok || !skillRes.ok || !equipRes.ok) {
    throw new Error(`Failed to fetch game tables. HTTP Statuses: char=${charRes.status}, skill=${skillRes.status}, equip=${equipRes.status}`)
  }

  const [charTable, skillTable, equipTable] = await Promise.all([
    charRes.json(),
    skillRes.json(),
    equipRes.json(),
  ])

  console.log(`Loaded: ${Object.keys(charTable).length} characters, ${Object.keys(skillTable).length} skills, ${Object.keys(equipTable.equipDict || {}).length} equips.`)

  // Index equips by charId
  const charEquipsMap = new Map()
  for (const [equipId, eq] of Object.entries(equipTable.equipDict || {})) {
    if (!eq.charId) continue
    if (!charEquipsMap.has(eq.charId)) {
      charEquipsMap.set(eq.charId, [])
    }
    // Only real combat modules (type ADVANCED) which have stages & item costs
    if (eq.type === 'ADVANCED' && eq.itemCost && Object.keys(eq.itemCost).length > 0) {
      charEquipsMap.get(eq.charId).push(eq)
    }
  }

  const operators = []

  for (const [charId, rawChar] of Object.entries(charTable)) {
    // Only real player operators: starts with char_, not trap/token/dummy, has profession, rarity 3 to 6
    if (!charId.startsWith('char_')) continue
    if (rawChar.isNotObtainable) continue
    if (rawChar.profession === 'TOKEN' || rawChar.profession === 'TRAP') continue

    const rarity = RARITY_MAP[rawChar.rarity] || 0
    // Keep playable operators (rarity 3 to 6 can be pulled from headhunting/recruitment)
    if (rarity < 3) continue

    const profession = PROFESSION_MAP[rawChar.profession] || rawChar.profession
    const name = rawChar.name?.trim() || charId

    // 1. Elite Promotion Costs
    const eliteCosts = {}
    if (rawChar.phases) {
      if (rawChar.phases[1]?.evolveCost) {
        eliteCosts.e1 = {
          lmd: ELITE_LMD[rarity]?.e1 || 20000,
          exp: ELITE_EXP[rarity]?.e1 || 80000,
          materials: rawChar.phases[1].evolveCost.map((m) => ({
            id: m.id,
            count: m.count,
          })),
        }
      }
      if (rawChar.phases[2]?.evolveCost) {
        eliteCosts.e2 = {
          lmd: ELITE_LMD[rarity]?.e2 || 120000,
          exp: ELITE_EXP[rarity]?.e2 || 200000,
          materials: rawChar.phases[2].evolveCost.map((m) => ({
            id: m.id,
            count: m.count,
          })),
        }
      }
    }

    // 2. Skills and Mastery Costs
    const skills = []
    const skillMasteryCosts = {}

    if (rawChar.skills && Array.isArray(rawChar.skills)) {
      rawChar.skills.forEach((sk, idx) => {
        const skillId = sk.skillId
        const skillInfo = skillTable[skillId]
        const skillName = skillInfo?.levels?.[0]?.name || `Skill ${idx + 1}`
        const skillIcon = skillInfo?.iconId || skillId

        const masteries = []
        if (sk.levelUpCostCond && Array.isArray(sk.levelUpCostCond)) {
          sk.levelUpCostCond.forEach((cond, mIdx) => {
            if (cond.levelUpCost && cond.levelUpCost.length > 0) {
              masteries.push({
                m: mIdx + 1,
                materials: cond.levelUpCost.map((m) => ({
                  id: m.id,
                  count: m.count,
                })),
              })
            }
          })
        }

        skills.push({
          skillId,
          name: skillName,
          icon: skillIcon,
          masteries,
        })

        const sKey = `s${idx + 1}`
        if (masteries.length > 0) {
          skillMasteryCosts[sKey] = masteries
        }
      })
    }

    // 3. Modules and Upgrade Costs
    const rawEquips = charEquipsMap.get(charId) || []
    const modules = []
    const moduleCosts = {}

    rawEquips.forEach((eq) => {
      const typeCode = eq.typeName2 || eq.typeName1 || 'X'
      const stages = []

      if (eq.itemCost) {
        for (const [stageNumStr, matList] of Object.entries(eq.itemCost)) {
          const stageNum = parseInt(stageNumStr, 10)
          let stageLmd = 0
          const mats = []

          matList.forEach((m) => {
            if (m.id === '4001') {
              stageLmd += m.count
            } else {
              mats.push({
                id: m.id,
                count: m.count,
              })
            }
          })

          stages.push({
            stage: stageNum,
            lmd: stageLmd,
            materials: mats,
          })

          // Populate legacy moduleCosts stage1/stage2/stage3 from the first module
          if (modules.length === 0) {
            moduleCosts[`stage${stageNum}`] = {
              lmd: stageLmd,
              materials: mats,
            }
          }
        }
      }

      modules.push({
        moduleId: eq.uniEquipId,
        name: eq.uniEquipName || `Module ${typeCode}`,
        typeCode,
        typeName: `${rawChar.subProfessionId ? rawChar.subProfessionId.toUpperCase() : 'MOD'}-${typeCode}`,
        stages,
      })
    })

    const avatar = `https://cdn.jsdelivr.net/gh/PuppiizSunniiz/Arknight-Images@main/avatars/${charId}.png`

    operators.push({
      id: charId,
      name,
      rarity,
      profession,
      avatar,
      skills,
      modules,
      eliteCosts,
      skillMasteryCosts,
      moduleCosts,
    })
  }

  // Sort: rarity descending (6★ first, then 5★, 4★, 3★), then alphabetically by name
  operators.sort((a, b) => {
    if (b.rarity !== a.rarity) return b.rarity - a.rarity
    return a.name.localeCompare(b.name)
  })

  console.log(`Successfully parsed ${operators.length} playable banner operators!`)
  console.log(`6★: ${operators.filter(o => o.rarity === 6).length}, 5★: ${operators.filter(o => o.rarity === 5).length}, 4★: ${operators.filter(o => o.rarity === 4).length}, 3★: ${operators.filter(o => o.rarity === 3).length}`)

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(operators, null, 2), 'utf-8')
  console.log(`Saved operator dataset to ${OUTPUT_FILE}`)
}

main().catch((err) => {
  console.error('Build operators error:', err)
  process.exit(1)
})
