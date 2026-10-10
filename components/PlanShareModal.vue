<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import {
  encodePlanToQueryString,
  decodePlanFromQueryString,
  exportPlanToJsonString,
  parseImportedPlanJson,
} from '~/utils/planShare'
import type { TargetPlanItem, OperatorData } from '~/types'

const props = defineProps<{
  isOpen: boolean
  plannedTargets: TargetPlanItem[]
  operatorsCatalog: OperatorData[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import', targets: TargetPlanItem[], mode: 'replace' | 'merge'): void
}>()

const toast = useToast()

type ModalTab = 'link' | 'export_json' | 'import'
const activeTab = ref<ModalTab>('link')

// Tab 1: Share Link
const shareableUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  if (!props.plannedTargets || props.plannedTargets.length === 0) return ''
  const encoded = encodePlanToQueryString(props.plannedTargets)
  const baseUrl = `${window.location.origin}/planner`
  return `${baseUrl}?plan=${encoded}`
})

const copyShareLink = async () => {
  if (!shareableUrl.value) return
  try {
    await navigator.clipboard.writeText(shareableUrl.value)
    toast.success('Shareable plan link copied to clipboard!', {
      title: 'LINK COPIED',
      tag: 'PRTS // SHARE',
    })
  } catch {
    toast.error('Failed to write link to clipboard.', { title: 'COPY ERROR' })
  }
}

// Tab 2: Export JSON
const exportedJson = computed(() => {
  if (!props.plannedTargets || props.plannedTargets.length === 0) return ''
  return exportPlanToJsonString(props.plannedTargets, 'Doctor Promotion Plan')
})

const copyJson = async () => {
  if (!exportedJson.value) return
  try {
    await navigator.clipboard.writeText(exportedJson.value)
    toast.success('Plan JSON copied to clipboard!', {
      title: 'JSON COPIED',
      tag: 'PRTS // EXPORT',
    })
  } catch {
    toast.error('Failed to copy JSON to clipboard.', { title: 'COPY ERROR' })
  }
}

const downloadJsonFile = () => {
  if (!exportedJson.value) return
  const blob = new Blob([exportedJson.value], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `arkcalc-plan-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  toast.success('Plan JSON downloaded successfully!', {
    title: 'DOWNLOAD READY',
    tag: 'FILE // EXPORT',
  })
}

// Tab 3: Import Plan
const importInput = ref('')
const importMode = ref<'replace' | 'merge'>('replace')
const importError = ref<string | null>(null)
const previewImportTargets = ref<TargetPlanItem[]>([])

const parseImport = () => {
  importError.value = null
  previewImportTargets.value = []
  const text = importInput.value.trim()
  if (!text) return

  try {
    // 1. Check if user pasted a full URL with ?plan=...
    if (text.includes('?plan=') || text.includes('&plan=')) {
      const match = text.match(/[?&]plan=([^&#\s]+)/)
      if (match && match[1]) {
        const decoded = decodePlanFromQueryString(match[1], props.operatorsCatalog)
        if (decoded.length > 0) {
          previewImportTargets.value = decoded
          return
        }
      }
    }

    // 2. Check if user pasted raw compact Base64URL string
    if (!text.startsWith('{') && !text.startsWith('[') && text.length > 15) {
      const decoded = decodePlanFromQueryString(text, props.operatorsCatalog)
      if (decoded.length > 0) {
        previewImportTargets.value = decoded
        return
      }
    }

    // 3. Try parsing as JSON
    const decoded = parseImportedPlanJson(text, props.operatorsCatalog)
    if (decoded.length > 0) {
      previewImportTargets.value = decoded
      return
    }

    importError.value = 'No matching operators found in payload. Check your JSON format or operator IDs.'
  } catch (err: any) {
    importError.value = `Parse Error: ${err.message || 'Invalid JSON or share link format'}`
  }
}

watch(importInput, () => {
  parseImport()
})

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    importInput.value = String(e.target?.result || '')
  }
  reader.readAsText(file)
}

const applyImport = () => {
  if (previewImportTargets.value.length === 0) return
  emit('import', previewImportTargets.value, importMode.value)
  toast.success(
    `Imported ${previewImportTargets.value.length} operator goals (${importMode.value === 'replace' ? 'Replaced' : 'Merged'})!`,
    {
      title: 'PLAN IMPORTED',
      tag: 'PRTS // IMPORT',
    }
  )
  emit('close')
  importInput.value = ''
  previewImportTargets.value = []
}
</script>

<template>
  <div v-if="isOpen" class="ak-modal-overlay" @click.self="$emit('close')">
    <div class="ak-modal-container">
      <!-- Modal Header -->
      <div class="ak-modal-head">
        <div class="ak-modal-title-group">
          <span class="ak-modal-badge">PRTS // TRANSFER</span>
          <h2 class="ak-modal-title">Share & Transfer Promotion Plan</h2>
        </div>
        <button type="button" class="ak-modal-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Tabs Bar -->
      <div class="ak-modal-tabs">
        <button
          type="button"
          class="ak-modal-tab"
          :class="{ 'ak-modal-tab--active': activeTab === 'link' }"
          @click="activeTab = 'link'"
        >
          [01] SHAREABLE LINK
        </button>
        <button
          type="button"
          class="ak-modal-tab"
          :class="{ 'ak-modal-tab--active': activeTab === 'export_json' }"
          @click="activeTab = 'export_json'"
        >
          [02] EXPORT JSON
        </button>
        <button
          type="button"
          class="ak-modal-tab"
          :class="{ 'ak-modal-tab--active': activeTab === 'import' }"
          @click="activeTab = 'import'"
        >
          [03] IMPORT PLAN
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="ak-modal-body">
        <!-- 1. SHAREABLE LINK TAB -->
        <div v-if="activeTab === 'link'" class="ak-tab-pane">
          <p class="ak-pane-desc">
            Share your promotion targets with other Doctors via a compact URL. Anyone opening this link will be able to preview and import your exact promotion plan without an account.
          </p>

          <template v-if="plannedTargets.length > 0">
            <div class="ak-url-box">
              <input
                type="text"
                readonly
                :value="shareableUrl"
                class="ak-url-input"
                @focus="($event.target as HTMLInputElement).select()"
              />
              <button type="button" class="ak-btn-action" @click="copyShareLink">
                📋 COPY LINK
              </button>
            </div>

            <div class="ak-preview-summary">
              <span class="ak-summary-label">CONTAINS {{ plannedTargets.length }} TARGETS:</span>
              <div class="ak-summary-chips">
                <span
                  v-for="t in plannedTargets"
                  :key="t.operatorId"
                  class="ak-summary-chip"
                >
                  {{ t.operator.name }} (E{{ t.targetElite }} M{{ t.targetMastery }})
                </span>
              </div>
            </div>
          </template>
          <div v-else class="ak-empty-pane">
            <p>Your promotion plan is currently empty. Add operators in the planner to generate a shareable link.</p>
          </div>
        </div>

        <!-- 2. EXPORT JSON TAB -->
        <div v-if="activeTab === 'export_json'" class="ak-tab-pane">
          <p class="ak-pane-desc">
            Export a full JSON backup of your current targets. You can save this file locally, paste it into another browser, or share it on Discord / Telegram.
          </p>

          <template v-if="plannedTargets.length > 0">
            <textarea
              readonly
              :value="exportedJson"
              rows="8"
              class="ak-json-textarea"
              @focus="($event.target as HTMLTextAreaElement).select()"
            />

            <div class="ak-export-actions">
              <button type="button" class="ak-btn-secondary" @click="copyJson">
                📋 COPY JSON TEXT
              </button>
              <button type="button" class="ak-btn-primary" @click="downloadJsonFile">
                💾 DOWNLOAD .JSON FILE
              </button>
            </div>
          </template>
          <div v-else class="ak-empty-pane">
            <p>No active targets in plan. Add operators first before exporting.</p>
          </div>
        </div>

        <!-- 3. IMPORT PLAN TAB -->
        <div v-if="activeTab === 'import'" class="ak-tab-pane">
          <p class="ak-pane-desc">
            Paste a shared ArkCalc URL, a compact query string, or a JSON file content to load promotion targets:
          </p>

          <textarea
            v-model="importInput"
            rows="5"
            placeholder="Paste share link (https://.../planner?plan=...) or JSON payload here..."
            class="ak-json-textarea ak-json-textarea--editable"
          />

          <div class="ak-import-file-row">
            <label class="ak-btn-file-upload">
              📂 SELECT .JSON FILE
              <input type="file" accept=".json,application/json" @change="handleFileUpload" />
            </label>

            <!-- Mode Selector -->
            <div class="ak-mode-selector">
              <label class="ak-mode-radio">
                <input v-model="importMode" type="radio" value="replace" />
                <span>REPLACE EXISTING ({{ plannedTargets.length }})</span>
              </label>
              <label class="ak-mode-radio">
                <input v-model="importMode" type="radio" value="merge" />
                <span>MERGE WITH EXISTING</span>
              </label>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="importError" class="ak-alert-error">
            ⚠️ {{ importError }}
          </div>

          <!-- Preview of detected targets -->
          <div v-if="previewImportTargets.length > 0" class="ak-import-preview">
            <div class="ak-preview-head">
              <span class="ak-text-cyan">✓ DETECTED {{ previewImportTargets.length }} OPERATOR GOALS:</span>
            </div>
            <div class="ak-summary-chips">
              <span
                v-for="t in previewImportTargets"
                :key="t.operatorId"
                class="ak-summary-chip ak-summary-chip--green"
              >
                {{ t.operator.name }} (E{{ t.targetElite }} Lvl {{ t.targetLevel }} M{{ t.targetMastery }})
              </span>
            </div>
          </div>

          <div class="ak-import-footer">
            <button
              type="button"
              class="ak-btn-primary"
              :disabled="previewImportTargets.length === 0"
              @click="applyImport"
            >
              📥 IMPORT & APPLY PLAN ({{ previewImportTargets.length }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.ak-modal-container {
  width: 100%;
  max-width: 640px;
  background: #0d121c;
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-left: 3px solid #00e5ff;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
}

.ak-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ak-modal-badge {
  font-family: monospace;
  font-size: 0.65rem;
  color: #00e5ff;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.ak-modal-title {
  margin: 0.2rem 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.ak-modal-close {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
}

.ak-modal-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
}

.ak-modal-tab {
  flex: 1;
  padding: 0.75rem 0.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #94a3b8;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.03);
  }

  &--active {
    color: #00e5ff;
    border-bottom-color: #00e5ff;
    background: rgba(0, 229, 255, 0.05);
  }
}

.ak-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.ak-tab-pane {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ak-pane-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.45;
}

.ak-url-box {
  display: flex;
  gap: 0.5rem;
}

.ak-url-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #38bdf8;
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  outline: none;

  &:focus {
    border-color: #00e5ff;
  }
}

.ak-json-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.75rem;
  outline: none;
  resize: vertical;

  &--editable:focus {
    border-color: #00e5ff;
  }
}

.ak-preview-summary, .ak-import-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ak-summary-label, .ak-preview-head {
  font-family: monospace;
  font-size: 0.68rem;
  color: #64748b;
  letter-spacing: 1px;
}

.ak-summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-height: 120px;
  overflow-y: auto;
}

.ak-summary-chip {
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: monospace;
  font-size: 0.72rem;
  color: #cbd5e1;

  &--green {
    border-color: rgba(74, 222, 128, 0.3);
    color: #86efac;
    background: rgba(74, 222, 128, 0.08);
  }
}

.ak-export-actions, .ak-import-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.ak-import-file-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-btn-file-upload {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  input {
    display: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-color: #00e5ff;
  }
}

.ak-mode-selector {
  display: flex;
  gap: 0.85rem;
}

.ak-mode-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: monospace;
  font-size: 0.7rem;
  color: #94a3b8;
  cursor: pointer;

  input {
    accent-color: #00e5ff;
  }
}

.ak-alert-error {
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  font-family: monospace;
  font-size: 0.75rem;
}

.ak-btn-primary {
  padding: 0.5rem 1.15rem;
  background: #00e5ff;
  color: #000;
  border: 1px solid #00e5ff;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #38bdf8;
    box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ak-btn-secondary, .ak-btn-action {
  padding: 0.5rem 0.85rem;
  background: transparent;
  color: #00e5ff;
  border: 1px solid rgba(0, 229, 255, 0.35);
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 229, 255, 0.12);
  }
}

.ak-empty-pane {
  padding: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.82rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}
</style>
