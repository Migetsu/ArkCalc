<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { usePenguinStats } from '~/composables/usePenguinStats'
import { useOperatorStore } from '~/stores/operatorStore'
import { usePlannerStore } from '~/stores/plannerStore'
import { useToast } from '~/composables/useToast'
import OperatorCardSkeleton from '~/components/ui/OperatorCardSkeleton.vue'
import FarmingTableSkeleton from '~/components/ui/FarmingTableSkeleton.vue'
import AccountSyncModal from '~/components/AccountSyncModal.vue'
import operatorsData from '~/assets/data/operators.json'
import materialsData from '~/assets/data/materials.json'
import { aggregateMaterialRequirements, calculateMaterialDeltas } from '~/utils/materialCalculator'
import type {
  OperatorData,
  TargetPlanItem,
  MaterialDelta,
  MaterialRequirement,
  ArknightsEvent,
} from '~/types'

useHead({
  title: 'Operator Promotion Planner // ArkCalc',
})

const userStore = useUserStore()
const penguin = usePenguinStats()
const operatorStore = useOperatorStore()
const plannerStore = usePlannerStore()
const toast = useToast()
const route = useRoute()

const isSyncModalOpen = ref(false)
const isLoadingDemo = ref(false)

const loadDemoData = async () => {
  isLoadingDemo.value = true
  try {
    const demo = await userStore.loadDemoData()
    // Select first operator and add to plan if empty
    if (plannerStore.plannedTargets.length === 0 && allOperators.value[0]) {
      const firstOp = allOperators.value[0]
      plannerStore.addTarget({
        operatorId: firstOp.id,
        operator: firstOp,
        currentElite: 0,
        targetElite: 2,
        currentLevel: 1,
        targetLevel: 90,
        currentMastery: 0,
        targetMastery: 3,
        currentModule: 0,
        targetModule: 3,
      })
    }
    toast.success(`Demo account loaded! Welcome Doctor ${demo.profile.nickname}.`, {
      title: 'DEMO LOADED',
      tag: 'PRTS // DEMO',
    })
  } catch (err: any) {
    toast.error('Failed to load demo data.', { title: 'ERROR' })
  } finally {
    isLoadingDemo.value = false
  }
}

// Load Penguin stats items & stages if not already loaded
const server = computed(() => userStore.profile.server || 'EN')
const isMatrixLoading = ref(false)

const refreshPenguinStats = async (force = false) => {
  isMatrixLoading.value = true
  if (force) {
    toast.info('Fetching live drop matrix from Penguin Stats...', {
      title: 'PENGUIN STATS',
      tag: 'NET // SYNC',
    })
  }
  try {
    await penguin.fetchAll(server.value, force)
    if (force) {
      toast.success('Penguin drop matrix synchronized & cached in IndexedDB', {
        title: 'CACHE SYNCHRONIZED',
        tag: 'IDB // STORED',
      })
    }
  } catch (e) {
    console.warn('[Planner] Live Penguin stats fetch warning:', e)
    if (force) {
      toast.error('Failed to sync live matrix. Reverting to cached data.', {
        title: 'NETWORK ERROR',
        tag: 'NET // FAIL',
      })
    }
  } finally {
    isMatrixLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    operatorStore.loadOperators(),
    refreshPenguinStats(false),
  ])

  // Support deep-linking from dashboard: /planner?op=char_xxx
  if (route.query.op) {
    selectedOperatorId.value = String(route.query.op)
  } else if (!selectedOperatorId.value && allOperators.value[0]) {
    selectedOperatorId.value = allOperators.value[0]!.id
  }

  if (allOperators.value.length > 0) {
    if (plannedTargets.value.length > 0) {
      for (const target of plannedTargets.value) {
        const matched = allOperators.value.find((op) => op.id === target.operatorId)
        if (matched) {
          target.operator = matched
        }
      }
    }
  }
})

// Re-fetch if player changes their server
watch(server, async (newServer) => {
  await refreshPenguinStats(true)
})

// Database of operators & materials (backed by operatorStore + IndexedDB cache)
const allOperators = computed<OperatorData[]>(() => {
  return operatorStore.operators.length > 0
    ? operatorStore.operators
    : (operatorsData as OperatorData[])
})

const materialsCatalog = materialsData as Array<{
  id: string
  name: string
  tier: number
  category: string
  icon?: string
}>

// Operator selection & filtering
const searchQuery = ref('')
const selectedProfession = ref<string>('ALL')
const selectedOperatorId = ref<string>((operatorsData[0] as OperatorData)?.id || '')

const professions = [
  'ALL',
  'Guard',
  'Caster',
  'Sniper',
  'Defender',
  'Medic',
  'Supporter',
  'Specialist',
  'Vanguard',
]

const filteredOperators = computed(() => {
  return allOperators.value.filter((op) => {
    const matchProf =
      selectedProfession.value === 'ALL' ||
      op.profession.toLowerCase() === selectedProfession.value.toLowerCase()
    const matchSearch =
      !searchQuery.value.trim() ||
      op.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
    return matchProf && matchSearch
  })
})

const currentOperator = computed(() => {
  return (
    allOperators.value.find((op) => op.id === selectedOperatorId.value) ||
    allOperators.value[0] ||
    (operatorsData[0] as OperatorData)
  )
})

// -----------------------------------------------------------------------------
// Target Promotion Configuration for Selected Operator
// -----------------------------------------------------------------------------
const currentElite = ref<number>(0)
const targetElite = ref<number>(2)
const currentLevel = ref<number>(1)
const targetLevel = ref<number>(90)

// Specific Skill & Mastery selection
const selectedSkillIndex = ref<number>(2)
const currentMastery = ref<number>(0)
const targetMastery = ref<number>(3)

// Specific Module & Stage selection
const selectedModuleId = ref<string>('none')
const currentModule = ref<number>(0)
const targetModule = ref<number>(3)

// Skills list for the currently inspected operator
const operatorSkills = computed(() => {
  const op = currentOperator.value
  if (!op) return []
  if (op.skills && op.skills.length > 0) return op.skills
  const count = op.rarity >= 5 ? 3 : op.rarity === 4 ? 2 : 1
  return Array.from({ length: count }, (_, i) => ({
    skillId: `skill_${i + 1}`,
    name: `Skill ${i + 1}`,
    masteries: (op.skillMasteryCosts as any)?.[`s${i + 1}`] || op.skillMasteryCosts?.s3 || [],
  }))
})

// Modules list for the currently inspected operator
const operatorModules = computed(() => {
  const op = currentOperator.value
  if (!op || !op.modules) return []
  return op.modules
})

// Whenever operator changes, populate from userStore.roster if owned
const syncFromRoster = (operatorId: string) => {
  const owned = userStore.getOperator(operatorId)
  if (owned) {
    currentElite.value = owned.elite
    currentLevel.value = owned.level
    const sKey = `skill_${selectedSkillIndex.value + 1}`
    currentMastery.value = (owned.masteries as Record<string, number>)?.[sKey] ?? 0
    currentModule.value = (selectedModuleId.value && selectedModuleId.value !== 'none' && (owned.modules as Record<string, number>)?.[selectedModuleId.value]) ?? 0
  } else {
    currentElite.value = 0
    currentLevel.value = 1
    currentMastery.value = 0
    currentModule.value = 0
  }
}

watch(currentOperator, (op) => {
  if (!op) return
  // Auto-select last skill by default (S3 for 6★/5★, S2 for 4★, S1 for 3★)
  const sCount = operatorSkills.value.length
  selectedSkillIndex.value = Math.max(0, sCount - 1)
  // Auto-select first combat module if available, otherwise 'none'
  if (operatorModules.value.length > 0) {
    selectedModuleId.value = operatorModules.value[0].moduleId
  } else {
    selectedModuleId.value = 'none'
  }
  syncFromRoster(op.id)
}, { immediate: true })

watch([selectedSkillIndex, selectedModuleId], () => {
  if (currentOperator.value) {
    syncFromRoster(currentOperator.value.id)
  }
})

// -----------------------------------------------------------------------------
// Active Planner Targets List (Backed by plannerStore + LocalStorage)
// -----------------------------------------------------------------------------
const plannedTargets = computed(() => plannerStore.plannedTargets)

const addCurrentToPlan = () => {
  if (!currentOperator.value) return

  const newTarget: TargetPlanItem = {
    operatorId: currentOperator.value.id,
    operator: currentOperator.value,
    currentElite: currentElite.value,
    targetElite: targetElite.value,
    currentLevel: currentLevel.value,
    targetLevel: targetLevel.value,
    selectedSkillIndex: selectedSkillIndex.value,
    currentMastery: currentMastery.value,
    targetMastery: targetMastery.value,
    selectedModuleId: selectedModuleId.value,
    currentModule: currentModule.value,
    targetModule: targetModule.value,
  }

  plannerStore.addTarget(newTarget)
  toast.success(
    `${currentOperator.value.name} upgrade goals set to E${targetElite.value} Lvl ${targetLevel.value}`,
    {
      title: 'TARGET UPDATED',
      tag: 'PLN // GOAL',
    }
  )
}

const removeTarget = (operatorId: string) => {
  const target = plannerStore.getTarget(operatorId)
  const name = target?.operator.name || 'Operator'
  plannerStore.removeTarget(operatorId)
  toast.info(`${name} removed from promotion plan`, {
    title: 'TARGET REMOVED',
    tag: 'PLN // REMOVE',
  })
}

const getTargetSummary = (target: TargetPlanItem): string => {
  const op = target.operator
  const sIdx = target.selectedSkillIndex ?? (op.skills?.length ? op.skills.length - 1 : 2)
  let res = `S${sIdx + 1} M${target.targetMastery}`
  if (target.selectedModuleId && target.selectedModuleId !== 'none' && target.targetModule > 0) {
    const mod = op.modules?.find((m) => m.moduleId === target.selectedModuleId)
    const type = mod?.typeName || 'MOD'
    res += ` | ${type} Lv${target.targetModule}`
  }
  return res
}

// -----------------------------------------------------------------------------
// Material & Resource Requirements Aggregator
// -----------------------------------------------------------------------------
interface RawTotals {
  lmd: number
  exp: number
  materials: Record<string, number>
}

const aggregatedNeeds = computed<RawTotals>(() => {
  return aggregateMaterialRequirements(plannedTargets.value)
})

// -----------------------------------------------------------------------------
// Guaranteed Event Rewards Integration (wiki.gg + offline catalog)
// -----------------------------------------------------------------------------
const includeEventRewards = ref<boolean>(true)
const selectedEventId = ref<string>('all')

const { data: eventsData, pending: isEventsLoading } = await useFetch<{
  source: string
  updatedAt: string
  events: ArknightsEvent[]
}>('/api/events')

const eventsList = computed<ArknightsEvent[]>(() => {
  return eventsData.value?.events || []
})

const selectedEventName = computed(() => {
  if (selectedEventId.value === 'all') return 'All Upcoming Events'
  const ev = eventsList.value.find((e) => e.id === selectedEventId.value)
  return ev ? ev.name : 'Selected Event'
})

const activeEventsCount = computed(() => {
  if (selectedEventId.value === 'all') return eventsList.value.length
  return eventsList.value.filter((e) => e.id === selectedEventId.value).length
})

const activeEventRewardsMap = computed<Record<string, number>>(() => {
  if (!includeEventRewards.value) return {}
  const activeEvents = eventsList.value.filter((ev) => {
    if (selectedEventId.value === 'all') return true
    return ev.id === selectedEventId.value
  })

  const map: Record<string, number> = {}
  for (const ev of activeEvents) {
    if (ev.rewards) {
      for (const r of ev.rewards) {
        map[r.itemId] = (map[r.itemId] || 0) + r.count
      }
    }
  }
  return map
})

// Highlight top event rewards that match doctor's required materials or high tiers
const displayedEventRewardHighlights = computed(() => {
  const activeEvents = eventsList.value.filter((ev) => {
    if (selectedEventId.value === 'all') return true
    return ev.id === selectedEventId.value
  })

  const aggregatedMap = new Map<string, { itemId: string; name: string; count: number; tier: number }>()

  for (const ev of activeEvents) {
    for (const r of ev.rewards || []) {
      const existing = aggregatedMap.get(r.itemId)
      if (existing) {
        existing.count += r.count
      } else {
        aggregatedMap.set(r.itemId, {
          itemId: r.itemId,
          name: r.name,
          count: r.count,
          tier: r.tier,
        })
      }
    }
  }

  const neededMatKeys = Object.keys(aggregatedNeeds.value.materials)
  return Array.from(aggregatedMap.values())
    .filter((r) => r.itemId !== '4001' && r.itemId !== '2004')
    .sort((a, b) => {
      const aNeeded = neededMatKeys.includes(a.itemId) ? 1 : 0
      const bNeeded = neededMatKeys.includes(b.itemId) ? 1 : 0
      if (aNeeded !== bNeeded) return bNeeded - aNeeded
      return b.tier - a.tier
    })
    .slice(0, 8)
})

// Total count of guaranteed event bonus items impacting plan
const totalEventBonusItemsApplied = computed(() => {
  if (!includeEventRewards.value) return 0
  let total = 0
  for (const item of calculatedDeltas.value) {
    if (item.eventRewards && item.eventRewards > 0) {
      total += item.eventRewards
    }
  }
  return total
})

// -----------------------------------------------------------------------------
// Delta Calculation against userStore.inventory & Guaranteed Event Rewards
// -----------------------------------------------------------------------------
const materialFilter = ref<'all' | 'deficit' | 'chips' | 'tier5' | 'tier4' | 'tier3'>('all')

const calculatedDeltas = computed<MaterialDelta[]>(() => {
  const matsMap = new Map(materialsCatalog.map((m) => [m.id, m]))
  const baseList = calculateMaterialDeltas(
    aggregatedNeeds.value,
    userStore.inventory,
    materialsCatalog,
    includeEventRewards.value ? activeEventRewardsMap.value : {}
  )

  return baseList.map((m) => {
    // Suggest best stage from Penguin Stats
    let bestStage
    const topStages = penguin.getBestStagesForItem(m.itemId).slice(0, 3)
    if (topStages.length > 0 && topStages[0]) {
      bestStage = {
        stageId: topStages[0].stageId,
        stageCode: topStages[0].stageCode,
        apCost: topStages[0].apCost,
        apPerDrop: topStages[0].apPerDrop,
        dropRate: topStages[0].dropRate,
        times: topStages[0].times,
      }
    }

    const totalApToFarm = bestStage && m.delta > 0 ? Math.round(m.delta * bestStage.apPerDrop) : 0

    return {
      ...m,
      icon: m.icon || matsMap.get(m.itemId)?.icon || `/images/items/${m.itemId}.png`,
      bestStage,
      bestStages: topStages,
      totalApToFarm,
    }
  })
})

// Filtered deltas
const filteredDeltas = computed(() => {
  let list = calculatedDeltas.value

  if (materialFilter.value === 'deficit') {
    list = list.filter((m) => !m.isSufficient)
  } else if (materialFilter.value === 'chips') {
    list = list.filter((m) => m.category === 'chip')
  } else if (materialFilter.value === 'tier5') {
    list = list.filter((m) => m.tier === 5)
  } else if (materialFilter.value === 'tier4') {
    list = list.filter((m) => m.tier === 4)
  } else if (materialFilter.value === 'tier3') {
    list = list.filter((m) => m.tier === 3)
  }

  // Sort by deficit descending
  return list.slice().sort((a, b) => b.delta - a.delta)
})

// Deficit materials for farming recommendations
const deficitFarmingPlan = computed(() => {
  return calculatedDeltas.value
    .filter((m) => !m.isSufficient && m.delta > 0 && m.bestStage)
    .sort((a, b) => (b.totalApToFarm || 0) - (a.totalApToFarm || 0))
})

// Summary metrics
const totalMissingItemsCount = computed(() => {
  return calculatedDeltas.value.filter((m) => !m.isSufficient).length
})

const totalEstimatedSanity = computed(() => {
  let sanity = 0
  for (const item of calculatedDeltas.value) {
    if (item.delta > 0 && item.bestStage?.apPerDrop) {
      sanity += Math.round(item.delta * item.bestStage.apPerDrop)
    }
  }
  return sanity
})

const totalEstimatedRuns = computed(() => {
  let runs = 0
  for (const item of calculatedDeltas.value) {
    if (item.delta > 0 && item.bestStage && item.bestStage.dropRate > 0) {
      runs += Math.ceil(item.delta / item.bestStage.dropRate)
    }
  }
  return runs
})

// Selected material for expanded stage breakdown
const inspectedMaterialId = ref<string | null>(null)
const toggleInspectMaterial = (itemId: string) => {
  inspectedMaterialId.value = inspectedMaterialId.value === itemId ? null : itemId
}

// Increment / quick edit owned in userStore
const adjustInventory = (itemId: string, delta: number) => {
  userStore.adjustItemQuantity(itemId, delta)
}
</script>

<template>
  <div class="ak-planner">
    <!-- Top Header -->
    <header class="ak-planner__header">
      <div class="ak-planner__title-group">
        <span class="ak-planner__tag">TACTICAL // MODULE PLN-01</span>
        <h1 class="ak-planner__title">Operator Promotion & Material Delta Planner</h1>
        <p class="ak-planner__desc">
          Configure promotion targets, calculate required resources, and compute the exact material deficit based on your depot inventory.
        </p>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="ak-stats-ribbon">
        <div class="ak-stat-pill">
          <span class="ak-stat-pill__label">TARGET OPERATORS</span>
          <span class="ak-stat-pill__val">{{ plannedTargets.length }}</span>
        </div>
        <div class="ak-stat-pill ak-stat-pill--amber">
          <span class="ak-stat-pill__label">DEFICIT MATERIALS</span>
          <span class="ak-stat-pill__val">{{ totalMissingItemsCount }}</span>
        </div>
        <div class="ak-stat-pill ak-stat-pill--green">
          <span class="ak-stat-pill__label">EST. SANITY TO FARM</span>
          <span class="ak-stat-pill__val">{{ totalEstimatedSanity.toLocaleString() }} AP</span>
        </div>
        <div
          class="ak-stat-pill ak-stat-pill--cyan"
          :title="`Penguin: ${penguin.cacheSource.toUpperCase()} | Ops: ${operatorStore.cacheSource.toUpperCase()}`"
        >
          <span class="ak-stat-pill__label">DATA CACHE</span>
          <span class="ak-stat-pill__val">
            {{ isMatrixLoading ? 'SYNCING...' : (penguin.cacheSource === 'indexeddb' ? 'INDEXEDDB' : 'ONLINE') }}
          </span>
        </div>
        <div
          class="ak-stat-pill"
          :class="includeEventRewards ? 'ak-stat-pill--purple' : ''"
          :title="includeEventRewards ? `Event reduction active: ${selectedEventName} (-${totalEventBonusItemsApplied} items)` : 'Event shop deduction disabled'"
        >
          <span class="ak-stat-pill__label">EVENT SHOP DEDUCTION</span>
          <span class="ak-stat-pill__val">
            {{ includeEventRewards ? (totalEventBonusItemsApplied > 0 ? `-${totalEventBonusItemsApplied} DEDUCTED` : 'ACTIVE') : 'OFF' }}
          </span>
        </div>
      </div>
    </header>

    <div class="ak-planner__layout">
      <!-- Left Column: Operator Selection & Goal Configuration -->
      <aside class="ak-planner__left">
        <!-- Panel 1: Operator Selector -->
        <div class="ak-panel">
          <div class="ak-panel__head">
            <span class="ak-panel__badge">01</span>
            <h3>SELECT OPERATOR</h3>
          </div>

          <!-- Search & Profession Filters -->
          <div class="ak-filter-group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search operator..."
              class="ak-search-input"
            />
            <div class="ak-professions-bar">
              <button
                v-for="prof in professions"
                :key="prof"
                type="button"
                class="ak-prof-btn"
                :class="{ 'ak-prof-btn--active': selectedProfession === prof }"
                @click="selectedProfession = prof"
              >
                {{ prof }}
              </button>
            </div>
          </div>

          <!-- Operator Thumbnails Grid -->
          <div class="ak-op-selector-grid">
            <OperatorCardSkeleton
              v-if="operatorStore.isLoading && filteredOperators.length === 0"
              :count="8"
            />
            <template v-else>
              <button
                v-for="op in filteredOperators"
                :key="op.id"
                type="button"
                class="ak-op-card"
                :class="{
                  'ak-op-card--active': selectedOperatorId === op.id,
                  'ak-op-card--planned': plannedTargets.some((t) => t.operatorId === op.id),
                }"
                @click="selectedOperatorId = op.id"
              >
                <div class="ak-op-card__avatar">
                  <img
                    :src="op.avatar"
                    :alt="op.name"
                    loading="lazy"
                    decoding="async"
                    @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
                  />
                  <span class="ak-op-card__stars">{{ '★'.repeat(op.rarity) }}</span>
                </div>
                <span class="ak-op-card__name">{{ op.name }}</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Panel 2: Goal Configuration for Selected Operator -->
        <div class="ak-panel">
          <div class="ak-panel__head">
            <span class="ak-panel__badge">02</span>
            <h3>UPGRADE GOALS // {{ currentOperator?.name }}</h3>
          </div>

          <div class="ak-goal-settings">
            <!-- Elite Level -->
            <div class="ak-setting-row">
              <span class="ak-setting-label">Elite Promotion</span>
              <div class="ak-range-selector">
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Current:</span>
                  <select v-model.number="currentElite" class="ak-mini-select">
                    <option :value="0">Elite 0</option>
                    <option :value="1">Elite 1</option>
                    <option :value="2">Elite 2</option>
                  </select>
                </div>
                <span class="ak-arrow">→</span>
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Target:</span>
                  <select v-model.number="targetElite" class="ak-mini-select">
                    <option :value="0">Elite 0</option>
                    <option :value="1">Elite 1</option>
                    <option :value="2">Elite 2</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Operator Level -->
            <div class="ak-setting-row">
              <span class="ak-setting-label">Level Range</span>
              <div class="ak-range-selector">
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Lvl {{ currentLevel }}</span>
                  <input
                    v-model.number="currentLevel"
                    type="range"
                    min="1"
                    max="90"
                    class="ak-range-slider"
                  />
                </div>
                <span class="ak-arrow">→</span>
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Lvl {{ targetLevel }}</span>
                  <input
                    v-model.number="targetLevel"
                    type="range"
                    min="1"
                    max="90"
                    class="ak-range-slider"
                  />
                </div>
              </div>
            </div>

            <!-- Selectable Skill Tabs (S1, S2, S3) -->
            <div class="ak-setting-row ak-setting-row--stack">
              <span class="ak-setting-label">Select Skill to Upgrade</span>
              <div class="ak-skill-tabs">
                <button
                  v-for="(sk, sIdx) in operatorSkills"
                  :key="sk.skillId"
                  type="button"
                  class="ak-skill-tab-btn"
                  :class="{ 'ak-skill-tab-btn--active': selectedSkillIndex === sIdx }"
                  @click="selectedSkillIndex = sIdx"
                >
                  <span class="ak-skill-tab-btn__badge">S{{ sIdx + 1 }}</span>
                  <span class="ak-skill-tab-btn__name" :title="sk.name">{{ sk.name }}</span>
                </button>
              </div>
            </div>

            <!-- Skill Mastery Range for Selected Skill -->
            <div class="ak-setting-row">
              <span class="ak-setting-label">Mastery Goal (S{{ selectedSkillIndex + 1 }})</span>
              <div class="ak-range-selector">
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Current:</span>
                  <select v-model.number="currentMastery" class="ak-mini-select">
                    <option :value="0">Rank 7 (M0)</option>
                    <option :value="1">Mastery 1</option>
                    <option :value="2">Mastery 2</option>
                    <option :value="3">Mastery 3</option>
                  </select>
                </div>
                <span class="ak-arrow">→</span>
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Target:</span>
                  <select v-model.number="targetMastery" class="ak-mini-select">
                    <option :value="0">Rank 7 (M0)</option>
                    <option :value="1">Mastery 1</option>
                    <option :value="2">Mastery 2</option>
                    <option :value="3">Mastery 3</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Selectable Combat Module -->
            <div class="ak-setting-row ak-setting-row--stack">
              <span class="ak-setting-label">Select Module to Upgrade</span>
              <div v-if="operatorModules.length > 0" class="ak-module-select-wrap">
                <select v-model="selectedModuleId" class="ak-select">
                  <option value="none">No Module Upgrade</option>
                  <option
                    v-for="mod in operatorModules"
                    :key="mod.moduleId"
                    :value="mod.moduleId"
                  >
                    [{{ mod.typeName }}] {{ mod.name }}
                  </option>
                </select>
              </div>
              <span v-else class="ak-no-module-text">No combat modules available for this operator</span>
            </div>

            <!-- Module Stage Range (if module selected) -->
            <div v-if="selectedModuleId !== 'none'" class="ak-setting-row">
              <span class="ak-setting-label">Module Stage</span>
              <div class="ak-range-selector">
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Current:</span>
                  <select v-model.number="currentModule" class="ak-mini-select">
                    <option :value="0">Stage 0 (Locked)</option>
                    <option :value="1">Stage 1</option>
                    <option :value="2">Stage 2</option>
                    <option :value="3">Stage 3</option>
                  </select>
                </div>
                <span class="ak-arrow">→</span>
                <div class="ak-selector-box">
                  <span class="ak-sub-label">Target:</span>
                  <select v-model.number="targetModule" class="ak-mini-select">
                    <option :value="0">Stage 0 (Locked)</option>
                    <option :value="1">Stage 1</option>
                    <option :value="2">Stage 2</option>
                    <option :value="3">Stage 3</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" class="ak-btn-primary" @click="addCurrentToPlan">
              + ADD / UPDATE IN PLAN
            </button>
          </div>
        </div>

        <!-- Panel 3: Active Planned Targets -->
        <div v-if="plannedTargets.length > 0" class="ak-panel">
          <div class="ak-panel__head">
            <span class="ak-panel__badge">03</span>
            <h3>ACTIVE PLAN TARGETS ({{ plannedTargets.length }})</h3>
          </div>

          <div class="ak-target-chips">
            <div
              v-for="target in plannedTargets"
              :key="target.operatorId"
              class="ak-target-chip"
            >
              <img
                :src="target.operator.avatar"
                :alt="target.operator.name"
                loading="lazy"
                decoding="async"
                @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
              />
              <div class="ak-target-chip__meta">
                <span class="ak-target-chip__name">{{ target.operator.name }}</span>
                <span class="ak-target-chip__step">
                  E{{ target.currentElite }}→E{{ target.targetElite }} | {{ getTargetSummary(target) }}
                </span>
              </div>
              <button
                type="button"
                class="ak-target-chip__del"
                title="Remove operator from plan"
                @click="removeTarget(target.operatorId)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Column: Materials Delta & Farming Recommendations -->
      <main class="ak-planner__right">
        <!-- Panel: Guaranteed Event Shop & Milestone Rewards HUD -->
        <div class="ak-panel ak-event-hud">
          <div class="ak-panel__head ak-panel__head--flex">
            <div class="ak-event-hud__title-group">
              <span class="ak-panel__badge ak-panel__badge--purple">PRTS // EVENT INTELLIGENCE</span>
              <h3>GUARANTEED EVENT SHOP & MILESTONE REWARDS</h3>
            </div>
            
            <div class="ak-event-hud__controls">
              <!-- Deduct Toggle -->
              <label class="ak-event-toggle" title="Toggle automatic deduction of guaranteed event rewards from farming deficits">
                <input v-model="includeEventRewards" type="checkbox" />
                <span class="ak-event-toggle__switch"></span>
                <span class="ak-event-toggle__label">
                  {{ includeEventRewards ? 'DEDUCTION ACTIVE' : 'DEDUCTION OFF' }}
                </span>
              </label>

              <!-- Event Selector -->
              <select
                v-if="includeEventRewards"
                v-model="selectedEventId"
                class="ak-event-selector"
              >
                <option value="all">★ All Upcoming Events ({{ eventsList.length }})</option>
                <option
                  v-for="ev in eventsList"
                  :key="ev.id"
                  :value="ev.id"
                >
                  {{ ev.name }} [{{ ev.status.toUpperCase() }}]
                </option>
              </select>
            </div>
          </div>

          <div class="ak-event-hud__body">
            <p class="ak-event-hud__desc">
              Guaranteed materials from <strong>{{ selectedEventName }}</strong> are automatically deducted from your material deficits so you don't over-farm before event stores open.
              <span v-if="totalEventBonusItemsApplied > 0" class="ak-event-hud__highlight-stat">
                (Saved: <strong>{{ totalEventBonusItemsApplied }}</strong> items from {{ activeEventsCount }} events)
              </span>
            </p>

            <div v-if="includeEventRewards && displayedEventRewardHighlights.length > 0" class="ak-event-highlights">
              <span class="ak-event-highlights__label">GUARANTEED REWARDS INCLUDED:</span>
              <div class="ak-event-chips">
                <div
                  v-for="rew in displayedEventRewardHighlights"
                  :key="rew.itemId"
                  class="ak-event-chip"
                  :class="`ak-event-chip--tier${rew.tier}`"
                  :title="`Guaranteed incoming reward: ${rew.name}`"
                >
                  <span class="ak-event-chip__count">+{{ rew.count }}</span>
                  <span class="ak-event-chip__name">{{ rew.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ak-panel ak-panel--main">
          <!-- Main Panel Header with Filters -->
          <div class="ak-panel__head ak-panel__head--flex">
            <div>
              <span class="ak-panel__badge">CALC</span>
              <h3>MATERIAL INVENTORY DELTA</h3>
            </div>

            <!-- Material Tabs -->
            <div class="ak-mat-tabs">
              <button
                type="button"
                class="ak-mat-tab"
                :class="{ 'ak-mat-tab--active': materialFilter === 'all' }"
                @click="materialFilter = 'all'"
              >
                ALL ({{ calculatedDeltas.length }})
              </button>
              <button
                type="button"
                class="ak-mat-tab ak-mat-tab--amber"
                :class="{ 'ak-mat-tab--active': materialFilter === 'deficit' }"
                @click="materialFilter = 'deficit'"
              >
                DEFICIT ONLY ({{ totalMissingItemsCount }})
              </button>
              <button
                type="button"
                class="ak-mat-tab"
                :class="{ 'ak-mat-tab--active': materialFilter === 'tier5' }"
                @click="materialFilter = 'tier5'"
              >
                TIER 5
              </button>
              <button
                type="button"
                class="ak-mat-tab"
                :class="{ 'ak-mat-tab--active': materialFilter === 'chips' }"
                @click="materialFilter = 'chips'"
              >
                CHIPS
              </button>
            </div>
          </div>

          <!-- Materials Grid -->
          <div v-if="filteredDeltas.length > 0" class="ak-materials-grid">
            <div
              v-for="mat in filteredDeltas"
              :key="mat.itemId"
              class="ak-material-card"
              :class="[
                `ak-material-card--tier${mat.tier}`,
                { 'ak-material-card--deficit': !mat.isSufficient },
              ]"
            >
              <!-- Material Icon & Tier Badge -->
              <div class="ak-material-card__visual">
                <div class="ak-material-card__icon-box">
                  <img
                    v-if="mat.icon"
                    :src="mat.icon"
                    :alt="mat.name"
                    loading="lazy"
                    decoding="async"
                    @error="($event.target as HTMLImageElement).src = '/images/items/placeholder.png'"
                  />
                  <span class="ak-material-card__tier-star">T{{ mat.tier }}</span>
                </div>
              </div>

              <!-- Content & Progress -->
              <div class="ak-material-card__info">
                <div class="ak-material-card__title-row">
                  <h4 class="ak-material-card__name">{{ mat.name }}</h4>
                  <!-- Status Pill -->
                  <span
                    v-if="!mat.isSufficient"
                    class="ak-badge ak-badge--deficit"
                  >
                    NEED -{{ mat.delta }}
                  </span>
                  <span v-else class="ak-badge ak-badge--ok">
                    READY ({{ mat.owned }}/{{ mat.required }})
                  </span>
                </div>

                <!-- Progress Bar -->
                <div class="ak-mat-bar">
                  <div
                    class="ak-mat-bar__fill"
                    :style="{
                      width: `${Math.min(100, Math.floor((mat.owned / mat.required) * 100))}%`,
                    }"
                    :class="{ 'ak-mat-bar__fill--ok': mat.isSufficient }"
                  />
                  <div
                    v-if="mat.eventRewards && mat.eventRewards > 0"
                    class="ak-mat-bar__event-fill"
                    :style="{
                      left: `${Math.min(100, Math.floor((mat.owned / mat.required) * 100))}%`,
                      width: `${Math.min(100 - Math.min(100, Math.floor((mat.owned / mat.required) * 100)), Math.floor((mat.eventRewards / mat.required) * 100))}%`,
                    }"
                    :title="`+${mat.eventRewards} guaranteed from event rewards`"
                  />
                </div>

                <div class="ak-material-card__footer">
                  <div class="ak-mat-counts">
                    <span>Depot: <strong>{{ mat.owned }}</strong></span>
                    <span v-if="mat.eventRewards && mat.eventRewards > 0" class="ak-mat-event-tag" :title="`+${mat.eventRewards} guaranteed from event rewards`">
                      +{{ mat.eventRewards }} Event
                    </span>
                    <span>/ Needed: <strong>{{ mat.required }}</strong></span>
                  </div>

                  <!-- Quick Depot Adjuster -->
                  <div class="ak-quick-counter">
                    <button
                      type="button"
                      class="ak-btn-count"
                      title="Decrement depot quantity"
                      @click="adjustInventory(mat.itemId, -1)"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      class="ak-btn-count"
                      title="Increment depot quantity"
                      @click="adjustInventory(mat.itemId, +1)"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <!-- Best Farming Stage Pill with Inspection Toggle -->
                <div
                  v-if="mat.bestStage && !mat.isSufficient"
                  class="ak-farming-hint"
                  :class="{ 'ak-farming-hint--active': inspectedMaterialId === mat.itemId }"
                  @click="toggleInspectMaterial(mat.itemId)"
                >
                  <div class="ak-farming-hint__left">
                    <span class="ak-farming-hint__pin">📍 Best:</span>
                    <strong class="ak-farming-hint__stage">{{ mat.bestStage.stageCode }}</strong>
                    <span class="ak-farming-hint__eff">
                      (~{{ mat.bestStage.apPerDrop.toFixed(1) }} AP / drop)
                    </span>
                  </div>
                  <span class="ak-farming-hint__toggle">
                    {{ inspectedMaterialId === mat.itemId ? '▲' : '▼' }}
                  </span>
                </div>

                <!-- Expanded Stage Comparison Matrix for this Material -->
                <div
                  v-if="inspectedMaterialId === mat.itemId && mat.bestStages && mat.bestStages.length > 0"
                  class="ak-mat-stages-detail"
                >
                  <div class="ak-mat-stages-detail__title">PENGUIN STATS AP EFFICIENCY:</div>
                  <div
                    v-for="(st, sIdx) in mat.bestStages"
                    :key="st.stageId"
                    class="ak-mat-stage-row"
                    :class="{ 'ak-mat-stage-row--best': sIdx === 0 }"
                  >
                    <div class="ak-mat-stage-code">
                      <span class="ak-rank-tag">#{{ sIdx + 1 }}</span>
                      <strong>{{ st.stageCode }}</strong>
                    </div>
                    <div class="ak-mat-stage-metrics">
                      <span class="ak-metric-drop">{{ (st.dropRate * 100).toFixed(1) }}% drop</span>
                      <span class="ak-metric-ap">{{ st.apCost }} AP</span>
                      <strong class="ak-metric-ratio">{{ st.apPerDrop.toFixed(1) }} AP/drop</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="ak-empty-materials">
            <template v-if="plannedTargets.length === 0">
              <span class="ak-empty-materials__icon">📋</span>
              <p class="ak-empty-materials__title">NO OPERATOR TARGETS IN ACTIVE PLAN</p>
              <p class="ak-empty-materials__desc">
                Select an operator from the left panel and click <strong>"+ ADD / UPDATE IN PLAN"</strong> to calculate material deficits.
              </p>
              <div v-if="!userStore.hasSyncedAccount" class="ak-empty-materials__actions">
                <button
                  type="button"
                  class="ak-btn-demo"
                  :disabled="isLoadingDemo"
                  @click="loadDemoData"
                >
                  <span v-if="isLoadingDemo">LOADING DEMO...</span>
                  <span v-else>LOAD DEMO DATA</span>
                </button>
                <button
                  type="button"
                  class="ak-btn-sync-cta"
                  @click="isSyncModalOpen = true"
                >
                  SYNC ACCOUNT →
                </button>
              </div>
            </template>
            <template v-else>
              <span class="ak-empty-materials__icon ak-text-green">✓</span>
              <p class="ak-empty-materials__title ak-text-green">ALL MATERIALS FULLY STOCKED</p>
              <p class="ak-empty-materials__desc">
                Your depot inventory contains sufficient resources to complete all planned upgrades!
              </p>
            </template>
          </div>
        </div>

        <!-- NEW PANEL: Penguin Stats Optimal Farming Operations Plan -->
        <div v-if="deficitFarmingPlan.length > 0" class="ak-panel ak-farming-plan-panel">
          <div class="ak-panel__head ak-panel__head--flex">
            <div>
              <span class="ak-panel__badge ak-panel__badge--cyan">PENGUIN // MATRIX</span>
              <h3>OPTIMAL FARMING RECOMMENDATIONS (SANITY-TO-DROP)</h3>
            </div>
            <div class="ak-farming-plan-summary">
              <span class="ak-fps-item">
                <span class="ak-fps-label">CACHE:</span>
                <strong
                  class="ak-fps-val"
                  :class="penguin.cacheSource === 'indexeddb' ? 'ak-text-cyan' : 'ak-text-amber'"
                >
                  {{ penguin.cacheSource === 'indexeddb' ? 'IDB CACHED' : 'ONLINE' }}
                </strong>
              </span>
              <span class="ak-fps-item">
                <span class="ak-fps-label">TOTAL DEFICIT:</span>
                <strong class="ak-fps-val">{{ deficitFarmingPlan.length }}</strong>
              </span>
              <span class="ak-fps-item">
                <span class="ak-fps-label">EST. RUNS:</span>
                <strong class="ak-fps-val">≈ {{ totalEstimatedRuns }}</strong>
              </span>
              <span class="ak-fps-item ak-fps-item--cyan">
                <span class="ak-fps-label">EST. SANITY:</span>
                <strong class="ak-fps-val">{{ totalEstimatedSanity.toLocaleString() }} AP</strong>
              </span>
              <button
                type="button"
                class="ak-btn-cache-sync"
                :disabled="isMatrixLoading"
                title="Force refresh drop matrix from Penguin Stats"
                @click="refreshPenguinStats(true)"
              >
                {{ isMatrixLoading ? 'SYNCING...' : '↻ REFRESH' }}
              </button>
            </div>
          </div>

          <div class="ak-farming-table-wrap">
            <FarmingTableSkeleton v-if="isMatrixLoading" :rows="4" />
            <table v-else class="ak-farming-table">
              <thead>
                <tr>
                  <th class="ak-th-mat">MATERIAL DEFICIT</th>
                  <th class="ak-th-stage">RECOMMENDED STAGE</th>
                  <th class="ak-th-rate">DROP RATE</th>
                  <th class="ak-th-ratio">SANITY / DROP</th>
                  <th class="ak-th-runs">EST. RUNS</th>
                  <th class="ak-th-cost">EST. TOTAL AP</th>
                  <th class="ak-th-alt">ALT. STAGES</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in deficitFarmingPlan"
                  :key="item.itemId"
                  class="ak-farming-row"
                >
                  <!-- Material Name & Delta -->
                  <td class="ak-td-mat">
                    <div class="ak-table-mat">
                      <img
                        v-if="item.icon"
                        :src="item.icon"
                        :alt="item.name"
                        class="ak-table-mat__icon"
                        loading="lazy"
                        decoding="async"
                        @error="($event.target as HTMLImageElement).src = '/images/items/placeholder.png'"
                      />
                      <div class="ak-table-mat__info">
                        <span class="ak-table-mat__name">{{ item.name }}</span>
                        <span class="ak-table-mat__deficit">
                          Need: {{ item.delta }} (Have: {{ item.owned }}<template v-if="item.eventRewards && item.eventRewards > 0">, +{{ item.eventRewards }} Event</template>)
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Best Stage -->
                  <td class="ak-td-stage">
                    <div class="ak-stage-pill">
                      <span class="ak-stage-pill__badge">TOP</span>
                      <strong class="ak-stage-pill__code">{{ item.bestStage?.stageCode }}</strong>
                      <span class="ak-stage-pill__cost">({{ item.bestStage?.apCost }} AP)</span>
                    </div>
                  </td>

                  <!-- Drop Rate -->
                  <td class="ak-td-rate">
                    <span class="ak-rate-val">
                      {{ ((item.bestStage?.dropRate || 0) * 100).toFixed(1) }}%
                    </span>
                    <span class="ak-rate-samples">
                      {{ item.bestStage?.times?.toLocaleString() || 0 }} runs
                    </span>
                  </td>

                  <!-- Sanity per drop -->
                  <td class="ak-td-ratio">
                    <div class="ak-ratio-box">
                      <strong class="ak-ratio-num">{{ item.bestStage?.apPerDrop.toFixed(1) }}</strong>
                      <span class="ak-ratio-unit">AP/item</span>
                    </div>
                  </td>

                  <!-- Estimated Runs Needed -->
                  <td class="ak-td-runs">
                    <span class="ak-runs-val">
                      ≈ {{ Math.ceil(item.delta / (item.bestStage?.dropRate || 1)) }}
                    </span>
                    <span class="ak-runs-sub">missions</span>
                  </td>

                  <!-- Estimated Total AP -->
                  <td class="ak-td-cost">
                    <strong class="ak-cost-val">
                      {{ (item.totalApToFarm || 0).toLocaleString() }} AP
                    </strong>
                  </td>

                  <!-- Alternative Stages -->
                  <td class="ak-td-alt">
                    <div v-if="item.bestStages && item.bestStages.length > 1" class="ak-alt-stages">
                      <span
                        v-for="alt in item.bestStages.slice(1, 3)"
                        :key="alt.stageId"
                        class="ak-alt-chip"
                        :title="`${(alt.dropRate * 100).toFixed(1)}% drop rate (${alt.apPerDrop.toFixed(1)} AP/drop)`"
                      >
                        {{ alt.stageCode }}
                        <small>({{ alt.apPerDrop.toFixed(1) }})</small>
                      </span>
                    </div>
                    <span v-else class="ak-no-alt">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Account Sync Modal -->
    <AccountSyncModal
      :is-open="isSyncModalOpen"
      @close="isSyncModalOpen = false"
      @synced="isSyncModalOpen = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.ak-planner {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__tag {
    font-size: 0.7rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0.25rem 0;
    color: $ak-text-primary;
    line-height: 1.15;

    @media (min-width: 640px) {
      font-size: 1.8rem;
    }

    @media (min-width: 1024px) {
      font-size: 2.2rem;
    }
  }

  &__desc {
    color: $ak-text-secondary;
    margin: 0;
    max-width: 800px;
    font-size: 0.85rem;
    line-height: 1.4;

    @media (min-width: 768px) {
      font-size: 0.95rem;
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 2rem;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  &__left {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__right {
    min-width: 0;
  }
}

// Stats Ribbon
.ak-stats-ribbon {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.ak-stat-pill {
  display: flex;
  flex-direction: column;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-left: 2px solid $ak-cyan;
  font-family: monospace;

  &__label {
    font-size: 0.65rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__val {
    font-size: 1.25rem;
    font-weight: 800;
    color: $ak-cyan;
  }

  &--amber {
    border-left-color: $ak-amber;
    .ak-stat-pill__val {
      color: $ak-amber;
    }
  }

  &--green {
    border-left-color: $ak-green;
    .ak-stat-pill__val {
      color: $ak-green;
    }
  }

  &--purple {
    border-left-color: #a855f7;
    .ak-stat-pill__val {
      color: #c084fc;
    }
  }
}

// Panels
.ak-panel {
  background: rgba($ak-bg-secondary, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  backdrop-filter: blur(8px);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);

  &--main {
    min-height: 600px;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    h3 {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin: 0;
      color: $ak-text-primary;
    }

    &--flex {
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
  }

  &__badge {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 1px;
    background: rgba($ak-cyan, 0.12);
    padding: 0.15rem 0.45rem;
    font-weight: 700;

    &--purple {
      color: #c084fc;
      background: rgba(#a855f7, 0.15);
      border: 1px solid rgba(#a855f7, 0.3);
    }

    &--cyan {
      color: $ak-cyan;
      background: rgba($ak-cyan, 0.15);
      border: 1px solid rgba($ak-cyan, 0.3);
    }
  }
}

// Operator selector filters
.ak-filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.ak-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: $ak-cyan;
  }
}

.ak-professions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-prof-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.65rem;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.04);
  color: $ak-text-secondary;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $ak-text-primary;
    background: rgba(255, 255, 255, 0.08);
  }

  &--active {
    background: rgba($ak-cyan, 0.15);
    color: $ak-cyan;
    border-color: $ak-cyan;
  }
}

// Operator selector grid
.ak-op-selector-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 0.25rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
}

.ak-op-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &__avatar {
    width: 48px;
    height: 48px;
    position: relative;
    overflow: hidden;
    background: #111;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__stars {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 0.45rem;
    color: $ak-rarity-6;
    background: rgba(0, 0, 0, 0.7);
    text-align: center;
    line-height: 1;
  }

  &__name {
    font-size: 0.65rem;
    color: $ak-text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    font-weight: 600;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &--active {
    border-color: $ak-cyan;
    background: rgba($ak-cyan, 0.12);
    .ak-op-card__name {
      color: $ak-cyan;
    }
  }

  &--planned {
    border-bottom: 2px solid $ak-green;
  }
}

// Goal Settings
.ak-goal-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ak-setting-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ak-setting-label {
  font-size: 0.75rem;
  font-family: monospace;
  color: $ak-text-secondary;
  font-weight: 700;
  letter-spacing: 1px;
}

.ak-range-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ak-selector-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ak-sub-label {
  font-size: 0.65rem;
  color: $ak-text-muted;
  font-family: monospace;
}

.ak-arrow {
  color: $ak-cyan;
  font-weight: 800;
}

.ak-mini-select {
  padding: 0.4rem 0.5rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-primary;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: $ak-cyan;
  }
}

.ak-range-slider {
  accent-color: $ak-cyan;
  cursor: pointer;
}

// Skill selection tabs
.ak-skill-tabs {
  display: flex;
  gap: 0.4rem;
  width: 100%;
}

.ak-skill-tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.45rem 0.35rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 0;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    color: $ak-text-primary;
  }

  &--active {
    background: rgba($ak-cyan, 0.18);
    border-color: $ak-cyan;
    color: $ak-cyan;
    box-shadow: inset 0 0 8px rgba($ak-cyan, 0.2);

    .ak-skill-tab-btn__badge {
      background: $ak-cyan;
      color: #000;
    }

    .ak-skill-tab-btn__name {
      color: #fff;
    }
  }

  &__badge {
    font-size: 0.7rem;
    font-weight: 800;
    font-family: monospace;
    padding: 0.1rem 0.35rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    letter-spacing: 0.5px;
  }

  &__name {
    font-size: 0.65rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    color: $ak-text-muted;
  }
}

// Module selector
.ak-module-select-wrap {
  width: 100%;

  .ak-select {
    width: 100%;
    padding: 0.45rem 0.6rem;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: $ak-text-primary;
    font-size: 0.78rem;
    font-family: monospace;
    outline: none;
    cursor: pointer;

    &:focus {
      border-color: $ak-cyan;
    }
  }
}

.ak-no-module-text {
  font-size: 0.7rem;
  font-family: monospace;
  color: $ak-text-muted;
  font-style: italic;
  padding: 0.25rem 0;
}

.ak-btn-primary {
  padding: 0.75rem 1rem;
  background: rgba($ak-cyan, 0.15);
  border: 1px solid $ak-cyan;
  color: $ak-cyan;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: $ak-cyan;
    color: #000;
    box-shadow: 0 0 12px rgba($ak-cyan, 0.4);
  }
}

.ak-btn-demo {
  padding: 0.55rem 0.95rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: $ak-text-primary;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ak-btn-sync-cta {
  padding: 0.55rem 1.1rem;
  background: $ak-cyan;
  border: 1px solid $ak-cyan;
  color: #000;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: lighten($ak-cyan, 10%);
    box-shadow: 0 0 10px rgba($ak-cyan, 0.4);
  }
}

// Planned targets chips
.ak-target-chips {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ak-target-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);

  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }

  &__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  &__name {
    font-size: 0.8rem;
    font-weight: 700;
    color: $ak-text-primary;
  }

  &__step {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-cyan;
  }

  &__del {
    background: transparent;
    border: none;
    color: $ak-text-muted;
    cursor: pointer;
    padding: 0.25rem;
    font-size: 0.8rem;

    &:hover {
      color: $ak-red;
    }
  }
}

// Material Tabs
.ak-mat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-mat-tab {
  padding: 0.35rem 0.75rem;
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.04);
  color: $ak-text-secondary;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;

  &:hover {
    color: $ak-text-primary;
    background: rgba(255, 255, 255, 0.08);
  }

  &--active {
    background: rgba($ak-cyan, 0.15);
    color: $ak-cyan;
    border-color: $ak-cyan;
  }

  &--amber.ak-mat-tab--active {
    background: rgba($ak-amber, 0.15);
    color: $ak-amber;
    border-color: $ak-amber;
  }
}

// Material Grid
.ak-materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.ak-material-card {
  display: flex;
  gap: 0.85rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.15);
  }

  &--deficit {
    border-left: 3px solid $ak-amber;
    background: linear-gradient(90deg, rgba($ak-amber, 0.06) 0%, rgba(0, 0, 0, 0.35) 100%);
  }

  &__visual {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__icon-box {
    width: 48px;
    height: 48px;
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
  }

  &__tier-star {
    position: absolute;
    bottom: -1px;
    right: -1px;
    background: #000;
    font-size: 0.55rem;
    font-family: monospace;
    font-weight: 800;
    padding: 0.05rem 0.2rem;
    color: $ak-cyan;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__name {
    font-size: 0.85rem;
    font-weight: 700;
    color: $ak-text-primary;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

// Progress Bar
.ak-mat-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;

  &__fill {
    height: 100%;
    background: $ak-amber;
    transition: width 0.3s ease;

    &--ok {
      background: $ak-green;
    }
  }
}

.ak-mat-counts {
  font-family: monospace;
  font-size: 0.7rem;
  color: $ak-text-muted;

  strong {
    color: $ak-text-primary;
  }
}

.ak-quick-counter {
  display: flex;
  gap: 0.25rem;
}

.ak-btn-count {
  padding: 0.15rem 0.4rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.65rem;
  cursor: pointer;

  &:hover {
    color: $ak-cyan;
    border-color: $ak-cyan;
  }
}

// Badges
.ak-badge {
  font-size: 0.65rem;
  font-family: monospace;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  letter-spacing: 0.5px;
  white-space: nowrap;

  &--deficit {
    background: rgba($ak-amber, 0.15);
    color: $ak-amber;
    border: 1px solid rgba($ak-amber, 0.4);
  }

  &--ok {
    background: rgba($ak-green, 0.15);
    color: $ak-green;
  }
}

// Farming hint
.ak-farming-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  font-size: 0.68rem;
  font-family: monospace;
  padding: 0.35rem 0.4rem 0.25rem;
  margin-top: 0.25rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($ak-cyan, 0.08);
  }

  &--active {
    background: rgba($ak-cyan, 0.12);
    border-top-color: rgba($ak-cyan, 0.3);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    overflow: hidden;
  }

  &__pin {
    color: $ak-text-muted;
  }

  &__stage {
    color: $ak-cyan;
  }

  &__eff {
    color: $ak-text-secondary;
  }

  &__toggle {
    font-size: 0.6rem;
    color: $ak-cyan;
    opacity: 0.7;
  }
}

// Inline Expanded Stages Matrix
.ak-mat-stages-detail {
  margin-top: 0.35rem;
  padding: 0.4rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba($ak-cyan, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__title {
    font-family: monospace;
    font-size: 0.6rem;
    font-weight: 700;
    color: $ak-cyan;
    letter-spacing: 0.5px;
  }
}

.ak-mat-stage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0.3rem;
  font-family: monospace;
  font-size: 0.65rem;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.02);

  &--best {
    background: rgba($ak-cyan, 0.1);
    border-left: 2px solid $ak-cyan;
  }
}

.ak-mat-stage-code {
  display: flex;
  align-items: center;
  gap: 0.3rem;

  .ak-rank-tag {
    font-size: 0.55rem;
    color: $ak-text-muted;
  }

  strong {
    color: $ak-text-primary;
  }
}

.ak-mat-stage-metrics {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .ak-metric-drop {
    color: $ak-text-secondary;
  }

  .ak-metric-ap {
    color: $ak-text-muted;
  }

  .ak-metric-ratio {
    color: $ak-cyan;
  }
}

.ak-empty-materials {
  padding: 3.5rem 2rem;
  text-align: center;
  font-family: monospace;
  color: $ak-text-muted;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &__icon {
    font-size: 2.2rem;
    margin-bottom: 0.35rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 1px;
    color: $ak-text-primary;
    margin: 0;
  }

  &__desc {
    max-width: 520px;
    font-size: 0.8rem;
    color: $ak-text-secondary;
    line-height: 1.45;
    margin: 0;

    strong {
      color: $ak-cyan;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
  }
}

// -----------------------------------------------------------------------------
// Dedicated Farming Plan Panel & Table
// -----------------------------------------------------------------------------
.ak-farming-plan-panel {
  margin-top: 1.5rem;
  border-top: 2px solid rgba($ak-cyan, 0.4);
}

.ak-panel__badge--cyan {
  background: rgba($ak-cyan, 0.2);
  color: $ak-cyan;
  border: 1px solid rgba($ak-cyan, 0.5);
}

.ak-farming-plan-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  font-family: monospace;
  font-size: 0.72rem;
  margin-top: 0.5rem;

  @media (min-width: 640px) {
    margin-top: 0;
  }
}

.ak-fps-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &--cyan {
    strong {
      color: $ak-cyan;
      text-shadow: 0 0 8px rgba($ak-cyan, 0.4);
    }
  }
}

.ak-fps-label {
  color: $ak-text-muted;
}

.ak-fps-val {
  color: $ak-text-primary;
}

.ak-farming-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ak-farming-table {
  width: 100%;
  border-collapse: collapse;
  font-family: monospace;
  font-size: 0.78rem;

  thead tr {
    background: rgba(0, 0, 0, 0.5);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }

  th {
    padding: 0.75rem 1rem;
    font-size: 0.68rem;
    letter-spacing: 1px;
    color: $ak-text-muted;
    text-align: left;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.02);
    }
  }

  td {
    padding: 0.75rem 1rem;
    vertical-align: middle;
  }
}

.ak-table-mat {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__icon {
    width: 36px;
    height: 36px;
    object-fit: contain;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__name {
    font-weight: 700;
    color: $ak-text-primary;
  }

  &__deficit {
    font-size: 0.68rem;
    color: $ak-amber;
  }
}

.ak-stage-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem;
  background: rgba($ak-cyan, 0.08);
  border: 1px solid rgba($ak-cyan, 0.35);

  &__badge {
    font-size: 0.55rem;
    font-weight: 900;
    padding: 0.1rem 0.25rem;
    background: $ak-cyan;
    color: #000;
  }

  &__code {
    font-size: 0.85rem;
    font-weight: 800;
    color: $ak-text-primary;
  }

  &__cost {
    font-size: 0.7rem;
    color: $ak-text-muted;
  }
}

.ak-rate-val {
  font-weight: 700;
  color: $ak-green;
  display: block;
}

.ak-rate-samples {
  font-size: 0.65rem;
  color: $ak-text-muted;
}

.ak-ratio-box {
  display: flex;
  flex-direction: column;

  .ak-ratio-num {
    font-size: 0.9rem;
    font-weight: 800;
    color: $ak-cyan;
  }

  .ak-ratio-unit {
    font-size: 0.62rem;
    color: $ak-text-muted;
  }
}

.ak-runs-val {
  font-weight: 700;
  color: $ak-text-primary;
}

.ak-runs-sub {
  font-size: 0.65rem;
  color: $ak-text-muted;
  display: block;
}

.ak-cost-val {
  color: $ak-yellow;
  font-size: 0.85rem;
}

.ak-alt-stages {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-alt-chip {
  padding: 0.2rem 0.4rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.68rem;
  color: $ak-text-secondary;
  cursor: help;

  small {
    color: $ak-text-muted;
    margin-left: 0.15rem;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    color: $ak-text-primary;
  }
}

.ak-no-alt {
  color: $ak-text-muted;
}

.ak-btn-cache-sync {
  background: rgba($ak-cyan, 0.12);
  border: 1px solid rgba($ak-cyan, 0.35);
  color: $ak-cyan;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: $ak-cyan;
    color: #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// -----------------------------------------------------------------------------
// Guaranteed Event Rewards HUD & Tags
// -----------------------------------------------------------------------------
.ak-event-hud {
  border-left: 3px solid #a855f7;
  background: linear-gradient(135deg, rgba(25, 15, 38, 0.88) 0%, rgba($ak-bg-secondary, 0.92) 100%);
  gap: 1rem;
  margin-bottom: 0.5rem;

  &__title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  &__desc {
    color: $ak-text-secondary;
    font-size: 0.82rem;
    margin: 0;
    line-height: 1.4;

    strong {
      color: #e9d5ff;
    }
  }

  &__highlight-stat {
    color: $ak-cyan;
    margin-left: 0.35rem;
    font-weight: 600;
  }
}

.ak-event-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;

  input {
    display: none;
  }

  &__switch {
    position: relative;
    width: 36px;
    height: 18px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9px;
    transition: background 0.25s ease;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.25s ease;
    }
  }

  input:checked + &__switch {
    background: #9333ea;
    &::after {
      transform: translateX(18px);
    }
  }

  &__label {
    font-family: monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #d8b4fe;
  }
}

.ak-event-selector {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(#a855f7, 0.4);
  color: #f3e8ff;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-family: monospace;
  outline: none;
  cursor: pointer;
  border-radius: 2px;

  &:focus {
    border-color: #c084fc;
  }
}

.ak-event-highlights {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__label {
    font-family: monospace;
    font-size: 0.65rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }
}

.ak-event-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ak-event-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.72rem;
  font-family: monospace;

  &__count {
    color: #c084fc;
    font-weight: 700;
  }

  &__name {
    color: $ak-text-primary;
  }

  &--tier5 {
    border-color: rgba($ak-rarity-6, 0.4);
    background: rgba($ak-rarity-6, 0.1);
  }
  &--tier4 {
    border-color: rgba($ak-rarity-5, 0.3);
    background: rgba($ak-rarity-5, 0.08);
  }
}

.ak-mat-bar {
  position: relative;
  overflow: hidden;

  &__event-fill {
    position: absolute;
    top: 0;
    height: 100%;
    background: repeating-linear-gradient(
      -45deg,
      #9333ea,
      #9333ea 4px,
      #a855f7 4px,
      #a855f7 8px
    );
    opacity: 0.85;
    transition: all 0.3s ease;
  }
}

.ak-mat-event-tag {
  color: #c084fc;
  font-size: 0.72rem;
  font-family: monospace;
  font-weight: 700;
  background: rgba(#a855f7, 0.15);
  border: 1px solid rgba(#a855f7, 0.3);
  padding: 0.05rem 0.35rem;
  border-radius: 2px;
}
</style>
