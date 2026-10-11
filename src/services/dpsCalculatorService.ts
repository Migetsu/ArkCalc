/**
 * Advanced Arknights Combat & DPS Simulation Service
 * 
 * Supports accurate physical/arts/true damage formulas,
 * minimum damage floor (5% ATK), attack intervals with ASPD frame rounding,
 * multihits, active skill burst multipliers, team buffs, enemy DEF/RES shred,
 * and DEF/RES scaling curves.
 */

import type { OperatorSummary, OperatorModule, SkillLevelDetail } from '@/types/game';
import { calculateOperatorStats, type CalculatedOperatorStats } from '@/services/operatorStatsCalculator';

export type DamageType = 'PHYSICAL' | 'ARTS' | 'TRUE' | 'HEAL';

export interface EnemyPreset {
  id: string;
  name: string;
  nameRu: string;
  hp: number;
  def: number;
  res: number;
  description: string;
  descriptionRu: string;
}

export interface SupportBuffPreset {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  atkPercent: number;
  flatAtk: number;
  aspd: number;
  fragilePercent: number;
  defShredPercent: number;
  flatDefShred: number;
  resShredPercent: number;
  flatResShred: number;
  artsTakenPercent: number;
}

export interface DpsBuffs {
  atkPercent: number;
  flatAtk: number;
  aspd: number;
  fragilePercent: number;
  defShredPercent: number;
  flatDefShred: number;
  resShredPercent: number;
  flatResShred: number;
  artsTakenPercent: number;
}

export interface DpsSimulationResult {
  // Calculated base stats of operator
  stats: CalculatedOperatorStats;

  // Combat parameters
  damageType: DamageType;
  finalAtk: number;
  effectiveEnemyDef: number;
  effectiveEnemyRes: number;
  effectiveAttackInterval: number;
  attacksPerSecond: number;
  hitsPerAttack: number;

  // Normal / Off-skill sustained damage
  normalDamagePerHit: number;
  normalDamagePerAttack: number;
  normalDps: number;

  // Active Skill Burst Damage
  skillMultiplier: number;
  skillDamagePerHit: number;
  skillDamagePerAttack: number;
  skillDuration: number;
  attacksInSkill: number;
  totalSkillDamage: number;
  skillBurstDps: number;

  // Combat performance
  timeToKillSeconds: number | null;
  minDamageFloorApplied: boolean;

  // Curves for visualization
  defCurve: Array<{ def: number; normalDps: number; skillDps: number }>;
  resCurve: Array<{ res: number; normalDps: number; skillDps: number }>;
}

export const ENEMY_PRESETS: EnemyPreset[] = [
  {
    id: 'infantry',
    name: 'Standard Infantry',
    nameRu: 'Пехотинец (Обычный)',
    hp: 5000,
    def: 100,
    res: 0,
    description: 'Low DEF, 0 RES trash mob',
    descriptionRu: 'Слабая пехота с низкой защитой и 0 RES',
  },
  {
    id: 'defender',
    name: 'Heavy Defender',
    nameRu: 'Тяжелый страж',
    hp: 15000,
    def: 1000,
    res: 0,
    description: 'Armored target, high DEF, 0 RES',
    descriptionRu: 'Бронированная цель с высокой физической защитой',
  },
  {
    id: 'sarkaz',
    name: 'Sarkaz Centurion',
    nameRu: 'Сарказ-центурион',
    hp: 30000,
    def: 400,
    res: 50,
    description: 'Moderate DEF, high Arts RES',
    descriptionRu: 'Сбалансированная цель с 50% магического сопротивления',
  },
  {
    id: 'shieldguard',
    name: 'Patriot Shieldguard',
    nameRu: 'Щитоносец Патриота',
    hp: 45000,
    def: 2000,
    res: 30,
    description: 'Extremely high DEF, medium RES',
    descriptionRu: 'Сверхвысокая защита (2000 DEF) и среднее сопротивление',
  },
  {
    id: 'patriot',
    name: 'Patriot (Phase 1)',
    nameRu: 'Патриот (Фаза 1)',
    hp: 45000,
    def: 2100,
    res: 45,
    description: 'Fortress boss with immense defenses and damage reduction',
    descriptionRu: 'Легендарный босс: 2100 DEF и 45 RES',
  },
  {
    id: 'emperor_blade',
    name: "Emperor's Blade",
    nameRu: 'Клинок Императора',
    hp: 100000,
    def: 800,
    res: 60,
    description: 'High HP elite boss with 60 RES',
    descriptionRu: 'Элитный босс с огромным HP и 60 RES',
  },
  {
    id: 'theresis',
    name: 'Theresis',
    nameRu: 'Терезис',
    hp: 150000,
    def: 1200,
    res: 50,
    description: 'Chapter 14 Boss: 150k HP, 1200 DEF, 50 RES',
    descriptionRu: 'Финал 14 главы: 150,000 HP, 1200 DEF, 50 RES',
  },
];

export const SUPPORT_BUFF_PRESETS: SupportBuffPreset[] = [
  {
    id: 'warfarin',
    name: 'Warfarin (S2)',
    nameRu: 'Варфарин (Скилл 2)',
    description: '+90% ATK buff to targeted operator',
    descriptionRu: '+90% к силе атаки союзника',
    atkPercent: 90,
    flatAtk: 0,
    aspd: 0,
    fragilePercent: 0,
    defShredPercent: 0,
    flatDefShred: 0,
    resShredPercent: 0,
    flatResShred: 0,
    artsTakenPercent: 0,
  },
  {
    id: 'skadi_alter',
    name: 'Skadi Alter (S2 M3)',
    nameRu: 'Скали Альтер (Скилл 2)',
    description: '+550 Flat ATK inspiration aura',
    descriptionRu: '+550 постоянной чистой атаки (Вдохновение)',
    atkPercent: 0,
    flatAtk: 550,
    aspd: 0,
    fragilePercent: 0,
    defShredPercent: 0,
    flatDefShred: 0,
    resShredPercent: 0,
    flatResShred: 0,
    artsTakenPercent: 0,
  },
  {
    id: 'suzuran',
    name: 'Suzuran (S3 M3)',
    nameRu: 'Сузуран (Скилл 3)',
    description: '+40% Fragile damage amplification',
    descriptionRu: '+40% Хрупкость (увеличение любого получаемого урона)',
    atkPercent: 0,
    flatAtk: 0,
    aspd: 0,
    fragilePercent: 40,
    defShredPercent: 0,
    flatDefShred: 0,
    resShredPercent: 0,
    flatResShred: 0,
    artsTakenPercent: 0,
  },
  {
    id: 'saria',
    name: 'Saria (S3 M3)',
    nameRu: 'Сария (Скилл 3)',
    description: '+55% Arts damage taken',
    descriptionRu: '+55% к получаемому магическому урону',
    atkPercent: 0,
    flatAtk: 0,
    aspd: 0,
    fragilePercent: 0,
    defShredPercent: 0,
    flatDefShred: 0,
    resShredPercent: 0,
    flatResShred: 0,
    artsTakenPercent: 55,
  },
  {
    id: 'shamare',
    name: 'Shamare (S2 M3)',
    nameRu: 'Шамаре (Скилл 2)',
    description: '-50% Enemy DEF cursed doll',
    descriptionRu: '-50% физической защиты врага (Кукла)',
    atkPercent: 0,
    flatAtk: 0,
    aspd: 0,
    fragilePercent: 0,
    defShredPercent: 50,
    flatDefShred: 0,
    resShredPercent: 0,
    flatResShred: 0,
    artsTakenPercent: 0,
  },
  {
    id: 'ifrit',
    name: 'Ifrit (S3 M3)',
    nameRu: 'Ифрит (Скилл 3)',
    description: '-40% RES and -20 Flat RES reduction',
    descriptionRu: '-40% RES и -20 чистого сопротивления магии',
    atkPercent: 0,
    flatAtk: 0,
    aspd: 0,
    fragilePercent: 0,
    defShredPercent: 0,
    flatDefShred: 0,
    resShredPercent: 40,
    flatResShred: 20,
    artsTakenPercent: 0,
  },
];

/**
 * Detects base damage type of the operator based on class, subclass, and skill
 */
export function determineDamageType(operator: OperatorSummary, skillDetail?: SkillLevelDetail | null): DamageType {
  const prof = operator.profession;
  const subProf = operator.subProfessionId?.toLowerCase() || '';

  if (prof === 'MEDIC') {
    return 'HEAL';
  }

  // Check skill override
  if (skillDetail) {
    const desc = skillDetail.description?.toLowerCase() || '';
    if (desc.includes('true damage') || desc.includes('чистый урон')) {
      return 'TRUE';
    }
    if (desc.includes('arts damage') || desc.includes('магический урон') || desc.includes('урон искусством')) {
      return 'ARTS';
    }
    if (desc.includes('physical damage') || desc.includes('физический урон')) {
      return 'PHYSICAL';
    }
  }

  // Class default
  if (prof === 'CASTER') return 'ARTS';
  if (subProf === 'artsfghter' || subProf === 'mummy' || subProf === 'mystic' || subProf === 'primcaster') {
    return 'ARTS';
  }
  if (prof === 'SUPPORT' && subProf !== 'bard' && subProf !== 'blessing') {
    return 'ARTS';
  }

  return 'PHYSICAL';
}

/**
 * Extracts skill multiplier from blackboard or description
 */
export function extractSkillMultiplier(skillDetail?: SkillLevelDetail | null): number {
  if (!skillDetail) return 1.0;

  const bb = skillDetail.blackboard || [];
  
  // Look for direct atk or atk_scale in blackboard
  const atkParam = bb.find((p) => p.key === 'atk' || p.key === 'atk_scale' || p.key === 'damage_scale');
  if (atkParam && typeof atkParam.value === 'number') {
    // If value is like 2.3, it means 230% ATK
    if (atkParam.value > 1.0) {
      return atkParam.value;
    }
    // If value is additive like 0.8 (+80%), multiplier is 1 + 0.8 = 1.8
    if (atkParam.value > 0) {
      return 1.0 + atkParam.value;
    }
  }

  // Check description for regex "+X% ATK" or "deals X% ATK"
  const desc = skillDetail.description || '';
  const match = desc.match(/(\d+)%\s*(?:of\s+)?ATK/i) || desc.match(/ATK\s*\+(\d+)%/i);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) {
      return val > 100 ? val / 100 : 1 + val / 100;
    }
  }

  return 1.0;
}

/**
 * Detects hits per attack (e.g. Swordmaster strikes twice, Chen S3 strikes 10 times, etc.)
 */
export function getHitsPerAttack(operator: OperatorSummary, skillDetail?: SkillLevelDetail | null): number {
  const subProf = operator.subProfessionId?.toLowerCase() || '';

  // Dual strike archetype (Swordmaster)
  if (subProf === 'sword') {
    return 2;
  }

  if (skillDetail) {
    const desc = skillDetail.description?.toLowerCase() || '';
    const bb = skillDetail.blackboard || [];
    const timesParam = bb.find((p) => p.key === 'times' || p.key === 'attack_count' || p.key === 'cnt');
    if (timesParam && typeof timesParam.value === 'number' && timesParam.value > 1) {
      return timesParam.value;
    }

    if (desc.includes('attacks 2 times') || desc.includes('атакует 2 раза') || desc.includes('strikes twice')) {
      return 2;
    }
    if (desc.includes('attacks 3 times') || desc.includes('атакует 3 раза')) {
      return 3;
    }
    if (desc.includes('attacks 4 times') || desc.includes('атакует 4 раза')) {
      return 4;
    }
    if (desc.includes('attacks 5 times') || desc.includes('атакует 5 раз') || desc.includes('rapid fire')) {
      return 5;
    }
  }

  return 1;
}

/**
 * Simulates complete single-hit, sustained, and burst DPS for an operator against enemy stats.
 */
export function simulateDps(params: {
  operator: OperatorSummary;
  elite: number;
  level: number;
  trust: number;
  potential: number;
  module?: OperatorModule | null;
  moduleStage?: number;
  skillDetail?: SkillLevelDetail | null;
  enemyHp: number;
  enemyDef: number;
  enemyRes: number;
  enemyCount?: number;
  buffs: DpsBuffs;
  customSkillMultiplier?: number;
  customHitsPerAttack?: number;
}): DpsSimulationResult {
  const {
    operator,
    elite,
    level,
    trust,
    potential,
    module,
    moduleStage,
    skillDetail,
    enemyHp,
    enemyDef,
    enemyRes,
    enemyCount = 1,
    buffs,
    customSkillMultiplier,
    customHitsPerAttack,
  } = params;

  // 1. Calculate operator base stats
  const stats = calculateOperatorStats({
    operator,
    elite,
    level,
    trust,
    potential,
    module,
    moduleStage,
  });

  // 2. Compute final operator ATK with team buffs
  const finalAtk = Math.max(1, Math.round(stats.atk * (1 + buffs.atkPercent / 100) + buffs.flatAtk));

  // 3. Compute effective enemy DEF & RES
  const effectiveEnemyDef = Math.max(
    0,
    Math.round((enemyDef - buffs.flatDefShred) * (1 - buffs.defShredPercent / 100))
  );
  const effectiveEnemyRes = Math.max(
    0,
    Math.min(100, Math.round((enemyRes - buffs.flatResShred) * (1 - buffs.resShredPercent / 100)))
  );

  // 4. Attack speed & frame intervals
  const totalAspd = Math.max(10, stats.aspd + buffs.aspd);
  // Arknights 30 FPS tick calculation
  const attackIntervalFrames = Math.max(6, Math.round((stats.attackTime * 30) / (totalAspd / 100)));
  const effectiveAttackInterval = attackIntervalFrames / 30;
  const attacksPerSecond = 1 / effectiveAttackInterval;

  // 5. Hits per attack & damage type
  const hitsPerAttack = customHitsPerAttack || getHitsPerAttack(operator, skillDetail);
  const damageType = determineDamageType(operator, skillDetail);

  // 6. Normal attack calculation (single hit)
  let normalRawHit = 0;
  let minDamageFloorApplied = false;
  const minDamageFloor = Math.max(1, Math.round(finalAtk * 0.05));

  if (damageType === 'ARTS') {
    normalRawHit = Math.max(minDamageFloor, Math.round(finalAtk * (1 - effectiveEnemyRes / 100)));
    if (normalRawHit === minDamageFloor) minDamageFloorApplied = true;
  } else if (damageType === 'PHYSICAL') {
    normalRawHit = Math.max(minDamageFloor, finalAtk - effectiveEnemyDef);
    if (normalRawHit === minDamageFloor) minDamageFloorApplied = true;
  } else if (damageType === 'TRUE') {
    normalRawHit = finalAtk;
  } else {
    // Healing
    normalRawHit = finalAtk;
  }

  // Amplification multipliers
  const fragileMult = 1 + buffs.fragilePercent / 100;
  const artsTakenMult = damageType === 'ARTS' ? 1 + buffs.artsTakenPercent / 100 : 1;
  const normalDamagePerHit = Math.round(normalRawHit * fragileMult * artsTakenMult);
  const normalDamagePerAttack = normalDamagePerHit * hitsPerAttack;
  const normalDps = Math.round(normalDamagePerAttack * attacksPerSecond * enemyCount);

  // 7. Active Skill calculation
  const skillMultiplier = customSkillMultiplier || extractSkillMultiplier(skillDetail);
  let skillRawHit = 0;
  const skillScaledAtk = Math.round(finalAtk * skillMultiplier);

  if (damageType === 'ARTS') {
    skillRawHit = Math.max(minDamageFloor, Math.round(skillScaledAtk * (1 - effectiveEnemyRes / 100)));
  } else if (damageType === 'PHYSICAL') {
    skillRawHit = Math.max(minDamageFloor, skillScaledAtk - effectiveEnemyDef);
  } else if (damageType === 'TRUE') {
    skillRawHit = skillScaledAtk;
  } else {
    skillRawHit = skillScaledAtk;
  }

  const skillDamagePerHit = Math.round(skillRawHit * fragileMult * artsTakenMult);
  const skillDamagePerAttack = skillDamagePerHit * hitsPerAttack;

  // Duration & total skill burst
  const skillDuration = skillDetail?.duration && skillDetail.duration > 0 ? skillDetail.duration : 20;
  const attacksInSkill = Math.floor(skillDuration / effectiveAttackInterval);
  const totalSkillDamage = skillDamagePerAttack * attacksInSkill * enemyCount;
  const skillBurstDps = Math.round(totalSkillDamage / skillDuration);

  // 8. Time to Kill (TTK)
  const totalEnemyHp = enemyHp * enemyCount;
  const timeToKillSeconds = skillBurstDps > 0 ? parseFloat((totalEnemyHp / skillBurstDps).toFixed(1)) : null;

  // 9. Curves generation (DEF from 0 to 3000 in steps of 150)
  const defCurve: Array<{ def: number; normalDps: number; skillDps: number }> = [];
  for (let d = 0; d <= 3000; d += 150) {
    const effDef = Math.max(0, Math.round((d - buffs.flatDefShred) * (1 - buffs.defShredPercent / 100)));
    let normHit = 0;
    let sklHit = 0;

    if (damageType === 'ARTS') {
      normHit = normalDamagePerHit;
      sklHit = skillDamagePerHit;
    } else if (damageType === 'PHYSICAL') {
      normHit = Math.round(Math.max(minDamageFloor, finalAtk - effDef) * fragileMult);
      sklHit = Math.round(Math.max(minDamageFloor, skillScaledAtk - effDef) * fragileMult);
    } else {
      normHit = normalDamagePerHit;
      sklHit = skillDamagePerHit;
    }

    defCurve.push({
      def: d,
      normalDps: Math.round(normHit * hitsPerAttack * attacksPerSecond * enemyCount),
      skillDps: Math.round(((sklHit * hitsPerAttack * attacksInSkill * enemyCount) / skillDuration)),
    });
  }

  // RES curve (from 0 to 100 in steps of 5)
  const resCurve: Array<{ res: number; normalDps: number; skillDps: number }> = [];
  for (let r = 0; r <= 100; r += 5) {
    const effRes = Math.max(0, Math.min(100, Math.round((r - buffs.flatResShred) * (1 - buffs.resShredPercent / 100))));
    let normHit = 0;
    let sklHit = 0;

    if (damageType === 'ARTS') {
      normHit = Math.round(Math.max(minDamageFloor, finalAtk * (1 - effRes / 100)) * fragileMult * artsTakenMult);
      sklHit = Math.round(Math.max(minDamageFloor, skillScaledAtk * (1 - effRes / 100)) * fragileMult * artsTakenMult);
    } else {
      normHit = normalDamagePerHit;
      sklHit = skillDamagePerHit;
    }

    resCurve.push({
      res: r,
      normalDps: Math.round(normHit * hitsPerAttack * attacksPerSecond * enemyCount),
      skillDps: Math.round(((sklHit * hitsPerAttack * attacksInSkill * enemyCount) / skillDuration)),
    });
  }

  return {
    stats,
    damageType,
    finalAtk,
    effectiveEnemyDef,
    effectiveEnemyRes,
    effectiveAttackInterval: parseFloat(effectiveAttackInterval.toFixed(2)),
    attacksPerSecond: parseFloat(attacksPerSecond.toFixed(2)),
    hitsPerAttack,
    normalDamagePerHit,
    normalDamagePerAttack,
    normalDps,
    skillMultiplier: parseFloat(skillMultiplier.toFixed(2)),
    skillDamagePerHit,
    skillDamagePerAttack,
    skillDuration,
    attacksInSkill,
    totalSkillDamage,
    skillBurstDps,
    timeToKillSeconds,
    minDamageFloorApplied,
    defCurve,
    resCurve,
  };
}
