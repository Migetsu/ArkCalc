<script setup lang="ts">
import { ref, computed } from 'vue'
import rawBanners from '~/assets/data/banners.json'
import type { BannerData, BannerWithGlobalDates } from '~/types'

// Props allowing custom initial offset or custom banners
const props = withDefaults(
  defineProps<{
    initialOffsetDays?: number
    banners?: BannerData[]
  }>(),
  {
    initialOffsetDays: 175,
    banners: () => rawBanners as BannerData[],
  }
)

// Reactive offset (default 175 days as requested)
const offsetDays = ref(props.initialOffsetDays)
const selectedFilter = ref<'all' | 'limited' | 'collab' | 'standard'>('all')
const searchQuery = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const now = new Date()

/**
 * Calculates estimated Global release date based on CN date and day offset
 */
const addDays = (dateStr: string, days: number): Date => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Formats a date into a clean YYYY-MM-DD representation
 */
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Banners computed with Global dates and status
 */
const processedBanners = computed<BannerWithGlobalDates[]>(() => {
  return props.banners.map((banner) => {
    const globalStart = addDays(banner.cnStartDate, offsetDays.value)
    const globalEnd = addDays(banner.cnEndDate, offsetDays.value)

    let status: 'upcoming' | 'active' | 'passed' = 'upcoming'
    let daysUntilGlobal = 0

    if (now > globalEnd) {
      status = 'passed'
      daysUntilGlobal = 0
    } else if (now >= globalStart && now <= globalEnd) {
      status = 'active'
      daysUntilGlobal = Math.ceil(
        (globalEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    } else {
      status = 'upcoming'
      daysUntilGlobal = Math.ceil(
        (globalStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    return {
      ...banner,
      estimatedGlobalStartDate: globalStart,
      estimatedGlobalEndDate: globalEnd,
      daysUntilGlobal,
      status,
    }
  })
})

/**
 * Filtered and sorted banners
 */
const filteredBanners = computed(() => {
  let list = processedBanners.value

  // Type Filter
  if (selectedFilter.value !== 'all') {
    list = list.filter((b) => b.type === selectedFilter.value)
  }

  // Search query (banner name or operator name)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.nameZh && b.nameZh.toLowerCase().includes(q)) ||
        b.featuredOperators.some((op) => op.name.toLowerCase().includes(q))
    )
  }

  // Sort by Global Start Date
  return list.slice().sort((a, b) => {
    const timeA = a.estimatedGlobalStartDate.getTime()
    const timeB = b.estimatedGlobalStartDate.getTime()
    return sortOrder.value === 'asc' ? timeA - timeB : timeB - timeA
  })
})
</script>

<template>
  <div class="ak-timeline">
    <!-- Header / Controls Bar -->
    <header class="ak-timeline__controls">
      <div class="ak-timeline__info">
        <h2 class="ak-timeline__title">CN → GLOBAL BANNER SCHEDULE</h2>
        <span class="ak-timeline__offset-badge">
          GLOBAL OFFSET: {{ offsetDays }} DAYS
        </span>
      </div>

      <div class="ak-timeline__filter-row">
        <!-- Search -->
        <div class="ak-search">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search banner or operator..."
            class="ak-search__input"
          />
        </div>

        <!-- Type Filter Tabs -->
        <div class="ak-filter-tabs">
          <button
            type="button"
            class="ak-filter-tab"
            :class="{ 'ak-filter-tab--active': selectedFilter === 'all' }"
            @click="selectedFilter = 'all'"
          >
            ALL
          </button>
          <button
            type="button"
            class="ak-filter-tab"
            :class="{ 'ak-filter-tab--active': selectedFilter === 'limited' }"
            @click="selectedFilter = 'limited'"
          >
            LIMITED
          </button>
          <button
            type="button"
            class="ak-filter-tab"
            :class="{ 'ak-filter-tab--active': selectedFilter === 'collab' }"
            @click="selectedFilter = 'collab'"
          >
            COLLAB
          </button>
          <button
            type="button"
            class="ak-filter-tab"
            :class="{ 'ak-filter-tab--active': selectedFilter === 'standard' }"
            @click="selectedFilter = 'standard'"
          >
            STANDARD
          </button>
        </div>

        <!-- Offset Slider Tool -->
        <div class="ak-offset-adjuster">
          <label for="offsetRange" class="ak-offset-adjuster__label">
            Offset: <strong>{{ offsetDays }}d</strong>
          </label>
          <input
            id="offsetRange"
            v-model.number="offsetDays"
            type="range"
            min="150"
            max="200"
            step="1"
            class="ak-offset-adjuster__range"
          />
        </div>
      </div>
    </header>

    <!-- Timeline Body -->
    <div v-if="filteredBanners.length > 0" class="ak-timeline__track">
      <div
        v-for="banner in filteredBanners"
        :key="banner.id"
        class="ak-timeline-item"
        :class="`ak-timeline-item--${banner.status}`"
      >
        <!-- Timeline Node Dot -->
        <div class="ak-timeline-item__connector">
          <div class="ak-timeline-item__node" />
          <div class="ak-timeline-item__line" />
        </div>

        <!-- Date Column -->
        <div class="ak-timeline-item__date-col">
          <div class="ak-date-badge">
            <span class="ak-date-badge__label">EST. GLOBAL</span>
            <span class="ak-date-badge__date">
              {{ formatDate(banner.estimatedGlobalStartDate) }}
            </span>
          </div>
          <div class="ak-date-badge ak-date-badge--secondary">
            <span class="ak-date-badge__label">CN ORIGINAL</span>
            <span class="ak-date-badge__date">
              {{ formatDate(banner.cnStartDate) }}
            </span>
          </div>
        </div>

        <!-- Card Content -->
        <div class="ak-banner-card" :class="`ak-banner-card--${banner.type}`">
          <!-- Card Header -->
          <div class="ak-banner-card__header">
            <div class="ak-banner-card__tags">
              <span class="ak-tag ak-tag--type">{{ banner.category }}</span>
              <span
                v-if="banner.status === 'active'"
                class="ak-tag ak-tag--status ak-tag--status-active"
              >
                ● ACTIVE (ENDS IN {{ banner.daysUntilGlobal }}D)
              </span>
              <span
                v-else-if="banner.status === 'upcoming'"
                class="ak-tag ak-tag--status ak-tag--status-upcoming"
              >
                IN ~{{ banner.daysUntilGlobal }} DAYS
              </span>
              <span v-else class="ak-tag ak-tag--status ak-tag--status-passed">
                CONCLUDED
              </span>
            </div>

            <div class="ak-banner-card__perks">
              <span v-if="banner.freePulls > 0" class="ak-perk ak-perk--free">
                🎁 {{ banner.freePulls }} FREE PULLS
              </span>
              <span class="ak-perk ak-perk--spark">
                ⚡ {{ banner.sparkCost }} SPARK
              </span>
            </div>
          </div>

          <!-- Banner Title -->
          <div class="ak-banner-card__title-box">
            <h3 class="ak-banner-card__title">{{ banner.name }}</h3>
            <span v-if="banner.nameZh" class="ak-banner-card__subtitle">
              {{ banner.nameZh }}
            </span>
          </div>

          <p class="ak-banner-card__desc">{{ banner.description }}</p>

          <!-- Featured Operators Section -->
          <div class="ak-banner-card__operators">
            <span class="ak-banner-card__operators-label">RATE-UP OPERATORS:</span>
            <div class="ak-operator-list">
              <div
                v-for="op in banner.featuredOperators"
                :key="op.id"
                class="ak-op-badge"
                :class="[
                  `ak-op-badge--r${op.rarity}`,
                  { 'ak-op-badge--limited': op.isLimited },
                ]"
              >
                <div class="ak-op-badge__avatar">
                  <img
                    v-if="op.avatar"
                    :src="op.avatar"
                    :alt="op.name"
                    loading="lazy"
                    @error="($event.target as HTMLElement).style.display = 'none'"
                  />
                  <div class="ak-op-badge__rarity-stars">
                    {{ '★'.repeat(op.rarity) }}
                  </div>
                </div>
                <div class="ak-op-badge__info">
                  <span class="ak-op-badge__name">{{ op.name }}</span>
                  <span class="ak-op-badge__class">
                    {{ op.profession }}
                    <strong v-if="op.isLimited" class="ak-op-badge__limited-flag">
                      [LIMITED]
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="ak-timeline__empty">
      <p>NO BANNERS MATCH CURRENT FILTER CRITERIA</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-family: inherit;

  // Controls Header
  &__controls {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
    background: rgba($ak-bg-secondary, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  }

  &__info {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: 2px;
    margin: 0;
    color: $ak-text-primary;
  }

  &__offset-badge {
    padding: 0.25rem 0.6rem;
    font-size: 0.75rem;
    font-family: monospace;
    font-weight: 700;
    background: rgba($ak-cyan, 0.15);
    color: $ak-cyan;
    border: 1px solid rgba($ak-cyan, 0.4);
    letter-spacing: 1px;
  }

  &__filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  // Track Layout
  &__track {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
  }

  &__empty {
    padding: 3rem;
    text-align: center;
    font-family: monospace;
    color: $ak-text-muted;
    border: 1px dashed rgba(255, 255, 255, 0.1);
  }
}

// Search Input
.ak-search {
  flex: 1;
  min-width: 220px;

  &__input {
    width: 100%;
    padding: 0.5rem 0.85rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: $ak-text-primary;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: $ak-cyan;
      box-shadow: 0 0 8px rgba($ak-cyan, 0.3);
    }
  }
}

// Filter Tabs
.ak-filter-tabs {
  display: flex;
  gap: 0.35rem;
}

.ak-filter-tab {
  padding: 0.45rem 0.85rem;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.04);
  color: $ak-text-secondary;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

// Offset slider tool
.ak-offset-adjuster {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: $ak-text-secondary;

  &__label {
    white-space: nowrap;
    strong {
      color: $ak-cyan;
    }
  }

  &__range {
    cursor: pointer;
    accent-color: $ak-cyan;
    width: 100px;
  }
}

// Timeline Item
.ak-timeline-item {
  display: grid;
  grid-template-columns: 24px 170px 1fr;
  gap: 1.5rem;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 20px 1fr;
    gap: 1rem;
  }

  &__connector {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__node {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: $ak-bg-main;
    border: 2px solid rgba(255, 255, 255, 0.3);
    margin-top: 1.5rem;
    z-index: 2;
    transition: all 0.2s ease;
  }

  &__line {
    flex: 1;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
    margin-top: 4px;
  }

  &--active &__node {
    border-color: $ak-green;
    background: $ak-green;
    box-shadow: 0 0 10px rgba($ak-green, 0.8);
  }

  &--upcoming &__node {
    border-color: $ak-cyan;
    background: $ak-bg-main;
    box-shadow: 0 0 8px rgba($ak-cyan, 0.4);
  }

  // Date column
  &__date-col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1.25rem;

    @media (max-width: 768px) {
      grid-column: 2 / -1;
      flex-direction: row;
      flex-wrap: wrap;
      padding-top: 0;
    }
  }
}

.ak-date-badge {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0.6rem;
  background: rgba(0, 0, 0, 0.4);
  border-left: 2px solid $ak-cyan;
  font-family: monospace;

  &__label {
    font-size: 0.6rem;
    letter-spacing: 1px;
    color: $ak-cyan;
    font-weight: 700;
  }

  &__date {
    font-size: 0.85rem;
    font-weight: 600;
    color: $ak-text-primary;
  }

  &--secondary {
    border-left-color: rgba(255, 255, 255, 0.2);

    .ak-date-badge__label {
      color: $ak-text-muted;
    }

    .ak-date-badge__date {
      color: $ak-text-secondary;
      font-size: 0.75rem;
    }
  }
}

// Banner Card
.ak-banner-card {
  background: rgba(24, 24, 28, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  transition: all 0.25s ease;
  backdrop-filter: blur(6px);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(30, 31, 36, 0.9);
  }

  &--limited {
    border-left: 3px solid $ak-rarity-6;
  }

  &--collab {
    border-left: 3px solid $ak-purple;
  }

  &--standard {
    border-left: 3px solid $ak-cyan;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__perks {
    display: flex;
    gap: 0.5rem;
  }

  &__title-box {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: 1px;
    margin: 0;
    color: $ak-text-primary;
  }

  &__subtitle {
    font-size: 0.85rem;
    color: $ak-text-muted;
    font-family: monospace;
  }

  &__desc {
    font-size: 0.875rem;
    color: $ak-text-secondary;
    margin: 0;
    line-height: 1.45;
  }

  &__operators {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }

  &__operators-label {
    font-size: 0.65rem;
    font-family: monospace;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: $ak-text-muted;
  }
}

// Tags & Perks
.ak-tag {
  font-size: 0.65rem;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.2rem 0.5rem;

  &--type {
    background: rgba(255, 255, 255, 0.08);
    color: $ak-text-primary;
  }

  &--status-active {
    background: rgba($ak-green, 0.15);
    color: $ak-green;
    border: 1px solid rgba($ak-green, 0.4);
  }

  &--status-upcoming {
    background: rgba($ak-cyan, 0.12);
    color: $ak-cyan;
    border: 1px solid rgba($ak-cyan, 0.35);
  }

  &--status-passed {
    background: rgba(255, 255, 255, 0.04);
    color: $ak-text-muted;
  }
}

.ak-perk {
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  padding: 0.2rem 0.5rem;

  &--free {
    background: rgba($ak-amber, 0.15);
    color: $ak-amber;
    border: 1px solid rgba($ak-amber, 0.4);
  }

  &--spark {
    background: rgba(255, 255, 255, 0.05);
    color: $ak-text-secondary;
  }
}

// Operator Badges
.ak-operator-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-op-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.65rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.55);
  }

  &--r6 {
    border-color: rgba($ak-rarity-6, 0.5);
    .ak-op-badge__rarity-stars {
      color: $ak-rarity-6;
    }
  }

  &--r5 {
    border-color: rgba($ak-rarity-5, 0.4);
    .ak-op-badge__rarity-stars {
      color: $ak-rarity-5;
    }
  }

  &--limited {
    background: linear-gradient(
      90deg,
      rgba($ak-rarity-6, 0.12) 0%,
      rgba(0, 0, 0, 0.35) 100%
    );
  }

  &__avatar {
    width: 38px;
    height: 38px;
    position: relative;
    background: #101012;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__rarity-stars {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 0.5rem;
    line-height: 1;
    background: rgba(0, 0, 0, 0.7);
    text-align: center;
    letter-spacing: -1px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__name {
    font-size: 0.825rem;
    font-weight: 700;
    color: $ak-text-primary;
  }

  &__class {
    font-size: 0.65rem;
    color: $ak-text-muted;
    font-family: monospace;
  }

  &__limited-flag {
    color: $ak-rarity-6;
    font-weight: 800;
  }
}
</style>
