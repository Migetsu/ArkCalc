<script setup lang="ts">
import { ref } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { exportDatabaseToJson, parseAndImportData } from '@/services/syncService';
import { X, Download, CheckCircle, AlertCircle, RefreshCw, Globe, Trash2, Clipboard } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const inventory = useInventoryStore();
const planner = usePlannerStore();
const gameData = useGameDataStore();

const statusMessage = ref<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
const isOperating = ref(false);
const isRefreshing = ref(false);

const pasteInputText = ref('');

async function handleExportJson() {
  try {
    await exportDatabaseToJson();
    statusMessage.value = { type: 'success', text: 'Файл резервной копии ark_calc_backup.json успешно скачан!' };
  } catch (err: any) {
    statusMessage.value = { type: 'error', text: `Ошибка экспорта: ${err.message || err}` };
  }
}

async function handlePasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim()) {
      pasteInputText.value = text.trim();
      await handleImportFromPaste();
    } else {
      statusMessage.value = {
        type: 'info',
        text: 'Буфер обмена пуст. Скопируйте Full Raw Data из ArkPRTS и нажмите кнопку снова.',
      };
    }
  } catch {
    statusMessage.value = {
      type: 'info',
      text: 'Вставьте скопированный текст из ArkPRTS в текстовое поле вручную (Ctrl+V) и нажмите «Импортировать».',
    };
  }
}

async function handleImportFromPaste() {
  if (!pasteInputText.value.trim()) return;
  isOperating.value = true;
  statusMessage.value = null;
  try {
    const res = await parseAndImportData(pasteInputText.value);
    if (res.success) {
      await inventory.loadInventory();
      await planner.loadPlans();
      statusMessage.value = { type: 'success', text: res.message };
      pasteInputText.value = '';
    } else {
      statusMessage.value = { type: 'error', text: res.message };
    }
  } catch (err: any) {
    statusMessage.value = { type: 'error', text: `Ошибка импорта: ${err.message || err}` };
  } finally {
    isOperating.value = false;
  }
}

async function handleClearWarehouse() {
  if (confirm('Вы уверены, что хотите стереть все ресурсы со склада?')) {
    await inventory.clearAll();
    statusMessage.value = { type: 'info', text: 'Данные склада успешно очищены.' };
  }
}

async function handleClearAllPlans() {
  if (confirm('Вы уверены, что хотите удалить все добавленные планы оперативников?')) {
    await planner.clearAllPlans();
    statusMessage.value = { type: 'info', text: 'Все планы оперативников удалены.' };
  }
}

async function handleRefreshGameData() {
  isRefreshing.value = true;
  statusMessage.value = null;
  try {
    await gameData.loadGameData(true);
    statusMessage.value = { type: 'success', text: 'Игровые данные успешно обновлены!' };
  } catch (err: any) {
    statusMessage.value = { type: 'error', text: `Ошибка обновления: ${err.message || err}` };
  } finally {
    isRefreshing.value = false;
  }
}

</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in" @click.self="emit('close')">
    <div class="bg-ark-darker border border-ark-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
      <!-- Header -->
      <div class="px-5 py-4 bg-ark-card border-b border-ark-border flex items-center justify-between">
        <h3 class="font-bold text-base text-slate-100 flex items-center gap-2">Настройки и синхронизация</h3>
        <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Status banner -->
      <div v-if="statusMessage" class="px-5 py-3 border-b flex items-center gap-2 text-xs font-medium" :class="[statusMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300']">
        <template v-if="statusMessage.type === 'success'">
          <CheckCircle class="w-4 h-4 flex-shrink-0" />
        </template>
        <template v-else>
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
        </template>
        <span>{{ statusMessage.text }}</span>
      </div>

      <!-- Body -->
      <div class="p-5 space-y-6 overflow-y-auto flex-1 text-xs">

        <!-- Game Data & Language Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Globe class="w-4 h-4 text-cyan-400" />
              Игровые данные и локализация
            </h4>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
              458+ Оперативников &bull; Все модули
            </span>
          </div>
          <p class="text-slate-400">
            Подключена полная база данных Arknights со всеми актуальными оперативниками, альтернативными модулями (X/Y/D) и крафтами. Имена персонажей отображаются на английском.
          </p>

          <!-- Language selector for material names -->
          <div class="flex items-center justify-between flex-wrap gap-3 p-3 rounded-lg bg-slate-900/80 border border-ark-border">
            <div>
              <span class="text-xs font-bold text-slate-200 block">Язык названий материалов</span>
              <span class="text-[11px] text-slate-400 block">Отображение ресурсов на складе, в калькуляторе и планах</span>
            </div>
            <div class="inline-flex bg-slate-950 p-1 rounded-lg border border-ark-border">
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                :class="gameData.itemLanguage === 'ru' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                @click="gameData.setItemLanguage('ru')"
              >
                Русский (RU)
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                :class="gameData.itemLanguage === 'en' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                @click="gameData.setItemLanguage('en')"
              >
                English (EN)
              </button>
            </div>
          </div>

          <div class="pt-1">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
              :disabled="isRefreshing"
              @click="handleRefreshGameData"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
              {{ isRefreshing ? 'Обновление...' : 'Принудительно обновить игровые данные' }}
            </button>
            <p class="text-slate-500 mt-1.5">Сбросит кэш и загрузит самые свежие данные с GitHub.</p>
          </div>
        </div>

        <!-- ArkPRTS Clipboard Import Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Clipboard class="w-4 h-4 text-cyan-400" />
              Импорт склада из ArkPRTS
            </h4>
            <span class="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Full Raw Data
            </span>
          </div>
          <p class="text-slate-400 leading-relaxed">
            Скопируйте данные в перехватчике <span class="text-slate-200 font-medium">ArkPRTS</span> (кнопка <i>Copy full raw data</i>) и нажмите кнопку быстрой вставки из буфера или вставьте текст в поле ниже вручную:
          </p>

          <div class="space-y-2.5 pt-1">
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                :disabled="isOperating"
                @click="handlePasteFromClipboard"
              >
                <Clipboard class="w-4 h-4" />
                Вставить из буфера обмена
              </button>
              <button
                v-if="pasteInputText.trim()"
                type="button"
                class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                @click="pasteInputText = ''"
              >
                Очистить поле
              </button>
            </div>

            <textarea
              v-model="pasteInputText"
              rows="4"
              placeholder="Или вставьте сюда скопированный JSON текст из ArkPRTS вручную (Ctrl+V)..."
              class="w-full bg-slate-900 border border-ark-border rounded-xl p-3 font-mono text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            ></textarea>

            <div class="flex items-center justify-between">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold text-xs transition-all"
                :disabled="!pasteInputText.trim() || isOperating"
                @click="handleImportFromPaste"
              >
                Импортировать введённый текст
              </button>
              <span v-if="pasteInputText.trim()" class="text-[10px] text-slate-500 font-mono">
                Длина: {{ pasteInputText.length }} символов
              </span>
            </div>
          </div>

          <!-- Backup Export -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="text-xs font-semibold text-slate-300 block">Резервная копия планов и склада</span>
              <span class="text-[11px] text-slate-500 block">Сохранить файл ark_calc_backup.json на диск</span>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition-colors"
              :disabled="isOperating"
              @click="handleExportJson"
            >
              <Download class="w-3.5 h-3.5 text-cyan-400" />
              Скачать бэкап (.json)
            </button>
          </div>
        </div>

        <!-- Danger Zone Section -->
        <div class="p-4 bg-red-950/20 rounded-xl border border-red-900/40 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-red-300 text-sm flex items-center gap-2">
              <Trash2 class="w-4 h-4 text-red-400" />
              Управление данными и сброс
            </h4>
          </div>
          <p class="text-slate-400">Здесь можно быстро стереть данные склада после тестирования или очистить все планы оперативников.</p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-800/80 text-xs font-semibold transition-colors"
              @click="handleClearWarehouse"
            >
              <Trash2 class="w-3.5 h-3.5 text-red-400" />
              Очистить склад (Стереть все ресурсы)
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 text-xs font-semibold transition-colors"
              @click="handleClearAllPlans"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Сбросить все планы
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3.5 bg-ark-card border-t border-ark-border flex justify-end">
        <button type="button" class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors" @click="emit('close')">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
