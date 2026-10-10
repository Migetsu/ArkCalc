<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useOperatorSkins } from '~/composables/useOperatorSkins'
import type { OperatorSkinItem } from '~/types'

const props = withDefaults(
  defineProps<{
    /** Operator ID (e.g. 'char_102_texas', 'char_172_svrash') */
    operatorId: string
    /** Optional operator name */
    operatorName?: string
    /** Optional operator rarity (1..6) */
    rarity?: number
    /** Pre-loaded skin list if available */
    skins?: OperatorSkinItem[]
    /** Initial skinId to display */
    initialSkinId?: string
  }>(),
  {
    operatorName: '',
    rarity: 6,
    skins: undefined,
    initialSkinId: '',
  }
)

const {
  skins: fetchedSkins,
  isLoading,
  error,
  fetchSkins,
} = useOperatorSkins()

// Combine pre-loaded skins or fetched skins
const availableSkins = computed<OperatorSkinItem[]>(() => {
  if (props.skins && props.skins.length > 0) {
    return props.skins
  }
  return fetchedSkins.value
})

// Current selected skin index
const selectedIndex = ref<number>(0)
// Filter category: 'all' | 'elite0' | 'elite2' | 'alternative'
const activeCategory = ref<'all' | 'elite0' | 'elite2' | 'alternative'>('all')

// Fullscreen lightbox state
const isLightboxOpen = ref<boolean>(false)

// Track which image URLs failed to fallback to CDN mirror
const failedUrls = ref<Record<string, boolean>>({})

onMounted(async () => {
  if (!props.skins || props.skins.length === 0) {
    if (props.operatorId) {
      await fetchSkins(props.operatorId)
    }
  }

  // If initialSkinId is specified, select it
  if (props.initialSkinId && availableSkins.value.length > 0) {
    const idx = availableSkins.value.findIndex((s) => s.skinId === props.initialSkinId)
    if (idx !== -1) selectedIndex.value = idx
  }
})

watch(
  () => props.operatorId,
  async (newId) => {
    if (newId && (!props.skins || props.skins.length === 0)) {
      selectedIndex.value = 0
      failedUrls.value = {}
      await fetchSkins(newId)
    }
  }
)

// Filtered skins based on category tab
const filteredSkins = computed(() => {
  if (activeCategory.value === 'all') return availableSkins.value
  return availableSkins.value.filter((s) => s.type === activeCategory.value)
})

// Ensure selectedIndex is within bounds of filteredSkins
const currentSkin = computed<OperatorSkinItem | null>(() => {
  if (filteredSkins.value.length === 0) return null
  return filteredSkins.value[selectedIndex.value] || filteredSkins.value[0] || null
})

// Select skin by item
const selectSkin = (skin: OperatorSkinItem) => {
  const idx = filteredSkins.value.findIndex((s) => s.skinId === skin.skinId)
  if (idx !== -1) {
    selectedIndex.value = idx
  }
}

// Next / Previous navigation
const prevSkin = () => {
  if (filteredSkins.value.length <= 1) return
  selectedIndex.value =
    (selectedIndex.value - 1 + filteredSkins.value.length) % filteredSkins.value.length
}

const nextSkin = () => {
  if (filteredSkins.value.length <= 1) return
  selectedIndex.value = (selectedIndex.value + 1) % filteredSkins.value.length
}

// Resolve current image URL (try Aceship first, fallback to CDN mirror)
const resolveArtworkUrl = (skin: OperatorSkinItem): string => {
  if (failedUrls.value[skin.skinId]) {
    return skin.cdnUrl
  }
  return skin.aceshipUrl
}

const handleImgError = (skin: OperatorSkinItem, event: Event) => {
  const target = event.target as HTMLImageElement
  if (!failedUrls.value[skin.skinId]) {
    // Switch to high-availability CDN mirror
    failedUrls.value[skin.skinId] = true
    target.src = skin.cdnUrl
  } else {
    // If CDN mirror also fails, fallback to placeholder
    target.src = '/images/operators/placeholder.png'
  }
}

// Open original image in new tab
const openOriginalImage = () => {
  if (!currentSkin.value) return
  const url = resolveArtworkUrl(currentSkin.value)
  window.open(url, '_blank', 'noopener,noreferrer')
}

// Category counts
const countE0 = computed(() => availableSkins.value.filter((s) => s.type === 'elite0').length)
const countE2 = computed(() => availableSkins.value.filter((s) => s.type === 'elite2').length)
const countAlt = computed(() => availableSkins.value.filter((s) => s.type === 'alternative').length)
</script>

<template>
  <div class="ak-skin-gallery">
    <!-- 1. Header Bar -->
    <header class="ak-skin-gallery__head">
      <div class="ak-gallery-info">
        <span class="ak-gallery-tag">PRTS // VISUAL ARCHIVE & WARDROBE</span>
        <h3 class="ak-gallery-title">
          {{ operatorName || 'Оперативник' }} — Галерея иллюстраций
        </h3>
      </div>

      <div class="ak-gallery-meta">
        <span class="ak-skins-count-badge">
          {{ availableSkins.length }} {{ availableSkins.length === 1 ? 'АРТ' : 'СКИНОВ' }}
        </span>
      </div>
    </header>

    <!-- 2. Category Filter Tabs -->
    <nav v-if="availableSkins.length > 1" class="ak-skin-tabs">
      <button
        type="button"
        class="ak-skin-tab"
        :class="{ 'is-active': activeCategory === 'all' }"
        @click="activeCategory = 'all'; selectedIndex = 0"
      >
        ВСЕ ({{ availableSkins.length }})
      </button>

      <button
        v-if="countE0 > 0"
        type="button"
        class="ak-skin-tab"
        :class="{ 'is-active': activeCategory === 'elite0' }"
        @click="activeCategory = 'elite0'; selectedIndex = 0"
      >
        <span class="ak-tab-icon">◈</span>
        ELITE 0
      </button>

      <button
        v-if="countE2 > 0"
        type="button"
        class="ak-skin-tab"
        :class="{ 'is-active': activeCategory === 'elite2' }"
        @click="activeCategory = 'elite2'; selectedIndex = 0"
      >
        <span class="ak-tab-icon">◈◈◈</span>
        ELITE 2
      </button>

      <button
        v-if="countAlt > 0"
        type="button"
        class="ak-skin-tab ak-skin-tab--alt"
        :class="{ 'is-active': activeCategory === 'alternative' }"
        @click="activeCategory = 'alternative'; selectedIndex = 0"
      >
        <span class="ak-tab-icon">✦</span>
        АЛЬТЕРНАТИВНЫЕ ({{ countAlt }})
      </button>
    </nav>

    <!-- 3. Loading State -->
    <div v-if="isLoading && availableSkins.length === 0" class="ak-gallery-loading">
      <div class="ak-loading-spinner"></div>
      <p class="ak-loading-text">ЗАГРУЗКА ИЛЛЮСТРАЦИЙ И СКИНОВ ИЗ CDN ACESHIP...</p>
    </div>

    <!-- 4. Error State -->
    <div v-else-if="error && availableSkins.length === 0" class="ak-gallery-error">
      <div class="ak-error-icon">⚠️</div>
      <p class="ak-error-text">{{ error }}</p>
    </div>

    <!-- 5. Main Artwork Showcase Stage -->
    <div v-else-if="currentSkin" class="ak-showcase-stage">
      <!-- Background Cyber Grid Decoration -->
      <div class="ak-stage-backdrop">
        <div class="ak-stage-crosshair"></div>
        <div class="ak-stage-watermark">{{ currentSkin.type.toUpperCase() }}</div>
      </div>

      <!-- Arrow Controls -->
      <button
        v-if="filteredSkins.length > 1"
        type="button"
        class="ak-nav-arrow ak-nav-arrow--prev"
        title="Предыдущий арт (Left Arrow)"
        @click="prevSkin"
      >
        ◀
      </button>

      <button
        v-if="filteredSkins.length > 1"
        type="button"
        class="ak-nav-arrow ak-nav-arrow--next"
        title="Следующий арт (Right Arrow)"
        @click="nextSkin"
      >
        ▶
      </button>

      <!-- Main Art Viewport -->
      <div class="ak-artwork-frame" @click="isLightboxOpen = true">
        <img
          :key="currentSkin.skinId"
          :src="resolveArtworkUrl(currentSkin)"
          :alt="currentSkin.name"
          class="ak-artwork-img"
          loading="eager"
          decoding="async"
          @error="handleImgError(currentSkin, $event)"
        />

        <!-- Top Corner Badges -->
        <div class="ak-artwork-corner-info">
          <span
            class="ak-type-badge"
            :class="`is-${currentSkin.type}`"
          >
            {{
              currentSkin.type === 'elite0'
                ? 'ELITE 0'
                : currentSkin.type === 'elite2'
                ? 'ELITE 2'
                : 'COSTUME'
            }}
          </span>
          <span v-if="currentSkin.skinGroupName" class="ak-brand-badge">
            {{ currentSkin.skinGroupName }}
          </span>
        </div>

        <!-- Floating Quick Tools -->
        <div class="ak-artwork-tools">
          <button
            type="button"
            class="ak-tool-btn"
            title="Открыть на весь экран"
            @click.stop="isLightboxOpen = true"
          >
            🔍 ПОЛНЫЙ ЭКРАН
          </button>
          <button
            type="button"
            class="ak-tool-btn"
            title="Открыть оригинальный файл в новой вкладке"
            @click.stop="openOriginalImage"
          >
            ↗ ОРИГИНАЛ
          </button>
        </div>
      </div>

      <!-- Bottom Lore & Skin Description Banner -->
      <div class="ak-showcase-desc">
        <div class="ak-desc-main">
          <h4 class="ak-skin-name">{{ currentSkin.name }}</h4>
          <span v-if="currentSkin.illustrator" class="ak-illustrator">
            Художник: <strong>{{ currentSkin.illustrator }}</strong>
          </span>
        </div>

        <p v-if="currentSkin.description" class="ak-skin-quote">
          "{{ currentSkin.description }}"
        </p>

        <p v-if="currentSkin.dialog" class="ak-skin-dialog">
          💬 "{{ currentSkin.dialog }}"
        </p>
      </div>
    </div>

    <!-- 6. Thumbnail Selection Strip -->
    <div v-if="availableSkins.length > 1" class="ak-thumbnails-strip">
      <div
        v-for="(skin, idx) in filteredSkins"
        :key="skin.skinId"
        class="ak-thumb-card"
        :class="{ 'is-active': currentSkin?.skinId === skin.skinId }"
        @click="selectSkin(skin)"
      >
        <div class="ak-thumb-avatar">
          <img
            :src="skin.avatarUrl || resolveArtworkUrl(skin)"
            :alt="skin.name"
            class="ak-thumb-img"
            loading="lazy"
            @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
          />
          <span class="ak-thumb-tag" :class="`is-${skin.type}`">
            {{ skin.type === 'elite0' ? 'E0' : skin.type === 'elite2' ? 'E2' : 'ALT' }}
          </span>
        </div>

        <div class="ak-thumb-label" :title="skin.name">
          {{ skin.name }}
        </div>
      </div>
    </div>

    <!-- 7. Fullscreen Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="isLightboxOpen && currentSkin"
        class="ak-lightbox-overlay"
        @click.self="isLightboxOpen = false"
      >
        <div class="ak-lightbox-content">
          <!-- Lightbox Top Controls -->
          <div class="ak-lightbox-bar">
            <div class="ak-lightbox-info">
              <span class="ak-lb-tag">PRTS FULLSCREEN INSPECTOR</span>
              <h3 class="ak-lb-title">{{ currentSkin.name }} // {{ operatorName }}</h3>
            </div>

            <div class="ak-lightbox-actions">
              <button
                type="button"
                class="ak-lb-btn"
                title="Открыть в новой вкладке"
                @click="openOriginalImage"
              >
                ↗ ВКЛАДКА
              </button>
              <button
                type="button"
                class="ak-lb-close"
                title="Закрыть (Esc)"
                @click="isLightboxOpen = false"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Fullscreen Image Frame -->
          <div class="ak-lightbox-img-wrap" @click="isLightboxOpen = false">
            <img
              :src="resolveArtworkUrl(currentSkin)"
              :alt="currentSkin.name"
              class="ak-lightbox-img"
              @error="handleImgError(currentSkin, $event)"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ak-skin-gallery {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-left: 3px solid #00e5ff;
  border-radius: 4px;
  padding: 1.5rem;
  font-family: var(--font-mono, 'JetBrains Mono', 'Consolas', monospace);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
}

/* -------------------------------------------------------------------------- */
/* Head */
/* -------------------------------------------------------------------------- */
.ak-skin-gallery__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  padding-bottom: 0.85rem;
}

.ak-gallery-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ak-gallery-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 0.1em;
}

.ak-gallery-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.ak-skins-count-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.12);
  border: 1px solid rgba(0, 229, 255, 0.3);
  padding: 0.25rem 0.65rem;
  border-radius: 2px;
}

/* -------------------------------------------------------------------------- */
/* Filter Tabs */
/* -------------------------------------------------------------------------- */
.ak-skin-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  padding: 0.25rem;
  border-radius: 3px;
}

.ak-skin-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.4rem 0.85rem;
  border-radius: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.ak-skin-tab:hover {
  color: #ffffff;
}

.ak-skin-tab.is-active {
  background: rgba(0, 229, 255, 0.18);
  color: #00e5ff;
}

.ak-skin-tab--alt.is-active {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.ak-tab-icon {
  font-size: 0.65rem;
}

/* -------------------------------------------------------------------------- */
/* Loading & Error */
/* -------------------------------------------------------------------------- */
.ak-gallery-loading,
.ak-gallery-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.ak-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 229, 255, 0.2);
  border-top-color: #00e5ff;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.ak-loading-text,
.ak-error-text {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* -------------------------------------------------------------------------- */
/* Showcase Stage */
/* -------------------------------------------------------------------------- */
.ak-showcase-stage {
  position: relative;
  background: radial-gradient(circle at center, #0f172a 0%, #070a0f 100%);
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ak-stage-backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.ak-stage-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 80%;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.ak-stage-watermark {
  position: absolute;
  right: 1.5rem;
  bottom: 5rem;
  font-size: 5rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.02);
  text-transform: uppercase;
}

/* Nav Arrows */
.ak-nav-arrow {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(0, 229, 255, 0.4);
  color: #00e5ff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.ak-nav-arrow:hover {
  background: #00e5ff;
  color: #0b0e14;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.5);
}

.ak-nav-arrow--prev {
  left: 1rem;
}

.ak-nav-arrow--next {
  right: 1rem;
}

/* Artwork Frame */
.ak-artwork-frame {
  position: relative;
  width: 100%;
  min-height: 440px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
  overflow: hidden;
  padding: 1.5rem;
}

.ak-artwork-img {
  max-width: 100%;
  max-height: 560px;
  object-fit: contain;
  filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.7));
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ak-artwork-frame:hover .ak-artwork-img {
  transform: scale(1.02);
}

.ak-artwork-corner-info {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 5;
}

.ak-type-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
  letter-spacing: 0.05em;
}

.ak-type-badge.is-elite0 {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.ak-type-badge.is-elite2 {
  background: rgba(255, 106, 0, 0.2);
  border: 1px solid #ff6a00;
  color: #ff6a00;
}

.ak-type-badge.is-alternative {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

.ak-brand-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
  color: #cbd5e1;
}

.ak-artwork-tools {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.4rem;
  z-index: 5;
}

.ak-tool-btn {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(75, 85, 99, 0.5);
  color: #94a3b8;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.3rem 0.6rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);
}

.ak-tool-btn:hover {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  color: #ffffff;
}

/* Description Banner */
.ak-showcase-desc {
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(75, 85, 99, 0.4);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 5;
}

.ak-desc-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ak-skin-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
}

.ak-illustrator {
  font-size: 0.75rem;
  color: #94a3b8;
}

.ak-illustrator strong {
  color: #00e5ff;
}

.ak-skin-quote {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0;
  white-space: pre-wrap;
  font-style: italic;
}

.ak-skin-dialog {
  font-size: 0.75rem;
  color: #f59e0b;
  margin: 0;
}

/* -------------------------------------------------------------------------- */
/* Thumbnails Strip */
/* -------------------------------------------------------------------------- */
.ak-thumbnails-strip {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.ak-thumb-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 3px;
  padding: 0.5rem;
  min-width: 100px;
  max-width: 120px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.ak-thumb-card:hover {
  border-color: #00e5ff;
  transform: translateY(-2px);
}

.ak-thumb-card.is-active {
  background: rgba(0, 229, 255, 0.12);
  border-color: #00e5ff;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
}

.ak-thumb-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 2px;
  overflow: hidden;
  background: #111827;
}

.ak-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ak-thumb-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 0.55rem;
  font-weight: 800;
  text-align: center;
  padding: 1px 0;
  color: #ffffff;
}

.ak-thumb-tag.is-elite0 {
  background: rgba(56, 189, 248, 0.85);
}

.ak-thumb-tag.is-elite2 {
  background: rgba(255, 106, 0, 0.85);
}

.ak-thumb-tag.is-alternative {
  background: rgba(245, 158, 11, 0.85);
}

.ak-thumb-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #cbd5e1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* -------------------------------------------------------------------------- */
/* Fullscreen Lightbox Modal */
/* -------------------------------------------------------------------------- */
.ak-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
}

.ak-lightbox-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.ak-lightbox-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 1px solid rgba(75, 85, 99, 0.4);
}

.ak-lb-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 0.1em;
  display: block;
}

.ak-lb-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0.2rem 0 0;
}

.ak-lightbox-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.ak-lb-btn {
  background: #111827;
  border: 1px solid rgba(0, 229, 255, 0.4);
  color: #00e5ff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.4rem 0.8rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ak-lb-btn:hover {
  background: #00e5ff;
  color: #0b0e14;
}

.ak-lb-close {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.ak-lb-close:hover {
  background: rgba(244, 63, 94, 0.3);
  border-color: #f43f5e;
  color: #f43f5e;
}

.ak-lightbox-img-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
  cursor: zoom-out;
}

.ak-lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.9));
}
</style>
