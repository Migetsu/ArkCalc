/**
 * Arknights Operator Combat Stats Calculation Engine
 *
 * Implements exact linear interpolation per Elite promotion and Level,
 * Trust bonuses (0..100%), Potential rank modifiers (Pot 1..6),
 * and Module attribute additions (Stages 1..3).
 */

import type { OperatorSummary, OperatorModule } from '@/types/game';

export interface CalculatedOperatorStats {
  // Total computed combat stats
  hp: number;
  atk: number;
  def: number;
  res: number;
  cost: number;
  blockCnt: number;
  attackTime: number;
  aspd: number;
  effectiveAttackInterval: number;
  respawnTime: number;
  dps: number;

  // Breakdown components
  baseHp: number;
  trustHp: number;
  potHp: number;
  modHp: number;

  baseAtk: number;
  trustAtk: number;
  potAtk: number;
  modAtk: number;

  baseDef: number;
  trustDef: number;
  potDef: number;
  modDef: number;

  baseRes: number;
  modRes: number;

  baseCost: number;
  potCost: number;
  modCost: number;

  baseBlockCnt: number;
  modBlockCnt: number;

  baseRespawnTime: number;
  potRespawnTime: number;

  // Progression info
  maxLevel: number;
  currentLevel: number;
  currentElite: number;
  currentTrust: number;
  currentPotential: number;
}

// Fallback trust bonuses by profession when favorKeyFrames is missing
const CLASS_TRUST_BONUSES: Record<string, { hp: number; atk: number; def: number }> = {
  WARRIOR: { hp: 300, atk: 70, def: 0 },
  SNIPER: { hp: 150, atk: 75, def: 0 },
  TANK: { hp: 450, atk: 0, def: 75 },
  CASTER: { hp: 120, atk: 85, def: 0 },
  MEDIC: { hp: 150, atk: 65, def: 0 },
  PIONEER: { hp: 260, atk: 60, def: 0 },
  SUPPORT: { hp: 180, atk: 55, def: 0 },
  SPECIAL: { hp: 220, atk: 65, def: 0 },
};

/**
 * Calculates complete operator stats across Elite phase, level, trust, potential, and module.
 */
export function calculateOperatorStats(params: {
  operator: OperatorSummary;
  elite: number;
  level: number;
  trust: number;
  potential: number;
  module?: OperatorModule | null;
  moduleStage?: number;
}): CalculatedOperatorStats {
  const { operator, elite, level, trust, potential, module, moduleStage } = params;

  const maxElite = Math.max(0, operator.phases.length - 1);
  const clampedElite = Math.max(0, Math.min(elite, maxElite));
  const phase = operator.phases[clampedElite] || operator.phases[0];
  const maxLevel = phase ? phase.maxLevel : 50;
  const clampedLevel = Math.max(1, Math.min(level, maxLevel));
  const clampedTrust = Math.max(0, Math.min(trust, 100));
  const clampedPot = Math.max(1, Math.min(potential, 6));

  // 1. BASE STATS INTERPOLATION (Elite & Level)
  let baseHp = 0;
  let baseAtk = 0;
  let baseDef = 0;
  let baseRes = 0;
  let baseCost = 0;
  let baseBlockCnt = 1;
  let attackTime = operator.attributes?.attackTime || 1.0;
  let baseRespawnTime = operator.attributes?.respawnTime || 70;

  if (phase && phase.attributesKeyFrames && phase.attributesKeyFrames.length >= 2) {
    const kf0 = phase.attributesKeyFrames[0];
    const kf1 = phase.attributesKeyFrames[1];
    const ratio = maxLevel > 1 ? (clampedLevel - 1) / (maxLevel - 1) : 0;

    baseHp = Math.round(kf0.data.maxHp + (kf1.data.maxHp - kf0.data.maxHp) * ratio);
    baseAtk = Math.round(kf0.data.atk + (kf1.data.atk - kf0.data.atk) * ratio);
    baseDef = Math.round(kf0.data.def + (kf1.data.def - kf0.data.def) * ratio);
    baseRes = Math.round(kf0.data.magicResistance + (kf1.data.magicResistance - kf0.data.magicResistance) * ratio);
    baseCost = Math.round(kf0.data.cost + (kf1.data.cost - kf0.data.cost) * ratio);
    baseBlockCnt = kf1.data.blockCnt ?? 1;
    attackTime = kf0.data.baseAttackTime || operator.attributes?.attackTime || 1.0;
    baseRespawnTime = kf0.data.respawnTime || operator.attributes?.respawnTime || 70;
  } else if (operator.attributes) {
    // Formula fallback when exact keyframes are pending reload
    const maxAttr = operator.attributes;
    const phaseWeights = [
      { min: 0.35, max: 0.55 }, // E0
      { min: 0.55, max: 0.78 }, // E1
      { min: 0.78, max: 1.00 }, // E2
    ];
    const weight = phaseWeights[clampedElite] || phaseWeights[phaseWeights.length - 1];
    const ratio = maxLevel > 1 ? (clampedLevel - 1) / (maxLevel - 1) : 0;
    const scale = weight.min + (weight.max - weight.min) * ratio;

    baseHp = Math.round(maxAttr.hp * scale);
    baseAtk = Math.round(maxAttr.atk * scale);
    baseDef = Math.round(maxAttr.def * scale);
    baseRes = maxAttr.res || 0;
    baseCost = maxAttr.cost || 10;
    baseBlockCnt = maxAttr.blockCnt ?? 1;
    attackTime = maxAttr.attackTime || 1.0;
    baseRespawnTime = maxAttr.respawnTime || 70;
  }

  // 2. TRUST / FAVOR BONUSES (0..100%)
  const trustRatio = clampedTrust / 100;
  let trustHp = 0;
  let trustAtk = 0;
  let trustDef = 0;

  if (operator.favorKeyFrames && operator.favorKeyFrames.length >= 2) {
    const fkf1 = operator.favorKeyFrames[1];
    trustHp = Math.round((fkf1.data.maxHp || 0) * trustRatio);
    trustAtk = Math.round((fkf1.data.atk || 0) * trustRatio);
    trustDef = Math.round((fkf1.data.def || 0) * trustRatio);
  } else {
    const classBonus = CLASS_TRUST_BONUSES[operator.profession] || { hp: 200, atk: 60, def: 0 };
    trustHp = Math.round(classBonus.hp * trustRatio);
    trustAtk = Math.round(classBonus.atk * trustRatio);
    trustDef = Math.round(classBonus.def * trustRatio);
  }

  // 3. POTENTIAL BONUSES (Pot 1..6)
  let potHp = 0;
  let potAtk = 0;
  let potDef = 0;
  let potCost = 0;
  let potRespawnTime = 0;
  let potAspd = 0;

  if (operator.potentialRanks && operator.potentialRanks.length > 0) {
    // Potential ranks start at index 0 for Pot 2 up to Pot 6 (index 4)
    const activeRanksCount = clampedPot - 1;
    for (let i = 0; i < activeRanksCount && i < operator.potentialRanks.length; i++) {
      const pr = operator.potentialRanks[i];
      if (pr.attribMod) {
        potHp += pr.attribMod.hp || 0;
        potAtk += pr.attribMod.atk || 0;
        potDef += pr.attribMod.def || 0;
        potCost += pr.attribMod.cost || 0;
        potRespawnTime += pr.attribMod.respawnTime || 0;
        potAspd += pr.attribMod.attackSpeed || 0;
      } else if (pr.description) {
        const desc = pr.description.toLowerCase();
        if (desc.includes('deploy cost -1') || desc.includes('cost -1')) {
          potCost -= 1;
        } else if (desc.includes('deploy cost -2') || desc.includes('cost -2')) {
          potCost -= 2;
        } else if (desc.includes('redeploy') && desc.includes('-')) {
          const match = desc.match(/-(\d+)/);
          if (match) potRespawnTime -= parseInt(match[1], 10);
        } else if (desc.includes('attack +') || desc.includes('atk +')) {
          const match = desc.match(/\+(\d+)/);
          if (match) potAtk += parseInt(match[1], 10);
        } else if (desc.includes('hp +') || desc.includes('max hp +')) {
          const match = desc.match(/\+(\d+)/);
          if (match) potHp += parseInt(match[1], 10);
        } else if (desc.includes('def +') || desc.includes('defense +')) {
          const match = desc.match(/\+(\d+)/);
          if (match) potDef += parseInt(match[1], 10);
        } else if (desc.includes('attack speed +') || desc.includes('aspd +')) {
          const match = desc.match(/\+(\d+)/);
          if (match) potAspd += parseInt(match[1], 10);
        }
      }
    }
  } else {
    // Standard Arknights potential rules fallback
    if (clampedPot >= 2) potCost -= 1;
    if (clampedPot >= 6) potCost -= 1;
    if (clampedPot >= 3) {
      if (operator.profession === 'SPECIAL' && baseRespawnTime <= 30) {
        potRespawnTime -= 4; // Fast-redeploy bonus
      } else {
        potHp += 150;
      }
    }
    if (clampedPot >= 4) potAtk += 25;
  }

  // 4. MODULE BONUSES (Stages 1, 2, 3)
  let modHp = 0;
  let modAtk = 0;
  let modDef = 0;
  let modRes = 0;
  let modCost = 0;
  let modBlockCnt = 0;
  let modAspd = 0;

  if (module && module.stages && module.stages.length > 0 && moduleStage && moduleStage > 0) {
    const stageDetail = module.stages.find((s) => s.stage === moduleStage) || module.stages[0];
    if (stageDetail && stageDetail.attributes) {
      for (const attr of stageDetail.attributes) {
        const key = attr.key.toLowerCase();
        const val = attr.value || 0;
        if (key.includes('max_hp') || key.includes('hp')) modHp += val;
        else if (key.includes('atk')) modAtk += val;
        else if (key.includes('def')) modDef += val;
        else if (key.includes('magic_resistance') || key.includes('res')) modRes += val;
        else if (key.includes('cost')) modCost += val;
        else if (key.includes('block_cnt') || key.includes('block')) modBlockCnt += val;
        else if (key.includes('attack_speed') || key.includes('aspd')) modAspd += val;
      }
    }
  }

  // 5. TOTALS & METRICS
  const hp = Math.max(1, baseHp + trustHp + potHp + modHp);
  const atk = Math.max(1, baseAtk + trustAtk + potAtk + modAtk);
  const def = Math.max(0, baseDef + trustDef + potDef + modDef);
  const res = Math.max(0, baseRes + modRes);
  const cost = Math.max(0, baseCost + potCost + modCost);
  const blockCnt = Math.max(0, baseBlockCnt + modBlockCnt);
  const respawnTime = Math.max(5, baseRespawnTime + potRespawnTime);

  const aspd = Math.max(10, 100 + modAspd + potAspd);
  const effectiveAttackInterval = Math.round((attackTime / (aspd / 100)) * 100) / 100;
  const dps = Math.round(atk / Math.max(0.1, effectiveAttackInterval));

  return {
    hp,
    atk,
    def,
    res,
    cost,
    blockCnt,
    attackTime,
    aspd,
    effectiveAttackInterval,
    respawnTime,
    dps,

    baseHp,
    trustHp,
    potHp,
    modHp,

    baseAtk,
    trustAtk,
    potAtk,
    modAtk,

    baseDef,
    trustDef,
    potDef,
    modDef,

    baseRes,
    modRes,

    baseCost,
    potCost,
    modCost,

    baseBlockCnt,
    modBlockCnt,

    baseRespawnTime,
    potRespawnTime,

    maxLevel,
    currentLevel: clampedLevel,
    currentElite: clampedElite,
    currentTrust: clampedTrust,
    currentPotential: clampedPot,
  };
}
