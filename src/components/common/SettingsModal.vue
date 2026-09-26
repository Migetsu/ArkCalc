<script setup lang="ts">
import { ref } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useGameDataStore } from '@/stores/gamedata';
import { exportDatabaseToJson, importDatabaseFromJson } from '@/services/syncService';
import { X, Download, Upload, CheckCircle, AlertCircle, RefreshCw, Globe } from 'lucide-vue-next';

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

const fileInputRef = ref<HTMLInputElement | null>(null);

async function handleExportJson() {
  try {
    await exportDatabaseToJson();
    statusMessage.value = { type: 'success', text: 'Файл резервной копии ark_calc_backup.json успешно скачан!' };
  } catch (err: any) {
    statusMessage.value = { type: 'error', text: `Ошибка экспорта: ${err.message || err}` };
  }
}

function triggerImportClick() {
  fileInputRef.value?.click();
}

async function handleFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  isOperating.value = true;
  statusMessage.value = null;
  try {
    const res = await importDatabaseFromJson(file);
    if (res.success) {
      await inventory.loadInventory();
      await planner.loadPlans();
      statusMessage.value = { type: 'success', text: `Импорт завершен: ${res.inventoryCount} предметов, ${res.plansCount} планов.` };
    } else {
      statusMessage.value = { type: 'error', text: res.message };
    }
  } catch (err: any) {
    statusMessage.value = { type: 'error', text: `Ошибка импорта: ${err.message || err}` };
  } finally {
    isOperating.value = false;
    target.value = '';
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

function setRegion(region: 'en_US' | 'zh_CN') {
  gameData.serverRegion = region;
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

        <!-- Region & Game Data Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Globe class="w-4 h-4 text-amber-400" />
              Регион сервера и игровые данные
            </h4>
          </div>
          <p class="text-slate-400">
            Выберите регион для загрузки игровых данных. <strong class="text-amber-300">CN</strong> содержит более актуальные данные по операторам и модулям. EN использует официальный глобальный репозиторий.
          </p>

          <!-- Region selector -->
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-medium">Регион:</span>
            <div class="inline-flex bg-slate-900 p-1 rounded-lg border border-ark-border">
              <button
                type="button"
                class="px-3 py-1.5 rounded text-xs font-bold transition-all"
                :class="gameData.serverRegion === 'en_US' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'"
                @click="setRegion('en_US')"
              >
                EN (Global)
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded text-xs font-bold transition-all"
                :class="gameData.serverRegion === 'zh_CN' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'"
                @click="setRegion('zh_CN')"
              >
                CN (Более полные данные)
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
            <p class="text-slate-500 mt-1.5">Сбросит кэш и загрузит свежие данные с GitHub. Полезно если не хватает модулей или устаревшие иконки.</p>
          </div>
        </div>

        <!-- JSON Backup Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Download class="w-4 h-4 text-cyan-400" />
              Резервное копирование (Файл JSON)
            </h4>
            <span class="text-[10px] text-slate-400 font-mono">1-клик экспорт/импорт</span>
          </div>
          <p class="text-slate-400">Сохраните файл со всеми оперативниками в планах и количеством ресурсов на складе, чтобы легко перенести на другое устройство или сохранить копию. Поддерживается импорт полного дампа ArkPRTS.</p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/40 font-semibold transition-colors" :disabled="isOperating" @click="handleExportJson">
              <Download class="w-4 h-4" />
              Скачать ark_calc_backup.json
            </button>
            <button type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors" :disabled="isOperating" @click="triggerImportClick">
              <Upload class="w-4 h-4 text-slate-400" />
              Восстановить из файла .json
            </button>
            <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileSelected" />
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
