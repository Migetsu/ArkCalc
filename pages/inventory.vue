<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { useAppSupabase } from '~/composables/useAppSupabase'
import materialsData from '~/assets/data/materials.json'

useHead({
  title: 'Depot & Material Inventory // ArkCalc',
})

const userStore = useUserStore()
const { client, user, isAuthenticated } = useAppSupabase()

// All items catalog
const itemsCatalog = materialsData as Array<{
  id: string
  name: string
  tier: number
  category: string
  icon?: string
}>

// -----------------------------------------------------------------------------
// Filters & Search
// -----------------------------------------------------------------------------
const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const selectedTier = ref<number | 'all'>('all')
const onlyInStock = ref(false)

const categories = [
  { id: 'all', label: 'ALL ITEMS' },
  { id: 'material', label: 'MATERIALS' },
  { id: 'chip', label: 'CHIPS' },
  { id: 'currency', label: 'CURRENCY' },
  { id: 'skill', label: 'SKILL BOOKS' },
  { id: 'module', label: 'MODULES' },
]

const tiers = ['all', 5, 4, 3, 2, 1] as const

const filteredItems = computed(() => {
  return itemsCatalog.filter((item) => {
    // Category match
    const matchCat =
      selectedCategory.value === 'all' || item.category === selectedCategory.value

    // Tier match
    const matchTier =
      selectedTier.value === 'all' || item.tier === selectedTier.value

    // Search query match
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch =
      !q || item.name.toLowerCase().includes(q) || item.id.includes(q)

    // Stock check
    const qty = userStore.getItemQuantity(item.id)
    const matchStock = !onlyInStock.value || qty > 0

    return matchCat && matchTier && matchSearch && matchStock
  })
})

// Summary metrics
const totalStockedTypes = computed(() => {
  return itemsCatalog.filter((item) => userStore.getItemQuantity(item.id) > 0).length
})

const totalUnitsCount = computed(() => {
  return itemsCatalog.reduce(
    (sum, item) => sum + userStore.getItemQuantity(item.id),
    0
  )
})

// -----------------------------------------------------------------------------
// Automatic Supabase Synchronization
// -----------------------------------------------------------------------------
type SyncState = 'idle' | 'saving' | 'saved' | 'error'
const syncStatus = ref<SyncState>('idle')
const lastSavedTime = ref<string | null>(null)
const syncErrorMessage = ref<string | null>(null)

// Map to hold debounced timer IDs per item
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Update quantity in local store and trigger debounced auto-save to Supabase
 */
const updateQuantity = (itemId: string, newQuantity: number) => {
  const qty = Math.max(0, Math.floor(newQuantity || 0))
  userStore.setItemQuantity(itemId, qty)

  if (isAuthenticated.value && user.value) {
    syncStatus.value = 'saving'
    syncErrorMessage.value = null

    // Clear previous timer for this item if active
    if (debounceTimers.has(itemId)) {
      clearTimeout(debounceTimers.get(itemId)!)
    }

    const timer = setTimeout(async () => {
      debounceTimers.delete(itemId)
      try {
        const { error } = await client.from('user_inventories').upsert(
          {
            user_id: user.value!.id,
            item_id: itemId,
            quantity: qty,
          },
          { onConflict: 'user_id, item_id' }
        )

        if (error) throw error
        syncStatus.value = 'saved'
        lastSavedTime.value = new Date().toLocaleTimeString()
      } catch (err: unknown) {
        syncStatus.value = 'error'
        syncErrorMessage.value = err instanceof Error ? err.message : String(err)
      }
    }, 450)

    debounceTimers.set(itemId, timer)
  }
}

const adjustQuantity = (itemId: string, delta: number) => {
  const current = userStore.getItemQuantity(itemId)
  updateQuantity(itemId, current + delta)
}

const clearItem = (itemId: string) => {
  updateQuantity(itemId, 0)
}

// Manual force sync all depot to Supabase
const forceSyncAll = async () => {
  if (!isAuthenticated.value) return
  syncStatus.value = 'saving'
  const res = await userStore.syncToSupabase()
  if (res.success) {
    syncStatus.value = 'saved'
    lastSavedTime.value = new Date().toLocaleTimeString()
  } else {
    syncStatus.value = 'error'
    syncErrorMessage.value = res.error || 'Failed to sync'
  }
}

// Reload all depot items from Supabase
const reloadFromCloud = async () => {
  if (!isAuthenticated.value) return
  syncStatus.value = 'saving'
  const res = await userStore.fetchFromSupabase()
  if (res.success) {
    syncStatus.value = 'saved'
    lastSavedTime.value = new Date().toLocaleTimeString()
  } else {
    syncStatus.value = 'error'
    syncErrorMessage.value = res.error || 'Failed to load'
  }
}
</script>

<template>
  <div class="ak-inventory-page">
    <!-- Header -->
    <header class="ak-inv-header">
      <div class="ak-inv-header__title-box">
        <span class="ak-inv-header__tag">DEPOT // MODULE INV-04</span>
        <h1 class="ak-inv-header__title">Depot & Material Inventory</h1>
        <p class="ak-inv-header__desc">
          Manage your Rhodes Island stockpile. Quantities are persisted locally and automatically synced to Supabase.
        </p>
      </div>

      <!-- Cloud Sync Status Widget -->
      <div class="ak-sync-widget">
        <div class="ak-sync-widget__status">
          <div
            class="ak-sync-widget__dot"
            :class="{
              'ak-sync-widget__dot--online': isAuthenticated && syncStatus !== 'error',
              'ak-sync-widget__dot--saving': syncStatus === 'saving',
              'ak-sync-widget__dot--error': syncStatus === 'error',
            }"
          />
          <div class="ak-sync-widget__meta">
            <span v-if="!isAuthenticated" class="ak-sync-widget__title">
              LOCAL STORAGE MODE
            </span>
            <span v-else-if="syncStatus === 'saving'" class="ak-sync-widget__title ak-sync-widget__title--pulse">
              SYNCING TO SUPABASE...
            </span>
            <span v-else-if="syncStatus === 'error'" class="ak-sync-widget__title ak-sync-widget__title--error">
              SYNC ERROR
            </span>
            <span v-else class="ak-sync-widget__title">
              SUPABASE CLOUD SYNC ACTIVE
            </span>

            <span class="ak-sync-widget__sub">
              {{
                isAuthenticated
                  ? lastSavedTime
                    ? `Last synced: ${lastSavedTime}`
                    : 'Auto-save on change'
                  : 'Saved locally in browser'
              }}
            </span>
          </div>
        </div>

        <div v-if="isAuthenticated" class="ak-sync-widget__actions">
          <button
            type="button"
            class="ak-sync-btn"
            title="Force push all depot items to cloud"
            @click="forceSyncAll"
          >
            PUSH ALL
          </button>
          <button
            type="button"
            class="ak-sync-btn"
            title="Reload depot items from cloud"
            @click="reloadFromCloud"
          >
            PULL CLOUD
          </button>
        </div>
      </div>
    </header>

    <!-- Stock Summary Strip -->
    <section class="ak-summary-strip">
      <div class="ak-strip-card">
        <span class="ak-strip-card__label">TOTAL STOCKED TYPES</span>
        <span class="ak-strip-card__val">
          <strong>{{ totalStockedTypes }}</strong> / {{ itemsCatalog.length }}
        </span>
      </div>

      <div class="ak-strip-card">
        <span class="ak-strip-card__label">TOTAL MATERIAL UNITS</span>
        <span class="ak-strip-card__val">
          <strong>{{ totalUnitsCount.toLocaleString() }}</strong>
        </span>
      </div>

      <div class="ak-strip-card ak-strip-card--cyan">
        <span class="ak-strip-card__label">LMD IN DEPOT</span>
        <span class="ak-strip-card__val">
          <strong>{{ userStore.getItemQuantity('4001').toLocaleString() }}</strong>
        </span>
      </div>

      <div class="ak-strip-card ak-strip-card--amber">
        <span class="ak-strip-card__label">ORUNDUM IN DEPOT</span>
        <span class="ak-strip-card__val">
          <strong>{{ userStore.getItemQuantity('orundum').toLocaleString() }}</strong>
        </span>
      </div>
    </section>

    <!-- Toolbar Filters -->
    <section class="ak-inv-toolbar">
      <!-- Search & In-stock toggle -->
      <div class="ak-toolbar-row">
        <div class="ak-search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search material name or ID..."
            class="ak-search-input"
          />
        </div>

        <label class="ak-stock-toggle">
          <input v-model="onlyInStock" type="checkbox" class="ak-checkbox" />
          <span>Only In-Stock (&gt;0)</span>
        </label>
      </div>

      <!-- Categories Bar -->
      <div class="ak-categories-bar">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="ak-cat-btn"
          :class="{ 'ak-cat-btn--active': selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Tier Filters -->
      <div class="ak-tier-bar">
        <span class="ak-tier-bar__label">TIER:</span>
        <button
          v-for="t in tiers"
          :key="t"
          type="button"
          class="ak-tier-btn"
          :class="{ 'ak-tier-btn--active': selectedTier === t }"
          @click="selectedTier = t"
        >
          {{ t === 'all' ? 'ALL' : `T${t}` }}
        </button>
      </div>
    </section>

    <!-- Items Grid -->
    <main class="ak-items-section">
      <div v-if="filteredItems.length > 0" class="ak-items-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="ak-item-card"
          :class="[
            `ak-item-card--t${item.tier}`,
            { 'ak-item-card--stocked': userStore.getItemQuantity(item.id) > 0 },
          ]"
        >
          <!-- Item Icon & Tier Tag -->
          <div class="ak-item-card__visual">
            <div class="ak-item-card__icon-box">
              <img
                v-if="item.icon"
                :src="item.icon"
                :alt="item.name"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = '/images/items/placeholder.png'"
              />
              <span class="ak-item-card__tier-badge">T{{ item.tier }}</span>
            </div>
          </div>

          <!-- Item Details & Input -->
          <div class="ak-item-card__body">
            <div class="ak-item-card__head">
              <h3 class="ak-item-card__name" :title="item.name">{{ item.name }}</h3>
              <button
                v-if="userStore.getItemQuantity(item.id) > 0"
                type="button"
                class="ak-item-card__clear"
                title="Clear item to 0"
                @click="clearItem(item.id)"
              >
                ✕
              </button>
            </div>

            <!-- Direct Quantity Numeric Input -->
            <div class="ak-item-card__input-box">
              <input
                :value="userStore.getItemQuantity(item.id)"
                type="number"
                min="0"
                step="1"
                class="ak-item-card__qty-input"
                @change="updateQuantity(item.id, Number(($event.target as HTMLInputElement).value))"
              />
            </div>

            <!-- Quick Adjuster Steppers -->
            <div class="ak-item-card__steppers">
              <button
                type="button"
                class="ak-step-btn"
                title="Decrease by 10"
                @click="adjustQuantity(item.id, -10)"
              >
                -10
              </button>
              <button
                type="button"
                class="ak-step-btn"
                title="Decrease by 1"
                @click="adjustQuantity(item.id, -1)"
              >
                -1
              </button>
              <button
                type="button"
                class="ak-step-btn ak-step-btn--plus"
                title="Increase by 1"
                @click="adjustQuantity(item.id, 1)"
              >
                +1
              </button>
              <button
                type="button"
                class="ak-step-btn ak-step-btn--plus"
                title="Increase by 10"
                @click="adjustQuantity(item.id, 10)"
              >
                +10
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Filter State -->
      <div v-else class="ak-empty-grid">
        <p>NO MATERIALS MATCH CURRENT FILTERS</p>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.ak-inventory-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

// Header
.ak-inv-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &__tag {
    font-size: 0.7rem;
    font-family: monospace;
    color: $ak-green;
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
    max-width: 750px;
    font-size: 0.85rem;
    line-height: 1.45;

    @media (min-width: 768px) {
      font-size: 0.95rem;
    }
  }
}

// Sync Widget
.ak-sync-widget {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: rgba($ak-bg-secondary, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1.25rem;
  backdrop-filter: blur(8px);
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);

  &__status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: $ak-amber;
    box-shadow: 0 0 8px rgba($ak-amber, 0.6);

    &--online {
      background-color: $ak-green;
      box-shadow: 0 0 8px rgba($ak-green, 0.8);
    }

    &--saving {
      background-color: $ak-cyan;
      box-shadow: 0 0 10px rgba($ak-cyan, 0.8);
      animation: pulse 1s infinite alternate;
    }

    &--error {
      background-color: $ak-red;
      box-shadow: 0 0 8px rgba($ak-red, 0.8);
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    font-family: monospace;
    line-height: 1.15;
  }

  &__title {
    font-size: 0.75rem;
    font-weight: 700;
    color: $ak-text-primary;
    letter-spacing: 0.5px;

    &--pulse {
      color: $ak-cyan;
    }

    &--error {
      color: $ak-red;
    }
  }

  &__sub {
    font-size: 0.65rem;
    color: $ak-text-muted;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    padding-left: 1rem;
  }
}

.ak-sync-btn {
  padding: 0.35rem 0.65rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $ak-cyan;
    border-color: $ak-cyan;
    background: rgba($ak-cyan, 0.1);
  }
}

// Summary Strip
.ak-summary-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.ak-strip-card {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.35);
  border-left: 3px solid $ak-green;
  font-family: monospace;

  &__label {
    font-size: 0.65rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__val {
    font-size: 1.15rem;
    color: $ak-text-secondary;
    margin-top: 0.15rem;

    strong {
      color: $ak-text-primary;
      font-size: 1.35rem;
    }
  }

  &--cyan {
    border-left-color: $ak-cyan;
    .ak-strip-card__val strong {
      color: $ak-cyan;
    }
  }

  &--amber {
    border-left-color: $ak-amber;
    .ak-strip-card__val strong {
      color: $ak-amber;
    }
  }
}

// Toolbar
.ak-inv-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba($ak-bg-secondary, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
}

.ak-toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.ak-search-box {
  flex: 1;
  min-width: 260px;
}

.ak-search-input {
  width: 100%;
  padding: 0.55rem 0.85rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: $ak-green;
    box-shadow: 0 0 8px rgba($ak-green, 0.3);
  }
}

.ak-stock-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: $ak-text-secondary;
  cursor: pointer;
  user-select: none;
}

.ak-checkbox {
  accent-color: $ak-green;
  cursor: pointer;
}

// Categories bar
.ak-categories-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ak-cat-btn {
  padding: 0.4rem 0.85rem;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.5px;
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
    background: rgba($ak-green, 0.15);
    color: $ak-green;
    border-color: $ak-green;
  }
}

// Tier Bar
.ak-tier-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;

  &__label {
    font-size: 0.7rem;
    color: $ak-text-muted;
    font-weight: 700;
  }
}

.ak-tier-btn {
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.3);
  color: $ak-text-secondary;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;

  &:hover {
    color: $ak-text-primary;
  }

  &--active {
    background: rgba($ak-cyan, 0.15);
    color: $ak-cyan;
    border-color: $ak-cyan;
  }
}

// Items Grid
.ak-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.ak-item-card {
  display: flex;
  gap: 0.85rem;
  padding: 0.85rem;
  background: rgba(20, 20, 24, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);

  &:hover {
    background: rgba(28, 28, 34, 0.85);
    border-color: rgba(255, 255, 255, 0.15);
  }

  &--t5 {
    border-left: 2px solid $ak-rarity-6;
  }
  &--t4 {
    border-left: 2px solid $ak-rarity-4;
  }
  &--t3 {
    border-left: 2px solid $ak-rarity-3;
  }
  &--t2 {
    border-left: 2px solid $ak-rarity-2;
  }
  &--t1 {
    border-left: 2px solid $ak-rarity-1;
  }

  &--stocked {
    background: rgba(26, 28, 32, 0.9);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &__visual {
    display: flex;
    flex-direction: column;
  }

  &__icon-box {
    width: 46px;
    height: 46px;
    position: relative;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 38px;
      height: 38px;
      object-fit: contain;
    }
  }

  &__tier-badge {
    position: absolute;
    bottom: -1px;
    right: -1px;
    background: #000;
    font-size: 0.5rem;
    font-family: monospace;
    font-weight: 800;
    padding: 0.05rem 0.2rem;
    color: $ak-text-secondary;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    min-width: 0;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.35rem;
  }

  &__name {
    font-size: 0.8rem;
    font-weight: 700;
    color: $ak-text-primary;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__clear {
    background: transparent;
    border: none;
    color: $ak-text-muted;
    font-size: 0.7rem;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: $ak-red;
    }
  }

  &__input-box {
    width: 100%;
  }

  &__qty-input {
    width: 100%;
    padding: 0.35rem 0.5rem;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: $ak-text-primary;
    font-family: monospace;
    font-size: 0.95rem;
    font-weight: 800;
    text-align: right;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: $ak-green;
    }
  }

  &__steppers {
    display: flex;
    gap: 0.25rem;
  }
}

.ak-step-btn {
  flex: 1;
  padding: 0.2rem 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $ak-text-primary;
  }

  &--plus {
    color: $ak-green;
    &:hover {
      background: rgba($ak-green, 0.15);
      border-color: $ak-green;
    }
  }
}

.ak-empty-grid {
  padding: 4rem 2rem;
  text-align: center;
  font-family: monospace;
  color: $ak-text-muted;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}
</style>
