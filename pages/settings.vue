<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/userStore'
import AccountSyncModal from '~/components/AccountSyncModal.vue'

useHead({
  title: 'System Settings // ArkCalc',
})

const userStore = useUserStore()
const supabaseUser = useSupabaseUser()

// Local state initialized from Pinia userStore
const monthlyCard = ref<boolean>(userStore.settings.monthly_card ?? true)
const theme = ref<string>(userStore.settings.theme || 'dark')
const server = ref<string>(userStore.settings.server || 'EN')
const language = ref<string>(userStore.settings.language || 'en')
const showUnreleased = ref<boolean>(userStore.settings.show_unreleased ?? false)

// Status feedback
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const statusMessage = ref<string>('')
const isSyncModalOpen = ref(false)

// Keep local state in sync when userStore changes externally
watch(
  () => userStore.settings,
  (newSettings) => {
    monthlyCard.value = newSettings.monthly_card ?? true
    theme.value = newSettings.theme || 'dark'
    server.value = newSettings.server || 'EN'
    language.value = newSettings.language || 'en'
    showUnreleased.value = newSettings.show_unreleased ?? false
  },
  { deep: true }
)

// Available Themes
const themeOptions = [
  {
    id: 'dark',
    name: 'Rhodes Dark (Default)',
    desc: 'Deep carbon terminal with Rhodes Island neon cyan accents',
    colorHex: '#00d4ff',
    bgHex: '#121214',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    desc: 'High-contrast neon magenta and dark synthwave palette',
    colorHex: '#ff007f',
    bgHex: '#0f0c1b',
  },
  {
    id: 'originium',
    name: 'Originium Amber',
    desc: 'Catastrophe warning hazard amber and industrial gold',
    colorHex: '#ff9100',
    bgHex: '#14110f',
  },
  {
    id: 'rhodes-light',
    name: 'PRTS Clean Slate',
    desc: 'Enhanced contrast monochrome palette with electric cyan',
    colorHex: '#00e5ff',
    bgHex: '#1c1d22',
  },
]

// Server Regions
const serverOptions = [
  { code: 'EN', name: 'Global / EN' },
  { code: 'JP', name: 'Japan / JP' },
  { code: 'KR', name: 'Korea / KR' },
  { code: 'CN', name: 'China / CN' },
]

// Language Options
const languageOptions = [
  { code: 'en', name: 'English (EN)' },
  { code: 'ru', name: 'Русский (RU)' },
  { code: 'zh', name: '中文 (ZH)' },
  { code: 'ja', name: '日本語 (JA)' },
]

// Save settings to userStore (which auto-syncs to Supabase and applies theme)
const saveSettings = async () => {
  saveStatus.value = 'saving'
  statusMessage.value = 'APPLYING CONFIGURATION & SYNCING TO SUPABASE...'

  try {
    await userStore.updateSettings({
      monthly_card: monthlyCard.value,
      theme: theme.value,
      server: server.value,
      language: language.value,
      show_unreleased: showUnreleased.value,
    })

    // Also sync server with profile server
    if (userStore.profile.server !== server.value) {
      userStore.setProfile({ server: server.value })
    }

    saveStatus.value = 'saved'
    statusMessage.value = supabaseUser.value
      ? '✓ SETTINGS SYNCHRONIZED WITH SUPABASE (user_settings)'
      : '✓ SETTINGS SAVED LOCALLY (Connect Supabase to cloud-sync)'

    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
        statusMessage.value = ''
      }
    }, 3500)
  } catch (err: any) {
    saveStatus.value = 'error'
    statusMessage.value = `⚠ SYNC FAILED: ${err?.message || 'Unknown error'}`
  }
}

// Instant theme preview on click
const selectTheme = (themeId: string) => {
  theme.value = themeId
  saveSettings()
}

// Toggle monthly card
const toggleMonthlyCard = () => {
  monthlyCard.value = !monthlyCard.value
  saveSettings()
}

// Manual Cloud Sync button
const forceCloudSync = async () => {
  saveStatus.value = 'saving'
  statusMessage.value = 'TRANSMITTING ALL APP DATA TO SUPABASE...'
  const res = await userStore.syncToSupabase()
  if (res.success) {
    saveStatus.value = 'saved'
    statusMessage.value = '✓ FULL CLOUD SYNC COMPLETED WITH SUPABASE'
  } else {
    saveStatus.value = 'error'
    statusMessage.value = `⚠ CLOUD SYNC FAILED: ${res.error}`
  }
}

onMounted(() => {
  if (userStore.settings.theme && typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', userStore.settings.theme)
  }
})
</script>

<template>
  <div class="ak-settings">
    <!-- Header -->
    <header class="ak-settings__header">
      <div class="ak-settings__title-group">
        <span class="ak-settings__tag">SYSTEM CONFIG // MODULE SET-05</span>
        <h1 class="ak-settings__title">Terminal Preferences & Settings</h1>
        <p class="ak-settings__desc">
          Manage your Rhodes Island PRTS user preferences, Monthly Card subscription state, and terminal UI theme.
          Settings automatically sync with your Supabase cloud profile.
        </p>
      </div>

      <!-- Cloud Sync Status Badge -->
      <div class="ak-cloud-status" :class="{ 'ak-cloud-status--connected': Boolean(supabaseUser) }">
        <div class="ak-cloud-status__icon" />
        <div class="ak-cloud-status__meta">
          <span class="ak-cloud-status__label">
            {{ supabaseUser ? 'SUPABASE CLOUD: CONNECTED' : 'LOCAL STORAGE MODE' }}
          </span>
          <span class="ak-cloud-status__sub">
            {{ supabaseUser ? (supabaseUser.email || 'Authorized Doctor') : 'Saved locally in browser' }}
          </span>
        </div>
        <button
          v-if="supabaseUser"
          type="button"
          class="ak-btn-cloud-sync"
          title="Force immediate push to Supabase"
          :disabled="saveStatus === 'saving'"
          @click="forceCloudSync"
        >
          PUSH CLOUD
        </button>
      </div>
    </header>

    <!-- Status Alert Banner -->
    <transition name="ak-alert-fade">
      <div
        v-if="saveStatus !== 'idle'"
        class="ak-status-banner"
        :class="{
          'ak-status-banner--saving': saveStatus === 'saving',
          'ak-status-banner--saved': saveStatus === 'saved',
          'ak-status-banner--error': saveStatus === 'error',
        }"
      >
        <span class="ak-status-banner__spinner" v-if="saveStatus === 'saving'" />
        <span>{{ statusMessage }}</span>
      </div>
    </transition>

    <div class="ak-settings__grid">
      <!-- Section 1: Monthly Card & Gameplay Preferences -->
      <section class="ak-settings-card">
        <div class="ak-settings-card__head">
          <span class="ak-settings-card__num">01</span>
          <h3>GAMEPLAY & SUBSCRIPTIONS</h3>
        </div>

        <div class="ak-settings-card__body">
          <!-- Monthly Card Toggle -->
          <div class="ak-setting-item" @click="toggleMonthlyCard">
            <div class="ak-setting-item__info">
              <div class="ak-setting-item__title-row">
                <span class="ak-setting-item__title">Monthly Card (月卡)</span>
                <span
                  class="ak-badge-card"
                  :class="monthlyCard ? 'ak-badge-card--active' : 'ak-badge-card--inactive'"
                >
                  {{ monthlyCard ? 'ACTIVE (+200 / DAY)' : 'INACTIVE' }}
                </span>
              </div>
              <p class="ak-setting-item__desc">
                Enables +200 daily Orundum and +60 daily Sanity calculations in the Gacha Spark Planner and material farming estimator.
              </p>
            </div>
            <div class="ak-toggle-switch" :class="{ 'ak-toggle-switch--active': monthlyCard }">
              <div class="ak-toggle-switch__handle" />
            </div>
          </div>

          <!-- Show Unreleased / Future Content -->
          <div class="ak-setting-item" @click="showUnreleased = !showUnreleased; saveSettings()">
            <div class="ak-setting-item__info">
              <div class="ak-setting-item__title-row">
                <span class="ak-setting-item__title">CN Future Content Forecast</span>
                <span
                  class="ak-badge-card"
                  :class="showUnreleased ? 'ak-badge-card--active' : 'ak-badge-card--inactive'"
                >
                  {{ showUnreleased ? 'ENABLED' : 'DISABLED' }}
                </span>
              </div>
              <p class="ak-setting-item__desc">
                Display unreleased CN operators and upcoming banners in search results and timelines (~175 days offset).
              </p>
            </div>
            <div class="ak-toggle-switch" :class="{ 'ak-toggle-switch--active': showUnreleased }">
              <div class="ak-toggle-switch__handle" />
            </div>
          </div>

          <!-- Account Sync / arkprts Quick Launcher -->
          <div class="ak-sync-promo-box">
            <div class="ak-sync-promo-box__text">
              <strong>PRTS AUTOMATIC ACCOUNT SYNC</strong>
              <p>Pull live depot materials, orundum counts and operator levels directly from Yostar game servers.</p>
            </div>
            <button
              type="button"
              class="ak-btn-promo-sync"
              @click="isSyncModalOpen = true"
            >
              OPEN SYNC GATEWAY
            </button>
          </div>
        </div>
      </section>

      <!-- Section 2: Terminal UI Theme -->
      <section class="ak-settings-card">
        <div class="ak-settings-card__head">
          <span class="ak-settings-card__num">02</span>
          <h3>PRTS TERMINAL THEME</h3>
        </div>

        <div class="ak-settings-card__body">
          <p class="ak-section-subtitle">
            Select the visual aesthetic theme for your Rhodes Island terminal interface:
          </p>

          <div class="ak-themes-grid">
            <div
              v-for="t in themeOptions"
              :key="t.id"
              class="ak-theme-card"
              :class="{ 'ak-theme-card--active': theme === t.id }"
              @click="selectTheme(t.id)"
            >
              <div class="ak-theme-card__preview" :style="{ backgroundColor: t.bgHex }">
                <span class="ak-theme-dot" :style="{ backgroundColor: t.colorHex }" />
                <span class="ak-theme-line" :style="{ backgroundColor: t.colorHex }" />
              </div>
              <div class="ak-theme-card__meta">
                <div class="ak-theme-card__name-row">
                  <strong class="ak-theme-card__name">{{ t.name }}</strong>
                  <span v-if="theme === t.id" class="ak-theme-check">✓ ACTIVE</span>
                </div>
                <span class="ak-theme-card__desc">{{ t.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Region & Server Configuration -->
      <section class="ak-settings-card">
        <div class="ak-settings-card__head">
          <span class="ak-settings-card__num">03</span>
          <h3>SERVER REGION & LOCALIZATION</h3>
        </div>

        <div class="ak-settings-card__body">
          <!-- Server Region -->
          <div class="ak-setting-field">
            <label class="ak-field-label">TARGET GAME SERVER</label>
            <div class="ak-server-select-grid">
              <button
                v-for="opt in serverOptions"
                :key="opt.code"
                type="button"
                class="ak-region-btn"
                :class="{ 'ak-region-btn--active': server === opt.code }"
                @click="server = opt.code; saveSettings()"
              >
                <span class="ak-region-btn__code">{{ opt.code }}</span>
                <span class="ak-region-btn__name">{{ opt.name }}</span>
              </button>
            </div>
            <span class="ak-field-hint">
              Affects drop rate sampling in Penguin Stats and event schedules.
            </span>
          </div>

          <!-- Language Selector -->
          <div class="ak-setting-field">
            <label class="ak-field-label">INTERFACE LANGUAGE</label>
            <select
              v-model="language"
              class="ak-select-input"
              @change="saveSettings"
            >
              <option
                v-for="lang in languageOptions"
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- Section 4: Data Management & Supabase Tables -->
      <section class="ak-settings-card">
        <div class="ak-settings-card__head">
          <span class="ak-settings-card__num">04</span>
          <h3>DATA MANAGEMENT</h3>
        </div>

        <div class="ak-settings-card__body">
          <div class="ak-data-stats">
            <div class="ak-data-pill">
              <span class="ak-data-pill__label">STORED OPERATORS:</span>
              <strong class="ak-data-pill__val">{{ userStore.totalOperators }}</strong>
            </div>
            <div class="ak-data-pill">
              <span class="ak-data-pill__label">STOCK ITEMS:</span>
              <strong class="ak-data-pill__val">{{ Object.keys(userStore.inventory).length }}</strong>
            </div>
            <div class="ak-data-pill">
              <span class="ak-data-pill__label">SYNC STATUS:</span>
              <strong class="ak-data-pill__val" :class="userStore.isSynced ? 'ak-text-cyan' : 'ak-text-amber'">
                {{ userStore.isSynced ? 'SYNCED' : 'UNSAVED' }}
              </strong>
            </div>
          </div>

          <div class="ak-danger-zone">
            <div class="ak-danger-zone__text">
              <strong>RESET LOCAL DEPOT & ROSTER</strong>
              <p>Clears cached items and operators from browser localStorage (does not delete Supabase remote data).</p>
            </div>
            <button
              type="button"
              class="ak-btn-danger"
              @click="userStore.clearUserData(); saveSettings()"
            >
              CLEAR LOCAL DATA
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Account Sync Modal -->
    <AccountSyncModal v-model="isSyncModalOpen" />
  </div>
</template>

<style lang="scss" scoped>
.ak-settings {
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

  &__title-group {
    max-width: 700px;
  }

  &__tag {
    font-size: 0.75rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 1.5px;
    margin: 0.25rem 0 0.5rem;
    color: $ak-text-primary;
  }

  &__desc {
    color: $ak-text-secondary;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;

    @media (min-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

// Cloud Status Box
.ak-cloud-status {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: monospace;

  &__icon {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: $ak-amber;
    box-shadow: 0 0 8px rgba($ak-amber, 0.8);
  }

  &--connected {
    .ak-cloud-status__icon {
      background-color: $ak-green;
      box-shadow: 0 0 8px rgba($ak-green, 0.8);
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 700;
    color: $ak-text-primary;
  }

  &__sub {
    font-size: 0.65rem;
    color: $ak-text-muted;
  }
}

.ak-btn-cloud-sync {
  padding: 0.35rem 0.65rem;
  background: rgba($ak-cyan, 0.15);
  border: 1px solid $ak-cyan;
  color: $ak-cyan;
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: $ak-cyan;
    color: #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
}

// Status Banner
.ak-status-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-left: 4px solid;

  &--saving {
    background: rgba($ak-cyan, 0.1);
    color: $ak-cyan;
    border-color: $ak-cyan;
  }

  &--saved {
    background: rgba($ak-green, 0.1);
    color: $ak-green;
    border-color: $ak-green;
  }

  &--error {
    background: rgba($ak-red, 0.1);
    color: $ak-red;
    border-color: $ak-red;
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba($ak-cyan, 0.3);
    border-top-color: $ak-cyan;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

// Settings Cards
.ak-settings-card {
  background: $ak-bg-secondary;
  border: 1px solid rgba(255, 255, 255, 0.08);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  display: flex;
  flex-direction: column;

  &__head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    h3 {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: $ak-text-primary;
      margin: 0;
    }
  }

  &__num {
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 800;
    color: $ak-cyan;
    padding: 0.1rem 0.35rem;
    background: rgba($ak-cyan, 0.12);
    border: 1px solid rgba($ak-cyan, 0.3);
  }

  &__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
}

.ak-section-subtitle {
  font-size: 0.8rem;
  color: $ak-text-muted;
  margin: 0;
}

// Setting Item with Switch
.ak-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &__info {
    flex: 1;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.35rem;
  }

  &__title {
    font-weight: 700;
    font-size: 0.95rem;
    color: $ak-text-primary;
  }

  &__desc {
    margin: 0;
    font-size: 0.78rem;
    color: $ak-text-secondary;
    line-height: 1.4;
  }
}

.ak-badge-card {
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border: 1px solid;

  &--active {
    background: rgba($ak-green, 0.12);
    border-color: rgba($ak-green, 0.4);
    color: $ak-green;
  }

  &--inactive {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    color: $ak-text-muted;
  }
}

// Toggle Switch
.ak-toggle-switch {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &__handle {
    width: 16px;
    height: 16px;
    background: #fff;
    position: absolute;
    top: 3px;
    left: 4px;
    transition: transform 0.2s ease;
  }

  &--active {
    background: $ak-cyan;
    border-color: $ak-cyan;

    .ak-toggle-switch__handle {
      transform: translateX(18px);
      background: #000;
    }
  }
}

// Promo Box
.ak-sync-promo-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba($ak-cyan, 0.05);
  border: 1px dashed rgba($ak-cyan, 0.3);
  border-left: 3px solid $ak-cyan;

  &__text {
    strong {
      font-size: 0.8rem;
      font-family: monospace;
      color: $ak-cyan;
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: $ak-text-secondary;
    }
  }
}

.ak-btn-promo-sync {
  padding: 0.45rem 0.85rem;
  background: $ak-cyan;
  border: 1px solid $ak-cyan;
  color: #000;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: $ak-cyan-light;
    box-shadow: 0 0 10px rgba($ak-cyan, 0.5);
  }
}

// Themes Grid
.ak-themes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.ak-theme-card {
  display: flex;
  flex-direction: column;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.04);
  }

  &--active {
    border-color: $ak-cyan;
    background: rgba($ak-cyan, 0.08);
  }

  &__preview {
    height: 48px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.75rem;
    position: relative;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__name-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.25rem;
  }

  &__name {
    font-size: 0.82rem;
    color: $ak-text-primary;
  }

  &__desc {
    font-size: 0.7rem;
    color: $ak-text-muted;
    line-height: 1.3;
  }
}

.ak-theme-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.ak-theme-line {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  opacity: 0.7;
}

.ak-theme-check {
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 800;
  color: $ak-cyan;
}

// Setting Field
.ak-setting-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ak-field-label {
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: $ak-text-muted;
  letter-spacing: 1px;
}

.ak-field-hint {
  font-size: 0.72rem;
  color: $ak-text-muted;
}

.ak-server-select-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.ak-region-btn {
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &__code {
    font-size: 0.85rem;
    font-weight: 800;
    color: $ak-text-primary;
  }

  &__name {
    font-size: 0.65rem;
    color: $ak-text-muted;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &--active {
    background: rgba($ak-cyan, 0.12);
    border-color: $ak-cyan;

    .ak-region-btn__code {
      color: $ak-cyan;
    }
  }
}

.ak-select-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-family: monospace;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: $ak-cyan;
  }
}

// Data Stats
.ak-data-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.ak-data-pill {
  padding: 0.6rem 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__label {
    color: $ak-text-muted;
  }

  &__val {
    color: $ak-text-primary;
  }
}

.ak-text-cyan {
  color: $ak-cyan !important;
}

.ak-text-amber {
  color: $ak-amber !important;
}

// Danger Zone
.ak-danger-zone {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba($ak-red, 0.05);
  border: 1px solid rgba($ak-red, 0.2);
  border-left: 3px solid $ak-red;
  margin-top: 0.5rem;

  &__text {
    strong {
      font-size: 0.8rem;
      font-family: monospace;
      color: $ak-red;
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 0.72rem;
      color: $ak-text-secondary;
    }
  }
}

.ak-btn-danger {
  padding: 0.45rem 0.85rem;
  background: transparent;
  border: 1px solid $ak-red;
  color: $ak-red;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: $ak-red;
    color: #fff;
  }
}

// Animations
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ak-alert-fade-enter-active,
.ak-alert-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.ak-alert-fade-enter-from,
.ak-alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
