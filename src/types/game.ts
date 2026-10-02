export type Profession =
  | 'WARRIOR'
  | 'SNIPER'
  | 'PIONEER'
  | 'TANK'
  | 'MEDIC'
  | 'SUPPORT'
  | 'CASTER'
  | 'SPECIAL';

export interface MaterialCost {
  id: string;
  count: number;
}

export interface RangeGrid {
  row: number;
  col: number;
}

export interface RangeInfo {
  id: string;
  direction: number;
  grids: RangeGrid[];
}

export interface AttributeKeyFrame {
  level: number;
  data: {
    maxHp: number;
    atk: number;
    def: number;
    magicResistance: number;
    cost: number;
    blockCnt: number;
    baseAttackTime?: number;
    respawnTime?: number;
  };
}

export interface PotentialRank {
  type: number; // 0 = stat / cost, 1 = talent
  description: string;
  attribMod?: {
    hp?: number;
    atk?: number;
    def?: number;
    cost?: number;
    respawnTime?: number;
    attackSpeed?: number;
  };
}

export interface OperatorPhase {
  maxLevel: number;
  rangeId?: string;
  evolveCost: MaterialCost[] | null;
  attributesKeyFrames?: AttributeKeyFrame[];
}

export interface SkillMasteryCost {
  masteryLevel: number; // 1, 2, 3
  costs: MaterialCost[];
}

export type AppLanguage = 'ru' | 'en';

export interface SkillLevelDetail {
  level: number; // 1 to 10 (1-7: Rank 1-7, 8: M1, 9: M2, 10: M3)
  name: string;
  nameCn?: string;
  rangeId?: string;
  description: string;
  descriptionCn?: string;
  skillType: string; // 'MANUAL', 'AUTO', 'PASSIVE'
  durationType?: string;
  duration: number; // seconds, 0 = instant, -1 = infinite / no channel
  isInfinite?: boolean;
  spType: string; // 'INCREASE_WITH_TIME', 'INCREASE_WHEN_ATTACK', 'INCREASE_WHEN_TAKEN_DAMAGE', 'NONE'
  spCost: number;
  initSp: number;
  blackboard?: { key: string; value?: number; valueStr?: string }[];
}

export interface OperatorSkill {
  skillId: string;
  name: string;
  nameCn?: string;
  iconId: string;
  masteries: SkillMasteryCost[];
  levels?: SkillLevelDetail[];
  unlockCond?: { phase: string; level: number };
}

export interface ModuleStageDetail {
  stage: number; // 1, 2, 3
  attributes: { key: string; value: number }[];
  traitChange?: string;
  talentChange?: {
    name?: string;
    description?: string;
  };
  costs: MaterialCost[];
}

export interface OperatorModule {
  id: string;
  name: string;
  nameCn?: string;
  uniEquipIcon: string;
  typeIcon: string;
  typeName: string;
  typeName1: string;
  typeName2: string;
  formattedName: string;
  costs: Record<number, MaterialCost[]>; // 1, 2, 3
  stages?: ModuleStageDetail[];
  desc?: string;
  descCn?: string;
}

export interface OperatorAttributes {
  hp: number;
  atk: number;
  def: number;
  res: number;
  cost: number;
  blockCnt: number;
  attackTime: number;
  respawnTime: number;
}

export interface OperatorTalentCandidate {
  unlockPhase: number;
  unlockLevel: number;
  name: string;
  description: string;
  nameCn?: string;
  descriptionCn?: string;
}

export interface OperatorTalent {
  candidates: OperatorTalentCandidate[];
}

export interface OperatorSkin {
  skinId: string;
  charId: string;
  portraitId: string;
  avatarId: string;
  isBuySkin: boolean;
  skinName: string;
  skinGroupName: string;
  content?: string;
  dialog?: string;
  drawerList?: string[];
  sortId?: number;
}

export interface OperatorSummary {
  id: string;
  name: string;
  nameCn?: string;
  appellation: string;
  rarity: number; // 1 - 6
  profession: Profession;
  subProfessionId: string;
  avatarUrl: string;
  maxLevels: number[]; // [30], [40, 55], [50, 80, 90]
  phases: OperatorPhase[];
  allSkillLvlup: { lvlUpCost: MaterialCost[] }[];
  skills: OperatorSkill[];
  modules: OperatorModule[];
  // Wiki metadata
  description?: string;
  descriptionCn?: string;
  itemUsage?: string;
  itemDesc?: string;
  itemDescCn?: string;
  position?: string;
  tagList?: string[];
  talents?: OperatorTalent[];
  talentsCn?: OperatorTalent[];
  attributes?: OperatorAttributes;
  skins?: OperatorSkin[];
  favorKeyFrames?: AttributeKeyFrame[];
  potentialRanks?: PotentialRank[];
}

export interface ItemSummary {
  itemId: string;
  name: string;
  rarity: number; // 1 - 5
  iconId: string;
  classifyType: string;
  itemType: string;
  sortId: number;
}

export interface WorkshopRecipe {
  formulaId: string;
  itemId: string;
  count: number; // yield count (usually 1)
  goldCost: number; // LMD cost
  costs: MaterialCost[];
}

export interface GameConstants {
  characterExpMap: Record<string, number[]>; // "0", "1", "2"
  characterUpgradeCostMap: Record<string, number[]>; // "0", "1", "2"
  evolveGoldCost: number[][]; // [rarityIndex][phaseIndex]
  maxLevel: number[][]; // [rarityIndex][phaseIndex]
}

export interface CalculatedPlanRequirement {
  exp: number;
  lmd: number;
  materials: Record<string, number>;
}

export interface ItemRequirementSummary {
  itemId: string;
  needed: number;
  stock: number;
  deficit: number;
  craftable: boolean;
}

export interface CraftingStep {
  itemId: string;
  countToCraft: number;
  goldCost: number;
  ingredients: {
    itemId: string;
    countPerCraft: number;
    totalNeeded: number;
    usedFromStock: number;
    missingToCraftOrFarm: number;
  }[];
}

export interface FarmingRequirement {
  itemId: string;
  count: number;
}

export interface CalculationResult {
  totalExp: number;
  totalLmdLevel: number;
  totalLmdEvolve: number;
  totalLmdCraft: number;
  totalLmd: number;
  rawMaterials: Record<string, number>; // total raw needed
  directDeficit: ItemRequirementSummary[]; // deficit without crafting
  craftingSteps: CraftingStep[]; // workshop crafting actions
  farmRequirements: FarmingRequirement[]; // pure base items to farm
}
