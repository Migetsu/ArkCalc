export interface MaterialRequirement {
  id: string
  count: number
}

export interface SkillMasteryStep {
  m: number
  materials: MaterialRequirement[]
}

export interface SkillData {
  skillId: string
  name: string
  icon?: string
  masteries?: SkillMasteryStep[]
}

export interface ModuleStage {
  stage: number
  lmd: number
  materials: MaterialRequirement[]
}

export interface ModuleData {
  moduleId: string
  name: string
  typeCode: string // e.g. "X", "Y", "D"
  typeName: string // e.g. "WAR-X", "SNI-Y"
  stages: ModuleStage[]
}

export interface OperatorData {
  id: string
  name: string
  rarity: number
  profession: string
  avatar: string
  skills?: SkillData[]
  modules?: ModuleData[]
  eliteCosts: {
    e1?: { lmd: number; exp: number; materials: MaterialRequirement[] }
    e2?: { lmd: number; exp: number; materials: MaterialRequirement[] }
  }
  // Backwards compatibility shortcuts
  skillMasteryCosts?: {
    s1?: SkillMasteryStep[]
    s2?: SkillMasteryStep[]
    s3?: SkillMasteryStep[]
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
  // Specific skill selection (0-indexed: 0 = S1, 1 = S2, 2 = S3)
  selectedSkillIndex?: number
  currentMastery: number
  targetMastery: number
  // Specific module selection (moduleId e.g. "uniequip_002_xxx" or "none")
  selectedModuleId?: string
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
