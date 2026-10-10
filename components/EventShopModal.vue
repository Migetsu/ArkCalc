<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ArknightsEvent, EventRewardItem } from '~/types'

const props = defineProps<{
  isOpen: boolean
  eventsList: ArknightsEvent[]
  selectedEventId: string
  userInventory: Record<string, number>
  neededMaterials: Record<string, number>
  totalSanitySaved: number
  totalRunsSaved: number
  source?: string
  isSyncing?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:selectedEventId', id: string): void
  (e: 'sync'): void
}>()

const categoryFilter = ref<'all' | 'material' | 'module' | 'skill' | 'currency' | 'exp'>('all')
const searchQuery = ref('')
const filterOnlyNeeded = ref(false)

const currentEvents = computed<ArknightsEvent[]>(() => {
  if (props.selectedEventId === 'all') return props.eventsList
  return props.eventsList.filter((e) => e.id === props.selectedEventId)
})

interface DisplayRewardItem extends EventRewardItem {
  eventName: string
  neededCount: number
  ownedCount: number
  isNeeded: boolean
  isDeficit: boolean
}

const allStoreItems = computed<DisplayRewardItem[]>(() => {
  const list: DisplayRewardItem[] = []
  for (const ev of currentEvents.value) {
    for (const r of ev.rewards || []) {
      const needed = props.neededMaterials[r.itemId] || 0
      const owned = props.userInventory[r.itemId] || 0
      const isDeficit = needed > owned

      list.push({
        ...r,
        eventName: ev.name,
        neededCount: needed,
        ownedCount: owned,
        isNeeded: needed > 0,
        isDeficit,
      })
    }
  }
  return list
})

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const cat = categoryFilter.value

  return allStoreItems.value.filter((item) => {
    if (query && !item.name.toLowerCase().includes(query)) return false
    if (cat !== 'all') {
      if (cat === 'currency' && item.category !== 'currency' && item.category !== 'permit') return false
      if (cat !== 'currency' && item.category !== cat) return false
    }
    if (filterOnlyNeeded.value && !item.isNeeded) return false
    return true
  }).sort((a, b) => {
    // Sort items that satisfy doctor's deficit first, then by tier descending
    if (a.isDeficit !== b.isDeficit) return a.isDeficit ? -1 : 1
    if (a.isNeeded !== b.isNeeded) return a.isNeeded ? -1 : 1
    return b.tier - a.tier
  })
})

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Transition name="ak-modal-fade">
    <div
      v-if="isOpen"
      class="ak-modal-overlay"
      @click="handleBackdropClick"
    >
      <div class="ak-modal-dialog ak-modal-dialog--wide">
        <!-- Terminal Header -->
        <div class="ak-modal-header">
          <div class="ak-modal-header__title-group">
            <span class="ak-modal-badge ak-modal-badge--purple">PRTS // EVENT INTELLIGENCE</span>
            <h3 class="ak-modal-title">ИНСПЕКТОР ИВЕНТОВЫХ МАГАЗИНОВ И НАГРАД</h3>
          </div>
          <button
            type="button"
            class="ak-modal-close"
            title="Закрыть окно"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Metric Ribbon -->
        <div class="ak-shop-ribbon">
          <div class="ak-shop-stat">
            <span class="ak-shop-stat__label">ИСТОЧНИК ДАННЫХ</span>
            <span
              class="ak-shop-stat__val"
              :class="source === 'wiki.gg-live' ? 'ak-shop-stat__val--live' : ''"
            >
              {{ source === 'wiki.gg-live' ? '● WIKI.GG (LIVE API)' : 'ОФФЛАЙН КЭШ PRTS' }}
            </span>
          </div>
          <div class="ak-shop-stat ak-shop-stat--green">
            <span class="ak-shop-stat__label">СЭКОНОМЛЕНО SANITY</span>
            <span class="ak-shop-stat__val">⚡ -{{ totalSanitySaved.toLocaleString() }} AP</span>
          </div>
          <div class="ak-shop-stat ak-shop-stat--cyan">
            <span class="ak-shop-stat__label">СЭКОНОМЛЕНО ЗАБЕГОВ</span>
            <span class="ak-shop-stat__val">~{{ totalRunsSaved }} миссий</span>
          </div>
          <div class="ak-shop-stat ak-shop-stat--purple">
            <span class="ak-shop-stat__label">ВСЕГО ПОЗИЦИЙ</span>
            <span class="ak-shop-stat__val">{{ allStoreItems.length }} предметов</span>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="ak-shop-toolbar">
          <div class="ak-shop-toolbar__row">
            <!-- Event Switcher -->
            <div class="ak-shop-select-wrap">
              <label class="ak-shop-input-label">СОБЫТИЕ:</label>
              <select
                :value="selectedEventId"
                class="ak-shop-select"
                @change="emit('update:selectedEventId', ($event.target as HTMLSelectElement).value)"
              >
                <option value="all">★ Все предстоящие ивенты ({{ eventsList.length }})</option>
                <option
                  v-for="ev in eventsList"
                  :key="ev.id"
                  :value="ev.id"
                >
                  {{ ev.name }} [{{ ev.status.toUpperCase() }}]
                </option>
              </select>
            </div>

            <!-- Live Sync Button -->
            <button
              type="button"
              class="ak-btn-sync-wiki"
              :disabled="isSyncing"
              @click="emit('sync')"
            >
              <span class="ak-btn-sync-wiki__icon" :class="{ 'ak-spin': isSyncing }">⟳</span>
              <span>{{ isSyncing ? 'СИНХРОНИЗАЦИЯ С WIKI.GG...' : 'СИНХРОНИЗИРОВАТЬ С WIKI.GG' }}</span>
            </button>
          </div>

          <!-- Category Pills & Search -->
          <div class="ak-shop-toolbar__row ak-shop-toolbar__row--wrap">
            <div class="ak-category-pills">
              <button
                type="button"
                class="ak-category-pill"
                :class="{ 'ak-category-pill--active': categoryFilter === 'all' }"
                @click="categoryFilter = 'all'"
              >
                ВСЕ
              </button>
              <button
                type="button"
                class="ak-category-pill"
                :class="{ 'ak-category-pill--active': categoryFilter === 'material' }"
                @click="categoryFilter = 'material'"
              >
                МАТЕРИАЛЫ
              </button>
              <button
                type="button"
                class="ak-category-pill"
                :class="{ 'ak-category-pill--active': categoryFilter === 'module' }"
                @click="categoryFilter = 'module'"
              >
                МОДУЛИ
              </button>
              <button
                type="button"
                class="ak-category-pill"
                :class="{ 'ak-category-pill--active': categoryFilter === 'skill' }"
                @click="categoryFilter = 'skill'"
              >
                КНИГИ НАВЫКОВ
              </button>
              <button
                type="button"
                class="ak-category-pill"
                :class="{ 'ak-category-pill--active': categoryFilter === 'currency' }"
                @click="categoryFilter = 'currency'"
              >
                ВАЛЮТА / БИЛЕТЫ
              </button>
              <button
                type="button"
                class="ak-category-pill"
                :class="{ 'ak-category-pill--active': categoryFilter === 'exp' }"
                @click="categoryFilter = 'exp'"
              >
                ОПЫТ (EXP)
              </button>
            </div>

            <div class="ak-shop-search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по названию предмета..."
                class="ak-shop-search-input"
              />
              <label class="ak-shop-checkbox-label">
                <input v-model="filterOnlyNeeded" type="checkbox" />
                <span>Только нужные для плана</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Items Grid Container -->
        <div class="ak-shop-body">
          <div v-if="filteredItems.length > 0" class="ak-shop-grid">
            <div
              v-for="(item, idx) in filteredItems"
              :key="`${item.itemId}-${idx}`"
              class="ak-shop-card"
              :class="[
                `ak-shop-card--tier${item.tier}`,
                { 'ak-shop-card--needed': item.isNeeded },
                { 'ak-shop-card--deficit': item.isDeficit },
              ]"
            >
              <!-- Icon -->
              <div class="ak-shop-card__icon-box">
                <img
                  :src="item.icon || `/images/items/${item.itemId}.png`"
                  :alt="item.name"
                  loading="lazy"
                  decoding="async"
                  @error="($event.target as HTMLImageElement).src = '/images/items/placeholder.png'"
                />
                <span class="ak-shop-card__tier">T{{ item.tier }}</span>
              </div>

              <!-- Meta -->
              <div class="ak-shop-card__meta">
                <div class="ak-shop-card__name-row">
                  <h4 class="ak-shop-card__name" :title="item.name">{{ item.name }}</h4>
                  <span
                    v-if="item.isDeficit"
                    class="ak-shop-card__badge ak-shop-card__badge--deficit"
                    title="Этот ресурс сокращает дефицит прокачки в вашем плане!"
                  >
                    СОКРАЩАЕТ ДЕФИЦИТ
                  </span>
                  <span
                    v-else-if="item.isNeeded"
                    class="ak-shop-card__badge ak-shop-card__badge--needed"
                  >
                    НУЖНО В ПЛАНЕ
                  </span>
                </div>

                <div class="ak-shop-card__details">
                  <span class="ak-shop-card__amount">В магазине: <strong>+{{ item.count }}</strong></span>
                  <span v-if="item.neededCount > 0" class="ak-shop-card__plan-info">
                    Требуется в плане: <strong>{{ item.neededCount }}</strong> (на складе: {{ item.ownedCount }})
                  </span>
                  <span class="ak-shop-card__event-tag">Ивент: {{ item.eventName }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="ak-shop-empty">
            <span class="ak-shop-empty__icon">🔍</span>
            <p>Предметов с заданными параметрами фильтра не найдено.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="ak-modal-footer">
          <span class="ak-modal-footer__note">
            * Ресурсы из ивентовых магазинов автоматически вычитаются из оставшегося фарма Sanity при включённом тумблере вычета.
          </span>
          <button
            type="button"
            class="ak-modal-btn ak-modal-btn--primary"
            @click="emit('close')"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.ak-modal-fade-enter-active,
.ak-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.ak-modal-fade-enter-from,
.ak-modal-fade-leave-to {
  opacity: 0;
}

.ak-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.ak-modal-dialog {
  background: #101217;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 35px rgba(0, 0, 0, 0.9);
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &--wide {
    max-width: 1040px;
  }
}

.ak-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &__title-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
}

.ak-modal-badge {
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
  letter-spacing: 0.5px;

  &--purple {
    background: rgba(#a855f7, 0.2);
    color: #c084fc;
    border: 1px solid rgba(#a855f7, 0.5);
  }
}

.ak-modal-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: $ak-text-primary;
}

.ak-modal-close {
  background: transparent;
  border: none;
  color: $ak-text-muted;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: $ak-red;
  }
}

// Ribbon
.ak-shop-ribbon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(20, 10, 30, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ak-shop-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.4rem 0.6rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);

  &__label {
    font-size: 0.58rem;
    font-family: monospace;
    color: $ak-text-muted;
    letter-spacing: 0.5px;
  }

  &__val {
    font-size: 0.82rem;
    font-family: monospace;
    font-weight: 800;
    color: $ak-text-primary;

    &--live {
      color: $ak-green;
      text-shadow: 0 0 6px rgba($ak-green, 0.5);
    }
  }

  &--green &__val {
    color: $ak-green;
  }

  &--cyan &__val {
    color: $ak-cyan;
  }

  &--purple &__val {
    color: #c084fc;
  }
}

// Toolbar
.ak-shop-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    &--wrap {
      flex-wrap: wrap;
    }
  }
}

.ak-shop-select-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.ak-shop-input-label {
  font-family: monospace;
  font-size: 0.68rem;
  color: $ak-text-muted;
}

.ak-shop-select {
  flex: 1;
  max-width: 420px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(#a855f7, 0.4);
  color: #f3e8ff;
  padding: 0.4rem 0.6rem;
  font-size: 0.78rem;
  font-family: monospace;
  outline: none;
  border-radius: 2px;

  &:focus {
    border-color: #c084fc;
  }
}

.ak-btn-sync-wiki {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  background: rgba(#a855f7, 0.15);
  border: 1px solid rgba(#a855f7, 0.4);
  color: #d8b4fe;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #9333ea;
    color: #fff;
    box-shadow: 0 0 10px rgba(#a855f7, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__icon {
    font-size: 0.95rem;
    font-weight: 800;
  }
}

.ak-spin {
  animation: ak-spin-anim 1s linear infinite;
  display: inline-block;
}

@keyframes ak-spin-anim {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Category Pills
.ak-category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-category-pill {
  padding: 0.3rem 0.6rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.68rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $ak-text-primary;
  }

  &--active {
    background: rgba(#a855f7, 0.2);
    border-color: #a855f7;
    color: #e9d5ff;
    font-weight: 700;
  }
}

.ak-shop-search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ak-shop-search-input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-primary;
  padding: 0.35rem 0.6rem;
  font-size: 0.75rem;
  font-family: monospace;
  min-width: 220px;
  outline: none;

  &:focus {
    border-color: $ak-cyan;
  }
}

.ak-shop-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: monospace;
  font-size: 0.68rem;
  color: $ak-text-secondary;
  cursor: pointer;
}

// Grid
.ak-shop-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  max-height: 52vh;
}

.ak-shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.65rem;
}

.ak-shop-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left-width: 3px;
  transition: all 0.2s;

  &--tier5 {
    border-left-color: $ak-rarity-6;
  }
  &--tier4 {
    border-left-color: $ak-rarity-5;
  }
  &--tier3 {
    border-left-color: $ak-rarity-4;
  }

  &--needed {
    background: rgba(#a855f7, 0.06);
  }

  &--deficit {
    background: rgba($ak-green, 0.08);
    border-color: rgba($ak-green, 0.35);
  }

  &__icon-box {
    width: 44px;
    height: 44px;
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__tier {
    position: absolute;
    bottom: 1px;
    right: 2px;
    font-size: 0.55rem;
    font-family: monospace;
    font-weight: 800;
    color: #ffc400;
    background: rgba(0, 0, 0, 0.8);
    padding: 0 0.2rem;
  }

  &__meta {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
  }

  &__name {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: $ak-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__badge {
    font-family: monospace;
    font-size: 0.55rem;
    font-weight: 800;
    padding: 0.1rem 0.35rem;
    border-radius: 1px;
    letter-spacing: 0.5px;
    white-space: nowrap;

    &--deficit {
      background: rgba($ak-green, 0.2);
      color: $ak-green;
      border: 1px solid rgba($ak-green, 0.4);
    }

    &--needed {
      background: rgba(#a855f7, 0.2);
      color: #c084fc;
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    font-family: monospace;
    font-size: 0.68rem;
    color: $ak-text-muted;

    strong {
      color: $ak-text-primary;
    }
  }

  &__amount {
    color: #d8b4fe;
    font-weight: 600;
  }

  &__event-tag {
    font-size: 0.62rem;
    color: $ak-text-secondary;
    opacity: 0.75;
  }
}

.ak-shop-empty {
  padding: 3rem 1rem;
  text-align: center;
  font-family: monospace;
  color: $ak-text-muted;

  &__icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: block;
  }
}

// Modal Footer
.ak-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  &__note {
    font-size: 0.72rem;
    font-family: monospace;
    color: $ak-text-muted;
  }
}

.ak-modal-btn {
  padding: 0.55rem 1.25rem;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &--primary {
    background: $ak-cyan;
    color: #000;

    &:hover {
      background: lighten($ak-cyan, 10%);
      box-shadow: 0 0 10px rgba($ak-cyan, 0.4);
    }
  }
}
</style>
