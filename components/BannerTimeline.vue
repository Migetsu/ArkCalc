<script setup lang="ts">
import { ref, computed } from 'vue'
import fallbackBanners from '~/assets/data/banners.json'

interface RateUpOperator {
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
  operators: RateUpOperator[]
}

// Props
const props = withDefaults(
  defineProps<{
    initialOffsetDays?: number
  }>(),
  {
    initialOffsetDays: 175,
  }
)

// Reactive State
const offsetDays = ref(props.initialOffsetDays)
const selectedCategory = ref<string>('all')
const searchQuery = ref<string>('')
const sortAscending = ref<boolean>(true) // true: oldest at top, newest at bottom (matching wiki default)

// Fetch banners from server API which parses arknights.wiki.gg/wiki/Headhunting/Banners/Upcoming
const { data: apiResponse, pending: isLoading, refresh } = useFetch('/api/banners', {
  default: () => ({
    source: 'local-fallback',
    updatedAt: new Date().toISOString(),
    banners: fallbackBanners as BannerItem[],
  }),
})

const rawBanners = computed<BannerItem[]>(() => {
  return (apiResponse.value?.banners as BannerItem[]) || (fallbackBanners as BannerItem[])
})

// Date helpers
const addDays = (dateStr: string, days: number): Date => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

const formatDate = (d: Date | string): string => {
  const dateObj = typeof d === 'string' ? new Date(d) : d
  if (isNaN(dateObj.getTime())) return ''
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const now = new Date()

// Processed banners with Global dates and status
const processedBanners = computed(() => {
  return rawBanners.value.map((b) => {
    const globalStart = addDays(b.cnStartDate, offsetDays.value)
    const globalEnd = b.cnEndDate ? addDays(b.cnEndDate, offsetDays.value) : addDays(b.cnStartDate, offsetDays.value + 14)

    let status: 'upcoming' | 'active' | 'passed' = 'upcoming'
    let daysUntilGlobal = 0

    if (now > globalEnd) {
      status = 'passed'
      daysUntilGlobal = 0
    } else if (now >= globalStart && now <= globalEnd) {
      status = 'active'
      daysUntilGlobal = Math.ceil((globalEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      status = 'upcoming'
      daysUntilGlobal = Math.ceil((globalStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Split operators by rarity
    const sixStarOps = (b.operators || []).filter((op) => op.rarity === 6)
    const fiveStarOps = (b.operators || []).filter((op) => op.rarity === 5)
    const otherOps = (b.operators || []).filter((op) => op.rarity < 5)

    return {
      ...b,
      globalStartDate: globalStart,
      globalEndDate: globalEnd,
      daysUntilGlobal,
      status,
      sixStarOps,
      fiveStarOps,
      otherOps,
    }
  })
})

// Filtered and sorted banners
// Default sort: oldest at the top (ascending by cnStartDate), newest at the bottom
const filteredBanners = computed(() => {
  let list = [...processedBanners.value]

  // Category filter
  if (selectedCategory.value !== 'all') {
    list = list.filter((b) => {
      if (selectedCategory.value === 'limited') {
        return b.type === 'limited' || b.category === 'Limited'
      }
      if (selectedCategory.value === 'crossover') {
        return b.type === 'crossover' || b.category === 'Collab'
      }
      if (selectedCategory.value === 'joint') {
        return b.type === 'joint' || b.category === 'Joint Operation'
      }
      if (selectedCategory.value === 'orienteering') {
        return b.type === 'orienteering' || b.category === 'Orienteering'
      }
      if (selectedCategory.value === 'standard') {
        return b.type === 'standard' || b.category === 'Standard'
      }
      return true
    })
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(q) || b.name.toLowerCase().includes(q)
      const matchOp = b.operators?.some((op) => op.name.toLowerCase().includes(q))
      return matchTitle || matchOp
    })
  }

  // Sort: sortAscending = true -> oldest at top, newest at bottom (wiki order)
  list.sort((a, b) => {
    const timeA = new Date(a.cnStartDate).getTime()
    const timeB = new Date(b.cnStartDate).getTime()
    return sortAscending.value ? timeA - timeB : timeB - timeA
  })

  return list
})

// Fallback image helper
const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = 'https://raw.githubusercontent.com/Aceship/Arknight-Images/master/ui/banner/banner_placeholder.png'
  }
}
</script>

<template>
  <div class="ak-banner-timeline">
    <!-- Header Control Strip -->
    <div class="ak-timeline-controls">
      <div class="ak-controls-top">
        <div class="ak-source-badge">
          <span class="ak-source-dot" :class="{ 'ak-source-dot--live': apiResponse?.source === 'wiki.gg' }" />
          <span class="ak-source-text">
            DATA SOURCE: <strong>arknights.wiki.gg</strong>
            <span v-if="apiResponse?.source === 'wiki.gg'"> (LIVE)</span>
            <span v-else> (LOCAL CACHE)</span>
          </span>
        </div>

        <div class="ak-controls-actions">
          <button
            class="ak-btn-refresh"
            :disabled="isLoading"
            @click="() => refresh()"
          >
            <span v-if="isLoading" class="ak-spinner" />
            <span v-else>↻</span>
            REFRESH FROM WIKI
          </button>
        </div>
      </div>

      <!-- Offset & Filters Toolbar -->
      <div class="ak-toolbar-row">
        <!-- Offset Adjuster -->
        <div class="ak-offset-adjuster">
          <span class="ak-offset-label">GLOBAL OFFSET:</span>
          <button class="ak-offset-step" @click="offsetDays = Math.max(0, offsetDays - 5)">-5d</button>
          <div class="ak-offset-value">
            <strong>{{ offsetDays }}</strong> DAYS
          </div>
          <button class="ak-offset-step" @click="offsetDays += 5">+5d</button>
          <button
            v-if="offsetDays !== 175"
            class="ak-offset-reset"
            @click="offsetDays = 175"
          >
            RESET (175d)
          </button>
        </div>

        <!-- Sort Toggle -->
        <div class="ak-sort-toggle">
          <button
            class="ak-sort-btn"
            :class="{ 'ak-sort-btn--active': sortAscending }"
            @click="sortAscending = !sortAscending"
            :title="sortAscending ? 'Oldest at top, newest at bottom (Wiki order)' : 'Newest at top, oldest at bottom'"
          >
            <span class="ak-sort-icon">{{ sortAscending ? '⬇' : '⬆' }}</span>
            <span>{{ sortAscending ? 'OLDEST AT TOP (WIKI ORDER)' : 'NEWEST AT TOP' }}</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs & Search -->
      <div class="ak-filter-row">
        <div class="ak-category-tabs">
          <button
            class="ak-cat-btn"
            :class="{ 'ak-cat-btn--active': selectedCategory === 'all' }"
            @click="selectedCategory = 'all'"
          >
            ALL ({{ rawBanners.length }})
          </button>
          <button
            class="ak-cat-btn ak-cat-btn--limited"
            :class="{ 'ak-cat-btn--active': selectedCategory === 'limited' }"
            @click="selectedCategory = 'limited'"
          >
            LIMITED
          </button>
          <button
            class="ak-cat-btn ak-cat-btn--collab"
            :class="{ 'ak-cat-btn--active': selectedCategory === 'crossover' }"
            @click="selectedCategory = 'crossover'"
          >
            CROSSOVER
          </button>
          <button
            class="ak-cat-btn ak-cat-btn--joint"
            :class="{ 'ak-cat-btn--active': selectedCategory === 'joint' }"
            @click="selectedCategory = 'joint'"
          >
            JOINT OPERATION
          </button>
          <button
            class="ak-cat-btn ak-cat-btn--orienteering"
            :class="{ 'ak-cat-btn--active': selectedCategory === 'orienteering' }"
            @click="selectedCategory = 'orienteering'"
          >
            ORIENTEERING
          </button>
        </div>

        <div class="ak-search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            class="ak-search-input"
            placeholder="Search banner or operator..."
          />
        </div>
      </div>
    </div>

    <!-- Wiki-Styled Banner Table -->
    <div class="ak-wiki-table-wrap">
      <table class="ak-wiki-table">
        <thead>
          <tr>
            <th class="ak-th-banner">Banner</th>
            <th class="ak-th-operators">Rate-Up Operators</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in filteredBanners"
            :key="b.id"
            class="ak-wiki-row"
          >
            <!-- Left Column: Banner -->
            <td class="ak-wiki-col-banner">
              <div class="ak-banner-box">
                <!-- Cyan/Blue Title Bar -->
                <div class="ak-banner-title-bar">
                  {{ b.title }}
                </div>

                <!-- Banner Graphic Image -->
                <div class="ak-banner-img-wrap">
                  <img
                    :src="b.bannerImg || b.bannerImage"
                    :alt="b.title"
                    class="ak-banner-img"
                    loading="lazy"
                    @error="onImageError"
                  />
                </div>

                <!-- Date Info Block -->
                <div class="ak-banner-dates-bar">
                  <div class="ak-date-cn">
                    <b>CN date:</b> {{ b.cnStartDate.replace(/-/g, '/') }} – {{ (b.cnEndDate || b.cnStartDate).replace(/-/g, '/') }}
                  </div>
                  <div class="ak-date-global">
                    <b>Est. Global:</b> {{ formatDate(b.globalStartDate) }} – {{ formatDate(b.globalEndDate) }}
                    <span class="ak-days-chip" :class="`ak-days-chip--${b.status}`">
                      <template v-if="b.status === 'active'">NOW ACTIVE</template>
                      <template v-else-if="b.status === 'passed'">PASSED</template>
                      <template v-else>IN ~{{ b.daysUntilGlobal }}d</template>
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <!-- Right Column: Rate-Up Operators -->
            <td class="ak-wiki-col-operators">
              <div class="ak-ops-container">
                <!-- Description / Instructions if present -->
                <div v-if="b.description" class="ak-ops-desc">
                  {{ b.description }}
                </div>

                <!-- 6-Star Operators Sub-Section (if banner has both 6★ and 5★ with custom texts) -->
                <div v-if="b.sixStarOps.length > 0" class="ak-ops-tier-block">
                  <div v-if="b.description && b.title.includes('Orienteering')" class="ak-ops-subheading">
                    6★ Operators (Choose 3 rate-ups):
                  </div>
                  <div class="ak-ops-grid">
                    <div
                      v-for="op in b.sixStarOps"
                      :key="op.name"
                      class="ak-wiki-op-card"
                      :title="`${op.name} (6★ ${op.profession || ''})`"
                    >
                      <div class="ak-wiki-op-avatar">
                        <img
                          :src="op.icon"
                          :alt="op.name"
                          loading="lazy"
                          @error="onImageError"
                        />
                      </div>
                      <div class="ak-wiki-op-bar ak-wiki-op-bar--6" />
                    </div>
                  </div>
                </div>

                <!-- 5-Star Operators Sub-Section -->
                <div v-if="b.fiveStarOps.length > 0" class="ak-ops-tier-block">
                  <div v-if="b.description && b.title.includes('Orienteering')" class="ak-ops-subheading">
                    5★ Operators (Choose 3 rate-ups):
                  </div>
                  <div class="ak-ops-grid">
                    <div
                      v-for="op in b.fiveStarOps"
                      :key="op.name"
                      class="ak-wiki-op-card"
                      :title="`${op.name} (5★ ${op.profession || ''})`"
                    >
                      <div class="ak-wiki-op-avatar">
                        <img
                          :src="op.icon"
                          :alt="op.name"
                          loading="lazy"
                          @error="onImageError"
                        />
                      </div>
                      <div class="ak-wiki-op-bar ak-wiki-op-bar--5" />
                    </div>
                  </div>
                </div>

                <!-- Other Operators (if any) -->
                <div v-if="b.otherOps.length > 0" class="ak-ops-tier-block">
                  <div class="ak-ops-grid">
                    <div
                      v-for="op in b.otherOps"
                      :key="op.name"
                      class="ak-wiki-op-card"
                      :title="`${op.name} (${op.rarity}★ ${op.profession || ''})`"
                    >
                      <div class="ak-wiki-op-avatar">
                        <img
                          :src="op.icon"
                          :alt="op.name"
                          loading="lazy"
                          @error="onImageError"
                        />
                      </div>
                      <div class="ak-wiki-op-bar ak-wiki-op-bar--other" />
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredBanners.length === 0" class="ak-empty-table">
        <span>🔍</span>
        <p>No upcoming banners matched your search or category filter.</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-banner-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// -----------------------------------------------------------------------------
// Controls Toolbar
// -----------------------------------------------------------------------------
.ak-timeline-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba($ak-bg-secondary, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid $ak-cyan;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
}

.ak-controls-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-source-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.72rem;
  color: $ak-text-secondary;
}

.ak-source-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $ak-text-muted;

  &--live {
    background: $ak-green;
    box-shadow: 0 0 8px $ak-green;
  }
}

.ak-btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: $ak-cyan;
    border-color: $ak-cyan;
    background: rgba($ak-cyan, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ak-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: $ak-cyan;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

// Toolbar row
.ak-toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.ak-offset-adjuster {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: monospace;
}

.ak-offset-label {
  font-size: 0.7rem;
  color: $ak-text-muted;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-right: 0.25rem;
}

.ak-offset-step {
  padding: 0.3rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-secondary;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    color: $ak-cyan;
    border-color: $ak-cyan;
  }
}

.ak-offset-value {
  padding: 0.3rem 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.85rem;
  color: $ak-text-secondary;

  strong {
    color: $ak-cyan;
    font-size: 1rem;
  }
}

.ak-offset-reset {
  padding: 0.3rem 0.5rem;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: $ak-text-muted;
  font-size: 0.68rem;
  cursor: pointer;

  &:hover {
    color: $ak-yellow;
    border-color: $ak-yellow;
  }
}

.ak-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $ak-cyan;
    border-color: $ak-cyan;
  }

  &--active {
    border-color: rgba($ak-cyan, 0.4);
    color: $ak-cyan;
  }
}

.ak-sort-icon {
  font-size: 0.85rem;
}

// Category filter row
.ak-filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-cat-btn {
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $ak-text-primary;
  }

  &--active {
    background: rgba($ak-cyan, 0.15);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }

  &--limited.ak-cat-btn--active {
    background: rgba($ak-red, 0.15);
    border-color: $ak-red;
    color: $ak-red;
  }

  &--collab.ak-cat-btn--active {
    background: rgba($ak-purple, 0.15);
    border-color: $ak-purple;
    color: $ak-purple;
  }

  &--joint.ak-cat-btn--active {
    background: rgba($ak-amber, 0.15);
    border-color: $ak-amber;
    color: $ak-amber;
  }

  &--orienteering.ak-cat-btn--active {
    background: rgba($ak-yellow, 0.15);
    border-color: $ak-yellow;
    color: $ak-yellow;
  }
}

.ak-search-wrap {
  min-width: 240px;
  flex: 1;
  max-width: 320px;
}

.ak-search-input {
  width: 100%;
  padding: 0.45rem 0.8rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-size: 0.78rem;
  font-family: monospace;
  outline: none;

  &:focus {
    border-color: $ak-cyan;
  }
}

// -----------------------------------------------------------------------------
// Wiki Table (Screenshot Style)
// -----------------------------------------------------------------------------
.ak-wiki-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0d0e11;
}

.ak-wiki-table {
  width: 100%;
  border-collapse: collapse;
  font-family: inherit;

  thead tr {
    background: #17181d;
    border-bottom: 2px solid rgba(255, 255, 255, 0.15);

    th {
      padding: 0.85rem 1rem;
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: $ak-text-primary;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
  }
}

.ak-th-banner {
  width: 44%;
  min-width: 360px;
}

.ak-th-operators {
  width: 56%;
  min-width: 420px;
}

.ak-wiki-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  &:hover {
    background: rgba(255, 255, 255, 0.015);
  }
}

// Left Column: Banner box
.ak-wiki-col-banner {
  vertical-align: top;
  padding: 0.85rem;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.ak-banner-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 512px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #000;
}

// Blue title bar from screenshot
.ak-banner-title-bar {
  background-color: #00a2ff;
  color: #000000;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.84rem;
  padding: 0.35rem 0.65rem;
  text-align: center;
  letter-spacing: 0.3px;
  line-height: 1.25;
}

.ak-banner-img-wrap {
  width: 100%;
  background: #000;
  overflow: hidden;
}

.ak-banner-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

// Date block below image
.ak-banner-dates-bar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: #0a0b0e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  font-size: 0.75rem;
  text-align: center;
}

.ak-date-cn {
  color: $ak-text-primary;
  b {
    color: #fff;
    margin-right: 0.25rem;
  }
}

.ak-date-global {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  color: $ak-text-secondary;
  font-size: 0.7rem;

  b {
    color: $ak-cyan;
  }
}

.ak-days-chip {
  padding: 0.1rem 0.35rem;
  font-size: 0.62rem;
  font-weight: 800;
  border-radius: 2px;

  &--upcoming {
    background: rgba($ak-cyan, 0.2);
    color: $ak-cyan;
    border: 1px solid rgba($ak-cyan, 0.4);
  }

  &--active {
    background: rgba($ak-green, 0.2);
    color: $ak-green;
    border: 1px solid rgba($ak-green, 0.4);
    animation: pulse 1s infinite alternate;
  }

  &--passed {
    background: rgba(255, 255, 255, 0.05);
    color: $ak-text-muted;
  }
}

// Right Column: Rate-Up Operators
.ak-wiki-col-operators {
  vertical-align: top;
  padding: 1.25rem 1.5rem;
  background: #141519;
}

.ak-ops-container {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ak-ops-desc {
  font-size: 0.8rem;
  color: $ak-text-secondary;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.ak-ops-tier-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ak-ops-subheading {
  font-family: monospace;
  font-size: 0.72rem;
  color: $ak-text-muted;
  font-weight: 700;
}

.ak-ops-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
}

// Square operator card matching wiki screenshot
.ak-wiki-op-card {
  display: flex;
  flex-direction: column;
  width: 60px;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.ak-wiki-op-avatar {
  width: 60px;
  height: 60px;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
  }
}

// Colored bottom bar under operator
.ak-wiki-op-bar {
  height: 3px;
  width: 60px;

  &--6 {
    background-color: #FFC800; // Gold/Yellow bar for 6-star as in screenshot
  }

  &--5 {
    background-color: #FFFFA9; // Light yellow/cream bar for 5-star as in screenshot
  }

  &--other {
    background-color: $ak-rarity-4;
  }
}

.ak-empty-table {
  padding: 4rem 2rem;
  text-align: center;
  color: $ak-text-muted;
  font-family: monospace;
  font-size: 0.85rem;

  span {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
