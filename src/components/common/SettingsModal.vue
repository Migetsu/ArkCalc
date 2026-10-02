<script setup lang="ts">
import { ref } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { usePlannerStore } from '@/stores/planner';
import { useRosterStore } from '@/stores/roster';
import { useGameDataStore } from '@/stores/gamedata';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore } from '@/stores/locale';
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
const locale = useLocaleStore();

function changeLanguage(lang: 'en' | 'ru') {
  locale.setLanguage(lang);
  gameData.setItemLanguage(lang);
}

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
    statusMessage.value = {
      type: 'error',
      text: locale.currentLang === 'ru' ? 'Пожалуйста, введите корректный адрес электронной почты Yostar.' : 'Please enter a valid Yostar account email address.',
    };
    return;
  }
  isSendingCode.value = true;
  statusMessage.value = null;
  try {
    const res = await requestVerificationCode(yostarEmail.value, yostarServer.value);
    if (res.success) {
      statusMessage.value = {
        type: 'success',
        text: res.message || (locale.currentLang === 'ru' ? 'Код подтверждения отправлен на почту!' : 'Verification code sent to your email!'),
      };
      startCooldown();
    } else {
      statusMessage.value = {
        type: 'error',
        text: res.error || (locale.currentLang === 'ru' ? 'Ошибка отправки кода' : 'Failed to send verification code'),
      };
    }
  } finally {
    isSendingCode.value = false;
  }
}

async function handleLinkAndSyncYostar() {
  if (!yostarEmail.value || !yostarCode.value) {
    statusMessage.value = {
      type: 'error',
      text: locale.currentLang === 'ru' ? 'Заполните email и 6-значный код из письма.' : 'Please enter email and the 6-digit code from the email.',
    };
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
        text: locale.currentLang === 'ru'
          ? `Игровой аккаунт ${res.account.nickName || res.account.email} успешно привязан и синхронизирован! Склад и ростер обновлены.`
          : `Account ${res.account.nickName || res.account.email} successfully linked and synchronized! Depot and roster updated.`,
      };
    } else {
      statusMessage.value = {
        type: 'error',
        text: res.error || (locale.currentLang === 'ru' ? 'Не удалось привязать аккаунт Yostar' : 'Failed to link Yostar account'),
      };
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
        text: locale.currentLang === 'ru'
          ? `Данные с игрового сервера успешно обновлены в 1 клик! Загружено предметов: ${res.inventoryCount || 0}, оперативников: ${res.rosterCount || 0}.`
          : `Live server data refreshed in 1 click! Loaded items: ${res.inventoryCount || 0}, operators: ${res.rosterCount || 0}.`,
      };
    } else {
      statusMessage.value = {
        type: 'error',
        text: res.error || (locale.currentLang === 'ru' ? 'Ошибка синхронизации с аккаунтом' : 'Account synchronization error'),
      };
    }
  } finally {
    isDirectSyncing.value = false;
  }
}

function handleUnlinkYostar() {
  const confirmMsg = locale.currentLang === 'ru'
    ? 'Вы действительно хотите отвязать аккаунт Yostar? Токен будет удален с этого устройства.'
    : 'Are you sure you want to unlink your Yostar account? Stored session token will be removed.';
  if (confirm(confirmMsg)) {
    unlinkAccount();
    yostarAccount.value = null;
    statusMessage.value = {
      type: 'info',
      text: locale.currentLang === 'ru' ? 'Аккаунт Yostar успешно отвязан.' : 'Yostar account successfully unlinked.',
    };
  }
}

function formatSyncTime(isoString?: string): string {
  if (!isoString) return locale.currentLang === 'ru' ? 'Еще не синхронизировано' : 'Not synced yet';
  try {
    const d = new Date(isoString);
    return d.toLocaleString(locale.currentLang === 'ru' ? 'ru-RU' : 'en-US', {
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
    statusMessage.value = {
      type: 'success',
      text: locale.currentLang === 'ru'
        ? 'Файл резервной копии ark_calc_backup.json успешно скачан!'
        : 'Backup file ark_calc_backup.json successfully downloaded!',
    };
  } catch (err: any) {
    statusMessage.value = {
      type: 'error',
      text: `${locale.currentLang === 'ru' ? 'Ошибка экспорта:' : 'Export error:'} ${err.message || err}`,
    };
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
        text: locale.currentLang === 'ru'
          ? 'Буфер обмена пуст. Скопируйте Full Raw Data из ArkPRTS и нажмите кнопку снова.'
          : 'Clipboard is empty. Copy Full Raw Data from ArkPRTS and click again.',
      };
    }
  } catch {
    statusMessage.value = {
      type: 'info',
      text: locale.currentLang === 'ru'
        ? 'Вставьте скопированный текст из ArkPRTS в текстовое поле вручную (Ctrl+V) и нажмите «Импортировать».'
        : 'Paste copied text from ArkPRTS into the text area below manually (Ctrl+V) and click Import.',
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
        extraMsg = syncRes.success
          ? (locale.currentLang === 'ru' ? ' И автоматически сохранено в облако!' : ' And automatically synced to cloud!')
          : (locale.currentLang === 'ru' ? ' (Локально сохранено, ошибка синхронизации с облаком)' : ' (Saved locally, cloud sync error)');
      }

      statusMessage.value = { type: 'success', text: res.message + extraMsg };
      pasteInputText.value = '';
    } else {
      statusMessage.value = { type: 'error', text: res.message };
    }
  } catch (err: any) {
    statusMessage.value = {
      type: 'error',
      text: `${locale.currentLang === 'ru' ? 'Ошибка импорта:' : 'Import error:'} ${err.message || err}`,
    };
  } finally {
    isOperating.value = false;
  }
}

async function handleClearWarehouse() {
  const confirmMsg = locale.currentLang === 'ru'
    ? 'Вы уверены, что хотите стереть все ресурсы со склада?'
    : 'Are you sure you want to clear all depot materials?';
  if (confirm(confirmMsg)) {
    await inventory.clearAll();
    if (auth.isAuthenticated) {
      await auth.syncToCloud();
    }
    statusMessage.value = {
      type: 'info',
      text: locale.currentLang === 'ru' ? 'Данные склада успешно очищены.' : 'Depot materials successfully cleared.',
    };
  }
}

async function handleClearRoster() {
  const confirmMsg = locale.currentLang === 'ru'
    ? 'Вы уверены, что хотите очистить ростер импортированных оперативников?'
    : 'Are you sure you want to clear your imported operator roster?';
  if (confirm(confirmMsg)) {
    await rosterStore.clearAllRoster();
    if (auth.isAuthenticated) {
      await auth.syncToCloud();
    }
    statusMessage.value = {
      type: 'info',
      text: locale.currentLang === 'ru' ? 'Ростер оперативников успешно очищен.' : 'Operator roster successfully cleared.',
    };
  }
}

async function handleClearAllPlans() {
  const confirmMsg = locale.currentLang === 'ru'
    ? 'Вы уверены, что хотите удалить все добавленные планы оперативников?'
    : 'Are you sure you want to delete all upgrade plans?';
  if (confirm(confirmMsg)) {
    await planner.clearAllPlans();
    statusMessage.value = {
      type: 'info',
      text: locale.currentLang === 'ru' ? 'Все планы оперативников удалены.' : 'All operator plans successfully deleted.',
    };
  }
}

async function handleRefreshGameData() {
  isRefreshing.value = true;
  statusMessage.value = null;
  try {
    await gameData.loadGameData(true);
    statusMessage.value = {
      type: 'success',
      text: locale.currentLang === 'ru' ? 'Игровые данные успешно обновлены!' : 'Game database successfully refreshed!',
    };
  } catch (err: any) {
    statusMessage.value = {
      type: 'error',
      text: `${locale.currentLang === 'ru' ? 'Ошибка обновления:' : 'Update error:'} ${err.message || err}`,
    };
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
      text: locale.currentLang === 'ru'
        ? `Penguin Stats успешно обновлён онлайн! Синхронизировано ${count} записей выпадения материалов.`
        : `Penguin Stats successfully updated online! Synchronized ${count} drop rate records.`,
    };
  } catch (err: any) {
    statusMessage.value = {
      type: 'error',
      text: locale.currentLang === 'ru'
        ? `Не удалось загрузить данные Penguin Stats (${err.message || err}). Продолжает использоваться локальная база.`
        : `Failed to download Penguin Stats data (${err.message || err}). Falling back to local benchmark data.`,
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
        <h3 class="font-bold text-base text-slate-100 flex items-center gap-2">
          {{ locale.currentLang === 'ru' ? 'Настройки и синхронизация' : 'Settings & Synchronization' }}
        </h3>
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
              {{ locale.currentLang === 'ru' ? 'Игровые данные и локализация' : 'Game Data & Localization' }}
            </h4>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
              {{ Object.keys(gameData.operators).length || 429 }} {{ locale.currentLang === 'ru' ? 'Оперативников • Все модули' : 'Operators • All Modules' }}
            </span>
          </div>
          <p class="text-slate-400">
            {{ locale.currentLang === 'ru' ? 'Подключена полная база данных Arknights со всеми актуальными оперативниками, альтернативными модулями (X/Y/D) и крафтами. Имена персонажей отображаются на английском.' : 'Authoritative Arknights game database with all operators, alternative module trees (X/Y/D), and crafting formulas. 100% offline.' }}
          </p>

          <!-- Language selector for interface & game data -->
          <div class="flex items-center justify-between flex-wrap gap-3 p-3 rounded-lg bg-slate-900/80 border border-ark-border">
            <div>
              <span class="text-xs font-bold text-slate-200 block">{{ locale.t('settings.languageTitle') }}</span>
              <span class="text-[11px] text-slate-400 block">{{ locale.t('settings.languageHint') }}</span>
            </div>
            <div class="inline-flex bg-slate-950 p-1 rounded-lg border border-ark-border">
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5"
                :class="locale.currentLang === 'en' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                @click="changeLanguage('en')"
              >
                <span>English (EN)</span>
                <span class="text-[9px] px-1 rounded bg-slate-900/80 text-cyan-200 border border-cyan-400/30 font-mono">Default</span>
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                :class="locale.currentLang === 'ru' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
                @click="changeLanguage('ru')"
              >
                Русский (RU)
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
              {{ isRefreshing ? (locale.currentLang === 'ru' ? 'Обновление данных...' : 'Updating data...') : (locale.currentLang === 'ru' ? 'Обновить данные игры' : 'Refresh Game Data') }}
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-semibold transition-colors text-xs"
              :disabled="isSyncingPenguin"
              @click="handleSyncPenguin"
            >
              <Zap class="w-4 h-4" :class="{ 'animate-spin': isSyncingPenguin }" />
              {{ isSyncingPenguin ? (locale.currentLang === 'ru' ? 'Синхронизация дропов...' : 'Syncing drops...') : (locale.currentLang === 'ru' ? 'Синхронизировать Penguin Stats' : 'Sync Penguin Stats') }}
            </button>
          </div>
          <p class="text-slate-500 mt-1.5">
            {{ locale.currentLang === 'ru' ? 'Обновление базы персонажей с GitHub и актуальной матрицы дропа стадий с penguin-stats.io.' : 'Updates operator database from GitHub and stage drop rates from penguin-stats.io.' }}
          </p>
        </div>

        <!-- Yostar Direct 1-Click Sync Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Gamepad2 class="w-4 h-4 text-cyan-400" />
              {{ locale.currentLang === 'ru' ? 'Прямая синхронизация с игрой (Yostar)' : 'Direct Game Sync (Yostar)' }}
            </h4>
            <span
              v-if="yostarAccount"
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"
            >
              <ShieldCheck class="w-3 h-3" />
              {{ locale.currentLang === 'ru' ? 'Привязан' : 'Linked' }} ({{ yostarAccount.server.toUpperCase() }})
            </span>
            <span
              v-else
              class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800"
            >
              {{ locale.currentLang === 'ru' ? 'В 1 клик • Без сторонних сайтов' : '1-Click • No third-party tools' }}
            </span>
          </div>

          <p class="text-slate-400 leading-relaxed">
            {{ locale.currentLang === 'ru' ? 'Прямое подключение к игровому серверу Arknights. Загружает ваш актуальный склад, всех имеющихся оперативников, уровни прокачки, навыков и модулей без необходимости заходить на сторонние ресурсы или копировать JSON вручную.' : 'Direct connection to Arknights game servers. Loads live depot materials, all owned operators, promotion levels, skill masteries, and module stages in 1 click.' }}
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
                      <span>{{ yostarAccount.nickName || (locale.currentLang === 'ru' ? 'Доктор' : 'Doctor') }}</span>
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
                  <span>{{ locale.currentLang === 'ru' ? 'Отвязать' : 'Unlink' }}</span>
                </button>
              </div>

              <div class="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span>{{ locale.currentLang === 'ru' ? 'Последняя синхронизация:' : 'Last synchronized:' }}</span>
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
                {{ isDirectSyncing ? (locale.currentLang === 'ru' ? 'Скачивание данных с сервера Arknights...' : 'Fetching data from Arknights server...') : (locale.currentLang === 'ru' ? 'Синхронизировать аккаунт прямо сейчас (В 1 клик)' : 'Sync Account Right Now (1-Click)') }}
              </span>
            </button>

            <p class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
              <span>💡</span>
              <span>{{ locale.currentLang === 'ru' ? 'Перед нажатием сверните или закройте игру на телефоне, чтобы сервер не выдал сообщение о входе с другого устройства.' : 'Before syncing, minimize or close the game on your device to prevent simultaneous login warnings.' }}</span>
            </p>
          </div>

          <!-- STATE 2: Account not yet linked -->
          <div v-else class="space-y-3 pt-1">
            <!-- Server Selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {{ locale.currentLang === 'ru' ? 'Регион сервера игры' : 'Game Server Region' }}
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
                {{ locale.currentLang === 'ru' ? 'Почта аккаунта Yostar' : 'Yostar Account Email' }}
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
                  <span>{{ codeCooldown > 0 ? (locale.currentLang === 'ru' ? `${codeCooldown} сек.` : `${codeCooldown}s`) : (locale.currentLang === 'ru' ? 'Получить код' : 'Send Code') }}</span>
                </button>
              </div>
            </div>

            <!-- Code & Link Row -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {{ locale.currentLang === 'ru' ? '6-значный код из письма' : '6-digit Verification Code' }}
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
                  <span>{{ isLinking ? (locale.currentLang === 'ru' ? 'Подключение...' : 'Linking...') : (locale.currentLang === 'ru' ? 'Подключить и синхронизировать' : 'Link & Sync Account') }}</span>
                </button>
              </div>
            </div>

            <!-- Information note -->
            <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 leading-relaxed">
              <p>
                &bull; {{ locale.currentLang === 'ru' ? 'Код подтверждения отправляется официальным шлюзом Yostar на вашу почту.' : 'Verification code is sent directly from the official Yostar login gateway.' }}
              </p>
              <p>
                &bull; {{ locale.currentLang === 'ru' ? 'После первого ввода сервис сохраняет токен сессии на этом устройстве, и в дальнейшем данные будут обновляться в 1 клик без писем на почту.' : 'After initial linking, session credentials stay stored locally on this device for instant 1-click updates without new emails.' }}
              </p>
              <p>
                &bull; {{ locale.currentLang === 'ru' ? 'Перед нажатием сверните игру на телефоне, чтобы не выбило активную сессию.' : 'Minimize the game on your mobile device before syncing to prevent session conflicts.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- ArkPRTS Clipboard Import Section -->
        <div class="p-4 bg-ark-card rounded-xl border border-ark-border space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Clipboard class="w-4 h-4 text-cyan-400" />
              {{ locale.currentLang === 'ru' ? 'Импорт склада из ArkPRTS' : 'Import Depot from ArkPRTS' }}
            </h4>
            <span class="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Full Raw Data
            </span>
          </div>
          <p class="text-slate-400 leading-relaxed">
            {{ locale.currentLang === 'ru' ? 'Скопируйте данные в перехватчике ArkPRTS (кнопка Copy full raw data) и нажмите кнопку быстрой вставки из буфера или вставьте текст в поле ниже вручную:' : 'Copy depot dump in ArkPRTS network interceptor (click Copy full raw data) and use quick paste or paste manually below:' }}
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
                {{ locale.currentLang === 'ru' ? 'Вставить из буфера обмена' : 'Paste from Clipboard' }}
              </button>
              <button
                v-if="pasteInputText.trim()"
                type="button"
                class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                @click="pasteInputText = ''"
              >
                {{ locale.currentLang === 'ru' ? 'Очистить поле' : 'Clear' }}
              </button>
            </div>

            <textarea
              v-model="pasteInputText"
              rows="4"
              :placeholder="locale.currentLang === 'ru' ? 'Или вставьте сюда скопированный JSON текст из ArkPRTS вручную (Ctrl+V)...' : 'Or paste copied JSON text from ArkPRTS manually here (Ctrl+V)...'"
              class="w-full bg-slate-900 border border-ark-border rounded-xl p-3 font-mono text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            ></textarea>

            <div class="flex items-center justify-between">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-bold text-xs transition-all"
                :disabled="!pasteInputText.trim() || isOperating"
                @click="handleImportFromPaste"
              >
                {{ locale.currentLang === 'ru' ? 'Импортировать введённый текст' : 'Import Entered JSON' }}
              </button>
              <span v-if="pasteInputText.trim()" class="text-[10px] text-slate-500 font-mono">
                {{ locale.currentLang === 'ru' ? 'Длина' : 'Length' }}: {{ pasteInputText.length }} {{ locale.currentLang === 'ru' ? 'символов' : 'characters' }}
              </span>
            </div>
          </div>

          <!-- Backup Export -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="text-xs font-semibold text-slate-300 block">
                {{ locale.currentLang === 'ru' ? 'Резервная копия планов и склада' : 'Backup Plans & Depot' }}
              </span>
              <span class="text-[11px] text-slate-500 block">
                {{ locale.currentLang === 'ru' ? 'Сохранить файл ark_calc_backup.json на диск' : 'Save ark_calc_backup.json file locally' }}
              </span>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition-colors"
              :disabled="isOperating"
              @click="handleExportJson"
            >
              <Download class="w-3.5 h-3.5 text-cyan-400" />
              {{ locale.currentLang === 'ru' ? 'Скачать бэкап (.json)' : 'Download Backup (.json)' }}
            </button>
          </div>
        </div>

        <!-- Danger Zone Section -->
        <div class="p-4 bg-red-950/20 rounded-xl border border-red-900/40 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-red-300 text-sm flex items-center gap-2">
              <Trash2 class="w-4 h-4 text-red-400" />
              {{ locale.currentLang === 'ru' ? 'Управление данными и сброс' : 'Data Management & Reset' }}
            </h4>
          </div>
          <p class="text-slate-400 text-xs">
            {{ locale.currentLang === 'ru' ? 'Здесь можно быстро стереть данные склада после тестирования или очистить все планы оперативников.' : 'Quickly clear warehouse inventory after testing or purge all operator upgrade plans.' }}
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-800/80 text-xs font-semibold transition-colors"
              @click="handleClearWarehouse"
            >
              <Trash2 class="w-3.5 h-3.5 text-red-400" />
              {{ locale.currentLang === 'ru' ? 'Очистить склад' : 'Clear Depot' }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-800 text-xs font-semibold transition-colors"
              @click="handleClearRoster"
            >
              <Trash2 class="w-3.5 h-3.5 text-red-400" />
              {{ locale.currentLang === 'ru' ? 'Очистить мой ростер' : 'Clear My Roster' }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 text-xs font-semibold transition-colors"
              @click="handleClearAllPlans"
            >
              <Trash2 class="w-3.5 h-3.5" />
              {{ locale.currentLang === 'ru' ? 'Сбросить все планы' : 'Reset All Plans' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3.5 bg-ark-card border-t border-ark-border flex justify-end">
        <button type="button" class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors" @click="emit('close')">
          {{ locale.currentLang === 'ru' ? 'Закрыть' : 'Close' }}
        </button>
      </div>
    </div>
  </div>
</template>
