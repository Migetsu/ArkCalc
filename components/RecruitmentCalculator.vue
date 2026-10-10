<script setup lang="ts">
import { ref, computed } from 'vue'
import rawOperators from '~/assets/data/recruitment.json'
import type { RecruitOperator, TagCombination } from '~/types'

// Load recruitment dataset
const operators = rawOperators as RecruitOperator[]

// Tag categories and definitions
interface TagCategory {
  title: string
  key: string
  tags: string[]
}

const TAG_CATEGORIES: TagCategory[] = [
  {
    title: 'Qualification',
    key: 'qualification',
    tags: ['Top Operator', 'Senior Operator', 'Starter', 'Robot'],
  },
  {
    title: 'Position',
    key: 'position',
    tags: ['Melee', 'Ranged'],
  },
  {
    title: 'Profession / Class',
    key: 'class',
    tags: [
      'Vanguard',
      'Guard',
      'Sniper',
      'Defender',
      'Medic',
      'Supporter',
      'Caster',
      'Specialist',
    ],
  },
  {
    title: 'Affixes & Roles',
    key: 'affix',
    tags: [
      'Healing',
      'Support',
      'DPS',
      'Defense',
      'AoE',
      'Slow',
      'Debuff',
      'Fast-Redeploy',
      'Shift',
      'Summon',
      'Crowd Control',
      'Nuker',
      'Survival',
      'DP-Recovery',
    ],
  },
]

// -----------------------------------------------------------------------------
// Tag Selection State (Max 5 tags per Arknights recruitment slot)
// -----------------------------------------------------------------------------
const selectedTags = ref<string[]>([])
const MAX_SELECTED_TAGS = 5

const isTagSelected = (tag: string): boolean => {
  return selectedTags.value.includes(tag)
}

const toggleTag = (tag: string) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx !== -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    if (selectedTags.value.length < MAX_SELECTED_TAGS) {
      selectedTags.value.push(tag)
    }
  }
}

const clearTags = () => {
  selectedTags.value = []
}

// Quick Test Presets
const applyPreset = (tags: string[]) => {
  selectedTags.value = [...tags]
}

// -----------------------------------------------------------------------------
// Combinatorics Generator (Subsets of size 1, 2, 3)
// -----------------------------------------------------------------------------
const getSubsets = (arr: string[]): string[][] => {
  const result: string[][] = []
  const n = arr.length

  // Subsets of length 1
  for (let i = 0; i < n; i++) {
    result.push([arr[i]!])
  }

  // Subsets of length 2
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      result.push([arr[i]!, arr[j]!])
    }
  }

  // Subsets of length 3
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        result.push([arr[i]!, arr[j]!, arr[k]!])
      }
    }
  }

  return result
}

// -----------------------------------------------------------------------------
// Operator Matching Engine
// -----------------------------------------------------------------------------
const filterOperatorsForCombination = (combo: string[]): RecruitOperator[] => {
  return operators.filter((op) => {
    // 1. Must match ALL tags in the combination
    const hasAll = combo.every((t) => op.tags.includes(t))
    if (!hasAll) return false

    // 2. 6-star operators strictly require 'Top Operator' in the chosen combination
    if (op.rarity === 6 && !combo.includes('Top Operator')) {
      return false
    }

    // 3. 'Top Operator' selected strictly yields 6-star operators
    if (combo.includes('Top Operator') && op.rarity !== 6) {
      return false
    }

    // 4. 'Senior Operator' tag strictly yields 5-star operators
    if (combo.includes('Senior Operator') && op.rarity !== 5) {
      return false
    }

    // 5. 1-star Robot operators strictly require 'Robot' tag
    if (op.rarity === 1 && !combo.includes('Robot')) {
      return false
    }

    // 6. If 'Robot' tag is chosen, only 1-star robots are recruited
    if (combo.includes('Robot') && op.rarity !== 1) {
      return false
    }

    // 7. 2-star Starter operators strictly require 'Starter' tag
    if (op.rarity === 2 && !combo.includes('Starter')) {
      return false
    }

    // 8. If 'Starter' tag is chosen, only 1-star or 2-star operators appear
    if (combo.includes('Starter') && op.rarity > 2) {
      return false
    }

    return true
  })
}

// -----------------------------------------------------------------------------
// Combination Calculations & Evaluation
// -----------------------------------------------------------------------------
const allCombinations = computed<TagCombination[]>(() => {
  if (selectedTags.value.length === 0) return []

  const subsets = getSubsets(selectedTags.value)
  const results: TagCombination[] = []

  for (const combo of subsets) {
    const matchedOps = filterOperatorsForCombination(combo)
    if (matchedOps.length === 0) continue

    const rarities = matchedOps.map((op) => op.rarity)
    const minRarity = Math.min(...rarities)
    const maxRarity = Math.max(...rarities)

    results.push({
      tags: combo,
      operators: matchedOps.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name)),
      minRarity,
      maxRarity,
      hasGuaranteed6Star: minRarity === 6,
      hasGuaranteed5Star: minRarity === 5,
      hasGuaranteed4Star: minRarity === 4,
      hasRobot: combo.includes('Robot') || minRarity === 1,
    })
  }

  // Sort combinations:
  // 1. Guaranteed 6★ (Score 600)
  // 2. Guaranteed 5★ (Score 500)
  // 3. Guaranteed 4★ (Score 400)
  // 4. Robot tag (Score 350)
  // 5. Min rarity 3★ (Score 300)
  // Tiebreak: fewer tags (safer from tag drops), then fewer candidates (more targeted)
  return results.sort((a, b) => {
    const getScore = (c: TagCombination) => {
      if (c.hasGuaranteed6Star) return 600
      if (c.hasGuaranteed5Star) return 500
      if (c.hasGuaranteed4Star) return 400
      if (c.hasRobot) return 350
      return 300
    }

    const scoreA = getScore(a)
    const scoreB = getScore(b)
    if (scoreA !== scoreB) return scoreB - scoreA

    if (a.tags.length !== b.tags.length) return a.tags.length - b.tags.length
    return a.operators.length - b.operators.length
  })
})

// -----------------------------------------------------------------------------
// Filters & Search
// -----------------------------------------------------------------------------
type GuaranteeFilter = 'all' | '4plus' | '5plus' | '6star' | 'robot'
const guaranteeFilter = ref<GuaranteeFilter>('all')
const classFilter = ref<string>('all')
const searchQuery = ref<string>('')

const filteredCombinations = computed(() => {
  return allCombinations.value.filter((combo) => {
    // 1. Guarantee filter
    if (guaranteeFilter.value === '6star' && !combo.hasGuaranteed6Star) return false
    if (guaranteeFilter.value === '5plus' && combo.minRarity < 5) return false
    if (guaranteeFilter.value === '4plus' && combo.minRarity < 4) return false
    if (guaranteeFilter.value === 'robot' && !combo.hasRobot) return false

    // 2. Class filter
    if (classFilter.value !== 'all') {
      const hasClass = combo.operators.some((op) => op.profession.toLowerCase() === classFilter.value.toLowerCase())
      if (!hasClass) return false
    }

    // 3. Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchesOp = combo.operators.some((op) => op.name.toLowerCase().includes(q))
      const matchesTag = combo.tags.some((t) => t.toLowerCase().includes(q))
      if (!matchesOp && !matchesTag) return false
    }

    return true
  })
})

// Quick Counts
const stats = computed(() => {
  return {
    totalCombos: allCombinations.value.length,
    sixStar: allCombinations.value.filter((c) => c.hasGuaranteed6Star).length,
    fiveStar: allCombinations.value.filter((c) => c.hasGuaranteed5Star).length,
    fourStar: allCombinations.value.filter((c) => c.hasGuaranteed4Star).length,
    robot: allCombinations.value.filter((c) => c.hasRobot).length,
  }
})

// Avatar fallback helper
const handleImgError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.src = '/images/operators/placeholder.png'
  }
}
</script>

<template>
  <div class="ak-recruitment">
    <!-- Header Notification Banner -->
    <div class="ak-rec-header">
      <div class="ak-rec-header__main">
        <span class="ak-rec-header__code">HR // PUBLIC RECRUITMENT LOGIC ENGINE</span>
        <h2 class="ak-rec-header__title">Tag Combinatorics & Guarantee Calculator</h2>
        <p class="ak-rec-header__desc">
          Select up to 5 recruitment tags from your current recruitment slot.
          Combinations are calculated and sorted by guaranteed outcome tier.
        </p>
      </div>

      <!-- Quick Slot Counter & Reset -->
      <div class="ak-rec-header__status">
        <div class="ak-slot-counter" :class="{ 'ak-slot-counter--full': selectedTags.length === MAX_SELECTED_TAGS }">
          <span class="ak-slot-counter__label">SELECTED TAGS</span>
          <span class="ak-slot-counter__num">
            <strong>{{ selectedTags.length }}</strong> / {{ MAX_SELECTED_TAGS }}
          </span>
        </div>
        <button
          class="ak-btn-reset"
          :disabled="selectedTags.length === 0"
          @click="clearTags"
        >
          RESET ALL
        </button>
      </div>
    </div>

    <!-- Tag Selection Board -->
    <div class="ak-tag-board">
      <div
        v-for="cat in TAG_CATEGORIES"
        :key="cat.key"
        class="ak-tag-category"
      >
        <div class="ak-tag-category__header">
          <span class="ak-tag-category__indicator" :class="`ak-tag-category__indicator--${cat.key}`" />
          <span class="ak-tag-category__title">{{ cat.title }}</span>
        </div>

        <div class="ak-tag-group">
          <button
            v-for="tag in cat.tags"
            :key="tag"
            class="ak-tag-btn"
            :class="[
              `ak-tag-btn--${cat.key}`,
              { 'ak-tag-btn--active': isTagSelected(tag) },
              { 'ak-tag-btn--disabled': !isTagSelected(tag) && selectedTags.length >= MAX_SELECTED_TAGS },
            ]"
            :disabled="!isTagSelected(tag) && selectedTags.length >= MAX_SELECTED_TAGS"
            @click="toggleTag(tag)"
          >
            <span class="ak-tag-btn__check" v-if="isTagSelected(tag)">✓</span>
            <span class="ak-tag-btn__name">{{ tag }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Presets -->
    <div class="ak-presets-strip">
      <span class="ak-presets-strip__label">TEST PRESETS:</span>
      <button class="ak-preset-btn" @click="applyPreset(['Top Operator', 'Guard', 'DPS', 'Survival', 'Crowd Control'])">
        ★6 Top Op + Guard
      </button>
      <button class="ak-preset-btn" @click="applyPreset(['Crowd Control', 'Fast-Redeploy', 'Debuff', 'Melee', 'Specialist'])">
        ★5 Crowd Control / Debuff
      </button>
      <button class="ak-preset-btn" @click="applyPreset(['Shift', 'Slow', 'Defense', 'Specialist', 'Melee'])">
        ★4+ Shift / Slow
      </button>
      <button class="ak-preset-btn" @click="applyPreset(['Robot', 'Melee', 'Guard', 'Support', 'Nuker'])">
        ★1 Robot Tag
      </button>
    </div>

    <!-- Results Section -->
    <div class="ak-results-section">
      <!-- Controls & Summary Bar -->
      <div class="ak-results-toolbar">
        <!-- Filter Tabs -->
        <div class="ak-filter-tabs">
          <button
            class="ak-tab-btn"
            :class="{ 'ak-tab-btn--active': guaranteeFilter === 'all' }"
            @click="guaranteeFilter = 'all'"
          >
            ALL ({{ stats.totalCombos }})
          </button>
          <button
            class="ak-tab-btn ak-tab-btn--gold"
            :class="{ 'ak-tab-btn--active': guaranteeFilter === '6star' }"
            @click="guaranteeFilter = '6star'"
          >
            ★6 TOP OP ({{ stats.sixStar }})
          </button>
          <button
            class="ak-tab-btn ak-tab-btn--yellow"
            :class="{ 'ak-tab-btn--active': guaranteeFilter === '5plus' }"
            @click="guaranteeFilter = '5plus'"
          >
            ★5+ GUARANTEE ({{ stats.fiveStar }})
          </button>
          <button
            class="ak-tab-btn ak-tab-btn--purple"
            :class="{ 'ak-tab-btn--active': guaranteeFilter === '4plus' }"
            @click="guaranteeFilter = '4plus'"
          >
            ★4+ GUARANTEE ({{ stats.fourStar }})
          </button>
          <button
            class="ak-tab-btn ak-tab-btn--cyan"
            :class="{ 'ak-tab-btn--active': guaranteeFilter === 'robot' }"
            @click="guaranteeFilter = 'robot'"
          >
            ★1 ROBOT ({{ stats.robot }})
          </button>
        </div>

        <!-- Search & Class Dropdown -->
        <div class="ak-search-row">
          <div class="ak-input-wrap">
            <input
              v-model="searchQuery"
              type="text"
              class="ak-search-input"
              placeholder="Search operator or tag..."
            />
          </div>

          <select v-model="classFilter" class="ak-select">
            <option value="all">ALL CLASSES</option>
            <option value="vanguard">VANGUARD</option>
            <option value="guard">GUARD</option>
            <option value="sniper">SNIPER</option>
            <option value="defender">DEFENDER</option>
            <option value="medic">MEDIC</option>
            <option value="supporter">SUPPORTER</option>
            <option value="caster">CASTER</option>
            <option value="specialist">SPECIALIST</option>
          </select>
        </div>
      </div>

      <!-- Combinations List -->
      <div v-if="filteredCombinations.length > 0" class="ak-combos-list">
        <div
          v-for="(combo, idx) in filteredCombinations"
          :key="`${combo.tags.join('-')}-${idx}`"
          class="ak-combo-card"
          :class="[
            { 'ak-combo-card--r6': combo.hasGuaranteed6Star },
            { 'ak-combo-card--r5': combo.hasGuaranteed5Star },
            { 'ak-combo-card--r4': combo.hasGuaranteed4Star },
            { 'ak-combo-card--robot': combo.hasRobot },
          ]"
        >
          <!-- Card Header -->
          <div class="ak-combo-card__header">
            <div class="ak-combo-card__tags">
              <span
                v-for="tag in combo.tags"
                :key="tag"
                class="ak-combo-tag-pill"
                :class="[
                  { 'ak-combo-tag-pill--gold': tag === 'Top Operator' },
                  { 'ak-combo-tag-pill--yellow': tag === 'Senior Operator' },
                  { 'ak-combo-tag-pill--cyan': tag === 'Robot' },
                ]"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Guarantee Outcome Badge -->
            <div class="ak-combo-card__badge-wrap">
              <span
                v-if="combo.hasGuaranteed6Star"
                class="ak-guarantee-badge ak-guarantee-badge--r6"
              >
                ★6 GUARANTEED
              </span>
              <span
                v-else-if="combo.hasGuaranteed5Star"
                class="ak-guarantee-badge ak-guarantee-badge--r5"
              >
                ★5 GUARANTEED
              </span>
              <span
                v-else-if="combo.hasGuaranteed4Star"
                class="ak-guarantee-badge ak-guarantee-badge--r4"
              >
                ★4+ GUARANTEED
              </span>
              <span
                v-else-if="combo.hasRobot"
                class="ak-guarantee-badge ak-guarantee-badge--robot"
              >
                ★1 ROBOT (03:50)
              </span>
              <span
                v-else
                class="ak-guarantee-badge ak-guarantee-badge--r3"
              >
                ★3+ COMMON
              </span>

              <!-- Timer Recommendation Tip -->
              <span class="ak-timer-tip">
                {{ combo.hasRobot ? '⏱️ Set 03:50' : '⏱️ Set 09:00' }}
              </span>
            </div>
          </div>

          <!-- Operators Row -->
          <div class="ak-combo-card__ops">
            <div
              v-for="op in combo.operators"
              :key="op.id"
              class="ak-op-badge"
              :class="`ak-op-badge--r${op.rarity}`"
              :title="`${op.name} (${op.rarity}★ ${op.profession}) - Tags: ${op.tags.join(', ')}`"
            >
              <div class="ak-op-badge__avatar-box">
                <img
                  :src="op.avatar"
                  :alt="op.name"
                  loading="lazy"
                  @error="handleImgError"
                />
                <span class="ak-op-badge__stars">{{ '★'.repeat(op.rarity) }}</span>
              </div>
              <div class="ak-op-badge__info">
                <span class="ak-op-badge__name">{{ op.name }}</span>
                <span class="ak-op-badge__class">{{ op.profession }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State: No combinations matched filters -->
      <div v-else-if="selectedTags.length > 0" class="ak-empty-state">
        <span class="ak-empty-state__icon">🔍</span>
        <h3>NO MATCHING COMBINATIONS FOUND</h3>
        <p>No valid operator combination matched your search or rarity filter criteria.</p>
      </div>

      <!-- Empty State: No tags selected -->
      <div v-else class="ak-empty-state">
        <span class="ak-empty-state__icon">🎯</span>
        <h3>NO RECRUITMENT TAGS SELECTED</h3>
        <p>Pick up to 5 tags from the board above to calculate possible operator outcomes and guarantee thresholds.</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-recruitment {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------
.ak-rec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1.5rem;
  background: rgba($ak-bg-secondary, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid $ak-yellow;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);

  &__main {
    max-width: 650px;
  }

  &__code {
    font-size: 0.68rem;
    font-family: monospace;
    color: $ak-yellow;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 800;
    color: $ak-text-primary;
    margin: 0.2rem 0 0.4rem;
  }

  &__desc {
    font-size: 0.85rem;
    color: $ak-text-secondary;
    margin: 0;
    line-height: 1.4;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.ak-slot-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: monospace;
  padding: 0.5rem 0.85rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);

  &__label {
    font-size: 0.6rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__num {
    font-size: 1.15rem;
    color: $ak-text-secondary;

    strong {
      color: $ak-yellow;
      font-size: 1.3rem;
    }
  }

  &--full {
    border-color: rgba($ak-yellow, 0.4);
  }
}

.ak-btn-reset {
  padding: 0.65rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba($ak-red, 0.15);
    border-color: $ak-red;
    color: $ak-red;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// -----------------------------------------------------------------------------
// Tag Selection Board
// -----------------------------------------------------------------------------
.ak-tag-board {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: rgba($ak-bg-secondary, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.ak-tag-category {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__indicator {
    width: 3px;
    height: 12px;
    background: $ak-text-muted;

    &--qualification {
      background: $ak-yellow;
    }
    &--position {
      background: $ak-cyan;
    }
    &--class {
      background: $ak-cyan-dark;
    }
    &--affix {
      background: $ak-green;
    }
  }

  &__title {
    font-family: monospace;
    font-size: 0.72rem;
    font-weight: 700;
    color: $ak-text-muted;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
}

.ak-tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ak-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.95rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: $ak-text-primary;
    border-color: rgba(255, 255, 255, 0.25);
  }

  &__check {
    font-size: 0.75rem;
    color: $ak-yellow;
  }

  &--active {
    background: rgba($ak-yellow, 0.15) !important;
    border-color: $ak-yellow !important;
    color: $ak-yellow !important;
    box-shadow: 0 0 10px rgba($ak-yellow, 0.25);
  }

  &--qualification.ak-tag-btn--active {
    background: rgba($ak-yellow, 0.2) !important;
    border-color: $ak-yellow !important;
    color: #fff !important;
  }

  &--disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

// -----------------------------------------------------------------------------
// Presets Strip
// -----------------------------------------------------------------------------
.ak-presets-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);

  &__label {
    font-family: monospace;
    font-size: 0.68rem;
    font-weight: 700;
    color: $ak-text-muted;
    letter-spacing: 1px;
    margin-right: 0.25rem;
  }
}

.ak-preset-btn {
  padding: 0.35rem 0.65rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($ak-cyan, 0.12);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }
}

// -----------------------------------------------------------------------------
// Results Section
// -----------------------------------------------------------------------------
.ak-results-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ak-results-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba($ak-bg-secondary, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ak-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ak-tab-btn {
  padding: 0.45rem 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $ak-text-primary;
    background: rgba(255, 255, 255, 0.08);
  }

  &--active {
    background: rgba(255, 255, 255, 0.15);
    border-color: $ak-text-primary;
    color: #fff;
  }

  &--gold.ak-tab-btn--active {
    background: rgba($ak-rarity-6, 0.2);
    border-color: $ak-rarity-6;
    color: $ak-rarity-6;
  }

  &--yellow.ak-tab-btn--active {
    background: rgba($ak-yellow, 0.2);
    border-color: $ak-yellow;
    color: $ak-yellow;
  }

  &--purple.ak-tab-btn--active {
    background: rgba($ak-rarity-4, 0.2);
    border-color: $ak-rarity-4;
    color: $ak-rarity-4;
  }

  &--cyan.ak-tab-btn--active {
    background: rgba($ak-cyan, 0.2);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }
}

.ak-search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
}

.ak-input-wrap {
  flex: 1;
  min-width: 240px;
}

.ak-search-input {
  width: 100%;
  padding: 0.55rem 0.85rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-size: 0.82rem;
  font-family: monospace;
  outline: none;

  &:focus {
    border-color: $ak-yellow;
  }
}

.ak-select {
  padding: 0.55rem 0.85rem;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-size: 0.78rem;
  font-family: monospace;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: $ak-yellow;
  }
}

// -----------------------------------------------------------------------------
// Combinations List Cards
// -----------------------------------------------------------------------------
.ak-combos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ak-combo-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(22, 22, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid rgba(255, 255, 255, 0.2);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(28, 28, 34, 0.95);
    border-color: rgba(255, 255, 255, 0.15);
  }

  &--r6 {
    border-left-color: $ak-rarity-6;
    background: linear-gradient(90deg, rgba($ak-rarity-6, 0.08) 0%, rgba(22, 22, 26, 0.8) 100%);
  }

  &--r5 {
    border-left-color: $ak-yellow;
    background: linear-gradient(90deg, rgba($ak-yellow, 0.07) 0%, rgba(22, 22, 26, 0.8) 100%);
  }

  &--r4 {
    border-left-color: $ak-rarity-4;
    background: linear-gradient(90deg, rgba($ak-rarity-4, 0.06) 0%, rgba(22, 22, 26, 0.8) 100%);
  }

  &--robot {
    border-left-color: $ak-cyan;
    background: linear-gradient(90deg, rgba($ak-cyan, 0.06) 0%, rgba(22, 22, 26, 0.8) 100%);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__badge-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__ops {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
}

.ak-combo-tag-pill {
  padding: 0.35rem 0.7rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-primary;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;

  &--gold {
    background: rgba($ak-rarity-6, 0.2);
    border-color: $ak-rarity-6;
    color: $ak-rarity-6;
  }

  &--yellow {
    background: rgba($ak-yellow, 0.2);
    border-color: $ak-yellow;
    color: $ak-yellow;
  }

  &--cyan {
    background: rgba($ak-cyan, 0.2);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }
}

.ak-guarantee-badge {
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 0.35rem 0.65rem;
  text-transform: uppercase;

  &--r6 {
    background: rgba($ak-rarity-6, 0.25);
    border: 1px solid $ak-rarity-6;
    color: $ak-rarity-6;
  }

  &--r5 {
    background: rgba($ak-yellow, 0.25);
    border: 1px solid $ak-yellow;
    color: $ak-yellow;
  }

  &--r4 {
    background: rgba($ak-rarity-4, 0.25);
    border: 1px solid $ak-rarity-4;
    color: $ak-rarity-4;
  }

  &--robot {
    background: rgba($ak-cyan, 0.25);
    border: 1px solid $ak-cyan;
    color: $ak-cyan;
  }

  &--r3 {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: $ak-text-secondary;
  }
}

.ak-timer-tip {
  font-family: monospace;
  font-size: 0.68rem;
  color: $ak-text-muted;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.3rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

// -----------------------------------------------------------------------------
// Operator Badges
// -----------------------------------------------------------------------------
.ak-op-badge {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.65rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.65);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &--r6 {
    border-left: 3px solid $ak-rarity-6;
    .ak-op-badge__name {
      color: $ak-rarity-6;
    }
  }

  &--r5 {
    border-left: 3px solid $ak-yellow;
    .ak-op-badge__name {
      color: $ak-yellow;
    }
  }

  &--r4 {
    border-left: 3px solid $ak-rarity-4;
    .ak-op-badge__name {
      color: $ak-rarity-4;
    }
  }

  &--r3 {
    border-left: 3px solid $ak-rarity-3;
  }

  &--r2 {
    border-left: 3px solid $ak-rarity-2;
  }

  &--r1 {
    border-left: 3px solid $ak-cyan;
  }

  &__avatar-box {
    position: relative;
    width: 38px;
    height: 38px;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 34px;
      height: 34px;
      object-fit: contain;
    }
  }

  &__stars {
    position: absolute;
    bottom: -3px;
    right: 0;
    font-size: 0.45rem;
    color: $ak-yellow;
    letter-spacing: -1px;
    text-shadow: 0 0 3px #000;
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-size: 0.78rem;
    font-weight: 700;
    color: $ak-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__class {
    font-size: 0.62rem;
    font-family: monospace;
    color: $ak-text-muted;
    text-transform: uppercase;
  }
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------
.ak-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba($ak-bg-secondary, 0.5);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  gap: 0.5rem;

  &__icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-family: monospace;
    font-size: 1.1rem;
    color: $ak-text-primary;
    margin: 0;
    letter-spacing: 1px;
  }

  p {
    font-size: 0.85rem;
    color: $ak-text-muted;
    max-width: 450px;
    margin: 0;
  }
}
</style>
