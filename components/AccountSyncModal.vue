<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '~/stores/userStore'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'synced', result: any): void
}>()

const userStore = useUserStore()
const toast = useToast()

// State
type AuthTab = 'token' | 'email' | 'demo'
const activeTab = ref<AuthTab>('token')

const form = reactive({
  server: 'en',
  uid: '',
  token: '',
  email: '',
  code: '',
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successData = ref<any | null>(null)
const syncStage = ref<string>('')

// Close Modal
const closeModal = () => {
  if (isSubmitting.value) return
  emit('update:modelValue', false)
  emit('close')
  errorMessage.value = null
  successData.value = null
}

// Demo data generator for rapid offline preview / testing
const generateDemoData = (): {
  success: boolean
  profile: { uid: string; nickname: string; level: number; server: string }
  gacha: {
    orundum: number
    originite_prime: number
    single_permits: number
    ten_permits: number
    lmd: number
    pulls_without_op: number
    pulls_with_op: number
  }
  inventory: Record<string, number>
  roster: Array<{
    operator_id: string
    elite: number
    level: number
    potential: number
    skill_level: number
    masteries: Record<string, number>
    modules: Record<string, number>
  }>
  total_operators?: number
} => {
  return {
    success: true,
    profile: {
      uid: '88492015',
      nickname: 'Doctor Amiya',
      level: 120,
      server: form.server.toUpperCase(),
    },
    gacha: {
      orundum: 42600,
      originite_prime: 54,
      single_permits: 8,
      ten_permits: 3,
      lmd: 2450000,
      pulls_without_op: 109,
      pulls_with_op: 125,
    },
    inventory: {
      '4001': 2450000,
      'orundum': 42600,
      'originite_prime': 54,
      '7001': 8,
      '7002': 3,
      '30013': 85,
      '30014': 24,
      '30073': 42,
      '30074': 18,
      '30083': 36,
      '30084': 12,
      '30093': 29,
      '30094': 14,
      '31014': 16,
      '31024': 15,
      '32001': 10,
      '3303': 120,
      'mod_unlock_token': 14,
    },
    roster: [
      {
        operator_id: 'char_172_silver',
        elite: 2,
        level: 90,
        potential: 6,
        skill_level: 7,
        masteries: { skchr_silver_3: 3 },
        modules: { uniequip_002_silver: 3 },
      },
      {
        operator_id: 'char_350_surtr',
        elite: 2,
        level: 90,
        potential: 3,
        skill_level: 7,
        masteries: { skchr_surtr_3: 3 },
        modules: {},
      },
      {
        operator_id: 'char_4025_aprot',
        elite: 2,
        level: 90,
        potential: 4,
        skill_level: 7,
        masteries: { skchr_aprot_3: 3 },
        modules: { uniequip_002_aprot: 3 },
      },
      {
        operator_id: 'char_202_demkni',
        elite: 2,
        level: 80,
        potential: 5,
        skill_level: 7,
        masteries: { skchr_demkni_1: 3, skchr_demkni_2: 3, skchr_demkni_3: 3 },
        modules: { uniequip_002_demkni: 3 },
      },
      {
        operator_id: 'char_103_angel',
        elite: 2,
        level: 80,
        potential: 6,
        skill_level: 7,
        masteries: { skchr_angel_3: 3 },
        modules: { uniequip_002_angel: 3 },
      },
      {
        operator_id: 'char_102_texas',
        elite: 2,
        level: 60,
        potential: 6,
        skill_level: 7,
        masteries: { skchr_texas_2: 3 },
        modules: {},
      },
      {
        operator_id: 'char_237_gravel',
        elite: 1,
        level: 50,
        potential: 6,
        skill_level: 7,
        masteries: {},
        modules: {},
      },
    ],
    total_operators: 7,
  }
}

// Perform Account Sync
const handleSync = async () => {
  errorMessage.value = null
  successData.value = null
  isSubmitting.value = true

  try {
    syncStage.value = 'CONNECTING TO PRTS AUTH GATEWAY...'

    if (activeTab.value === 'demo') {
      // Simulate network latency for demo
      await new Promise((r) => setTimeout(r, 600))
      syncStage.value = 'DECODING DEPOT INVENTORY & TROOP ROSTER...'
      await new Promise((r) => setTimeout(r, 500))
      const demo = await userStore.loadDemoData()
      successData.value = demo
      emit('synced', demo)
      toast.success(
        `Welcome Doctor ${demo.profile.nickname}! Depot stock & operator roster synchronized.`,
        {
          title: 'PRTS GATEWAY',
          tag: 'AUTH // OK',
        }
      )
      return
    }

    // Build Payload for /api/sync_arkprts (Vercel Python serverless endpoint)
    const payload: Record<string, any> = {
      server: form.server,
      auth_type: activeTab.value === 'token' ? 'token' : 'email_code',
    }

    if (activeTab.value === 'token') {
      if (!form.uid.trim() || !form.token.trim()) {
        throw new Error('Please provide both UID and Secret Token.')
      }
      payload.uid = form.uid.trim()
      payload.token = form.token.trim()
    } else {
      if (!form.email.trim() || !form.code.trim()) {
        throw new Error('Please provide both Yostar Email and Verification Code.')
      }
      payload.email = form.email.trim()
      payload.code = form.code.trim()
    }

    syncStage.value = 'QUERYING ARKNIGHTS GAME SERVERS...'

    // Try posting to /api/sync_arkprts
    const response = await fetch('/api/sync_arkprts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to authenticate with game servers. Check your credentials.')
    }

    syncStage.value = 'UPDATING LOCAL DEPOT & OPERATOR ROSTER...'

    // Update userStore
    await userStore.syncFromArkprtsData(data)
    successData.value = data
    emit('synced', data)
    toast.success(`Doctor profile and inventory synchronized with game servers!`, {
      title: 'PRTS GATEWAY',
      tag: 'AUTH // OK',
    })
  } catch (err: any) {
    const msg = err?.message || 'An unexpected synchronization error occurred.'
    errorMessage.value = msg
    toast.error(msg, {
      title: 'GATEWAY ERROR',
      tag: 'AUTH // FAIL',
    })
  } finally {
    isSubmitting.value = false
    syncStage.value = ''
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="ak-modal-overlay" @click.self="closeModal">
      <div class="ak-modal-dialog">
        <!-- Header Bar -->
      <div class="ak-modal-header">
        <div class="ak-modal-header__meta">
          <span class="ak-modal-header__code">PRTS.GATEWAY // PROTOCOL SYNC</span>
          <h3 class="ak-modal-header__title">Account Synchronization</h3>
        </div>
        <button
          type="button"
          class="ak-modal-close"
          :disabled="isSubmitting"
          aria-label="Close modal"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <!-- Success Screen -->
      <div v-if="successData" class="ak-modal-body ak-success-body">
        <div class="ak-success-badge">
          <span class="ak-success-badge__icon">✓</span>
          <h4>SYNCHRONIZATION COMPLETED</h4>
          <p>Account data successfully retrieved via arkprts and synced to your Pinia store & local depot.</p>
        </div>

        <div class="ak-sync-summary">
          <div class="ak-summary-card">
            <span class="ak-summary-card__label">DOCTOR</span>
            <span class="ak-summary-card__val">
              <strong>{{ successData.profile.nickname }}</strong>
              (LV.{{ successData.profile.level }})
            </span>
          </div>

          <div class="ak-summary-card">
            <span class="ak-summary-card__label">ROSTER</span>
            <span class="ak-summary-card__val">
              <strong>{{ successData.total_operators }}</strong> Operators
            </span>
          </div>

          <div class="ak-summary-card">
            <span class="ak-summary-card__label">ORUNDUM & OP</span>
            <span class="ak-summary-card__val">
              <strong>{{ successData.gacha.orundum.toLocaleString() }}</strong> 💎 / 
              <strong>{{ successData.gacha.originite_prime }}</strong> OP
            </span>
          </div>

          <div class="ak-summary-card">
            <span class="ak-summary-card__label">ESTIMATED PULLS</span>
            <span class="ak-summary-card__val ak-summary-card__val--cyan">
              <strong>{{ successData.gacha.pulls_with_op }}</strong> Pulls
            </span>
          </div>
        </div>

        <div class="ak-modal-footer">
          <button type="button" class="ak-btn ak-btn--primary" @click="closeModal">
            CLOSE & CONTINUE
          </button>
        </div>
      </div>

      <!-- Form Body -->
      <div v-else class="ak-modal-body">
        <!-- Auth Method Tabs -->
        <div class="ak-auth-tabs">
          <button
            type="button"
            class="ak-auth-tab"
            :class="{ 'ak-auth-tab--active': activeTab === 'token' }"
            @click="activeTab = 'token'"
          >
            TOKEN LOGIN
          </button>
          <button
            type="button"
            class="ak-auth-tab"
            :class="{ 'ak-auth-tab--active': activeTab === 'email' }"
            @click="activeTab = 'email'"
          >
            YOSTAR EMAIL CODE
          </button>
          <button
            type="button"
            class="ak-auth-tab ak-auth-tab--demo"
            :class="{ 'ak-auth-tab--active': activeTab === 'demo' }"
            @click="activeTab = 'demo'"
          >
            DEMO PREVIEW
          </button>
        </div>

        <!-- Server Selector -->
        <div class="ak-form-group">
          <label class="ak-label">SERVER REGION</label>
          <div class="ak-server-grid">
            <button
              v-for="s in ['en', 'jp', 'kr', 'cn']"
              :key="s"
              type="button"
              class="ak-server-btn"
              :class="{ 'ak-server-btn--active': form.server === s }"
              @click="form.server = s"
            >
              {{ s.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Token Fields -->
        <template v-if="activeTab === 'token'">
          <div class="ak-form-group">
            <label class="ak-label">DOCTOR UID (ACCOUNT ID)</label>
            <input
              v-model="form.uid"
              type="text"
              class="ak-input"
              placeholder="e.g. 10482914"
              :disabled="isSubmitting"
            />
          </div>

          <div class="ak-form-group">
            <label class="ak-label">SECRET AUTH TOKEN</label>
            <div class="ak-password-wrap">
              <input
                v-model="form.token"
                :type="showPassword ? 'text' : 'password'"
                class="ak-input"
                placeholder="Enter Yostar or PRTS auth token"
                :disabled="isSubmitting"
              />
              <button
                type="button"
                class="ak-pw-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'HIDE' : 'SHOW' }}
              </button>
            </div>
          </div>
        </template>

        <!-- Email Verification Fields -->
        <template v-else-if="activeTab === 'email'">
          <div class="ak-form-group">
            <label class="ak-label">YOSTAR ACCOUNT EMAIL</label>
            <input
              v-model="form.email"
              type="email"
              class="ak-input"
              placeholder="doctor@example.com"
              :disabled="isSubmitting"
            />
          </div>

          <div class="ak-form-group">
            <label class="ak-label">6-DIGIT VERIFICATION CODE</label>
            <input
              v-model="form.code"
              type="text"
              class="ak-input ak-input--code"
              placeholder="123456"
              maxlength="6"
              :disabled="isSubmitting"
            />
          </div>
        </template>

        <!-- Demo Mode Notice -->
        <template v-else>
          <div class="ak-demo-notice">
            <span class="ak-demo-notice__icon">ℹ️</span>
            <div>
              <strong>DEMO PREVIEW MODE</strong>
              <p>
                Loads realistic sample account data (SilverAsh, Surtr, Młynar, 42.6k Orundum, 54 OP, LMD and upgrade materials)
                into your Pinia store without requiring live Yostar credentials.
              </p>
            </div>
          </div>
        </template>

        <!-- Sync Progress / Stage indicator -->
        <div v-if="isSubmitting" class="ak-sync-progress">
          <div class="ak-progress-bar">
            <div class="ak-progress-bar__fill" />
          </div>
          <span class="ak-progress-text">{{ syncStage }}</span>
        </div>

        <!-- Error Message Banner -->
        <div v-if="errorMessage" class="ak-error-banner">
          <span class="ak-error-banner__icon">⚠</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Modal Actions -->
        <div class="ak-modal-footer">
          <button
            type="button"
            class="ak-btn ak-btn--ghost"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            CANCEL
          </button>
          <button
            type="button"
            class="ak-btn ak-btn--primary"
            :disabled="isSubmitting"
            @click="handleSync"
          >
            <span v-if="isSubmitting" class="ak-spinner" />
            <span>{{ activeTab === 'demo' ? 'LOAD DEMO DATA' : 'START SYNC' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.ak-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.ak-modal-dialog {
  width: 100%;
  max-width: 520px;
  background: $ak-bg-secondary;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 4px solid $ak-cyan;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba($ak-cyan, 0.15);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  display: flex;
  flex-direction: column;
}

// Header
.ak-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &__code {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 800;
    color: $ak-text-primary;
    margin: 0.15rem 0 0;
  }
}

.ak-modal-close {
  background: transparent;
  border: none;
  color: $ak-text-muted;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem;

  &:hover {
    color: $ak-red;
  }
}

// Body
.ak-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

// Auth Tabs
.ak-auth-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0.5rem;
}

.ak-auth-tab {
  padding: 0.6rem 0.85rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: $ak-text-primary;
  }

  &--active {
    color: $ak-cyan;
    border-bottom-color: $ak-cyan;
  }

  &--demo.ak-auth-tab--active {
    color: $ak-yellow;
    border-bottom-color: $ak-yellow;
  }
}

// Forms
.ak-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ak-label {
  font-family: monospace;
  font-size: 0.68rem;
  font-weight: 700;
  color: $ak-text-muted;
  letter-spacing: 1px;
}

.ak-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-family: monospace;
  font-size: 0.85rem;
  outline: none;

  &:focus {
    border-color: $ak-cyan;
    box-shadow: 0 0 8px rgba($ak-cyan, 0.3);
  }

  &--code {
    letter-spacing: 4px;
    font-size: 1.1rem;
    font-weight: 800;
    text-align: center;
  }
}

.ak-password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ak-pw-toggle {
  position: absolute;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.62rem;
  cursor: pointer;

  &:hover {
    color: $ak-text-primary;
  }
}

// Server Grid
.ak-server-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.ak-server-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $ak-text-secondary;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    color: $ak-text-primary;
    border-color: rgba(255, 255, 255, 0.25);
  }

  &--active {
    background: rgba($ak-cyan, 0.15);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }
}

// Demo Notice
.ak-demo-notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba($ak-yellow, 0.08);
  border: 1px solid rgba($ak-yellow, 0.25);
  border-left: 3px solid $ak-yellow;
  font-size: 0.82rem;
  color: $ak-text-secondary;

  strong {
    color: $ak-yellow;
    font-family: monospace;
  }

  p {
    margin: 0.25rem 0 0;
    line-height: 1.35;
  }
}

// Progress
.ak-sync-progress {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.ak-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;

  &__fill {
    width: 40%;
    height: 100%;
    background: $ak-cyan;
    position: absolute;
    animation: indeterminate 1.2s infinite ease-in-out;
  }
}

.ak-progress-text {
  font-family: monospace;
  font-size: 0.68rem;
  color: $ak-cyan;
  letter-spacing: 0.5px;
}

// Error Banner
.ak-error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba($ak-red, 0.12);
  border: 1px solid rgba($ak-red, 0.3);
  border-left: 3px solid $ak-red;
  color: $ak-red;
  font-family: monospace;
  font-size: 0.75rem;
}

// Footer
.ak-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.ak-btn {
  padding: 0.65rem 1.25rem;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;

  &--ghost {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: $ak-text-secondary;

    &:hover {
      color: $ak-text-primary;
      border-color: rgba(255, 255, 255, 0.3);
    }
  }

  &--primary {
    background: $ak-cyan;
    border: 1px solid $ak-cyan;
    color: #000;

    &:hover:not(:disabled) {
      background: $ak-cyan-light;
      box-shadow: 0 0 10px rgba($ak-cyan, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// Success screen
.ak-success-body {
  gap: 1.5rem;
}

.ak-success-badge {
  text-align: center;
  padding: 1.25rem;
  background: rgba($ak-green, 0.08);
  border: 1px dashed rgba($ak-green, 0.3);

  &__icon {
    display: inline-block;
    width: 36px;
    height: 36px;
    line-height: 36px;
    border-radius: 50%;
    background: $ak-green;
    color: #000;
    font-weight: 900;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  h4 {
    font-family: monospace;
    color: $ak-green;
    font-size: 0.95rem;
    margin: 0;
    letter-spacing: 1px;
  }

  p {
    font-size: 0.78rem;
    color: $ak-text-secondary;
    margin: 0.35rem 0 0;
  }
}

.ak-sync-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.ak-summary-card {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  display: flex;
  flex-direction: column;

  &__label {
    font-size: 0.6rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__val {
    font-size: 0.85rem;
    color: $ak-text-secondary;
    margin-top: 0.2rem;

    strong {
      color: $ak-text-primary;
    }

    &--cyan strong {
      color: $ak-cyan;
    }
  }
}

.ak-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes indeterminate {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}
</style>
