export interface MaterialRequirement {
  id: string
  count: number
}

export interface OperatorData {
  id: string
  name: string
  rarity: number
  profession: string
  avatar: string
  eliteCosts: {
    e1?: { lmd: number; exp: number; materials: MaterialRequirement[] }
    e2?: { lmd: number; exp: number; materials: MaterialRequirement[] }
  }
  skillMasteryCosts?: {
    s1?: { m: number; materials: MaterialRequirement[] }[]
    s2?: { m: number; materials: MaterialRequirement[] }[]
    s3?: { m: number; materials: MaterialRequirement[] }[]
  }
  moduleCosts?: {
    stage1?: { lmd: number; materials: MaterialRequirement[] }
    stage2?: { lmd: number; materials: MaterialRequirement[] }
    stage3?: { lmd: number; materials: MaterialRequirement[] }
  }
}

export interface TargetPlanItem {
  operatorId: string
  operator: OperatorData
  currentElite: number
  targetElite: number
  currentLevel: number
  targetLevel: number
  currentMastery: number
  targetMastery: number
  currentModule: number
  targetModule: number
}

export interface MaterialDelta {
  itemId: string
  name: string
  tier: number
  category: string
  icon?: string
  required: number
  owned: number
  delta: number
  isSufficient: boolean
  bestStage?: {
    stageId?: string
    stageCode: string
    apCost: number
    apPerDrop: number
    dropRate: number
    times?: number
  }
  bestStages?: Array<{
    stageId: string
    stageCode: string
    apCost: number
    apPerDrop: number
    dropRate: number
    times: number
  }>
  totalApToFarm?: number
}
