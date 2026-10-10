export interface CatalogOperator {
  id: string
  name: string
  appellation: string
  rarity: 1 | 2 | 3 | 4 | 5 | 6
  profession: string
  subProfessionId?: string
  position: 'MELEE' | 'RANGED'
  tagList: string[]
  nationId?: string | null
  groupId?: string | null
  teamId?: string | null
  faction: string
  itemUsage?: string
  itemDesc?: string
  description?: string
  avatar: string
  portrait?: string
  skills?: Array<{
    skillId: string
    name: string
    icon?: string
  }>
}

export interface FactionInfo {
  id: string
  name: string
  count: number
}

export interface OperatorAttributes {
  maxHp: number
  atk: number
  def: number
  magicResistance: number
  cost: number
  blockCnt: number
  attackSpeed: number
  baseAttackTime: number
  respawnTime: number
}

export interface OperatorPhase {
  phase: number // 0, 1, 2
  maxLevel: number
  rangeId?: string
  minAttributes: OperatorAttributes
  maxAttributes: OperatorAttributes
  evolveCost?: Array<{ id: string; count: number; name?: string; icon?: string }>
}

export interface OperatorSkillLevel {
  level: number
  name: string
  description: string
  skillType: string
  spType: string
  spCost: number
  initSp: number
  duration: number
}

export interface OperatorSkillDetailed {
  skillId: string
  iconId: string
  name: string
  icon: string
  unlockPhase: number
  unlockLevel: number
  levels: OperatorSkillLevel[]
}

export interface OperatorTalent {
  name: string
  description: string
  unlockPhase: number
  unlockLevel: number
}

export interface OperatorDetailedData extends CatalogOperator {
  phases: OperatorPhase[]
  detailedSkills: OperatorSkillDetailed[]
  talents: OperatorTalent[]
}

export interface RangeGrid {
  row: number
  col: number
}

export interface RangeData {
  id: string
  direction: number
  grids: RangeGrid[]
}
