<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
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

const props = defineProps<{
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

const oauthLoading = ref<'google' | 'discord' | null>(null);

async function handleOAuth(provider: 'google' | 'discord') {
  localError.value = null;
  oauthLoading.value = provider;
  const res = await auth.signInWithOAuth(provider);
  if (!res.success) {
    localError.value = res.error || locale.t('auth.loginFailed');
    oauthLoading.value = null;
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

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
    e.stopPropagation();
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
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
            :disabled="auth.isLoading || !!oauthLoading"
            class="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 mt-2"
          >
            <RefreshCw v-if="auth.isLoading && !oauthLoading" class="w-4 h-4 animate-spin" />
            <span>{{ activeTab === 'signin' ? locale.t('auth.signInBtn') : locale.t('auth.createAccount') }}</span>
          </button>
        </form>

        <!-- OAuth Social Login Divider -->
        <div class="relative my-3">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-800"></div>
          </div>
          <div class="relative flex justify-center text-[10px] uppercase">
            <span class="bg-slate-950 px-2.5 text-slate-500 font-semibold tracking-wider">
              {{ locale.t('auth.orContinueWith') }}
            </span>
          </div>
        </div>

        <!-- OAuth Providers: Google & Discord -->
        <div class="grid grid-cols-2 gap-2">
          <!-- Google Button -->
          <button
            type="button"
            :disabled="auth.isLoading || !!oauthLoading"
            class="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-sm disabled:opacity-50 group"
            @click="handleOAuth('google')"
          >
            <RefreshCw v-if="oauthLoading === 'google'" class="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <svg v-else class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17c1.8 3.7 5.6 6.5 10.1 6.5z" />
            </svg>
            <span class="group-hover:text-white">{{ locale.t('auth.oauthGoogle') }}</span>
          </button>

          <!-- Discord Button -->
          <button
            type="button"
            :disabled="auth.isLoading || !!oauthLoading"
            class="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/90 hover:bg-[#5865F2]/20 border border-slate-700/80 hover:border-[#5865F2]/60 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm disabled:opacity-50 group"
            @click="handleOAuth('discord')"
          >
            <RefreshCw v-if="oauthLoading === 'discord'" class="w-3.5 h-3.5 animate-spin text-[#5865F2]" />
            <svg v-else class="w-4 h-4 flex-shrink-0 text-[#5865F2] group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span class="group-hover:text-white">{{ locale.t('auth.oauthDiscord') }}</span>
          </button>
        </div>

        <div class="pt-2 text-center text-[10px] text-slate-500 leading-relaxed">
          {{ locale.t('auth.cloudFooterHint') }}
        </div>
      </div>
    </div>
  </div>
    </Transition>
  </Teleport>
</template>
