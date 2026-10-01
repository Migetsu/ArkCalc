<script setup lang="ts">
import { ref } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useRosterStore } from '@/stores/roster';
import { useGameDataStore } from '@/stores/gamedata';
import { useAuthStore } from '@/stores/auth';
import { exportDatabaseToJson, parseAndImportData } from '@/services/syncService';
import { syncPenguinStatsOnline } from '@/services/penguinStatsService';
import {
  getLinkedAccount,
  requestVerificationCode,
  linkAndSync,
  syncDirect,
  unlinkAccount,
  type YostarLinkedAccount,
  type ArknightsServer,
} from '@/services/yostarSyncService';
import {
  X,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Trash2,
  Clipboard,
  Zap,
  Gamepad2,
  Send,
  Unlink,
  ShieldCheck,
  Mail,
  KeyRound,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const inventory = useInventoryStore();
const planner = usePlannerStore();
const rosterStore = useRosterStore();
const gameData = useGameDataStore();
const auth = useAuthStore();

const statusMessage = ref<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
const isOperating = ref(false);
const isRefreshing = ref(false);
const isSyncingPenguin = ref(false);

const pasteInputText = ref('');

// Yostar Direct Sync State
const yostarAccount = ref<YostarLinkedAccount | null>(getLinkedAccount());
const yostarEmail = ref('');
const yostarCode = ref('');
const yostarServer = ref<ArknightsServer>('en');
const isSendingCode = ref(false);
const isLinking = ref(false);
const isDirectSyncing = ref(false);
const codeCooldown = ref(0);
let cooldownTimer: any = null;

function startCooldown() {
  codeCooldown.value = 60;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    if (codeCooldown.value > 0) {
      codeCooldown.value--;
    } else {
      clearInterval(cooldownTimer);
    }
  }, 1000);
}

async function handleSendYostarCode() {
  if (!yostarEmail.value || !yostarEmail.value.includes('@')) {
    statusMessage.value = { type: 'error', text: 'Пожалуйста, введите корректный адрес электронной почты Yostar.' };
    return;
  }
  isSendingCode.value = true;
  statusMessage.value = null;
  try {
    const res = await requestVerificationCode(yostarEmail.value, yostarServer.value);
    if (res.success) {
      statusMessage.value = { type: 'success', text: res.message || 'Код подтверждения отправлен на почту!' };
      startCooldown();
    } else {
      statusMessage.value = { type: 'error', text: res.error || 'Ошибка отправки кода' };
    }
  } finally {
    isSendingCode.value = false;
  }
}

async function handleLinkAndSyncYostar() {
  if (!yostarEmail.value || !yostarCode.value) {
    statusMessage.value = { type: 'error', text: 'Заполните email и 6-значный код из письма.' };
    return;
  }
  isLinking.value = true;
  statusMessage.value = null;
  try {
    const res = await linkAndSync(yostarEmail.value, yostarCode.value, yostarServer.value);
    if (res.success && res.account) {
      yostarAccount.value = res.account;
      yostarCode.value = '';
      statusMessage.value = {
        type: 'success',
        text: `Игровой аккаунт ${res.account.nickName || res.account.email} успешно привязан и синхронизирован! Склад и ростер обновлены.`,
      };
    } else {
      statusMessage.value = { type: 'error', text: res.error || 'Не удалось привязать аккаунт Yostar' };
    }
  } finally {
    isLinking.value = false;
  }
}

async function handleDirectSyncYostar() {
  isDirectSyncing.value = true;
  statusMessage.value = null;
  try {
    const res = await syncDirect();
    if (res.success && res.account) {
      yostarAccount.value = res.account;
      statusMessage.value = {
        type: 'success',
        text: `Данные с игрового сервера успешно обновлены в 1 клик! Загружено предметов: ${res.inventoryCount || 0}, оперативников: ${res.rosterCount || 0}.`,
      };
    } else {
      statusMessage.value = { type: 'error', text: res.error || 'Ошибка синхронизации с аккаунтом' };
    }
  } finally {
    isDirectSyncing.value = false;
  }
}

function handleUnlinkYostar() {
  if (confirm('Вы действительно хотите отвязать аккаунт Yostar? Токен будет удален с этого устройства.')) {
    unlinkAccount();
    yostarAccount.value = null;
    statusMessage.value = { type: 'info', text: 'Аккаунт Yostar успешно отвязан.' };
  }
}

function formatSyncTime(isoString?: string): string {
  if (!isoString) return 'Еще не синхронизировано';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

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
      await rosterStore.loadRoster();
      await planner.loadPlans();

      let extraMsg = '';
      if (auth.isAuthenticated) {
        const syncRes = await auth.syncToCloud();
        extraMsg = syncRes.success ? ' И автоматически сохранено в облако!' : ' (Локально сохранено, ошибка синхронизации с облаком)';
      }

      statusMessage.value = { type: 'success', text: res.message + extraMsg };
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
    if (auth.isAuthenticated) {
      await auth.syncToCloud();
    }
    statusMessage.value = { type: 'info', text: 'Данные склада успешно очищены.' };
  }
}

async function handleClearRoster() {
  if (confirm('Вы уверены, что хотите очистить ростер импортированных оперативников?')) {
    await rosterStore.clearAllRoster();
    if (auth.isAuthenticated) {
      await auth.syncToCloud();
    }
    statusMessage.value = { type: 'info', text: 'Ростер оперативников успешно очищен.' };
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

async function handleSyncPenguin() {
  isSyncingPenguin.value = true;
  statusMessage.value = null;
  try {
    const count = await syncPenguinStatsOnline();
    statusMessage.value = {
      type: 'success',
      text: `Penguin Stats успешно обновлён онлайн! Синхронизировано ${count} записей выпадения материалов.`,
    };
  } catch (err: any) {
    statusMessage.value = {
      type: 'error',
      text: `Не удалось загрузить данные Penguin Stats (${err.message || err}). Продолжает использоваться локальная база.`,
    };
  } finally {
    isSyncingPenguin.value = false;
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
              {{ Object.keys(gameData.operators).length || 429 }} Оперативников &bull; Все модули
            </span>
          </div>
          <p class="text-slate-400">
            Подключена полная база данных Arknights со всеми актуальными оперативниками, альтернативными модулями (X/Y/D) и крафтами. Имена персонажей отображаются на английском.
          </p>

          <!-- Language selector for material names & wiki -->
          <div class="flex items-center justify-between flex-wrap gap-3 p-3 rounded-lg bg-slate-900/80 border border-ark-border">
            <div>
              <span class="text-xs font-bold text-slate-200 block">Язык материалов и Вики</span>
              <span class="text-[11px] text-slate-400 block">Отображение ресурсов, навыков, талантов и модулей</span>
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
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                :class="gameData.itemLanguage === 'cn' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                @click="gameData.setItemLanguage('cn')"
              >
                Оригинал (CN)
              </button>
            </div>
          </div>

          <div class="pt-1 flex flex-wrap gap-2.5">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors text-xs"
              :disabled="isRefreshing"
              @click="handleRefreshGameData"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
              {{ isRefreshing ? 'Обновление данных...' : 'Обновить данные игры' }}
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-semibold transition-colors text-xs"
              :disabled="isSyncingPenguin"
              @click="handleSyncPenguin"
            >
              <Zap class="w-4 h-4" :class="{ 'animate-spin': isSyncingPenguin }" />
              {{ isSyncingPenguin ? 'Синхронизация дропов...' : 'Синхронизировать Penguin Stats' }}
            </button>
          </div>
          <p class="text-slate-500 mt-1.5">
            Обновление базы персонажей с GitHub и актуальной матрицы дропа стадий с penguin-stats.io.
          </p>
        </div>

        <!-- Yostar Direct 1-Click Sync Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Gamepad2 class="w-4 h-4 text-cyan-400" />
              Прямая синхронизация с игрой (Yostar)
            </h4>
            <span
              v-if="yostarAccount"
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"
            >
              <ShieldCheck class="w-3 h-3" />
              Привязан ({{ yostarAccount.server.toUpperCase() }})
            </span>
            <span
              v-else
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800"
            >
              В 1 клик &bull; Без сторонних сайтов
            </span>
          </div>

          <p class="text-slate-400 leading-relaxed">
            Прямое подключение к игровому серверу Arknights. Загружает ваш актуальный склад, всех имеющихся оперативников, уровни прокачки, навыков и модулей без необходимости заходить на сторонние ресурсы или копировать JSON вручную.
          </p>

          <!-- STATE 1: Account already linked -->
          <div v-if="yostarAccount" class="space-y-3 pt-1">
            <!-- Account badge card -->
            <div class="p-3.5 bg-slate-900/90 border border-ark-border rounded-xl space-y-2">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
                    {{ yostarAccount.level ? `Lv${yostarAccount.level}` : 'DR' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <span>{{ yostarAccount.nickName || 'Доктор' }}</span>
                      <span v-if="yostarAccount.nickNumber" class="text-slate-500 font-mono text-[10px]">#{{ yostarAccount.nickNumber }}</span>
                      <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {{ yostarAccount.server.toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono">
                      {{ yostarAccount.email }}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors p-1"
                  @click="handleUnlinkYostar"
                >
                  <Unlink class="w-3.5 h-3.5" />
                  <span>Отвязать</span>
                </button>
              </div>

              <div class="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span>Последняя синхронизация:</span>
                <strong class="text-slate-300">{{ formatSyncTime(yostarAccount.lastSyncAt) }}</strong>
              </div>
            </div>

            <!-- Big 1-Click Sync CTA Button -->
            <button
              type="button"
              :disabled="isDirectSyncing"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all active:scale-[0.99] disabled:opacity-50"
              @click="handleDirectSyncYostar"
            >
              <RefreshCw v-if="isDirectSyncing" class="w-4 h-4 animate-spin text-cyan-200" />
              <Zap v-else class="w-4 h-4 text-cyan-200" />
              <span>
                {{ isDirectSyncing ? 'Скачивание данных с сервера Arknights...' : 'Синхронизировать аккаунт прямо сейчас (В 1 клик)' }}
              </span>
            </button>

            <p class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
              <span>💡</span>
              <span>Перед нажатием сверните или закройте игру на телефоне, чтобы сервер не выдал сообщение о входе с другого устройства.</span>
            </p>
          </div>

          <!-- STATE 2: Account not yet linked -->
          <div v-else class="space-y-3 pt-1">
            <!-- Server Selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Регион сервера игры
              </label>
              <div class="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  class="py-1.5 rounded-lg transition-all"
                  :class="yostarServer === 'en' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                  @click="yostarServer = 'en'"
                >
                  Global (EN)
                </button>
                <button
                  type="button"
                  class="py-1.5 rounded-lg transition-all"
                  :class="yostarServer === 'jp' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                  @click="yostarServer = 'jp'"
                >
                  Japan (JP)
                </button>
                <button
                  type="button"
                  class="py-1.5 rounded-lg transition-all"
                  :class="yostarServer === 'kr' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                  @click="yostarServer = 'kr'"
                >
                  Korea (KR)
                </button>
              </div>
            </div>

            <!-- Email & Send Code Row -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Почта аккаунта Yostar
              </label>
              <div class="flex items-center gap-2">
                <div class="relative flex-1">
                  <Mail class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    v-model="yostarEmail"
                    type="email"
                    placeholder="doctor@rhodes-island.com"
                    class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="button"
                  :disabled="isSendingCode || codeCooldown > 0 || !yostarEmail.trim()"
                  class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 flex-shrink-0"
                  @click="handleSendYostarCode"
                >
                  <RefreshCw v-if="isSendingCode" class="w-3.5 h-3.5 animate-spin" />
                  <Send v-else class="w-3.5 h-3.5" />
                  <span>{{ codeCooldown > 0 ? `${codeCooldown} сек.` : 'Получить код' }}</span>
                </button>
              </div>
            </div>

            <!-- Code & Link Row -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                6-значный код из письма
              </label>
              <div class="flex items-center gap-2">
                <div class="relative flex-1">
                  <KeyRound class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    v-model="yostarCode"
                    type="text"
                    maxlength="6"
                    placeholder="123456"
                    class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="button"
                  :disabled="isLinking || !yostarCode.trim() || !yostarEmail.trim()"
                  class="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-md flex-shrink-0"
                  @click="handleLinkAndSyncYostar"
                >
                  <RefreshCw v-if="isLinking" class="w-3.5 h-3.5 animate-spin" />
                  <span>{{ isLinking ? 'Подключение...' : 'Подключить и синхронизировать' }}</span>
                </button>
              </div>
            </div>

            <!-- Information note -->
            <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 leading-relaxed">
              <p>
                &bull; Код подтверждения отправляется официальным шлюзом Yostar на вашу почту.
              </p>
              <p>
                &bull; После первого ввода сервис сохраняет токен сессии на этом устройстве, и в дальнейшем данные будут обновляться в <strong>1 клик</strong> без писем на почту.
              </p>
              <p>
                &bull; Перед нажатием сверните игру на телефоне, чтобы не выбило активную сессию.
              </p>
            </div>
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
              Очистить склад (Склад)
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-800 text-xs font-semibold transition-colors"
              @click="handleClearRoster"
            >
              <Trash2 class="w-3.5 h-3.5 text-red-400" />
              Очистить мой ростер
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
