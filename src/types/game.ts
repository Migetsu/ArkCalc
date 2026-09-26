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

export interface OperatorPhase {
  maxLevel: number;
  evolveCost: MaterialCost[] | null;
}

export interface SkillMasteryCost {
  masteryLevel: number; // 1, 2, 3
  costs: MaterialCost[];
}

export interface OperatorSkill {
  skillId: string;
  name: string;
  iconId: string;
  masteries: SkillMasteryCost[];
}

export interface OperatorModule {
  id: string;
  name: string;
  typeIcon: string;
  typeName: string;
  costs: Record<number, MaterialCost[]>; // 1, 2, 3
}

export interface OperatorSummary {
  id: string;
  name: string;
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
