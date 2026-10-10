<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { usePlannerStore } from '~/stores/plannerStore'
import { useOperatorStore } from '~/stores/operatorStore'
import { useToast } from '~/composables/useToast'
import BannerCardSkeleton from '~/components/ui/BannerCardSkeleton.vue'
import AccountSyncModal from '~/components/AccountSyncModal.vue'
import fallbackBanners from '~/assets/data/banners.json'
import type { TargetPlanItem, OperatorData } from '~/types'

useHead({
  title: 'Dashboard // ArkCalc Tactical Terminal',
})

const userStore = useUserStore()
const plannerStore = usePlannerStore()
const operatorStore = useOperatorStore()
const toast = useToast()

const isSyncModalOpen = ref(false)
const isLoadingDemo = ref(false)

const loadDemoData = async () => {
  isLoadingDemo.value = true
  try {
    const demo = await userStore.loadDemoData()
    toast.success(`Demo data loaded! Welcome Doctor ${demo.profile.nickname}.`, {
      title: 'DEMO LOADED',
      tag: 'PRTS // DEMO',
    })
  } catch (err: any) {
    toast.error('Failed to load demo data.', { title: 'ERROR' })
  } finally {
    isLoadingDemo.value = false
  }
}

// -----------------------------------------------------------------------------
// Core Navigation Modules
// -----------------------------------------------------------------------------
const modules = [
  {
    title: 'Operator Planner',
    code: 'PLN-01',
    description: 'Calculate promotion costs, material deficits, and optimal Sanity farming routes.',
    path: '/planner',
    accent: 'cyan',
    badge: 'FARMING // DELTA',
  },
  {
    title: 'Gacha Calculator',
    code: 'GCH-02',
    description: 'Simulate headhunting probability, spark savings timeline, and upcoming CN banners.',
    path: '/gacha',
    accent: 'amber',
    badge: 'SPARK // TIMELINE',
  },
  {
    title: 'Recruitment Matrix',
    code: 'RCR-03',
    description: 'Find guaranteed 4★, 5★, and Top Operator tag combinations in seconds.',
    path: '/recruitment',
    accent: 'yellow',
    badge: 'TAGS // COMBOS',
  },
  {
    title: 'Depot Inventory',
    code: 'INV-04',
    description: 'Track stock materials, currencies, and chips synced with Penguin Statistics.',
    path: '/inventory',
    accent: 'green',
    badge: 'DEPOT // SYNCED',
  },
]

// -----------------------------------------------------------------------------
// Widget 1: Upcoming Banner & Realtime Countdown
// -----------------------------------------------------------------------------
interface RateUpOp {
  name: string
  rarity: number
  profession?: string
  icon: string
}

interface BannerItem {
  id: string
  name: string
  title: string
  bannerImg: string
  bannerImage?: string
  type: string
  category: string
  cnStartDate: string
  cnEndDate: string
  sparkCost?: number
  freePulls?: number
  description?: string
  operators: RateUpOp[]
}

const { data: bannerApiResponse, status: bannerStatus } = useFetch('/api/banners', {
  default: () => ({
    source: 'local-fallback',
    updatedAt: new Date().toISOString(),
    banners: fallbackBanners as BannerItem[],
  }),
})

const allBanners = computed<BannerItem[]>(() => {
  return (bannerApiResponse.value?.banners as BannerItem[]) || (fallbackBanners as BannerItem[])
})

// Current client timestamp for countdown
const now = ref<number>(Date.now())
let timerId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timerId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
  operatorStore.loadOperators()
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

// Calculate banner start & end dates according to server offset
const isCnServer = computed(() => (userStore.profile.server || 'EN').toUpperCase() === 'CN')
const offsetDays = computed(() => (isCnServer.value ? 0 : 175))

const getBannerGlobalDate = (dateStr: string, days: number): Date => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

// Identify upcoming or currently active banner
const upcomingBanner = computed<{
  banner: BannerItem
  startDate: Date
  endDate: Date
  isActive: boolean
  isFuture: boolean
  diffMs: number
} | null>(() => {
  const list = allBanners.value
  if (!list || list.length === 0) return null

  const mapped = list.map((b) => {
    const sDate = getBannerGlobalDate(b.cnStartDate, offsetDays.value)
    const eDate = getBannerGlobalDate(b.cnEndDate || b.cnStartDate, offsetDays.value)
    // Banner runs ~14 days if end date is missing
    if (eDate.getTime() === sDate.getTime()) {
      eDate.setDate(eDate.getDate() + 14)
    }
    return {
      banner: b,
      startDate: sDate,
      endDate: eDate,
    }
  })

  // Sort by start date ascending
  mapped.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  // Find currently active banner or next upcoming banner
  for (const item of mapped) {
    if (now.value >= item.startDate.getTime() && now.value <= item.endDate.getTime()) {
      return {
        ...item,
        isActive: true,
        isFuture: false,
        diffMs: item.endDate.getTime() - now.value,
      }
    }
    if (now.value < item.startDate.getTime()) {
      return {
        ...item,
        isActive: false,
        isFuture: true,
        diffMs: item.startDate.getTime() - now.value,
      }
    }
  }

  // Fallback to earliest banner
  if (mapped[0]) {
    const s = mapped[0].startDate
    return {
      ...mapped[0],
      isActive: false,
      isFuture: s.getTime() > now.value,
      diffMs: Math.max(0, s.getTime() - now.value),
    }
  }

  return null
})

// Formatted countdown numbers
const countdown = computed(() => {
  if (!upcomingBanner.value || upcomingBanner.value.diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const totalSecs = Math.floor(upcomingBanner.value.diffMs / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const minutes = Math.floor((totalSecs % 3600) / 60)
  const seconds = totalSecs % 60
  return { days, hours, minutes, seconds }
})

// -----------------------------------------------------------------------------
// Widget 2: Gacha Savings & Spark Readiness
// -----------------------------------------------------------------------------
const orundum = computed(() => userStore.getItemQuantity('orundum'))
const originitePrime = computed(() => userStore.getItemQuantity('originite_prime'))
const singlePermits = computed(() => userStore.getItemQuantity('7001') || userStore.getItemQuantity('single_permit'))
const tenPermits = computed(() => userStore.getItemQuantity('7002') || userStore.getItemQuantity('ten_permit'))

const pullsFromOrundum = computed(() => Math.floor(orundum.value / 600))
const pullsFromOP = computed(() => Math.floor((originitePrime.value * 180) / 600))
const pullsFromTickets = computed(() => singlePermits.value + tenPermits.value * 10)

const totalAvailablePulls = computed(() => {
  return pullsFromOrundum.value + pullsFromOP.value + pullsFromTickets.value
})

const sparkTarget = 300 // Standard spark cost
const sparkProgressPercent = computed(() => {
  return Math.min(100, Math.floor((totalAvailablePulls.value / sparkTarget) * 100))
})
const pullsMissingForSpark = computed(() => Math.max(0, sparkTarget - totalAvailablePulls.value))

const hasMonthlyCard = computed(() => userStore.settings.monthly_card ?? true)

// -----------------------------------------------------------------------------
// Widget 3: Promotion Targets (Planner Store)
// -----------------------------------------------------------------------------
const plannedTargets = computed(() => plannerStore.plannedTargets)

// Quick suggestions if plan is empty
const suggestedOperators = computed<OperatorData[]>(() => {
  return (operatorStore.operators.length > 0 ? operatorStore.operators : (fallbackBanners as any)).slice(0, 4)
})

const quickAddSuggested = (op: OperatorData) => {
  plannerStore.addTarget({
    operatorId: op.id,
    operator: op,
    currentElite: 0,
    targetElite: 2,
    currentLevel: 1,
    targetLevel: 90,
    currentMastery: 0,
    targetMastery: 3,
    currentModule: 0,
    targetModule: 3,
  })
  toast.success(`${op.name} added to promotion targets!`, {
    title: 'TARGET ADDED',
    tag: 'PLN // GOAL',
  })
}
</script>

<template>
  <div class="ak-dash">
    <!-- Hero / Status Banner -->
    <header class="ak-dash__hero">
      <div class="ak-dash__hero-meta">
        <div class="ak-dash__status-badge">
          <span class="ak-status-dot" />
          <span>PRTS TACTICAL COMMAND // STATUS: OPTIMAL</span>
        </div>
        <h1 class="ak-dash__title">DASHBOARD // OVERVIEW</h1>
        <p class="ak-dash__subtitle">
          Rhodes Island Central Command Terminal. Monitor upcoming headhunting banners, your gacha savings trajectory, and active operator promotion goals.
        </p>
      </div>

      <!-- Quick Doctor Tag -->
      <div class="ak-doctor-badge">
        <div class="ak-doctor-badge__avatar">
          <img
            v-if="userStore.profile.avatar_url"
            :src="userStore.profile.avatar_url"
            :alt="userStore.profile.username"
          />
          <span v-else class="ak-avatar-placeholder">DR</span>
        </div>
        <div class="ak-doctor-badge__info">
          <span class="ak-doctor-badge__name">{{ userStore.profile.username }}</span>
          <span class="ak-doctor-badge__level">
            LV.{{ userStore.profile.level }} // SERVER: {{ userStore.profile.server || 'EN' }}
          </span>
        </div>
        <NuxtLink to="/settings" class="ak-doctor-badge__action" title="System Settings">
          ⚙
        </NuxtLink>
      </div>
    </header>

    <!-- Quick Account Sync / Demo Prompt if unsynced -->
    <div v-if="!userStore.hasSyncedAccount" class="ak-unsynced-banner">
      <div class="ak-unsynced-banner__info">
        <span class="ak-unsynced-banner__badge">PRTS // STANDBY</span>
        <div class="ak-unsynced-banner__text">
          <strong>NO GAME ACCOUNT SYNCHRONIZED</strong>
          <p>Depot stock, gacha currency, and operator promotion goals are currently empty. Synchronize your Arknights account or load interactive demo data to explore ArkCalc.</p>
        </div>
      </div>
      <div class="ak-unsynced-banner__actions">
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
    </div>

    <!-- Top Tactical Metrics Ribbon -->
    <section class="ak-ribbon">
      <div class="ak-ribbon-pill">
        <span class="ak-ribbon-pill__label">AVAILABLE PULLS:</span>
        <strong class="ak-ribbon-pill__val ak-text-cyan">{{ totalAvailablePulls }} ROLLS</strong>
      </div>
      <div class="ak-ribbon-pill">
        <span class="ak-ribbon-pill__label">ACTIVE TARGETS:</span>
        <strong class="ak-ribbon-pill__val">{{ plannedTargets.length }} OPERATORS</strong>
      </div>
      <div class="ak-ribbon-pill">
        <span class="ak-ribbon-pill__label">SPARK READINESS:</span>
        <strong class="ak-ribbon-pill__val" :class="totalAvailablePulls >= 300 ? 'ak-text-green' : 'ak-text-amber'">
          {{ sparkProgressPercent }}% ({{ totalAvailablePulls }}/300)
        </strong>
      </div>
      <div class="ak-ribbon-pill">
        <span class="ak-ribbon-pill__label">MONTHLY CARD:</span>
        <strong class="ak-ribbon-pill__val" :class="hasMonthlyCard ? 'ak-text-green' : 'ak-text-muted'">
          {{ hasMonthlyCard ? 'ACTIVE (+200/D)' : 'INACTIVE' }}
        </strong>
      </div>
    </section>

    <!-- 3 Summary Widgets Grid -->
    <section class="ak-widgets-grid">
      <!-- WIDGET 1: Upcoming Banner Countdown -->
      <div class="ak-widget ak-widget--banner">
        <div class="ak-widget__head">
          <div class="ak-widget__tag-group">
            <span class="ak-widget__badge ak-widget__badge--amber">GCH // RADAR</span>
            <span class="ak-widget__subtag">
              {{ upcomingBanner?.isActive ? 'BANNER IN PROGRESS' : 'NEXT UPCOMING BANNER' }}
            </span>
          </div>
          <span class="ak-banner-chip" :class="`ak-banner-chip--${upcomingBanner?.banner.category || 'standard'}`">
            {{ (upcomingBanner?.banner.category || 'HEADHUNTING').toUpperCase() }}
          </span>
        </div>

        <BannerCardSkeleton v-if="bannerStatus === 'pending' && !upcomingBanner" />
        <div v-else-if="upcomingBanner" class="ak-banner-body">
          <!-- Banner Art Hero with fallback -->
          <div class="ak-banner-art">
            <img
              :src="upcomingBanner.banner.bannerImg || upcomingBanner.banner.bannerImage"
              :alt="upcomingBanner.banner.title || upcomingBanner.banner.name"
              loading="lazy"
              class="ak-banner-art__img"
            />
            <div class="ak-banner-art__overlay">
              <h3 class="ak-banner-art__title">{{ upcomingBanner.banner.title || upcomingBanner.banner.name }}</h3>
              <span class="ak-banner-art__date">
                {{ upcomingBanner.startDate.toLocaleDateString() }} → {{ upcomingBanner.endDate.toLocaleDateString() }}
              </span>
            </div>
          </div>

          <!-- Realtime Digital Countdown Timer -->
          <div class="ak-countdown-box">
            <span class="ak-countdown-label">
              {{ upcomingBanner.isActive ? 'TIME REMAINING UNTIL CONCLUSION:' : 'COMMENCING IN:' }}
            </span>
            <ClientOnly>
              <div class="ak-countdown-digits">
                <div class="ak-digit-cell">
                  <span class="ak-digit-num">{{ String(countdown.days).padStart(2, '0') }}</span>
                  <span class="ak-digit-lbl">DAYS</span>
                </div>
                <span class="ak-digit-sep">:</span>
                <div class="ak-digit-cell">
                  <span class="ak-digit-num">{{ String(countdown.hours).padStart(2, '0') }}</span>
                  <span class="ak-digit-lbl">HRS</span>
                </div>
                <span class="ak-digit-sep">:</span>
                <div class="ak-digit-cell">
                  <span class="ak-digit-num">{{ String(countdown.minutes).padStart(2, '0') }}</span>
                  <span class="ak-digit-lbl">MIN</span>
                </div>
                <span class="ak-digit-sep">:</span>
                <div class="ak-digit-cell">
                  <span class="ak-digit-num ak-text-cyan">{{ String(countdown.seconds).padStart(2, '0') }}</span>
                  <span class="ak-digit-lbl">SEC</span>
                </div>
              </div>
              <template #fallback>
                <div class="ak-countdown-digits">
                  <div class="ak-digit-cell">
                    <span class="ak-digit-num">--</span>
                    <span class="ak-digit-lbl">DAYS</span>
                  </div>
                  <span class="ak-digit-sep">:</span>
                  <div class="ak-digit-cell">
                    <span class="ak-digit-num">--</span>
                    <span class="ak-digit-lbl">HRS</span>
                  </div>
                  <span class="ak-digit-sep">:</span>
                  <div class="ak-digit-cell">
                    <span class="ak-digit-num">--</span>
                    <span class="ak-digit-lbl">MIN</span>
                  </div>
                  <span class="ak-digit-sep">:</span>
                  <div class="ak-digit-cell">
                    <span class="ak-digit-num ak-text-cyan">--</span>
                    <span class="ak-digit-lbl">SEC</span>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- Featured Rate-Up Operators -->
          <div v-if="upcomingBanner.banner.operators && upcomingBanner.banner.operators.length > 0" class="ak-featured-ops">
            <span class="ak-featured-ops__title">FEATURED RATE-UP:</span>
            <div class="ak-featured-ops__list">
              <div
                v-for="op in upcomingBanner.banner.operators.slice(0, 4)"
                :key="op.name"
                class="ak-rateup-pill"
                :class="{ 'ak-rateup-pill--6star': op.rarity === 6 }"
              >
                <img v-if="op.icon" :src="op.icon" :alt="op.name" class="ak-rateup-pill__icon" />
                <span class="ak-rateup-pill__name">{{ op.name }}</span>
                <span class="ak-rateup-pill__stars">{{ '★'.repeat(op.rarity) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="ak-widget-empty">
          <p>SCANNING SATELLITE FOR BANNER SIGNALS...</p>
        </div>

        <div class="ak-widget__footer">
          <NuxtLink to="/gacha" class="ak-widget-btn ak-widget-btn--amber">
            VIEW BANNER TIMELINE & ARCHIVE →
          </NuxtLink>
        </div>
      </div>

      <!-- WIDGET 2: Gacha Savings & Spark Status -->
      <div class="ak-widget ak-widget--gacha">
        <div class="ak-widget__head">
          <div class="ak-widget__tag-group">
            <span class="ak-widget__badge ak-widget__badge--cyan">TREASURY // GACHA</span>
            <span class="ak-widget__subtag">HEADHUNTING WAR CHEST</span>
          </div>
          <span
            class="ak-spark-badge"
            :class="totalAvailablePulls >= 300 ? 'ak-spark-badge--ready' : 'ak-spark-badge--building'"
          >
            {{ totalAvailablePulls >= 300 ? 'SPARK GUARANTEED' : `${pullsMissingForSpark} ROLLS TO SPARK` }}
          </span>
        </div>

        <div class="ak-gacha-body">
          <!-- Big Pulls Gauge -->
          <div class="ak-pulls-summary">
            <div class="ak-pulls-main">
              <span class="ak-pulls-val">{{ totalAvailablePulls }}</span>
              <span class="ak-pulls-unit">PULLS AVAILABLE</span>
            </div>
            <div class="ak-pulls-spark-status">
              <span class="ak-pss-lbl">300-SPARK PROGRESS:</span>
              <strong class="ak-pss-val">{{ sparkProgressPercent }}%</strong>
            </div>
          </div>

          <!-- Spark Progress Bar -->
          <div class="ak-spark-bar">
            <div
              class="ak-spark-bar__fill"
              :style="{ width: `${sparkProgressPercent}%` }"
              :class="{ 'ak-spark-bar__fill--ready': totalAvailablePulls >= 300 }"
            />
            <div class="ak-spark-bar__notch ak-spark-bar__notch--100" style="left: 33.3%;" title="100 pulls" />
            <div class="ak-spark-bar__notch ak-spark-bar__notch--200" style="left: 66.6%;" title="200 pulls" />
          </div>

          <!-- Resource Breakdown Chips -->
          <div class="ak-resource-grid">
            <div class="ak-res-chip">
              <span class="ak-res-chip__label">ORUNDUM</span>
              <strong class="ak-res-chip__num">{{ orundum.toLocaleString() }}</strong>
              <small class="ak-res-chip__sub">≈ {{ pullsFromOrundum }} rolls</small>
            </div>
            <div class="ak-res-chip">
              <span class="ak-res-chip__label">ORIGINITE PRIME</span>
              <strong class="ak-res-chip__num">{{ originitePrime }} OP</strong>
              <small class="ak-res-chip__sub">≈ {{ pullsFromOP }} rolls</small>
            </div>
            <div class="ak-res-chip">
              <span class="ak-res-chip__label">HEADHUNTING PERMITS</span>
              <strong class="ak-res-chip__num">{{ singlePermits }} Single / {{ tenPermits }} Ten-roll</strong>
              <small class="ak-res-chip__sub">= {{ pullsFromTickets }} rolls</small>
            </div>
          </div>

          <!-- Monthly Card Bonus Status -->
          <div class="ak-monthly-status" :class="{ 'ak-monthly-status--active': hasMonthlyCard }">
            <span class="ak-monthly-status__icon">✦</span>
            <div class="ak-monthly-status__text">
              <strong>MONTHLY CARD: {{ hasMonthlyCard ? 'ACTIVE (+200 ORUNDUM / DAY)' : 'INACTIVE' }}</strong>
              <p v-if="hasMonthlyCard">Adds +6,000 Orundum (10 rolls) per calendar month to spark projection.</p>
              <p v-else>Enable Monthly Card in Settings for +200 daily Orundum savings calculations.</p>
            </div>
          </div>
        </div>

        <div class="ak-widget__footer">
          <NuxtLink to="/gacha" class="ak-widget-btn ak-widget-btn--cyan">
            OPEN GACHA SPARK CALCULATOR →
          </NuxtLink>
        </div>
      </div>

      <!-- WIDGET 3: Quick Access to Promotion Targets -->
      <div class="ak-widget ak-widget--targets">
        <div class="ak-widget__head">
          <div class="ak-widget__tag-group">
            <span class="ak-widget__badge ak-widget__badge--green">PLN // TARGETS</span>
            <span class="ak-widget__subtag">ACTIVE PROMOTION GOALS</span>
          </div>
          <span class="ak-target-count-badge">
            {{ plannedTargets.length }} ACTIVE
          </span>
        </div>

        <div class="ak-targets-body">
          <!-- When targets exist in plannerStore -->
          <div v-if="plannedTargets.length > 0" class="ak-target-list">
            <div
              v-for="target in plannedTargets"
              :key="target.operatorId"
              class="ak-dash-target-card"
            >
              <img
                :src="target.operator.avatar"
                :alt="target.operator.name"
                class="ak-dash-target-card__avatar"
              />
              <div class="ak-dash-target-card__info">
                <div class="ak-dash-target-card__title-row">
                  <span class="ak-dash-target-card__name">{{ target.operator.name }}</span>
                  <span class="ak-dash-target-card__prof">{{ target.operator.profession }}</span>
                </div>
                <!-- Goals Badges -->
                <div class="ak-dash-target-card__goals">
                  <span class="ak-goal-chip ak-goal-chip--elite">
                    E{{ target.currentElite }}→E{{ target.targetElite }}
                  </span>
                  <span class="ak-goal-chip ak-goal-chip--level">
                    L{{ target.targetLevel }}
                  </span>
                  <span v-if="target.targetMastery > 0" class="ak-goal-chip ak-goal-chip--mastery">
                    M{{ target.targetMastery }}
                  </span>
                  <span v-if="target.targetModule > 0" class="ak-goal-chip ak-goal-chip--module">
                    MOD {{ target.targetModule }}
                  </span>
                </div>
              </div>
              <NuxtLink
                :to="`/planner?op=${target.operatorId}`"
                class="ak-dash-target-card__link"
                title="Open in Operator Promotion Planner"
              >
                GO →
              </NuxtLink>
            </div>
          </div>

          <!-- When planner is empty, show quick add suggestions -->
          <div v-else class="ak-empty-targets">
            <p class="ak-empty-targets__msg">NO OPERATOR TARGETS PLANNED YET.</p>
            <span class="ak-empty-targets__sub">Click an elite operator below to add to promotion plan:</span>

            <div class="ak-suggested-grid">
              <button
                v-for="op in suggestedOperators"
                :key="op.id"
                type="button"
                class="ak-suggest-btn"
                @click="quickAddSuggested(op)"
              >
                <img :src="op.avatar" :alt="op.name" class="ak-suggest-btn__avatar" />
                <span class="ak-suggest-btn__name">{{ op.name }}</span>
                <span class="ak-suggest-btn__action">+ PLAN</span>
              </button>
            </div>
          </div>
        </div>

        <div class="ak-widget__footer">
          <NuxtLink to="/planner" class="ak-widget-btn ak-widget-btn--green">
            OPEN FULL PROMOTION PLANNER →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Tactical Terminal Modules Launcher Grid -->
    <section class="ak-modules-section">
      <div class="ak-modules-section__header">
        <span class="ak-modules-section__tag">RHODES ISLAND TERMINAL // APPS</span>
        <h2 class="ak-modules-section__title">TACTICAL MODULES</h2>
      </div>

      <div class="ak-modules-grid">
        <NuxtLink
          v-for="mod in modules"
          :key="mod.path"
          :to="mod.path"
          class="ak-mod-card"
          :class="`ak-mod-card--${mod.accent}`"
        >
          <div class="ak-mod-card__header">
            <span class="ak-mod-card__code">{{ mod.code }}</span>
            <span class="ak-mod-card__badge">{{ mod.badge }}</span>
          </div>
          <h3 class="ak-mod-card__title">{{ mod.title }}</h3>
          <p class="ak-mod-card__desc">{{ mod.description }}</p>
          <div class="ak-mod-card__footer">
            <span>INITIALIZE MODULE</span>
            <span class="ak-mod-card__arrow">→</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Account Sync Modal -->
    <AccountSyncModal
      :is-open="isSyncModalOpen"
      @close="isSyncModalOpen = false"
      @synced="isSyncModalOpen = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.ak-dash {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  // Hero Section
  &__hero {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__hero-meta {
    max-width: 720px;
  }

  &__status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.6rem;
    background: rgba($ak-cyan, 0.1);
    border-left: 2px solid $ak-cyan;
    font-size: 0.65rem;
    font-family: monospace;
    letter-spacing: 1.5px;
    color: $ak-cyan;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 1.5px;
    color: $ak-text-primary;
    margin: 0.25rem 0 0.5rem;
    line-height: 1.1;

    @media (min-width: 640px) {
      font-size: 2.3rem;
      letter-spacing: 2px;
    }

    @media (min-width: 1024px) {
      font-size: 2.8rem;
    }
  }

  &__subtitle {
    font-size: 0.9rem;
    color: $ak-text-secondary;
    margin: 0;
    line-height: 1.45;

    @media (min-width: 640px) {
      font-size: 1rem;
    }
  }
}

.ak-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $ak-cyan;
  box-shadow: 0 0 6px $ak-cyan;
}

// Doctor Badge
.ak-doctor-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 1rem;
  background: rgba(26, 26, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid $ak-cyan;
  backdrop-filter: blur(8px);

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__name {
    font-size: 0.95rem;
    font-weight: 800;
    color: $ak-text-primary;
  }

  &__level {
    font-size: 0.68rem;
    font-family: monospace;
    color: $ak-cyan;
  }

  &__action {
    margin-left: 0.5rem;
    color: $ak-text-muted;
    font-size: 1rem;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $ak-cyan;
    }
  }
}

.ak-avatar-placeholder {
  font-size: 0.8rem;
  font-weight: 800;
  font-family: monospace;
  color: $ak-cyan;
}

// Unsynced Alert Banner
.ak-unsynced-banner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba($ak-amber, 0.08);
  border: 1px solid rgba($ak-amber, 0.3);
  border-left: 4px solid $ak-amber;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    @media (min-width: 640px) {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }
  }

  &__badge {
    align-self: flex-start;
    padding: 0.2rem 0.5rem;
    font-family: monospace;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 1px;
    background: rgba($ak-amber, 0.2);
    color: $ak-amber;
    border: 1px solid rgba($ak-amber, 0.5);
    white-space: nowrap;
  }

  &__text {
    strong {
      display: block;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      color: $ak-amber;
      margin-bottom: 0.2rem;
    }

    p {
      margin: 0;
      font-size: 0.78rem;
      color: $ak-text-secondary;
      line-height: 1.4;
      max-width: 680px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
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

// Tactical Ribbon
.ak-ribbon {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-ribbon-pill {
  flex: 1;
  min-width: 170px;
  padding: 0.65rem 0.95rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-family: monospace;

  &__label {
    font-size: 0.65rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__val {
    font-size: 0.95rem;
    color: $ak-text-primary;
  }
}

// Widgets Grid
.ak-widgets-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

// Individual Widget Card
.ak-widget {
  background: rgba(22, 22, 26, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  transition: border-color 0.25s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.18);
  }

  &--banner {
    border-top: 2px solid $ak-amber;
  }

  &--gacha {
    border-top: 2px solid $ak-cyan;
  }

  &--targets {
    border-top: 2px solid $ak-green;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__tag-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__badge {
    font-size: 0.65rem;
    font-family: monospace;
    font-weight: 800;
    padding: 0.15rem 0.4rem;
    letter-spacing: 1px;

    &--amber {
      background: rgba($ak-amber, 0.15);
      color: $ak-amber;
    }

    &--cyan {
      background: rgba($ak-cyan, 0.15);
      color: $ak-cyan;
    }

    &--green {
      background: rgba($ak-green, 0.15);
      color: $ak-green;
    }
  }

  &__subtag {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-text-muted;
  }

  &__footer {
    padding: 0.85rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.2);
  }
}

.ak-widget-btn {
  display: block;
  text-align: center;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-decoration: none;
  padding: 0.5rem;
  transition: all 0.2s ease;

  &--amber {
    color: $ak-amber;
    border: 1px solid rgba($ak-amber, 0.3);
    background: rgba($ak-amber, 0.06);

    &:hover {
      background: $ak-amber;
      color: #000;
    }
  }

  &--cyan {
    color: $ak-cyan;
    border: 1px solid rgba($ak-cyan, 0.3);
    background: rgba($ak-cyan, 0.06);

    &:hover {
      background: $ak-cyan;
      color: #000;
    }
  }

  &--green {
    color: $ak-green;
    border: 1px solid rgba($ak-green, 0.3);
    background: rgba($ak-green, 0.06);

    &:hover {
      background: $ak-green;
      color: #000;
    }
  }
}

// Widget 1: Banner internals
.ak-banner-chip {
  font-size: 0.6rem;
  font-family: monospace;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-secondary;

  &--limited {
    border-color: rgba($ak-amber, 0.4);
    color: $ak-amber;
  }
}

.ak-banner-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ak-banner-art {
  position: relative;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.75;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(10, 10, 14, 0.9) 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0.75rem;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 800;
    margin: 0;
    color: #fff;
    line-height: 1.2;
  }

  &__date {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-amber;
    margin-top: 0.15rem;
  }
}

// Digital Countdown Box
.ak-countdown-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem;
  text-align: center;
}

.ak-countdown-label {
  font-size: 0.62rem;
  font-family: monospace;
  color: $ak-text-muted;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 0.4rem;
}

.ak-countdown-digits {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.ak-digit-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}

.ak-digit-num {
  font-size: 1.4rem;
  font-weight: 900;
  font-family: monospace;
  color: $ak-text-primary;
  line-height: 1;
}

.ak-digit-lbl {
  font-size: 0.58rem;
  font-family: monospace;
  color: $ak-text-muted;
  margin-top: 0.2rem;
}

.ak-digit-sep {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.3);
  font-family: monospace;
  margin-bottom: 0.6rem;
}

// Rate Up Operators
.ak-featured-ops {
  &__title {
    font-size: 0.62rem;
    font-family: monospace;
    color: $ak-text-muted;
    display: block;
    margin-bottom: 0.4rem;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
}

.ak-rateup-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.45rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.68rem;

  &__icon {
    width: 20px;
    height: 20px;
    border-radius: 2px;
  }

  &__name {
    color: $ak-text-primary;
    font-weight: 600;
  }

  &__stars {
    color: $ak-yellow;
    font-size: 0.6rem;
  }

  &--6star {
    border-color: rgba($ak-amber, 0.35);
    background: rgba($ak-amber, 0.08);
  }
}

// Widget 2: Gacha Savings internals
.ak-spark-badge {
  font-size: 0.62rem;
  font-family: monospace;
  font-weight: 700;
  padding: 0.15rem 0.45rem;

  &--ready {
    background: rgba($ak-green, 0.15);
    color: $ak-green;
    border: 1px solid rgba($ak-green, 0.4);
  }

  &--building {
    background: rgba($ak-cyan, 0.1);
    color: $ak-cyan;
    border: 1px solid rgba($ak-cyan, 0.3);
  }
}

.ak-gacha-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ak-pulls-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.ak-pulls-main {
  display: flex;
  flex-direction: column;
}

.ak-pulls-val {
  font-size: 2.2rem;
  font-weight: 900;
  font-family: monospace;
  color: $ak-cyan;
  line-height: 1;
}

.ak-pulls-unit {
  font-size: 0.68rem;
  font-family: monospace;
  color: $ak-text-muted;
  letter-spacing: 1px;
  margin-top: 0.25rem;
}

.ak-pulls-spark-status {
  text-align: right;
  font-family: monospace;

  .ak-pss-lbl {
    font-size: 0.62rem;
    color: $ak-text-muted;
    display: block;
  }

  .ak-pss-val {
    font-size: 1.1rem;
    color: $ak-text-primary;
  }
}

.ak-spark-bar {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $ak-cyan, $ak-cyan-dark);
    transition: width 0.4s ease;

    &--ready {
      background: linear-gradient(90deg, $ak-green, $ak-cyan);
    }
  }

  &__notch {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(0, 0, 0, 0.6);
  }
}

.ak-resource-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ak-res-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: monospace;
  font-size: 0.72rem;

  &__label {
    color: $ak-text-muted;
  }

  &__num {
    color: $ak-text-primary;
  }

  &__sub {
    color: $ak-cyan;
  }
}

.ak-monthly-status {
  display: flex;
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);

  &__icon {
    color: $ak-text-muted;
    font-size: 0.9rem;
  }

  &__text {
    strong {
      font-size: 0.72rem;
      font-family: monospace;
      color: $ak-text-secondary;
    }

    p {
      margin: 0.15rem 0 0;
      font-size: 0.65rem;
      color: $ak-text-muted;
    }
  }

  &--active {
    border-color: rgba($ak-green, 0.3);
    background: rgba($ak-green, 0.04);

    .ak-monthly-status__icon {
      color: $ak-green;
    }

    strong {
      color: $ak-green;
    }
  }
}

// Widget 3: Targets internals
.ak-target-count-badge {
  font-size: 0.62rem;
  font-family: monospace;
  color: $ak-green;
  background: rgba($ak-green, 0.12);
  padding: 0.15rem 0.4rem;
}

.ak-targets-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ak-target-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ak-dash-target-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
  }

  &__avatar {
    width: 42px;
    height: 42px;
    border-radius: 4px;
    background: #000;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__name {
    font-size: 0.85rem;
    font-weight: 700;
    color: $ak-text-primary;
  }

  &__prof {
    font-size: 0.65rem;
    color: $ak-text-muted;
    font-family: monospace;
  }

  &__goals {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__link {
    font-size: 0.72rem;
    font-family: monospace;
    font-weight: 800;
    color: $ak-green;
    text-decoration: none;
    padding: 0.25rem 0.45rem;
    border: 1px solid rgba($ak-green, 0.3);
    background: rgba($ak-green, 0.08);
    transition: all 0.2s ease;

    &:hover {
      background: $ak-green;
      color: #000;
    }
  }
}

.ak-goal-chip {
  font-size: 0.62rem;
  font-family: monospace;
  padding: 0.1rem 0.35rem;

  &--elite {
    background: rgba($ak-cyan, 0.12);
    color: $ak-cyan;
  }

  &--level {
    background: rgba(255, 255, 255, 0.06);
    color: $ak-text-primary;
  }

  &--mastery {
    background: rgba($ak-amber, 0.12);
    color: $ak-amber;
  }

  &--module {
    background: rgba(255, 255, 255, 0.08);
    color: $ak-yellow;
  }
}

.ak-empty-targets {
  text-align: center;
  padding: 0.5rem 0;

  &__msg {
    font-size: 0.78rem;
    font-family: monospace;
    color: $ak-text-secondary;
    margin: 0;
  }

  &__sub {
    font-size: 0.68rem;
    color: $ak-text-muted;
    display: block;
    margin: 0.25rem 0 0.75rem;
  }
}

.ak-suggested-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.ak-suggest-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 2px;
  }

  &__name {
    flex: 1;
    font-size: 0.72rem;
    font-weight: 700;
    color: $ak-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__action {
    font-size: 0.62rem;
    font-family: monospace;
    font-weight: 800;
    color: $ak-green;
  }

  &:hover {
    border-color: $ak-green;
    background: rgba($ak-green, 0.08);
  }
}

// Tactical Modules Launcher Section
.ak-modules-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.75rem;
  }

  &__tag {
    font-size: 0.68rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: $ak-text-primary;
    margin: 0.2rem 0 0;
  }
}

.ak-modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.ak-mod-card {
  position: relative;
  background: rgba(24, 24, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: all 0.25s ease;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);

  &:hover {
    transform: translateY(-2px);
    background: rgba(34, 34, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__code {
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: $ak-text-muted;
  }

  &__badge {
    font-size: 0.58rem;
    font-family: monospace;
    padding: 0.15rem 0.4rem;
    background: rgba(255, 255, 255, 0.05);
    color: $ak-text-secondary;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    color: $ak-text-primary;
  }

  &__desc {
    font-size: 0.8rem;
    color: $ak-text-secondary;
    margin: 0;
    line-height: 1.4;
    flex: 1;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: monospace;
    font-size: 0.68rem;
    color: $ak-text-muted;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 0.65rem;
    margin-top: 0.25rem;
  }

  &__arrow {
    transition: transform 0.2s ease;
  }

  &:hover &__arrow {
    transform: translateX(4px);
  }

  // Accent Variants
  &--cyan {
    border-left: 3px solid $ak-cyan;
    &:hover {
      box-shadow: 0 4px 20px rgba($ak-cyan, 0.15);
      border-color: $ak-cyan;
    }
  }

  &--amber {
    border-left: 3px solid $ak-amber;
    &:hover {
      box-shadow: 0 4px 20px rgba($ak-amber, 0.15);
      border-color: $ak-amber;
    }
  }

  &--yellow {
    border-left: 3px solid $ak-yellow;
    &:hover {
      box-shadow: 0 4px 20px rgba($ak-yellow, 0.15);
      border-color: $ak-yellow;
    }
  }

  &--green {
    border-left: 3px solid $ak-green;
    &:hover {
      box-shadow: 0 4px 20px rgba($ak-green, 0.15);
      border-color: $ak-green;
    }
  }
}

.ak-text-cyan {
  color: $ak-cyan !important;
}

.ak-text-green {
  color: $ak-green !important;
}

.ak-text-amber {
  color: $ak-amber !important;
}

.ak-text-muted {
  color: $ak-text-muted !important;
}
</style>
