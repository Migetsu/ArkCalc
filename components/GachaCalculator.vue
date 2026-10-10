<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/userStore'
import rawBanners from '~/assets/data/banners.json'
import type { BannerData } from '~/types'

const userStore = useUserStore()

// -----------------------------------------------------------------------------
// Target Banner & Date
// -----------------------------------------------------------------------------
const banners = rawBanners as BannerData[]
const selectedBannerId = ref<string>(banners[0]?.id || '')

// Calculate Global date with 175 days offset for a banner
const getEstimatedGlobalDate = (cnDateStr: string, offsetDays = 175): Date => {
  const d = new Date(cnDateStr)
  d.setDate(d.getDate() + offsetDays)
  return d
}

const formatDateToInput = (d: Date): string => {
  return d.toISOString().split('T')[0] || ''
}

// Default target date: from selected banner or 90 days from now
const targetDateStr = ref<string>('')

// Initialize target date from first banner
onMounted(() => {
  if (banners[0]) {
    const estDate = getEstimatedGlobalDate(banners[0].cnStartDate, 175)
    targetDateStr.value = formatDateToInput(estDate)
  } else {
    const defaultFuture = new Date()
    defaultFuture.setDate(defaultFuture.getDate() + 90)
    targetDateStr.value = formatDateToInput(defaultFuture)
  }
})

// When banner dropdown changes, update target date
watch(selectedBannerId, (newId) => {
  const found = banners.find((b) => b.id === newId)
  if (found) {
    const estDate = getEstimatedGlobalDate(found.cnStartDate, 175)
    targetDateStr.value = formatDateToInput(estDate)
  }
})

// -----------------------------------------------------------------------------
// Current Player Resources
// -----------------------------------------------------------------------------
const orundum = ref<number>(userStore.getItemQuantity('orundum') || 12000)
const originitePrime = ref<number>(userStore.getItemQuantity('originite_prime') || 35)
const singlePermits = ref<number>(userStore.getItemQuantity('single_permit') || 6)
const tenPermits = ref<number>(userStore.getItemQuantity('ten_permit') || 1)

// Options & Preferences
const convertOP = ref<boolean>(true) // Whether to count OP as pulls (1 OP = 180 Orundum)
const hasMonthlyCard = ref<boolean>(true) // Monthly card active (+200 Orundum/day)
const doAnnihilation = ref<boolean>(true) // 1800 Orundum/week
const buyGreenCertShop = ref<boolean>(true) // 600 Orundum + 4 permits per month
const targetSpark = ref<number>(300) // 300 for limited, 120 for collab
const includeFreePulls = ref<boolean>(true) // 24 for celebration, 10 for collab

// Auto-adjust target spark and free pulls when banner changes
watch(selectedBannerId, (newId) => {
  const found = banners.find((b) => b.id === newId)
  if (found) {
    targetSpark.value = found.sparkCost || 300
    if (found.freePulls > 0) {
      includeFreePulls.value = true
    }
  }
})

// -----------------------------------------------------------------------------
// Time & Income Calculations
// -----------------------------------------------------------------------------
const daysRemaining = computed(() => {
  if (!targetDateStr.value) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDateStr.value)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

const weeksRemaining = computed(() => daysRemaining.value / 7)
const monthsRemaining = computed(() => daysRemaining.value / 30.4375)

// Projected Incomes
const incomeDailyMissions = computed(() => daysRemaining.value * 100)
const incomeMonthlyCard = computed(() => (hasMonthlyCard.value ? daysRemaining.value * 200 : 0))
const incomeWeeklyMissions = computed(() => Math.floor(weeksRemaining.value * 500))
const incomeAnnihilation = computed(() => (doAnnihilation.value ? Math.floor(weeksRemaining.value * 1800) : 0))
const incomeGreenCertOrundum = computed(() => (buyGreenCertShop.value ? Math.floor(monthsRemaining.value * 600) : 0))
const incomeGreenCertPermits = computed(() => (buyGreenCertShop.value ? Math.floor(monthsRemaining.value * 4) : 0))

// Free event pulls from selected banner
const freeEventPulls = computed(() => {
  if (!includeFreePulls.value) return 0
  const found = banners.find((b) => b.id === selectedBannerId.value)
  return found?.freePulls || 0
})

// Total Farmed Orundum
const totalFarmedOrundum = computed(() => {
  return (
    incomeDailyMissions.value +
    incomeMonthlyCard.value +
    incomeWeeklyMissions.value +
    incomeAnnihilation.value +
    incomeGreenCertOrundum.value
  )
})

// -----------------------------------------------------------------------------
// Pull Totals & Conversions
// -----------------------------------------------------------------------------
// Current pulls ready now
const currentPullsFromOrundum = computed(() => Math.floor(orundum.value / 600))
const currentPullsFromOP = computed(() => (convertOP.value ? Math.floor((originitePrime.value * 180) / 600) : 0))
const currentPullsFromPermits = computed(() => singlePermits.value + tenPermits.value * 10)
const totalCurrentPulls = computed(() => {
  return currentPullsFromOrundum.value + currentPullsFromOP.value + currentPullsFromPermits.value
})

// Future pulls generated between now and target date
const projectedPullsFromFarmedOrundum = computed(() => Math.floor(totalFarmedOrundum.value / 600))
const projectedPullsFromFarmedPermits = computed(() => incomeGreenCertPermits.value)
const totalProjectedGainedPulls = computed(() => {
  return projectedPullsFromFarmedOrundum.value + projectedPullsFromFarmedPermits.value + freeEventPulls.value
})

// Final Grand Total
const grandTotalPulls = computed(() => {
  return totalCurrentPulls.value + totalProjectedGainedPulls.value
})

// Spark Progress
const sparkProgressPercent = computed(() => {
  if (targetSpark.value <= 0) return 100
  return Math.min(100, Math.floor((grandTotalPulls.value / targetSpark.value) * 100))
})

const sparkDeficit = computed(() => {
  return Math.max(0, targetSpark.value - grandTotalPulls.value)
})

// Save current resources back to userStore
const saveToStore = () => {
  userStore.setItemQuantity('orundum', orundum.value)
  userStore.setItemQuantity('originite_prime', originitePrime.value)
  userStore.setItemQuantity('single_permit', singlePermits.value)
  userStore.setItemQuantity('ten_permit', tenPermits.value)
}
</script>

<template>
  <div class="ak-calculator">
    <div class="ak-calculator__grid">
      <!-- Left Column: Inputs & Configuration -->
      <div class="ak-calc-col">
        <!-- Section: Target Banner -->
        <div class="ak-panel">
          <div class="ak-panel__header">
            <span class="ak-panel__code">CFG-01</span>
            <h3 class="ak-panel__title">TARGET BANNER & TIMELINE</h3>
          </div>

          <div class="ak-form-group">
            <label class="ak-label">Select Upcoming Banner</label>
            <select v-model="selectedBannerId" class="ak-select">
              <option v-for="b in banners" :key="b.id" :value="b.id">
                {{ b.name }} ({{ b.category }}) — {{ b.type.toUpperCase() }}
              </option>
            </select>
          </div>

          <div class="ak-form-row">
            <div class="ak-form-group">
              <label class="ak-label">Target Global Date</label>
              <input v-model="targetDateStr" type="date" class="ak-input" />
            </div>

            <div class="ak-form-group">
              <label class="ak-label">Spark Goal (Pulls)</label>
              <input v-model.number="targetSpark" type="number" min="1" max="600" class="ak-input" />
            </div>
          </div>

          <div class="ak-days-counter">
            <span class="ak-days-counter__label">ESTIMATED TIME TO BANNER:</span>
            <span class="ak-days-counter__value">
              <strong>{{ daysRemaining }}</strong> DAYS (~{{ weeksRemaining.toFixed(1) }} WEEKS)
            </span>
          </div>
        </div>

        <!-- Section: Current Resources -->
        <div class="ak-panel">
          <div class="ak-panel__header">
            <span class="ak-panel__code">RES-02</span>
            <h3 class="ak-panel__title">CURRENT DEPOT RESOURCES</h3>
          </div>

          <div class="ak-resource-grid">
            <!-- Orundum -->
            <div class="ak-resource-input">
              <div class="ak-resource-input__header">
                <span class="ak-resource-input__icon ak-resource-input__icon--orundum">◆</span>
                <label class="ak-label">Orundum</label>
              </div>
              <input v-model.number="orundum" type="number" min="0" step="100" class="ak-input" />
              <span class="ak-resource-input__sub">={{ currentPullsFromOrundum }} pulls</span>
            </div>

            <!-- OP -->
            <div class="ak-resource-input">
              <div class="ak-resource-input__header">
                <span class="ak-resource-input__icon ak-resource-input__icon--op">▲</span>
                <label class="ak-label">Originite Prime</label>
              </div>
              <input v-model.number="originitePrime" type="number" min="0" step="1" class="ak-input" />
              <span class="ak-resource-input__sub">
                {{ convertOP ? `≈${currentPullsFromOP} pulls` : 'Not converted' }}
              </span>
            </div>

            <!-- Single Permits -->
            <div class="ak-resource-input">
              <div class="ak-resource-input__header">
                <span class="ak-resource-input__icon ak-resource-input__icon--permit">🎟</span>
                <label class="ak-label">1x Permits</label>
              </div>
              <input v-model.number="singlePermits" type="number" min="0" class="ak-input" />
              <span class="ak-resource-input__sub">={{ singlePermits }} pulls</span>
            </div>

            <!-- 10x Permits -->
            <div class="ak-resource-input">
              <div class="ak-resource-input__header">
                <span class="ak-resource-input__icon ak-resource-input__icon--ten">🎟🎟</span>
                <label class="ak-label">10x Permits</label>
              </div>
              <input v-model.number="tenPermits" type="number" min="0" class="ak-input" />
              <span class="ak-resource-input__sub">={{ tenPermits * 10 }} pulls</span>
            </div>
          </div>

          <!-- Quick Save to Store Button -->
          <button type="button" class="ak-btn-secondary" @click="saveToStore">
            SAVE CURRENT INVENTORY TO STORE
          </button>
        </div>

        <!-- Section: Monthly Card & Income Options -->
        <div class="ak-panel">
          <div class="ak-panel__header">
            <span class="ak-panel__code">INC-03</span>
            <h3 class="ak-panel__title">INCOME MULTIPLIERS & BONUSES</h3>
          </div>

          <div class="ak-checkbox-list">
            <!-- Monthly Card Toggle -->
            <label class="ak-checkbox-card" :class="{ 'ak-checkbox-card--active': hasMonthlyCard }">
              <input v-model="hasMonthlyCard" type="checkbox" class="ak-checkbox" />
              <div class="ak-checkbox-card__body">
                <span class="ak-checkbox-card__title">Monthly Card Active (+200 Orundum/day)</span>
                <span class="ak-checkbox-card__desc">
                  Total bonus: +{{ incomeMonthlyCard.toLocaleString() }} Orundum (~{{
                    Math.floor(incomeMonthlyCard / 600)
                  }} pulls)
                </span>
              </div>
            </label>

            <!-- Convert OP Toggle -->
            <label class="ak-checkbox-card" :class="{ 'ak-checkbox-card--active': convertOP }">
              <input v-model="convertOP" type="checkbox" class="ak-checkbox" />
              <div class="ak-checkbox-card__body">
                <span class="ak-checkbox-card__title">Convert Originite Prime to Pulls (1 OP = 180 Orundum)</span>
                <span class="ak-checkbox-card__desc">
                  Uncheck if reserving OP strictly for outfits / skins
                </span>
              </div>
            </label>

            <!-- Annihilation Toggle -->
            <label class="ak-checkbox-card" :class="{ 'ak-checkbox-card--active': doAnnihilation }">
              <input v-model="doAnnihilation" type="checkbox" class="ak-checkbox" />
              <div class="ak-checkbox-card__body">
                <span class="ak-checkbox-card__title">Clear Weekly Annihilation (1800 Orundum/wk)</span>
                <span class="ak-checkbox-card__desc">
                  Projected: +{{ incomeAnnihilation.toLocaleString() }} Orundum
                </span>
              </div>
            </label>

            <!-- Green Cert Shop -->
            <label class="ak-checkbox-card" :class="{ 'ak-checkbox-card--active': buyGreenCertShop }">
              <input v-model="buyGreenCertShop" type="checkbox" class="ak-checkbox" />
              <div class="ak-checkbox-card__body">
                <span class="ak-checkbox-card__title">Green Cert Shop Tier 1 (600 Orundum + 4 Permits/mo)</span>
                <span class="ak-checkbox-card__desc">
                  Projected: +{{ incomeGreenCertOrundum.toLocaleString() }} Orundum & +{{
                    incomeGreenCertPermits
                  }} permits
                </span>
              </div>
            </label>

            <!-- Free Event Pulls -->
            <label class="ak-checkbox-card" :class="{ 'ak-checkbox-card--active': includeFreePulls }">
              <input v-model="includeFreePulls" type="checkbox" class="ak-checkbox" />
              <div class="ak-checkbox-card__body">
                <span class="ak-checkbox-card__title">Event Free Pulls (+{{ freeEventPulls }} Pulls)</span>
                <span class="ak-checkbox-card__desc">
                  Celebration free ten-roll permit & daily login headhunts
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Right Column: Results & Spark Projection -->
      <div class="ak-calc-col">
        <!-- Grand Total Card -->
        <div class="ak-summary-card">
          <div class="ak-summary-card__badge">PROJECTED HEADHUNTING CAPACITY</div>

          <div class="ak-summary-card__main-stat">
            <span class="ak-summary-card__big-num">{{ grandTotalPulls }}</span>
            <span class="ak-summary-card__unit">TOTAL PULLS</span>
          </div>

          <div class="ak-summary-card__equivalent">
            ≈ {{ (grandTotalPulls * 600).toLocaleString() }} ORUNDUM EQUIVALENT
          </div>

          <!-- Progress Bar to Target Spark -->
          <div class="ak-spark-progress">
            <div class="ak-spark-progress__header">
              <span class="ak-spark-progress__title">SPARK GOAL ({{ targetSpark }} PULLS)</span>
              <span class="ak-spark-progress__percent">{{ sparkProgressPercent }}%</span>
            </div>
            <div class="ak-spark-progress__bar">
              <div
                class="ak-spark-progress__fill"
                :style="{ width: `${sparkProgressPercent}%` }"
                :class="{ 'ak-spark-progress__fill--completed': sparkProgressPercent >= 100 }"
              />
            </div>
            <div class="ak-spark-progress__status">
              <span v-if="sparkDeficit === 0" class="ak-spark-progress__success">
                ✓ 300 SPARK GUARANTEED! (SURPLUS: +{{ grandTotalPulls - targetSpark }} PULLS)
              </span>
              <span v-else class="ak-spark-progress__deficit">
                DEFICIT: NEED {{ sparkDeficit }} MORE PULLS TO REACH SPARK
              </span>
            </div>
          </div>

          <!-- Breakdown List -->
          <div class="ak-breakdown">
            <div class="ak-breakdown__row">
              <span class="ak-breakdown__label">Current Ready Pulls</span>
              <span class="ak-breakdown__val">{{ totalCurrentPulls }} pulls</span>
            </div>
            <div class="ak-breakdown__sub-row">
              <span>• From Orundum ({{ orundum.toLocaleString() }})</span>
              <span>{{ currentPullsFromOrundum }} pulls</span>
            </div>
            <div class="ak-breakdown__sub-row">
              <span>• From OP ({{ originitePrime }} OP)</span>
              <span>{{ currentPullsFromOP }} pulls</span>
            </div>
            <div class="ak-breakdown__sub-row">
              <span>• From Permits ({{ singlePermits }} 1x, {{ tenPermits }} 10x)</span>
              <span>{{ currentPullsFromPermits }} pulls</span>
            </div>

            <div class="ak-breakdown__divider" />

            <div class="ak-breakdown__row">
              <span class="ak-breakdown__label">Projected Farmed Pulls</span>
              <span class="ak-breakdown__val ak-breakdown__val--green">
                +{{ totalProjectedGainedPulls - freeEventPulls }} pulls
              </span>
            </div>
            <div class="ak-breakdown__sub-row">
              <span>• Daily Missions ({{ daysRemaining }} days)</span>
              <span>{{ (incomeDailyMissions / 600).toFixed(1) }} pulls</span>
            </div>
            <div v-if="hasMonthlyCard" class="ak-breakdown__sub-row">
              <span>• Monthly Card Bonus</span>
              <span>{{ (incomeMonthlyCard / 600).toFixed(1) }} pulls</span>
            </div>
            <div class="ak-breakdown__sub-row">
              <span>• Weekly Missions & Annihilation</span>
              <span>{{ ((incomeWeeklyMissions + incomeAnnihilation) / 600).toFixed(1) }} pulls</span>
            </div>
            <div v-if="buyGreenCertShop" class="ak-breakdown__sub-row">
              <span>• Monthly Green Cert Shop</span>
              <span>{{ (incomeGreenCertOrundum / 600 + incomeGreenCertPermits).toFixed(1) }} pulls</span>
            </div>

            <div v-if="freeEventPulls > 0" class="ak-breakdown__row">
              <span class="ak-breakdown__label">Free Event Celebration Pulls</span>
              <span class="ak-breakdown__val ak-breakdown__val--cyan">
                +{{ freeEventPulls }} pulls
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-calculator {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &__grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 2rem;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
}

.ak-calc-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// Panel container
.ak-panel {
  background: rgba($ak-bg-secondary, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  backdrop-filter: blur(8px);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);

  &__header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__code {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 1.5px;
    background: rgba($ak-cyan, 0.1);
    padding: 0.15rem 0.4rem;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 1.5px;
    margin: 0;
    color: $ak-text-primary;
  }
}

// Form inputs
.ak-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.ak-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ak-label {
  font-size: 0.75rem;
  font-family: monospace;
  letter-spacing: 1px;
  color: $ak-text-secondary;
  text-transform: uppercase;
}

.ak-input,
.ak-select {
  padding: 0.6rem 0.85rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-primary;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: $ak-cyan;
    box-shadow: 0 0 8px rgba($ak-cyan, 0.3);
  }
}

.ak-select {
  cursor: pointer;
  option {
    background: $ak-bg-secondary;
    color: $ak-text-primary;
  }
}

// Days counter bar
.ak-days-counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.85rem;
  background: rgba(0, 0, 0, 0.3);
  border-left: 2px solid $ak-cyan;
  font-family: monospace;

  &__label {
    font-size: 0.7rem;
    color: $ak-text-muted;
  }

  &__value {
    font-size: 0.85rem;
    color: $ak-text-secondary;
    strong {
      color: $ak-cyan;
      font-size: 1.05rem;
    }
  }
}

// Resource Grid Inputs
.ak-resource-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.ak-resource-input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &__header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__icon {
    font-size: 0.9rem;
    &--orundum {
      color: $ak-orundum;
    }
    &--op {
      color: $ak-originite-prime;
    }
    &--permit {
      color: $ak-cyan;
    }
    &--ten {
      color: $ak-amber;
    }
  }

  &__sub {
    font-size: 0.7rem;
    font-family: monospace;
    color: $ak-text-muted;
  }
}

.ak-btn-secondary {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-primary;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($ak-cyan, 0.15);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }
}

// Checkbox Cards
.ak-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ak-checkbox-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &--active {
    border-color: rgba($ak-cyan, 0.35);
    background: rgba($ak-cyan, 0.05);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 600;
    color: $ak-text-primary;
  }

  &__desc {
    font-size: 0.7rem;
    color: $ak-text-muted;
    font-family: monospace;
  }
}

.ak-checkbox {
  margin-top: 0.2rem;
  accent-color: $ak-cyan;
  cursor: pointer;
}

// Summary Card (Right Column)
.ak-summary-card {
  position: sticky;
  top: 84px;
  background: rgba(22, 22, 26, 0.9);
  border: 1px solid rgba($ak-cyan, 0.3);
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  backdrop-filter: blur(12px);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);

  &__badge {
    align-self: flex-start;
    padding: 0.2rem 0.5rem;
    font-size: 0.65rem;
    font-family: monospace;
    letter-spacing: 1.5px;
    font-weight: 700;
    background: rgba($ak-cyan, 0.15);
    color: $ak-cyan;
    border-left: 2px solid $ak-cyan;
  }

  &__main-stat {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  &__big-num {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
    color: $ak-text-primary;
    text-shadow: 0 0 20px rgba($ak-cyan, 0.4);
    letter-spacing: -1px;
  }

  &__unit {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 2px;
    color: $ak-cyan;
  }

  &__equivalent {
    font-family: monospace;
    font-size: 0.8rem;
    color: $ak-text-muted;
    margin-top: -0.5rem;
  }
}

// Spark Progress
.ak-spark-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);

  &__header {
    display: flex;
    justify-content: space-between;
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__title {
    color: $ak-text-secondary;
  }

  &__percent {
    color: $ak-cyan;
  }

  &__bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $ak-cyan-dark, $ak-cyan);
    transition: width 0.3s ease;

    &--completed {
      background: linear-gradient(90deg, #10ac84, $ak-green);
    }
  }

  &__status {
    font-family: monospace;
    font-size: 0.7rem;
    font-weight: 700;
    margin-top: 0.25rem;
  }

  &__success {
    color: $ak-green;
  }

  &__deficit {
    color: $ak-amber;
  }
}

// Breakdown list
.ak-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;

  &__row {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    color: $ak-text-primary;
    margin-top: 0.25rem;
  }

  &__val {
    &--green {
      color: $ak-green;
    }
    &--cyan {
      color: $ak-cyan;
    }
  }

  &__sub-row {
    display: flex;
    justify-content: space-between;
    color: $ak-text-muted;
    padding-left: 0.75rem;
    font-size: 0.75rem;
  }

  &__divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 0.4rem 0;
  }
}
</style>
