<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAceshipOperators } from '~/composables/useAceshipOperators'
import OperatorDetailModal from '~/components/OperatorDetailModal.vue'
import type { CatalogOperator } from '~/types'

useSeoMeta({
  title: 'Каталог оперативников // PRTS База данных Arknights',
  ogTitle: 'Каталог оперативников // ArkCalc PRTS',
  description: 'Полная база данных оперативников Arknights из Aceship: фильтрация по 8 классам, редкости от 1★ до 6★, фракциям и веткам специализации с прямым переходом в калькулятор прокачки.',
  ogDescription: 'Полная база данных оперативников Arknights из базы Aceship: фильтрация по классам, редкости 1-6★, фракциям и быстрый расчет прокачки.',
  ogImage: '/images/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Каталог оперативников // ArkCalc PRTS',
  twitterDescription: 'База данных оперативников Arknights: фильтрация по классам, редкости 1-6★, фракциям и поиск.',
  twitterImage: '/images/og-image.png',
})

const router = useRouter()
const {
  operators,
  isLoading,
  error,
  cacheSource,
  factionsList,
  classesList,
  raritiesList,
  fetchOperators,
} = useAceshipOperators()

// -----------------------------------------------------------------------------
// Filters & Search State
// -----------------------------------------------------------------------------
const searchQuery = ref('')
const selectedClass = ref<string>('ALL')
const selectedRarity = ref<number | 'ALL'>('ALL')
const selectedFaction = ref<string>('ALL')
const selectedPosition = ref<'ALL' | 'MELEE' | 'RANGED'>('ALL')
const sortBy = ref<'rarity_desc' | 'rarity_asc' | 'name_asc' | 'name_desc' | 'class'>('rarity_desc')
const viewMode = ref<'grid' | 'list'>('grid')

// Pagination
const currentPage = ref(1)
const pageSize = ref(36)

// Operator Dossier Modal
const selectedOperator = ref<CatalogOperator | null>(null)
const isDetailModalOpen = ref(false)

const openDossier = (op: CatalogOperator) => {
  selectedOperator.value = op
  isDetailModalOpen.value = true
}

const goToPlanner = (op: CatalogOperator) => {
  router.push(`/planner?op=${op.id}`)
}

// -----------------------------------------------------------------------------
// Lifecycle
// -----------------------------------------------------------------------------
onMounted(async () => {
  await fetchOperators()
})

const handleForceSync = async () => {
  await fetchOperators(true)
}

// -----------------------------------------------------------------------------
// Filtering & Sorting
// -----------------------------------------------------------------------------
const filteredOperators = computed<CatalogOperator[]>(() => {
  let list = operators.value

  // 1. Search Query (name, appellation, subProfession, tags)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((op) => {
      const matchName = op.name.toLowerCase().includes(q)
      const matchAppellation = op.appellation?.toLowerCase().includes(q)
      const matchBranch = op.subProfessionId?.toLowerCase().includes(q)
      const matchFaction = op.faction?.toLowerCase().includes(q)
      const matchTags = op.tagList?.some((t) => t.toLowerCase().includes(q))
      return matchName || matchAppellation || matchBranch || matchFaction || matchTags
    })
  }

  // 2. Class Filter
  if (selectedClass.value !== 'ALL') {
    list = list.filter(
      (op) => op.profession.toLowerCase() === selectedClass.value.toLowerCase()
    )
  }

  // 3. Rarity Filter
  if (selectedRarity.value !== 'ALL') {
    list = list.filter((op) => op.rarity === selectedRarity.value)
  }

  // 4. Faction Filter
  if (selectedFaction.value !== 'ALL') {
    list = list.filter((op) => op.faction === selectedFaction.value)
  }

  // 5. Position Filter
  if (selectedPosition.value !== 'ALL') {
    list = list.filter((op) => op.position === selectedPosition.value)
  }

  // 6. Sorting
  return [...list].sort((a, b) => {
    switch (sortBy.value) {
      case 'rarity_desc':
        if (b.rarity !== a.rarity) return b.rarity - a.rarity
        return a.name.localeCompare(b.name)
      case 'rarity_asc':
        if (a.rarity !== b.rarity) return a.rarity - b.rarity
        return a.name.localeCompare(b.name)
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'class':
        if (a.profession !== b.profession) return a.profession.localeCompare(b.profession)
        return b.rarity - a.rarity
      default:
        return 0
    }
  })
})

// Reset pagination when any filter changes
watch(
  [searchQuery, selectedClass, selectedRarity, selectedFaction, selectedPosition, sortBy],
  () => {
    currentPage.value = 1
  }
)

const totalPages = computed(() => {
  return Math.ceil(filteredOperators.value.length / pageSize.value) || 1
})

const paginatedOperators = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOperators.value.slice(start, start + pageSize.value)
})

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== '' ||
    selectedClass.value !== 'ALL' ||
    selectedRarity.value !== 'ALL' ||
    selectedFaction.value !== 'ALL' ||
    selectedPosition.value !== 'ALL'
  )
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedClass.value = 'ALL'
  selectedRarity.value = 'ALL'
  selectedFaction.value = 'ALL'
  selectedPosition.value = 'ALL'
  sortBy.value = 'rarity_desc'
  currentPage.value = 1
}

// -----------------------------------------------------------------------------
// Helper UI styling
// -----------------------------------------------------------------------------
const getRarityTheme = (rarity: number) => {
  switch (rarity) {
    case 6:
      return '#ff6a00'
    case 5:
      return '#ffb703'
    case 4:
      return '#bb86fc'
    case 3:
      return '#00b4d8'
    case 2:
      return '#80ed99'
    default:
      return '#9e9e9e'
  }
}
</script>

<template>
  <div class="ak-catalog-page">
    <div class="ak-container">
      <!-- 1. Header Banner -->
      <header class="ak-catalog-header">
        <div class="ak-catalog-header__info">
          <div class="ak-catalog-header__breadcrumb">
            <span class="ak-code">PRTS // OPS-04</span>
            <span class="ak-sep">/</span>
            <span class="ak-sub">OPERATOR ROSTER ARCHIVE</span>
          </div>
          <h1 class="ak-catalog-header__title">
            Каталог оперативников <span class="ak-title-tag">ACESHIP DB</span>
          </h1>
          <p class="ak-catalog-header__desc">
            Полный тактический архив оперативников Rhodes Island из базы Aceship.
            Фильтрация по боевым классам, редкости, фракциям и мгновенный расчет в планировщике прокачки.
          </p>
        </div>

        <div class="ak-catalog-header__meta">
          <div class="ak-meta-chip">
            <span class="ak-meta-chip__label">ВСЕГО ОПЕРАТИВНИКОВ</span>
            <strong class="ak-meta-chip__val">{{ operators.length }}</strong>
          </div>
          <div class="ak-meta-chip">
            <span class="ak-meta-chip__label">ИСТОЧНИК КЭША</span>
            <span
              class="ak-meta-chip__status"
              :class="{
                'is-idb': cacheSource === 'indexeddb',
                'is-net': cacheSource === 'network',
                'is-bundle': cacheSource === 'bundle',
              }"
            >
              {{
                cacheSource === 'indexeddb'
                  ? '⚡ INDEXEDDB (OFFLINE)'
                  : cacheSource === 'network'
                  ? '🌐 CDN JS-DELIVR'
                  : cacheSource === 'bundle'
                  ? '📦 LOCAL FALLBACK'
                  : '⏳ ОЖИДАНИЕ'
              }}
            </span>
          </div>
          <button
            type="button"
            class="ak-btn-refresh"
            :disabled="isLoading"
            title="Обновить базу данных из Aceship CDN"
            @click="handleForceSync"
          >
            <span class="ak-btn-refresh__icon" :class="{ 'is-spinning': isLoading }">⟳</span>
            {{ isLoading ? 'СИНХРОНИЗАЦИЯ...' : 'ОБНОВИТЬ КЭШ' }}
          </button>
        </div>
      </header>

      <!-- 2. Main Filter Control Panel -->
      <section class="ak-catalog-controls">
        <!-- Search & Quick Filters Top Row -->
        <div class="ak-controls-row">
          <!-- Search Input -->
          <div class="ak-search-box">
            <span class="ak-search-box__icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="ak-search-box__input"
              placeholder="Поиск по имени, позывному, ветке или тегу..."
            />
            <button
              v-if="searchQuery"
              type="button"
              class="ak-search-box__clear"
              title="Очистить поиск"
              @click="searchQuery = ''"
            >
              ✕
            </button>
          </div>

          <!-- Sort Selector -->
          <div class="ak-sort-group">
            <label class="ak-sort-label">СОРТИРОВКА:</label>
            <select v-model="sortBy" class="ak-select">
              <option value="rarity_desc">Редкость: 6★ → 1★</option>
              <option value="rarity_asc">Редкость: 1★ → 6★</option>
              <option value="name_asc">Имя: A → Z</option>
              <option value="name_desc">Имя: Z → A</option>
              <option value="class">Класс профессии</option>
            </select>
          </div>

          <!-- View Mode Toggles -->
          <div class="ak-view-toggles">
            <button
              type="button"
              class="ak-view-btn"
              :class="{ 'is-active': viewMode === 'grid' }"
              title="Сетка карточек"
              @click="viewMode = 'grid'"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
            </button>
            <button
              type="button"
              class="ak-view-btn"
              :class="{ 'is-active': viewMode === 'list' }"
              title="Компактный список"
              @click="viewMode = 'list'"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Class Pills Row -->
        <div class="ak-filter-group">
          <span class="ak-filter-group__label">КЛАСС:</span>
          <div class="ak-filter-pills">
            <button
              type="button"
              class="ak-pill"
              :class="{ 'is-active': selectedClass === 'ALL' }"
              @click="selectedClass = 'ALL'"
            >
              ВСЕ КЛАССЫ
            </button>
            <button
              v-for="cls in classesList"
              :key="cls"
              type="button"
              class="ak-pill"
              :class="{ 'is-active': selectedClass === cls }"
              @click="selectedClass = cls"
            >
              {{ cls }}
            </button>
          </div>
        </div>

        <!-- Rarity & Position & Faction Filters Row -->
        <div class="ak-filter-grid">
          <!-- Rarity Pills -->
          <div class="ak-sub-filter">
            <span class="ak-filter-group__label">РЕДКОСТЬ:</span>
            <div class="ak-filter-pills">
              <button
                type="button"
                class="ak-pill"
                :class="{ 'is-active': selectedRarity === 'ALL' }"
                @click="selectedRarity = 'ALL'"
              >
                ВСЕ
              </button>
              <button
                v-for="r in raritiesList"
                :key="r"
                type="button"
                class="ak-pill ak-pill--rarity"
                :class="{ 'is-active': selectedRarity === r }"
                :style="{ '--star-color': getRarityTheme(r) }"
                @click="selectedRarity = r"
              >
                {{ r }}★
              </button>
            </div>
          </div>

          <!-- Position Pills -->
          <div class="ak-sub-filter">
            <span class="ak-filter-group__label">ПОЗИЦИЯ:</span>
            <div class="ak-filter-pills">
              <button
                type="button"
                class="ak-pill"
                :class="{ 'is-active': selectedPosition === 'ALL' }"
                @click="selectedPosition = 'ALL'"
              >
                ВСЕ
              </button>
              <button
                type="button"
                class="ak-pill"
                :class="{ 'is-active': selectedPosition === 'MELEE' }"
                @click="selectedPosition = 'MELEE'"
              >
                MELEE (БЛИЖНИЙ)
              </button>
              <button
                type="button"
                class="ak-pill"
                :class="{ 'is-active': selectedPosition === 'RANGED' }"
                @click="selectedPosition = 'RANGED'"
              >
                RANGED (ДАЛЬНИЙ)
              </button>
            </div>
          </div>

          <!-- Faction Dropdown -->
          <div class="ak-sub-filter ak-sub-filter--faction">
            <span class="ak-filter-group__label">ФРАКЦИЯ:</span>
            <select v-model="selectedFaction" class="ak-select ak-select--faction">
              <option value="ALL">Все фракции ({{ operators.length }})</option>
              <option
                v-for="fac in factionsList"
                :key="fac.id"
                :value="fac.name"
              >
                {{ fac.name }} ({{ fac.count }})
              </option>
            </select>
          </div>
        </div>

        <!-- Filter Summary Bar -->
        <div class="ak-summary-bar">
          <div class="ak-summary-bar__count">
            <span class="ak-summary-dot"></span>
            Найдено оперативников:
            <strong>{{ filteredOperators.length }}</strong>
            <span class="ak-summary-bar__total">из {{ operators.length }}</span>
          </div>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="ak-btn-reset"
            @click="resetFilters"
          >
            ✕ СБРОСИТЬ ВСЕ ФИЛЬТРЫ
          </button>
        </div>
      </section>

      <!-- 3. Loading State -->
      <div v-if="isLoading && operators.length === 0" class="ak-loading-state">
        <div class="ak-loading-spinner"></div>
        <p class="ak-loading-text">ЗАГРУЗКА БАЗЫ ДАННЫХ ACESHIP OPERATORS...</p>
        <span class="ak-loading-sub">Инициализация локального хранилища IndexedDB</span>
      </div>

      <!-- 4. Error State -->
      <div v-else-if="error && operators.length === 0" class="ak-error-state">
        <div class="ak-error-icon">⚠️</div>
        <h3 class="ak-error-title">СБОЙ ЗАГРУЗКИ КАТАЛОГА</h3>
        <p class="ak-error-desc">{{ error }}</p>
        <button type="button" class="ak-btn-retry" @click="handleForceSync">
          ПОВТОРИТЬ ПОПЫТКУ
        </button>
      </div>

      <!-- 5. Empty State -->
      <div
        v-else-if="filteredOperators.length === 0"
        class="ak-empty-state"
      >
        <div class="ak-empty-icon">📁</div>
        <h3 class="ak-empty-title">ОПЕРАТИВНИКИ НЕ НАЙДЕНЫ</h3>
        <p class="ak-empty-desc">
          По вашему запросу не найдено ни одного оперативника. Попробуйте изменить параметры поиска или сбросить фильтры.
        </p>
        <button type="button" class="ak-btn-reset-large" @click="resetFilters">
          СБРОСИТЬ ФИЛЬТРЫ
        </button>
      </div>

      <!-- 6. Operators Grid View -->
      <div
        v-else-if="viewMode === 'grid'"
        class="ak-catalog-grid"
      >
        <article
          v-for="op in paginatedOperators"
          :key="op.id"
          class="ak-op-card"
          :style="{ '--card-rarity': getRarityTheme(op.rarity) }"
        >
          <!-- Rarity Top Accent Bar -->
          <div class="ak-op-card__stripe">
            <span class="ak-op-card__stars">{{ '★'.repeat(op.rarity) }}</span>
            <span class="ak-op-card__class-label">{{ op.profession }}</span>
          </div>

          <!-- Card Content Body -->
          <div class="ak-op-card__body">
            <!-- Avatar Frame -->
            <div class="ak-op-card__avatar-wrap" @click="openDossier(op)">
              <img
                :src="op.avatar"
                :alt="op.name"
                class="ak-op-card__avatar"
                loading="lazy"
                decoding="async"
                @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
              />
              <span class="ak-op-card__pos-badge">{{ op.position }}</span>
            </div>

            <!-- Header Info -->
            <div class="ak-op-card__info">
              <h3 class="ak-op-card__name" :title="op.name" @click="openDossier(op)">
                {{ op.name }}
              </h3>
              <p class="ak-op-card__appellation">{{ op.appellation || op.name }}</p>

              <div class="ak-op-card__tags">
                <span class="ak-op-card__tag ak-op-card__tag--faction" :title="op.faction">
                  {{ op.faction }}
                </span>
                <span
                  v-if="op.subProfessionId"
                  class="ak-op-card__tag ak-op-card__tag--branch"
                  :title="op.subProfessionId"
                >
                  {{ op.subProfessionId.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Action Buttons Footer -->
          <div class="ak-op-card__actions">
            <button
              type="button"
              class="ak-card-btn ak-card-btn--info"
              title="Посмотреть тактическое досье и скиллы"
              @click="openDossier(op)"
            >
              ДОСЬЕ
            </button>
            <button
              type="button"
              class="ak-card-btn ak-card-btn--planner"
              title="Открыть в калькуляторе прокачки"
              @click="goToPlanner(op)"
            >
              В ПЛАННЕР ➜
            </button>
          </div>
        </article>
      </div>

      <!-- 7. Operators Compact List View -->
      <div
        v-else-if="viewMode === 'list'"
        class="ak-catalog-list"
      >
        <div class="ak-list-table-wrap">
          <table class="ak-list-table">
            <thead>
              <tr>
                <th>ОПЕРАТИВНИК</th>
                <th>РЕДКОСТЬ</th>
                <th>КЛАСС</th>
                <th>ВЕТКА</th>
                <th>ПОЗИЦИЯ</th>
                <th>ФРАКЦИЯ</th>
                <th class="ak-text-right">ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="op in paginatedOperators"
                :key="op.id"
                class="ak-list-row"
                :style="{ '--row-rarity': getRarityTheme(op.rarity) }"
              >
                <!-- Avatar & Name -->
                <td class="ak-list-cell--profile" @click="openDossier(op)">
                  <img
                    :src="op.avatar"
                    :alt="op.name"
                    class="ak-list-avatar"
                    loading="lazy"
                    decoding="async"
                    @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
                  />
                  <div class="ak-list-name-col">
                    <span class="ak-list-name">{{ op.name }}</span>
                    <span class="ak-list-appellation">{{ op.appellation || op.name }}</span>
                  </div>
                </td>

                <!-- Rarity -->
                <td>
                  <span class="ak-list-rarity" :style="{ color: getRarityTheme(op.rarity) }">
                    {{ '★'.repeat(op.rarity) }}
                  </span>
                </td>

                <!-- Profession -->
                <td>
                  <span class="ak-list-profession">{{ op.profession }}</span>
                </td>

                <!-- Branch / SubProfession -->
                <td>
                  <span class="ak-list-branch">
                    {{ op.subProfessionId ? op.subProfessionId.toUpperCase() : '—' }}
                  </span>
                </td>

                <!-- Position -->
                <td>
                  <span class="ak-list-position">{{ op.position }}</span>
                </td>

                <!-- Faction -->
                <td>
                  <span class="ak-list-faction">{{ op.faction }}</span>
                </td>

                <!-- Actions -->
                <td class="ak-text-right">
                  <div class="ak-list-actions">
                    <button
                      type="button"
                      class="ak-list-btn ak-list-btn--info"
                      title="Досье"
                      @click="openDossier(op)"
                    >
                      ДОСЬЕ
                    </button>
                    <button
                      type="button"
                      class="ak-list-btn ak-list-btn--plan"
                      title="В планнер"
                      @click="goToPlanner(op)"
                    >
                      ПЛАННЕР ➜
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8. Pagination Navigation -->
      <footer v-if="totalPages > 1" class="ak-catalog-pagination">
        <button
          type="button"
          class="ak-page-nav-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ◀ НАЗАД
        </button>

        <div class="ak-page-indicators">
          <span class="ak-page-current">Страница {{ currentPage }} из {{ totalPages }}</span>
        </div>

        <button
          type="button"
          class="ak-page-nav-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          ВПЕРЕД ▶
        </button>
      </footer>
    </div>

    <!-- 9. Operator Dossier Modal -->
    <OperatorDetailModal
      :is-open="isDetailModalOpen"
      :operator="selectedOperator"
      @close="isDetailModalOpen = false"
    />
  </div>
</template>

<style scoped>
.ak-catalog-page {
  min-height: 100vh;
  background-color: #0b0e14;
  color: #e2e8f0;
  font-family: var(--font-mono, 'JetBrains Mono', 'Consolas', monospace);
  padding: 2rem 1rem 4rem;
}

.ak-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* -------------------------------------------------------------------------- */
/* Header */
/* -------------------------------------------------------------------------- */
.ak-catalog-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-left: 4px solid #00e5ff;
  border-radius: 4px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.ak-catalog-header::after {
  content: 'PRTS ARCHIVE';
  position: absolute;
  right: -20px;
  bottom: -15px;
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.02);
  pointer-events: none;
  letter-spacing: 0.2em;
}

.ak-catalog-header__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #00e5ff;
  margin-bottom: 0.5rem;
}

.ak-sep {
  color: rgba(255, 255, 255, 0.3);
}

.ak-sub {
  color: #94a3b8;
}

.ak-catalog-header__title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-title-tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 229, 255, 0.15);
  border: 1px solid rgba(0, 229, 255, 0.4);
  color: #00e5ff;
  border-radius: 2px;
  letter-spacing: 0.05em;
}

.ak-catalog-header__desc {
  max-width: 750px;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #94a3b8;
}

.ak-catalog-header__meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .ak-catalog-header__meta {
    align-items: flex-start;
    width: 100%;
  }
}

.ak-meta-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

@media (max-width: 768px) {
  .ak-meta-chip {
    align-items: flex-start;
  }
}

.ak-meta-chip__label {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: #64748b;
  font-weight: 700;
}

.ak-meta-chip__val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #00e5ff;
}

.ak-meta-chip__status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
  letter-spacing: 0.05em;
}

.ak-meta-chip__status.is-idb {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.ak-meta-chip__status.is-net {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.ak-meta-chip__status.is-bundle {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}

.ak-btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ak-btn-refresh:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  transform: translateY(-1px);
}

.ak-btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ak-btn-refresh__icon.is-spinning {
  display: inline-block;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* -------------------------------------------------------------------------- */
/* Controls & Filters */
/* -------------------------------------------------------------------------- */
.ak-catalog-controls {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ak-controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.ak-search-box {
  position: relative;
  flex: 1;
  min-width: 280px;
  display: flex;
  align-items: center;
}

.ak-search-box__icon {
  position: absolute;
  left: 0.75rem;
  font-size: 0.85rem;
  opacity: 0.6;
  pointer-events: none;
}

.ak-search-box__input {
  width: 100%;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
  color: #ffffff;
  padding: 0.6rem 2.2rem 0.6rem 2.4rem;
  font-size: 0.875rem;
  font-family: inherit;
  border-radius: 2px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ak-search-box__input:focus {
  outline: none;
  border-color: #00e5ff;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.25);
}

.ak-search-box__clear {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem;
}

.ak-search-box__clear:hover {
  color: #ffffff;
}

.ak-sort-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ak-sort-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.ak-select {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
  color: #ffffff;
  padding: 0.55rem 0.75rem;
  font-size: 0.8rem;
  font-family: inherit;
  border-radius: 2px;
  cursor: pointer;
  outline: none;
}

.ak-select:focus {
  border-color: #00e5ff;
}

.ak-view-toggles {
  display: flex;
  gap: 0.25rem;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
  padding: 0.2rem;
  border-radius: 2px;
}

.ak-view-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ak-view-btn.is-active {
  background: rgba(0, 229, 255, 0.2);
  color: #00e5ff;
}

.ak-filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-filter-group__label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #94a3b8;
  min-width: 65px;
}

.ak-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-pill {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  color: #94a3b8;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ak-pill:hover {
  color: #ffffff;
  border-color: #94a3b8;
}

.ak-pill.is-active {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  color: #00e5ff;
}

.ak-pill--rarity.is-active {
  border-color: var(--star-color);
  color: var(--star-color);
  background: rgba(255, 255, 255, 0.05);
}

.ak-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  align-items: center;
}

.ak-sub-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ak-sub-filter--faction {
  flex-wrap: nowrap;
}

.ak-select--faction {
  flex: 1;
}

.ak-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  font-size: 0.8rem;
}

.ak-summary-bar__count {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
}

.ak-summary-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00e5ff;
  display: inline-block;
}

.ak-summary-bar__count strong {
  color: #ffffff;
  font-size: 0.95rem;
}

.ak-summary-bar__total {
  opacity: 0.6;
}

.ak-btn-reset {
  background: none;
  border: 1px dashed rgba(244, 63, 94, 0.4);
  color: #f43f5e;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.ak-btn-reset:hover {
  background: rgba(244, 63, 94, 0.15);
  border-color: #f43f5e;
}

/* -------------------------------------------------------------------------- */
/* States: Loading, Error, Empty */
/* -------------------------------------------------------------------------- */
.ak-loading-state,
.ak-error-state,
.ak-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  background: #111827;
  border: 1px dashed rgba(75, 85, 99, 0.4);
  border-radius: 4px;
}

.ak-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 229, 255, 0.15);
  border-top-color: #00e5ff;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

.ak-loading-text {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.05em;
  margin: 0 0 0.25rem;
}

.ak-loading-sub {
  font-size: 0.75rem;
  color: #64748b;
}

.ak-error-icon,
.ak-empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.ak-error-title,
.ak-empty-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem;
}

.ak-error-desc,
.ak-empty-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  max-width: 500px;
  margin: 0 0 1.25rem;
}

.ak-btn-retry,
.ak-btn-reset-large {
  background: #00e5ff;
  border: none;
  color: #0b0e14;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 0.6rem 1.25rem;
  border-radius: 2px;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.ak-btn-retry:hover,
.ak-btn-reset-large:hover {
  background: #38bdf8;
  transform: translateY(-1px);
}

/* -------------------------------------------------------------------------- */
/* Grid View */
/* -------------------------------------------------------------------------- */
.ak-catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.ak-op-card {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.ak-op-card:hover {
  transform: translateY(-4px);
  border-color: var(--card-rarity, #00e5ff);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.ak-op-card__stripe {
  height: 24px;
  background: linear-gradient(90deg, rgba(17, 24, 39, 0.9), rgba(0, 0, 0, 0.9));
  border-bottom: 2px solid var(--card-rarity, #00e5ff);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.ak-op-card__stars {
  font-size: 0.75rem;
  color: var(--card-rarity, #ff6a00);
  letter-spacing: -0.1em;
  font-weight: 800;
}

.ak-op-card__class-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.ak-op-card__body {
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
}

.ak-op-card__avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  cursor: pointer;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.ak-op-card__avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.ak-op-card__avatar-wrap:hover .ak-op-card__avatar {
  transform: scale(1.08);
}

.ak-op-card__pos-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.75);
  color: #cbd5e1;
  font-size: 0.55rem;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.05em;
  padding: 1px 0;
}

.ak-op-card__info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

.ak-op-card__name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color 0.15s ease;
}

.ak-op-card__name:hover {
  color: var(--card-rarity, #00e5ff);
}

.ak-op-card__appellation {
  font-size: 0.7rem;
  color: #64748b;
  margin: 0 0 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.ak-op-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.ak-op-card__tag {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.15rem 0.35rem;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ak-op-card__tag--faction {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ak-op-card__tag--branch {
  background: rgba(0, 229, 255, 0.1);
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.3);
}

.ak-op-card__actions {
  display: flex;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
}

.ak-card-btn {
  flex: 1;
  padding: 0.5rem 0.25rem;
  background: transparent;
  border: none;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.ak-card-btn--info {
  color: #94a3b8;
  border-right: 1px solid rgba(75, 85, 99, 0.3);
}

.ak-card-btn--info:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.ak-card-btn--planner {
  color: #00e5ff;
}

.ak-card-btn--planner:hover {
  background: rgba(0, 229, 255, 0.15);
  color: #ffffff;
}

/* -------------------------------------------------------------------------- */
/* List View */
/* -------------------------------------------------------------------------- */
.ak-catalog-list {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2.5rem;
}

.ak-list-table-wrap {
  overflow-x: auto;
}

.ak-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  text-align: left;
}

.ak-list-table th {
  background: #0f172a;
  color: #64748b;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.4);
}

.ak-text-right {
  text-align: right;
}

.ak-list-row {
  border-bottom: 1px solid rgba(75, 85, 99, 0.2);
  transition: background-color 0.15s ease;
}

.ak-list-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.ak-list-row td {
  padding: 0.6rem 1rem;
  vertical-align: middle;
}

.ak-list-cell--profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.ak-list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  object-fit: cover;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
}

.ak-list-name-col {
  display: flex;
  flex-direction: column;
}

.ak-list-name {
  font-weight: 800;
  color: #ffffff;
  font-size: 0.9rem;
}

.ak-list-appellation {
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
}

.ak-list-rarity {
  font-weight: 800;
  letter-spacing: -0.1em;
}

.ak-list-profession {
  font-weight: 700;
  color: #cbd5e1;
}

.ak-list-branch {
  color: #00e5ff;
  font-weight: 700;
  font-size: 0.75rem;
}

.ak-list-position {
  color: #94a3b8;
  font-size: 0.75rem;
}

.ak-list-faction {
  color: #94a3b8;
  font-size: 0.75rem;
}

.ak-list-actions {
  display: inline-flex;
  gap: 0.5rem;
}

.ak-list-btn {
  padding: 0.35rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 800;
  border-radius: 2px;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.15s ease;
}

.ak-list-btn--info {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
  color: #94a3b8;
}

.ak-list-btn--info:hover {
  border-color: #ffffff;
  color: #ffffff;
}

.ak-list-btn--plan {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.4);
  color: #00e5ff;
}

.ak-list-btn--plan:hover {
  background: #00e5ff;
  color: #0b0e14;
}

/* -------------------------------------------------------------------------- */
/* Pagination */
/* -------------------------------------------------------------------------- */
.ak-catalog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
}

.ak-page-nav-btn {
  background: #111827;
  border: 1px solid rgba(0, 229, 255, 0.3);
  color: #00e5ff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.5rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ak-page-nav-btn:hover:not(:disabled) {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
}

.ak-page-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: rgba(75, 85, 99, 0.3);
  color: #64748b;
}

.ak-page-indicators {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
}

.ak-page-current {
  color: #ffffff;
}
</style>
