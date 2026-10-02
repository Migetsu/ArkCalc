<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { useLocaleStore } from '@/stores/locale';
import {
  exportPlansToJson,
  importPlansFromJson,
  renderPlanCard,
  type InfographicData,
} from '@/services/planExportService';
import {
  X,
  Download,
  Copy,
  Upload,
  Image,
  FileJson,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next';

const emit = defineEmits<{ close: [] }>();

const planner = usePlannerStore();
const gameData = useGameDataStore();
const locale = useLocaleStore();

const t = (en: string, ru: string) => (locale.currentLang === 'ru' ? ru : en);

type Tab = 'card' | 'export' | 'import';
const activeTab = ref<Tab>('card');

// ─── Sanity data (mirrored from ResourceSummary) ──────────────────────────
const calc = computed(() => planner.calculationResult);
const planSanity = computed(() => {
  const s = calc.value;
  const totalLmd = s.totalLmd;
  const totalExp = s.totalExp;
  const matSanity = s.farmRequirements.reduce((acc, r) => {
    // Rough approximation: 20 sanity per item needed
    return acc + r.count * 20;
  }, 0);
  const lmdSanity = Math.round(Math.max(0, totalLmd - 0) * 0.0036);
  const totalSanity = matSanity + lmdSanity;
  const naturalDays = Math.round((totalSanity / 240) * 10) / 10;
  const opEquivalent = Math.ceil(totalSanity / 135);
  return { totalSanity, naturalDays, opEquivalent, totalLmd, totalExp };
});

// ─── Tab: Card ────────────────────────────────────────────────────────────
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isRendering = ref(false);
const cardRendered = ref(false);
const renderError = ref('');

async function generateCard() {
  if (!canvasRef.value) return;
  isRendering.value = true;
  renderError.value = '';
  cardRendered.value = false;
  try {
    const data: InfographicData = {
      plans: planner.planList,
      operators: gameData.operators,
      totalSanity: planSanity.value.totalSanity,
      naturalDays: planSanity.value.naturalDays,
      opEquivalent: planSanity.value.opEquivalent,
      totalLmd: planSanity.value.totalLmd,
      totalExp: planSanity.value.totalExp,
      lang: locale.currentLang as 'en' | 'ru',
    };
    await renderPlanCard(canvasRef.value, data);
    cardRendered.value = true;
  } catch (e) {
    renderError.value = String(e);
  } finally {
    isRendering.value = false;
  }
}

function downloadCard() {
  if (!canvasRef.value || !cardRendered.value) return;
  canvasRef.value.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arkcalc-plan-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

watch(activeTab, async (tab) => {
  if (tab === 'card' && !cardRendered.value) {
    await nextTick();
    generateCard();
  }
});

// Auto-generate on mount when card tab is active
watch(
  canvasRef,
  async (el) => {
    if (el && activeTab.value === 'card' && !cardRendered.value) {
      await nextTick();
      generateCard();
    }
  },
  { once: true },
);

// ─── Tab: JSON Export ─────────────────────────────────────────────────────
const exportJson = computed(() => exportPlansToJson(planner.planList));
const exportCopied = ref(false);

async function copyExportJson() {
  try {
    await navigator.clipboard.writeText(exportJson.value);
    exportCopied.value = true;
    setTimeout(() => (exportCopied.value = false), 2000);
  } catch {
    // fallback — select textarea
  }
}

function downloadExportJson() {
  const blob = new Blob([exportJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arkcalc-plans-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Tab: JSON Import ─────────────────────────────────────────────────────
const importText = ref('');
const importError = ref('');
const importSuccess = ref('');
const importPreview = ref<{ charId: string; name: string }[]>([]);

function parseImportPreview() {
  importError.value = '';
  importSuccess.value = '';
  importPreview.value = [];
  if (!importText.value.trim()) return;
  try {
    const plans = importPlansFromJson(importText.value);
    importPreview.value = plans.map((p) => ({
      charId: p.charId,
      name: gameData.operators[p.charId]?.name ?? p.charId,
    }));
    if (plans.length === 0) {
      importError.value = t('No valid plans found in JSON', 'В JSON не найдено корректных планов');
    }
  } catch (e) {
    importError.value = String(e);
  }
}

async function applyImport() {
  importError.value = '';
  try {
    const plans = importPlansFromJson(importText.value);
    if (plans.length === 0) {
      importError.value = t('No valid plans found', 'Не найдено корректных планов');
      return;
    }
    const record: Record<string, (typeof plans)[number]> = {};
    for (const p of plans) record[p.charId] = p;
    await planner.bulkImportPlans(record);
    importSuccess.value = t(
      `Successfully imported ${plans.length} plans!`,
      `Успешно импортировано ${plans.length} планов!`,
    );
    importText.value = '';
    importPreview.value = [];
  } catch (e) {
    importError.value = String(e);
  }
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    importText.value = (e.target?.result as string) ?? '';
    parseImportPreview();
  };
  reader.readAsText(file);
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-ark-bg border border-ark-border rounded-2xl shadow-2xl overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-ark-border bg-ark-card flex-shrink-0"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400"
          >
            <Download class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-100">
              {{ t('Export & Share Plan', 'Экспорт и шаринг плана') }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ t('Download as PNG card or JSON', 'Скачать как PNG или JSON') }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab bar -->
      <div class="flex gap-1 px-6 pt-4 flex-shrink-0">
        <button
          v-for="tab in (['card', 'export', 'import'] as const)"
          :key="tab"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="
            activeTab === tab
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          "
          @click="activeTab = tab"
        >
          <Image v-if="tab === 'card'" class="w-4 h-4" />
          <FileJson v-else-if="tab === 'export'" class="w-4 h-4" />
          <Upload v-else class="w-4 h-4" />
          <span>{{
            tab === 'card'
              ? t('PNG Card', 'PNG-карточка')
              : tab === 'export'
                ? t('JSON Export', 'JSON Экспорт')
                : t('JSON Import', 'JSON Импорт')
          }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-4">
        <!-- ─── TAB: PNG CARD ─── -->
        <template v-if="activeTab === 'card'">
          <p class="text-xs text-slate-400">
            {{
              t(
                'Generate a shareable infographic card with your plan summary — perfect for Discord or Telegram.',
                'Создайте красивую инфографику-карточку с вашим планом для шаринга в Discord или Telegram.',
              )
            }}
          </p>

          <!-- Canvas preview -->
          <div class="relative rounded-xl overflow-hidden border border-ark-border bg-slate-950">
            <canvas
              ref="canvasRef"
              class="w-full"
              style="max-height: 380px; object-fit: contain"
            />

            <!-- Loading overlay -->
            <div
              v-if="isRendering"
              class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 gap-3"
            >
              <Loader2 class="w-8 h-8 text-cyan-400 animate-spin" />
              <span class="text-xs text-slate-300">{{
                t('Generating card…', 'Генерируем карточку…')
              }}</span>
            </div>

            <!-- Error overlay -->
            <div
              v-if="renderError && !isRendering"
              class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 gap-2"
            >
              <AlertCircle class="w-8 h-8 text-red-400" />
              <span class="text-xs text-red-300">{{ renderError }}</span>
            </div>

            <!-- Empty state -->
            <div
              v-if="!isRendering && !cardRendered && !renderError"
              class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-2"
            >
              <Image class="w-12 h-12 text-slate-700" />
              <span class="text-xs text-slate-500">{{
                t('No plan data yet', 'Нет данных плана')
              }}</span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold transition-all border border-slate-700"
              :disabled="isRendering"
              @click="generateCard"
            >
              <Loader2 v-if="isRendering" class="w-4 h-4 animate-spin" />
              <Image v-else class="w-4 h-4" />
              {{ t('Regenerate', 'Перегенерировать') }}
            </button>
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              :class="
                cardRendered
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                  : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
              "
              :disabled="!cardRendered"
              @click="downloadCard"
            >
              <Download class="w-4 h-4" />
              {{ t('Download PNG', 'Скачать PNG') }}
            </button>
          </div>

          <p v-if="planner.planCount === 0" class="text-xs text-amber-400 flex items-center gap-2">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            {{
              t(
                'Add operators to your plan first to generate a card.',
                'Сначала добавьте операторов в план для генерации карточки.',
              )
            }}
          </p>
        </template>

        <!-- ─── TAB: JSON EXPORT ─── -->
        <template v-else-if="activeTab === 'export'">
          <p class="text-xs text-slate-400">
            {{
              t(
                'Export your entire plan as a JSON file. You can later import it back or share it with others.',
                'Экспортируйте весь план в JSON-файл. Позже его можно импортировать или поделиться с другими.',
              )
            }}
          </p>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border"
              :class="
                exportCopied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
              "
              @click="copyExportJson"
            >
              <CheckCircle v-if="exportCopied" class="w-4 h-4" />
              <Copy v-else class="w-4 h-4" />
              {{ exportCopied ? t('Copied!', 'Скопировано!') : t('Copy JSON', 'Копировать JSON') }}
            </button>
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-md transition-all"
              @click="downloadExportJson"
            >
              <Download class="w-4 h-4" />
              {{ t('Download .json', 'Скачать .json') }}
            </button>
          </div>

          <!-- JSON preview -->
          <div class="rounded-xl border border-ark-border bg-slate-950 overflow-hidden">
            <div
              class="flex items-center justify-between px-4 py-2 border-b border-ark-border bg-slate-900"
            >
              <span class="text-xs font-mono text-slate-400"
                >arkcalc-plans.json — {{ planner.planCount }}
                {{ t('operators', 'операторов') }}</span
              >
            </div>
            <textarea
              readonly
              :value="exportJson"
              class="w-full h-40 bg-transparent font-mono text-[11px] text-slate-300 p-4 resize-none outline-none custom-scrollbar"
              spellcheck="false"
            />
          </div>
        </template>

        <!-- ─── TAB: JSON IMPORT ─── -->
        <template v-else>
          <p class="text-xs text-slate-400">
            {{
              t(
                'Paste or upload a previously exported JSON file to restore your plan. This will OVERWRITE your current plan.',
                'Вставьте или загрузите ранее экспортированный JSON для восстановления плана. Это ЗАМЕНИТ текущий план.',
              )
            }}
          </p>

          <!-- Warning -->
          <div
            class="flex items-start gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{{
              t(
                'Importing will replace ALL current plans. Export your current plan first if you want to keep it.',
                'Импорт заменит ВСЕ текущие планы. Сначала экспортируйте текущий план, если хотите его сохранить.',
              )
            }}</span>
          </div>

          <!-- File upload -->
          <label
            class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold transition-all border border-slate-700 cursor-pointer w-fit"
          >
            <Upload class="w-4 h-4" />
            {{ t('Upload .json file', 'Загрузить .json файл') }}
            <input type="file" accept=".json,application/json" class="hidden" @change="handleFileUpload" />
          </label>

          <!-- Paste area -->
          <div class="rounded-xl border border-ark-border bg-slate-950 overflow-hidden">
            <div class="px-4 py-2 border-b border-ark-border bg-slate-900">
              <span class="text-xs text-slate-400">{{
                t('Or paste JSON here:', 'Или вставьте JSON сюда:')
              }}</span>
            </div>
            <textarea
              v-model="importText"
              class="w-full h-36 bg-transparent font-mono text-[11px] text-slate-300 p-4 resize-none outline-none custom-scrollbar placeholder:text-slate-600"
              :placeholder="t('Paste exported JSON...', 'Вставьте экспортированный JSON...')"
              spellcheck="false"
              @input="parseImportPreview"
            />
          </div>

          <!-- Preview -->
          <div
            v-if="importPreview.length > 0"
            class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60"
          >
            <p class="text-xs font-semibold text-emerald-300 mb-2">
              {{
                t(
                  `Found ${importPreview.length} plans:`,
                  `Найдено ${importPreview.length} планов:`,
                )
              }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="op in importPreview.slice(0, 20)"
                :key="op.charId"
                class="text-[10px] font-mono bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/50"
              >
                {{ op.name }}
              </span>
              <span
                v-if="importPreview.length > 20"
                class="text-[10px] font-mono text-slate-400 px-2 py-0.5"
              >
                +{{ importPreview.length - 20 }} {{ t('more', 'ещё') }}
              </span>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="importError"
            class="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{{ importError }}</span>
          </div>

          <!-- Success -->
          <div
            v-if="importSuccess"
            class="flex items-start gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs"
          >
            <CheckCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{{ importSuccess }}</span>
          </div>

          <!-- Apply button -->
          <button
            type="button"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
            :class="
              importPreview.length > 0 && !importError
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
            "
            :disabled="importPreview.length === 0 || !!importError"
            @click="applyImport"
          >
            <Upload class="w-4 h-4" />
            {{
              t(
                `Import ${importPreview.length} plans`,
                `Импортировать ${importPreview.length} планов`,
              )
            }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
