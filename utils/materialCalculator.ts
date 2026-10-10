import type { TargetPlanItem, MaterialDelta } from '~/types'

export interface RawTotals {
  lmd: number
  exp: number
  materials: Record<string, number>
}

export interface MaterialMetadata {
  id: string
  name: string
  tier: number
  category: string
  icon?: string
}

/**
 * Aggregates all promotional costs (Elite 1/2, level delta, S3 mastery, Module stages)
 * across a list of target plan items.
 */
export function aggregateMaterialRequirements(targets: TargetPlanItem[]): RawTotals {
  let totalLmd = 0
  let totalExp = 0
  const totalMats: Record<string, number> = {}

  const addMat = (id: string, count: number) => {
    totalMats[id] = (totalMats[id] || 0) + count
  }

  for (const target of targets) {
    const op = target.operator
    if (!op) continue

    // 1. Elite promotions
    if (target.currentElite < 1 && target.targetElite >= 1 && op.eliteCosts?.e1) {
      totalLmd += op.eliteCosts.e1.lmd || 0
      totalExp += op.eliteCosts.e1.exp || 0
      op.eliteCosts.e1.materials?.forEach((m) => addMat(m.id, m.count))
    }

    if (target.currentElite < 2 && target.targetElite >= 2 && op.eliteCosts?.e2) {
      totalLmd += op.eliteCosts.e2.lmd || 0
      totalExp += op.eliteCosts.e2.exp || 0
      op.eliteCosts.e2.materials?.forEach((m) => addMat(m.id, m.count))
    }

    // 2. Level difference estimation (2,500 LMD & 4,000 EXP per level)
    const levelDiff = Math.max(0, target.targetLevel - target.currentLevel)
    totalLmd += levelDiff * 2500
    totalExp += levelDiff * 4000

    // 3. Skill Mastery (S3)
    if (op.skillMasteryCosts?.s3) {
      for (const step of op.skillMasteryCosts.s3) {
        if (step.m > target.currentMastery && step.m <= target.targetMastery) {
          step.materials?.forEach((m) => addMat(m.id, m.count))
        }
      }
    }

    // 4. Module Upgrades (Stages 1, 2, 3)
    if (op.moduleCosts) {
      if (target.currentModule < 1 && target.targetModule >= 1 && op.moduleCosts.stage1) {
        totalLmd += op.moduleCosts.stage1.lmd || 0
        op.moduleCosts.stage1.materials?.forEach((m) => addMat(m.id, m.count))
      }
      if (target.currentModule < 2 && target.targetModule >= 2 && op.moduleCosts.stage2) {
        totalLmd += op.moduleCosts.stage2.lmd || 0
        op.moduleCosts.stage2.materials?.forEach((m) => addMat(m.id, m.count))
      }
      if (target.currentModule < 3 && target.targetModule >= 3 && op.moduleCosts.stage3) {
        totalLmd += op.moduleCosts.stage3.lmd || 0
        op.moduleCosts.stage3.materials?.forEach((m) => addMat(m.id, m.count))
      }
    }
  }

  return {
    lmd: totalLmd,
    exp: totalExp,
    materials: totalMats,
  }
}

/**
 * Calculates item deltas against depot inventory.
 * Delta = max(0, required - owned).
 */
export function calculateMaterialDeltas(
  aggregated: RawTotals,
  inventory: Record<string, number> = {},
  catalog: MaterialMetadata[] = []
): MaterialDelta[] {
  const list: MaterialDelta[] = []
  const matsMap = new Map(catalog.map((m) => [m.id, m]))

  // 1. Currency: LMD (4001)
  if (aggregated.lmd > 0) {
    const ownedLmd = inventory['4001'] || 0
    list.push({
      itemId: '4001',
      name: 'Lungmen Dollars (LMD)',
      tier: 4,
      category: 'currency',
      icon: matsMap.get('4001')?.icon,
      required: aggregated.lmd,
      owned: ownedLmd,
      delta: Math.max(0, aggregated.lmd - ownedLmd),
      isSufficient: ownedLmd >= aggregated.lmd,
    })
  }

  // 2. Currency: EXP (2004)
  if (aggregated.exp > 0) {
    const ownedExp = inventory['2004'] || 0
    list.push({
      itemId: '2004',
      name: 'Tactical Battle Record (EXP)',
      tier: 4,
      category: 'exp',
      icon: matsMap.get('2004')?.icon,
      required: aggregated.exp,
      owned: ownedExp,
      delta: Math.max(0, aggregated.exp - ownedExp),
      isSufficient: ownedExp >= aggregated.exp,
    })
  }

  // 3. Materials
  for (const [itemId, requiredCount] of Object.entries(aggregated.materials)) {
    if (requiredCount <= 0) continue

    const meta = matsMap.get(itemId) || {
      id: itemId,
      name: itemId,
      tier: 3,
      category: 'material',
      icon: undefined,
    }

    const ownedCount = inventory[itemId] || 0
    const delta = Math.max(0, requiredCount - ownedCount)

    list.push({
      itemId,
      name: meta.name,
      tier: meta.tier,
      category: meta.category,
      icon: meta.icon,
      required: requiredCount,
      owned: ownedCount,
      delta,
      isSufficient: ownedCount >= requiredCount,
    })
  }

  // Sort: Deficit first (higher tier first), then ready items
  return list.sort((a, b) => {
    if (a.delta > 0 && b.delta === 0) return -1
    if (a.delta === 0 && b.delta > 0) return 1
    if (a.tier !== b.tier) return b.tier - a.tier
    return a.name.localeCompare(b.name)
  })
}

/**
 * Filter material deltas by category or deficit state.
 */
export function filterMaterialDeltas(
  deltas: MaterialDelta[],
  filter: 'all' | 'deficit' | 'chips' | 'tier5' | 'tier4' | 'tier3' = 'all'
): MaterialDelta[] {
  switch (filter) {
    case 'deficit':
      return deltas.filter((d) => d.delta > 0)
    case 'chips':
      return deltas.filter(
        (d) => d.category === 'chip' || d.category === 'chips' || d.name.toLowerCase().includes('chip')
      )
    case 'tier5':
      return deltas.filter((d) => d.tier === 5)
    case 'tier4':
      return deltas.filter((d) => d.tier === 4)
    case 'tier3':
      return deltas.filter((d) => d.tier === 3)
    case 'all':
    default:
      return deltas
  }
}
