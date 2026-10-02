<script setup lang="ts">
import { ref } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import { useAuthStore } from '@/stores/auth';
import {
  X,
  Cloud,
  Mail,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const auth = useAuthStore();
const locale = useLocaleStore();

const activeTab = ref<'signin' | 'signup'>('signin');
const email = ref('');
const password = ref('');
const localError = ref<string | null>(null);

async function handleSubmit() {
  localError.value = null;
  if (!email.value || !password.value) {
    localError.value = locale.t('auth.fillEmailPass');
    return;
  }

  if (password.value.length < 6) {
    localError.value = locale.t('auth.passTooShort');
    return;
  }

  if (activeTab.value === 'signup') {
    const res = await auth.signUp(email.value, password.value);
    if (!res.success) {
      localError.value = res.error || locale.t('auth.regFailed');
    }
  } else {
    const res = await auth.signIn(email.value, password.value);
    if (!res.success) {
      localError.value = res.error || locale.t('auth.loginFailed');
    }
  }
}

function handleSignOut() {
  auth.signOut();
  email.value = '';
  password.value = '';
}

function formatSyncTime(isoString: string | null): string {
  if (!isoString) return locale.t('auth.neverSaved');
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
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="bg-ark-darker border border-ark-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-ark-border flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400"
          >
            <Cloud class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-slate-100 text-sm sm:text-base">
              {{ auth.isAuthenticated ? locale.t('auth.title') : locale.t('auth.login') }}
            </h3>
            <p class="text-[11px] text-slate-400 font-mono">
              {{ auth.isAuthenticated ? locale.t('auth.subtitle') : locale.t('auth.crossPlatformDesc') }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Authenticated Profile View -->
      <div v-if="auth.isAuthenticated" class="p-5 space-y-4">
        <!-- User info box -->
        <div class="bg-slate-900/90 border border-ark-border rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-medium">{{ locale.t('auth.accountStatus') }}</span>
            <span
              v-if="auth.isSyncing"
              class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5"
            >
              <RefreshCw class="w-3 h-3 animate-spin text-cyan-400" />
              {{ locale.t('auth.syncing') }}
            </span>
            <span
              v-else
              class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {{ locale.t('auth.statusActive') }}
            </span>
          </div>

          <div class="flex items-center gap-2.5 text-slate-200 font-mono text-sm font-semibold truncate pt-1">
            <div class="w-7 h-7 rounded-lg bg-cyan-950/70 border border-cyan-700/60 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <User class="w-4 h-4" />
            </div>
            <span class="truncate">{{ auth.userEmail }}</span>
          </div>

          <div class="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>{{ locale.t('auth.lastSaved') }}</span>
            <strong class="text-slate-200">{{ formatSyncTime(auth.lastSyncTime) }}</strong>
          </div>
        </div>

        <!-- Sync Feedback Messages -->
        <div
          v-if="auth.syncMessage"
          class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle2 class="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{{ auth.syncMessage }}</span>
        </div>
        <div
          v-if="auth.syncError"
          class="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{{ auth.syncError }}</span>
        </div>

        <!-- Automated Sync Features Card -->
        <div class="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2">
          <div class="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
            <ShieldCheck class="w-4 h-4 text-emerald-400" />
            {{ locale.t('auth.autoModeTitle') }}
          </div>
          <div class="space-y-1.5 text-slate-400 pl-1 leading-relaxed">
            <div class="flex items-start gap-2">
              <span class="text-cyan-400 font-bold">&bull;</span>
              <span><strong>{{ locale.t('auth.instantSaveBold') }}</strong> {{ locale.t('auth.instantSaveDesc') }}</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-cyan-400 font-bold">&bull;</span>
              <span><strong>{{ locale.t('auth.crossPlatformBold') }}</strong> {{ locale.t('auth.crossPlatformSubDesc') }}</span>
            </div>
          </div>
        </div>

        <!-- Subtle emergency sync button -->
        <div class="pt-1 flex items-center justify-between text-xs">
          <button
            type="button"
            :disabled="auth.isSyncing"
            class="text-slate-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            :title="locale.t('auth.forcePullTitle')"
            @click="auth.pullFromCloud"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': auth.isSyncing }" />
            <span>{{ locale.t('auth.forcePull') }}</span>
          </button>

          <button
            type="button"
            class="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition-colors p-1"
            @click="handleSignOut"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>{{ locale.t('auth.logout') }}</span>
          </button>
        </div>
      </div>

      <!-- Unauthenticated Login/Signup Form -->
      <div v-else class="p-5 space-y-4">
        <!-- Tabs -->
        <div class="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            class="py-1.5 rounded-lg transition-all"
            :class="activeTab === 'signin' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'signin'"
          >
            {{ locale.t('auth.login') }}
          </button>
          <button
            type="button"
            class="py-1.5 rounded-lg transition-all"
            :class="activeTab === 'signup' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            @click="activeTab = 'signup'"
          >
            {{ locale.t('auth.register') }}
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-3" @submit.prevent="handleSubmit">
          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {{ locale.t('auth.email') }}
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="doctor@rhodes-island.com"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {{ locale.t('auth.password') }}
            </label>
            <div class="relative">
              <Lock class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p v-if="activeTab === 'signup'" class="text-[10px] text-slate-500">
              {{ locale.t('auth.minPassword') }}
            </p>
          </div>

          <!-- Error Alert -->
          <div
            v-if="localError || auth.syncError"
            class="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{{ localError || auth.syncError }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="auth.isLoading"
            class="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 mt-2"
          >
            <RefreshCw v-if="auth.isLoading" class="w-4 h-4 animate-spin" />
            <span>{{ activeTab === 'signin' ? locale.t('auth.signInBtn') : locale.t('auth.createAccount') }}</span>
          </button>
        </form>

        <div class="pt-2 text-center text-[10px] text-slate-500 leading-relaxed">
          {{ locale.t('auth.cloudFooterHint') }}
        </div>
      </div>
    </div>
  </div>
</template>
