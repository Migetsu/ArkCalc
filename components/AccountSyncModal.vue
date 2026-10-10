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

// Active Tab: Yostar Email Code | Manual JSON Import | Demo Preview
type AuthTab = 'email' | 'json' | 'demo'
const activeTab = ref<AuthTab>('email')

const form = reactive({
  server: 'en',
  email: '',
  code: '',
})

// Send Code State
const isSendingCode = ref(false)
const sendCodeCooldown = ref(0)
let cooldownTimer: any = null

// Manual JSON Import State
const jsonInput = ref('')
const jsonFileName = ref('')
const jsonParseError = ref<string | null>(null)
const jsonPreviewData = ref<any | null>(null)

// Modal State
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

// Request verification code from Yostar
const handleSendCode = async () => {
  if (sendCodeCooldown.value > 0 || isSendingCode.value) return
  const cleanEmail = form.email.trim()

  if (!cleanEmail || !cleanEmail.includes('@')) {
    errorMessage.value = 'Please provide a valid email address before requesting a verification code.'
    return
  }

  errorMessage.value = null
  isSendingCode.value = true

  try {
    const res = await $fetch<any>('/api/yostar/send_code', {
      method: 'POST',
      body: {
        email: cleanEmail,
        server: form.server,
      },
    })

    toast.success(res.message || `Code requested for ${cleanEmail}. Check your inbox and spam folder.`, {
      title: 'VERIFICATION CODE SENT',
      tag: 'YOSTAR // AUTH',
    })

    // Initiate 60-second cooldown timer
    sendCodeCooldown.value = 60
    if (cooldownTimer) clearInterval(cooldownTimer)
    cooldownTimer = setInterval(() => {
      sendCodeCooldown.value--
      if (sendCodeCooldown.value <= 0) {
        clearInterval(cooldownTimer)
      }
    }, 1000)
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.message || 'Failed to transmit verification code request.'
    errorMessage.value = msg
    toast.error(msg, {
      title: 'TRANSMISSION ERROR',
      tag: 'AUTH // FAIL',
    })
  } finally {
    isSendingCode.value = false
  }
}

// Handle JSON file upload
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  jsonFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string
      jsonInput.value = text
      validateAndParseJson(text)
    } catch {
      jsonParseError.value = 'Failed to read uploaded file.'
    }
  }
  reader.readAsText(file)
}

// Paste JSON directly from system clipboard
const handlePasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      jsonInput.value = text
      validateAndParseJson(text)
      toast.info('JSON data pasted from clipboard.', { title: 'CLIPBOARD IMPORT' })
    }
  } catch {
    toast.warning('Clipboard access blocked by browser. Paste directly into the textarea.', { title: 'CLIPBOARD' })
  }
}

// Validate and parse raw JSON text
const validateAndParseJson = (rawText: string) => {
  jsonParseError.value = null
  jsonPreviewData.value = null
  if (!rawText.trim()) return null

  try {
    const parsed = JSON.parse(rawText)
    // Structure extraction preview
    const preview = {
      nickname: parsed.profile?.nickname || parsed.nickname || parsed.user?.name || 'Doctor',
      level: parsed.profile?.level || parsed.level || 120,
      server: parsed.profile?.server || parsed.server || form.server.toUpperCase(),
      rosterCount: Array.isArray(parsed.roster)
        ? parsed.roster.length
        : typeof parsed.roster === 'object' && parsed.roster !== null
        ? Object.keys(parsed.roster).length
        : 0,
      inventoryCount: typeof parsed.inventory === 'object' && parsed.inventory !== null
        ? Object.keys(parsed.inventory).length
        : 0,
      orundum: parsed.gacha?.orundum ?? parsed.inventory?.['orundum'] ?? 0,
      originitePrime: parsed.gacha?.originite_prime ?? parsed.inventory?.['originite_prime'] ?? 0,
    }

    jsonPreviewData.value = preview
    return parsed
  } catch (err: any) {
    jsonParseError.value = 'Syntax error in JSON: ' + (err.message || 'Invalid format')
    return null
  }
}

// Execute Account Synchronization or JSON Import
const handleSync = async () => {
  errorMessage.value = null
  successData.value = null

  // 1. DEMO MODE
  if (activeTab.value === 'demo') {
    isSubmitting.value = true
    syncStage.value = 'INITIALIZING DEMO ENVIRONMENT...'
    try {
      const demo = await userStore.loadDemoData()
      successData.value = {
        profile: demo.profile,
        total_operators: demo.roster?.length || 8,
        gacha: demo.gacha,
      }
      emit('synced', demo)
      toast.success(`Demo account loaded! Welcome Doctor ${demo.profile.nickname}.`, {
        title: 'DEMO READY',
        tag: 'PRTS // DEMO',
      })
    } catch (err: any) {
      errorMessage.value = err?.message || 'Failed to load demo data.'
    } finally {
      isSubmitting.value = false
      syncStage.value = ''
    }
    return
  }

  // 2. MANUAL JSON IMPORT
  if (activeTab.value === 'json') {
    const parsed = validateAndParseJson(jsonInput.value)
    if (!parsed) {
      errorMessage.value = jsonParseError.value || 'Please provide valid JSON data before importing.'
      return
    }

    isSubmitting.value = true
    syncStage.value = 'PARSING JSON & SYNCHRONIZING DEPOT...'
    try {
      await userStore.syncFromArkprtsData(parsed)
      successData.value = {
        profile: parsed.profile || {
          nickname: jsonPreviewData.value?.nickname || 'Doctor',
          level: jsonPreviewData.value?.level || 120,
          server: jsonPreviewData.value?.server || form.server.toUpperCase(),
        },
        total_operators: jsonPreviewData.value?.rosterCount || 0,
        gacha: parsed.gacha || {
          orundum: userStore.getItemQuantity('orundum'),
          originite_prime: userStore.getItemQuantity('originite_prime'),
          pulls_with_op: Math.floor(userStore.getItemQuantity('orundum') / 600) + Math.floor((userStore.getItemQuantity('originite_prime') * 180) / 600),
        },
      }
      emit('synced', parsed)
      toast.success('Roster and inventory depot imported successfully from JSON!', {
        title: 'IMPORT COMPLETED',
        tag: 'JSON // SYNCED',
      })
    } catch (err: any) {
      errorMessage.value = 'JSON Import Error: ' + (err?.message || 'Failed to process data structure')
    } finally {
      isSubmitting.value = false
      syncStage.value = ''
    }
    return
  }

  // 3. YOSTAR EMAIL CODE
  if (activeTab.value === 'email') {
    if (!form.email.trim() || !form.code.trim()) {
      errorMessage.value = 'Please provide both your Yostar account email and the 6-digit verification code.'
      return
    }

    isSubmitting.value = true
    syncStage.value = 'CONNECTING TO ARKNIGHTS GATEWAY...'

    try {
      const response = await fetch('/api/sync_arkprts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: form.server,
          auth_type: 'email_code',
          email: form.email.trim(),
          code: form.code.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate with game servers. Please check your verification code.')
      }

      syncStage.value = 'SYNCHRONIZING DEPOT & OPERATOR ROSTER...'
      await userStore.syncFromArkprtsData(data)
      successData.value = data
      emit('synced', data)

      toast.success('Doctor profile and inventory synchronized with game servers!', {
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
            ✕
          </button>
        </div>

        <!-- Success Screen -->
        <div v-if="successData" class="ak-modal-body ak-success-body">
          <div class="ak-success-badge">
            <span class="ak-success-badge__icon">✓</span>
            <h4>SYNCHRONIZATION COMPLETED</h4>
            <p>Account data successfully retrieved and populated into your local depot and roster.</p>
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
          <!-- Prominent Security & Zero-Storage Notice -->
          <div class="ak-security-banner">
            <div class="ak-security-banner__header">
              <span class="ak-security-banner__badge">⚠️ ACCOUNT RISK ADVISORY</span>
              <span class="ak-security-banner__policy">🔒 ZERO-STORAGE POLICY</span>
            </div>
            <p class="ak-security-banner__text">
              <strong>Account Safety:</strong> Synchronizing via live verification codes interacts directly with official authentication endpoints. Logging into an external tool while your in-game client is open will disconnect your active game session.
            </p>
            <p class="ak-security-banner__text ak-security-banner__text--dim">
              <strong>Privacy Guarantee:</strong> We do <em>not</em> store login credentials, verification codes, or access tokens on any server. All depot items and operator rosters remain entirely in your local browser session.
            </p>
          </div>

          <!-- Auth Method Tabs -->
          <div class="ak-auth-tabs">
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
              class="ak-auth-tab"
              :class="{ 'ak-auth-tab--active': activeTab === 'json' }"
              @click="activeTab = 'json'"
            >
              MANUAL JSON IMPORT
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

          <!-- Server Selector (For Email & General) -->
          <div v-if="activeTab !== 'demo'" class="ak-form-group">
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

          <!-- TAB 1: Yostar Email Verification Code -->
          <template v-if="activeTab === 'email'">
            <div class="ak-form-group">
              <label class="ak-label">YOSTAR ACCOUNT EMAIL</label>
              <div class="ak-input-with-action">
                <input
                  v-model="form.email"
                  type="email"
                  class="ak-input"
                  placeholder="doctor@example.com"
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  class="ak-btn-send-code"
                  :disabled="isSendingCode || sendCodeCooldown > 0 || isSubmitting"
                  @click="handleSendCode"
                >
                  <span v-if="isSendingCode" class="ak-mini-spinner" />
                  <span v-else-if="sendCodeCooldown > 0">{{ sendCodeCooldown }}s</span>
                  <span v-else>SEND CODE</span>
                </button>
              </div>
              <span class="ak-input-hint">Click "SEND CODE" to receive a 6-digit confirmation code on your email.</span>
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

          <!-- TAB 2: Manual JSON Import -->
          <template v-else-if="activeTab === 'json'">
            <div class="ak-form-group">
              <label class="ak-label">UPLOAD JSON FILE OR PASTE EXPORT</label>
              <div class="ak-file-upload-box">
                <label class="ak-file-picker-label">
                  <input
                    type="file"
                    accept=".json,application/json"
                    class="ak-file-hidden"
                    @change="handleFileUpload"
                  />
                  <span class="ak-file-btn">📂 CHOOSE .JSON FILE</span>
                  <span class="ak-file-name">{{ jsonFileName || 'No file selected (Supports Krooster / Arkprts / Penguin)' }}</span>
                </label>
                <button
                  type="button"
                  class="ak-btn-paste"
                  @click="handlePasteFromClipboard"
                >
                  📋 PASTE CLIPBOARD
                </button>
              </div>
            </div>

            <div class="ak-form-group">
              <label class="ak-label">JSON PAYLOAD</label>
              <textarea
                v-model="jsonInput"
                rows="5"
                class="ak-textarea"
                placeholder='Paste raw JSON here: { "profile": {...}, "inventory": {...}, "roster": [...] }'
                :disabled="isSubmitting"
                @input="validateAndParseJson(jsonInput)"
              />
            </div>

            <!-- JSON Live Preview & Error -->
            <div v-if="jsonParseError" class="ak-json-error">
              ⚠ {{ jsonParseError }}
            </div>
            <div v-else-if="jsonPreviewData" class="ak-json-preview">
              <div class="ak-json-preview__item">
                <span>Doctor:</span> <strong>{{ jsonPreviewData.nickname }} (Lv.{{ jsonPreviewData.level }})</strong>
              </div>
              <div class="ak-json-preview__item">
                <span>Operators:</span> <strong>{{ jsonPreviewData.rosterCount }}</strong>
              </div>
              <div class="ak-json-preview__item">
                <span>Depot Items:</span> <strong>{{ jsonPreviewData.inventoryCount }}</strong>
              </div>
              <div class="ak-json-preview__item">
                <span>Orundum:</span> <strong>{{ jsonPreviewData.orundum.toLocaleString() }}</strong>
              </div>
            </div>
          </template>

          <!-- TAB 3: Demo Preview Notice -->
          <template v-else>
            <div class="ak-demo-notice">
              <span class="ak-demo-notice__icon">ℹ️</span>
              <div>
                <strong>DEMO PREVIEW MODE</strong>
                <p>
                  Loads full sample account data (Doctor Amiya Lv.120, 8 operators including Młynar & Surtr, 42.6k Orundum, 54 OP, LMD and upgrade materials)
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
              :disabled="isSubmitting || (activeTab === 'json' && !jsonInput.trim())"
              @click="handleSync"
            >
              <span v-if="isSubmitting" class="ak-spinner" />
              <span v-else-if="activeTab === 'demo'">LOAD DEMO DATA</span>
              <span v-else-if="activeTab === 'json'">IMPORT JSON DATA</span>
              <span v-else>START SYNC</span>
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.ak-modal-dialog {
  width: 100%;
  max-width: 560px;
  background: $ak-bg-secondary;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 4px solid $ak-cyan;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba($ak-cyan, 0.15);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
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
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.15s ease;

  &:hover {
    color: #fff;
  }
}

.ak-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

// Security Banner
.ak-security-banner {
  padding: 0.85rem 1rem;
  background: rgba($ak-amber, 0.07);
  border: 1px solid rgba($ak-amber, 0.25);
  border-left: 3px solid $ak-amber;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__badge {
    font-size: 0.65rem;
    font-family: monospace;
    font-weight: 800;
    color: $ak-amber;
    letter-spacing: 1px;
  }

  &__policy {
    font-size: 0.65rem;
    font-family: monospace;
    font-weight: 700;
    color: $ak-green;
    background: rgba($ak-green, 0.12);
    padding: 0.15rem 0.4rem;
    letter-spacing: 1px;
    border: 1px solid rgba($ak-green, 0.25);
  }

  &__text {
    margin: 0;
    font-size: 0.73rem;
    line-height: 1.45;
    color: $ak-text-primary;

    &--dim {
      color: $ak-text-secondary;
    }

    strong {
      color: #fff;
    }
  }
}

// Auth Tabs
.ak-auth-tabs {
  display: flex;
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
}

.ak-auth-tab {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.65rem 0.5rem;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: $ak-text-muted;
  cursor: pointer;
  letter-spacing: 1px;
  margin-bottom: -2px;
  transition: all 0.15s ease;

  &:hover {
    color: $ak-text-primary;
  }

  &--active {
    color: $ak-cyan;
    border-bottom-color: $ak-cyan;
  }

  &--demo.ak-auth-tab--active {
    color: $ak-amber;
    border-bottom-color: $ak-amber;
  }
}

// Form Elements
.ak-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ak-label {
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  color: $ak-text-secondary;
  letter-spacing: 1px;
}

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
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $ak-text-primary;
  }

  &--active {
    background: rgba($ak-cyan, 0.12);
    border-color: $ak-cyan;
    color: $ak-cyan;
  }
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
  box-sizing: border-box;

  &:focus {
    border-color: $ak-cyan;
    box-shadow: 0 0 10px rgba($ak-cyan, 0.2);
  }

  &--code {
    text-align: center;
    letter-spacing: 8px;
    font-size: 1.25rem;
    font-weight: 800;
  }
}

.ak-input-with-action {
  display: flex;
  gap: 0.5rem;
}

.ak-btn-send-code {
  padding: 0 1rem;
  background: rgba($ak-cyan, 0.15);
  border: 1px solid $ak-cyan;
  color: $ak-cyan;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: $ak-cyan;
    color: #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ak-input-hint {
  font-size: 0.68rem;
  color: $ak-text-muted;
  font-family: monospace;
}

// JSON Upload Box
.ak-file-upload-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ak-file-picker-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.ak-file-hidden {
  display: none;
}

.ak-file-btn {
  padding: 0.45rem 0.85rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: $ak-text-primary;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
  }
}

.ak-file-name {
  font-size: 0.7rem;
  font-family: monospace;
  color: $ak-text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ak-btn-paste {
  padding: 0.45rem 0.85rem;
  background: rgba($ak-amber, 0.12);
  border: 1px solid rgba($ak-amber, 0.35);
  color: $ak-amber;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba($ak-amber, 0.25);
    border-color: $ak-amber;
  }
}

.ak-textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: $ak-text-primary;
  font-family: monospace;
  font-size: 0.75rem;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  line-height: 1.4;

  &:focus {
    border-color: $ak-cyan;
  }
}

.ak-json-error {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff6b6b;
  font-family: monospace;
  font-size: 0.72rem;
}

.ak-json-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba($ak-cyan, 0.2);

  &__item {
    font-size: 0.72rem;
    font-family: monospace;
    color: $ak-text-secondary;

    strong {
      color: $ak-cyan;
    }
  }
}

// Demo Notice
.ak-demo-notice {
  padding: 1rem;
  background: rgba($ak-amber, 0.08);
  border: 1px solid rgba($ak-amber, 0.25);
  border-left: 3px solid $ak-amber;
  display: flex;
  gap: 0.75rem;

  &__icon {
    font-size: 1.2rem;
  }

  strong {
    display: block;
    font-size: 0.8rem;
    color: $ak-amber;
    letter-spacing: 1px;
    font-family: monospace;
    margin-bottom: 0.25rem;
  }

  p {
    margin: 0;
    font-size: 0.75rem;
    color: $ak-text-secondary;
    line-height: 1.4;
  }
}

// Progress and Errors
.ak-sync-progress {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ak-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;

  &__fill {
    height: 100%;
    width: 60%;
    background: $ak-cyan;
    animation: indeterminate 1.5s infinite linear;
  }
}

.ak-progress-text {
  font-size: 0.65rem;
  font-family: monospace;
  color: $ak-cyan;
  letter-spacing: 1px;
}

.ak-error-banner {
  padding: 0.65rem 0.85rem;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff6b6b;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// Modal Footer
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
  cursor: pointer;
  letter-spacing: 1px;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;

  &--ghost {
    background: transparent;
    color: $ak-text-muted;

    &:hover {
      color: #fff;
    }
  }

  &--primary {
    background: $ak-cyan;
    color: #000;

    &:hover:not(:disabled) {
      background: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.ak-mini-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

.ak-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

// Success View
.ak-success-body {
  gap: 1.5rem;
}

.ak-success-badge {
  text-align: center;
  padding: 1.5rem;
  background: rgba($ak-green, 0.08);
  border: 1px solid rgba($ak-green, 0.3);

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: $ak-green;
    color: #000;
    font-size: 1.2rem;
    font-weight: 800;
    border-radius: 50%;
    margin-bottom: 0.75rem;
  }

  h4 {
    margin: 0;
    color: $ak-text-primary;
    font-size: 1rem;
    letter-spacing: 1px;
  }

  p {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    color: $ak-text-secondary;
  }
}

.ak-sync-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.ak-summary-card {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__label {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__val {
    font-size: 0.85rem;
    color: $ak-text-primary;

    &--cyan {
      color: $ak-cyan;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>
