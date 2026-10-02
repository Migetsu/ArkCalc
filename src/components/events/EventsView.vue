<script setup lang="ts">
import { ref, computed } from 'vue';
import { ARKNIGHTS_EVENTS, type ArknightsEvent } from '@/data/eventsData';
import { useLocaleStore } from '@/stores/locale';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import EventDetailsModal from './EventDetailsModal.vue';
import {
  Calendar,
  ShoppingBag,
  Search,
  Flame,
  ChevronRight,
  Radio,
} from 'lucide-vue-next';

const locale = useLocaleStore();

const searchQuery = ref<string>('');
const categoryFilter = ref<'all' | 'events' | 'banners'>('all');

// Track which events have their shop supplies factored into calculator
const appliedEvents = ref<Set<string>>(new Set());

// Modal state
const isModalOpen = ref<boolean>(false);
const selectedEvent = ref<ArknightsEvent | null>(null);

function openModal(e: ArknightsEvent) {
  selectedEvent.value = e;
  isModalOpen.value = true;
}

function toggleEventInCalculator(eventId: string) {
  if (appliedEvents.value.has(eventId)) {
    appliedEvents.value.delete(eventId);
  } else {
    appliedEvents.value.add(eventId);
  }
}

const filteredEvents = computed(() => {
  let list = ARKNIGHTS_EVENTS;

  if (categoryFilter.value === 'events') {
    list = list.filter((e) => e.shopItems.length > 0 || e.farmingStages.length > 0);
  } else if (categoryFilter.value === 'banners') {
    list = list.filter((e) => e.type === 'headhunting' && e.shopItems.length === 0);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((e) => {
      const nameEn = e.nameEn.toLowerCase();
      const nameRu = e.nameRu.toLowerCase();
      const nameCn = e.nameCn.toLowerCase();
      const ops6 = e.sixStarOps.map((o) => o.name.toLowerCase()).join(' ');
      const ops5 = e.fiveStarOps.map((o) => o.name.toLowerCase()).join(' ');
      return (
        nameEn.includes(q) ||
        nameRu.includes(q) ||
        nameCn.includes(q) ||
        ops6.includes(q) ||
        ops5.includes(q)
      );
    });
  }

  return list;
});

function getHeaderTag(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.headerTagRu;
  return e.headerTagEn;
}

function getPrompt6(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.prompt6Ru || locale.t('events.defaultPrompt6');
  return e.prompt6En || locale.t('events.defaultPrompt6');
}

function getPrompt5(e: ArknightsEvent): string {
  if (locale.currentLang === 'ru') return e.prompt5Ru || locale.t('events.defaultPrompt5');
  return e.prompt5En || locale.t('events.defaultPrompt5');
}

function handleAvatarError(e: Event) {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = PLACEHOLDER_AVATAR;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header banner -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Calendar class="w-4 h-4" />
            <span>{{ locale.t('events.title') }}</span>
          </div>
          <h2 class="text-xl md:text-2xl font-black text-slate-100 tracking-tight mt-1">
            {{ locale.t('events.subtitle') }}
          </h2>
          <p class="text-xs text-slate-400 mt-1 max-w-2xl">
            {{ locale.currentLang === 'ru' ? 'CN сервер опережает Global (EN/JP/KR) примерно на 5.5 месяцев. Просматривайте активные CN баннеры, предстоящие Global события и хронологию с наградами магазина и оптимальными картами для фарма.' : 'CN server runs ~5.5 months ahead of Global (EN/JP/KR). Preview active CN banners, upcoming Global events, and retrospective timelines with full shop rewards and optimal stage farming rates.' }}
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-slate-300">CN Gap: <strong class="text-white">~5.5 months</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation & Filters Toolbar -->
    <div class="bg-ark-card border border-ark-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Category Tabs (All / Events with Shops / Headhunting Banners) -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          :class="categoryFilter === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'"
          @click="categoryFilter = 'all'"
        >
          <Flame class="w-3.5 h-3.5 text-amber-300" />
          <span>{{ locale.currentLang === 'ru' ? 'Все' : 'All' }}</span>
          <span class="bg-slate-950/60 font-mono text-[10px] px-1.5 py-0.2 rounded">
            {{ ARKNIGHTS_EVENTS.length }}
          </span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          :class="categoryFilter === 'events' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'"
          @click="categoryFilter = 'events'"
        >
          <ShoppingBag class="w-3.5 h-3.5 text-cyan-300" />
          <span>{{ locale.currentLang === 'ru' ? 'Ивенты с магазином' : 'Events & Shops' }}</span>
          <span class="bg-slate-950/60 font-mono text-[10px] px-1.5 py-0.2 rounded">
            {{ ARKNIGHTS_EVENTS.filter(e => e.shopItems.length > 0).length }}
          </span>
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          :class="categoryFilter === 'banners' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'"
          @click="categoryFilter = 'banners'"
        >
          <Radio class="w-3.5 h-3.5 text-amber-300" />
          <span>{{ locale.currentLang === 'ru' ? 'Баннеры хедхантинга' : 'Headhunting Banners' }}</span>
          <span class="bg-slate-950/60 font-mono text-[10px] px-1.5 py-0.2 rounded">
            {{ ARKNIGHTS_EVENTS.filter(e => e.type === 'headhunting' && e.shopItems.length === 0).length }}
          </span>
        </button>
      </div>

      <!-- Search Filter -->
      <div class="flex items-center gap-2 flex-1 md:max-w-xs">
        <div class="relative w-full">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="locale.t('common.search')"
            class="w-full bg-slate-900 border border-ark-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
          />
        </div>
      </div>
    </div>

    <!-- Events List Matching Reference Design -->
    <div class="space-y-6">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg transition-all"
      >
        <div class="flex flex-col lg:flex-row items-stretch gap-6">
          <!-- Left Column: Header Tag + Poster Banner + Date + Details Modal Button -->
          <div class="w-full lg:w-[350px] xl:w-[370px] flex-shrink-0 flex flex-col justify-between space-y-3">
            <div>
              <!-- Cyan Event / Banner Tag Bar -->
              <div class="bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm py-1.5 px-3 rounded-t-lg text-center tracking-tight uppercase shadow-sm">
                {{ getHeaderTag(event) }}
              </div>

              <!-- Poster image -->
              <div
                class="relative aspect-[3.2/1] w-full bg-slate-950 border-x border-b border-cyan-400/40 rounded-b-lg overflow-hidden shadow-md group/poster cursor-pointer"
                title="Click to view details, shop & farming stages"
                @click="openModal(event)"
              >
                <img
                  :src="event.bannerPosterUrl"
                  :alt="event.nameEn"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300"
                />
                <div class="absolute inset-0 bg-slate-950/30 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="bg-slate-900/90 text-cyan-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border border-cyan-500/40">
                    {{ locale.t('events.viewDetails') }}
                  </span>
                </div>
              </div>

              <!-- Dates row -->
              <div class="text-center py-2 px-1 text-xs font-mono font-bold text-slate-100 flex flex-col items-center gap-0.5">
                <div>
                  CN date: <span class="text-white">{{ event.cnStartDate }} – {{ event.cnEndDate }}</span>
                </div>
                <div v-if="event.globalEstimatedArrival" class="text-[11px] text-cyan-300 font-normal">
                  Global est: <strong>{{ event.globalEstimatedArrival }}</strong>
                </div>
              </div>

              <!-- Content Type Pill Badge -->
              <div class="pt-0.5 pb-1 flex items-center justify-center">
                <span
                  v-if="event.shopItems.length > 0"
                  class="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 shadow-sm"
                >
                  <ShoppingBag class="w-3.5 h-3.5 text-cyan-400" />
                  {{ locale.currentLang === 'ru' ? `Магазин: ${event.shopItems.length} поз.` : `Shop: ${event.shopItems.length} items` }}
                  <span v-if="event.farmingStages.length > 0">&bull; {{ locale.currentLang === 'ru' ? `Фарм: ${event.farmingStages.length}` : `Farm: ${event.farmingStages.length}` }}</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-800/60 text-amber-300 shadow-sm"
                >
                  <Radio class="w-3.5 h-3.5 text-amber-400" />
                  {{ locale.currentLang === 'ru' ? 'Баннер призыва (гача)' : 'Headhunting Banner (Gacha)' }}
                </span>
              </div>
            </div>

            <!-- Modal Action Button -->
            <button
              type="button"
              class="w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2"
              :class="[
                appliedEvents.has(event.id)
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              ]"
              @click="openModal(event)"
            >
              <ShoppingBag v-if="event.shopItems.length > 0" class="w-4 h-4 text-cyan-400" />
              <Radio v-else class="w-4 h-4 text-amber-400" />
              <span>{{ event.shopItems.length > 0 ? locale.t('events.viewDetails') : (locale.currentLang === 'ru' ? 'Подробнее о баннере' : 'Banner Details') }}</span>
              <span v-if="appliedEvents.has(event.id)" class="ml-1 inline-flex items-center text-[10px] text-emerald-400 font-mono">
                [✓ {{ locale.t('calc.eventShopActive') }}]
              </span>
              <ChevronRight class="w-3.5 h-3.5 ml-auto text-slate-400" />
            </button>
          </div>

          <!-- Right Column: Operator Avatars Rows matching reference image -->
          <div class="flex-1 min-w-0 flex flex-col justify-center space-y-4">
            <!-- 6 Star Section -->
            <div class="space-y-2">
              <div class="text-xs sm:text-[13px] font-medium text-slate-200 leading-snug">
                {{ getPrompt6(event) }}
              </div>

              <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <div
                  v-for="op in event.sixStarOps"
                  :key="op.charId"
                  class="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-slate-900 rounded-sm overflow-hidden border-b-4 border-amber-400 shadow-md group/op cursor-pointer transition-transform hover:scale-105"
                  :title="op.name"
                  @click="openModal(event)"
                >
                  <img
                    :src="op.avatarUrl || getAvatarUrl(op.charId)"
                    :alt="op.name"
                    loading="lazy"
                    class="w-full h-full object-cover"
                    @error="handleAvatarError"
                  />
                  <!-- Name tooltip on hover -->
                  <div class="absolute inset-x-0 bottom-0 bg-slate-950/80 text-[9px] text-amber-300 text-center font-bold truncate opacity-0 group-hover/op:opacity-100 transition-opacity px-0.5">
                    {{ op.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 5 Star Section -->
            <div class="space-y-2 pt-1">
              <div class="text-xs sm:text-[13px] font-medium text-slate-200 leading-snug">
                {{ getPrompt5(event) }}
              </div>

              <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <div
                  v-for="op in event.fiveStarOps"
                  :key="op.charId"
                  class="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-slate-900 rounded-sm overflow-hidden border-b-4 border-amber-300 shadow-md group/op cursor-pointer transition-transform hover:scale-105"
                  :title="op.name"
                  @click="openModal(event)"
                >
                  <img
                    :src="op.avatarUrl || getAvatarUrl(op.charId)"
                    :alt="op.name"
                    loading="lazy"
                    class="w-full h-full object-cover"
                    @error="handleAvatarError"
                  />
                  <!-- Name tooltip on hover -->
                  <div class="absolute inset-x-0 bottom-0 bg-slate-950/80 text-[9px] text-amber-200 text-center font-bold truncate opacity-0 group-hover/op:opacity-100 transition-opacity px-0.5">
                    {{ op.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal (Shop Supplies & Farm Stages) -->
    <EventDetailsModal
      :event="selectedEvent"
      :is-open="isModalOpen"
      :is-applied="selectedEvent ? appliedEvents.has(selectedEvent.id) : false"
      @close="isModalOpen = false"
      @toggle-apply="toggleEventInCalculator"
    />
  </div>
</template>
