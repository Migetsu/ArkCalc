<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import type { ArknightsEvent } from '@/data/eventsData';
import { useLocaleStore } from '@/stores/locale';
import ItemIcon from '@/components/common/ItemIcon.vue';
import { getAvatarUrl, PLACEHOLDER_AVATAR } from '@/utils/imageUrl';
import {
  X,
  ShoppingBag,
  Zap,
  Calendar,
  Sparkles,
  Radio,
  Clock,
} from 'lucide-vue-next';

const props = defineProps<{
  event: ArknightsEvent | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const locale = useLocaleStore();

const eventName = computed(() => {
  if (!props.event) return '';
  if (locale.currentLang === 'ru') return props.event.nameRu;
  return props.event.nameEn;
});

const eventSummary = computed(() => {
  if (!props.event) return '';
  if (locale.currentLang === 'ru') return props.event.summaryRu;
  return props.event.summaryEn;
});

const headerTag = computed(() => {
  if (!props.event) return '';
  if (locale.currentLang === 'ru') return props.event.headerTagRu;
  return props.event.headerTagEn;
});

function handleClose() {
  emit('close');
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
        v-if="isOpen && event"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        @click.self="handleClose"
      >
        <div
          class="bg-ark-card border border-ark-border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Modal Header -->
          <div class="px-5 py-4 border-b border-ark-border flex items-center justify-between bg-slate-900/90 gap-3 flex-shrink-0">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="inline-block bg-cyan-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full tracking-wider font-mono uppercase">
                  {{ headerTag }}
                </span>
                <span
                  v-if="event.status === 'upcoming_global'"
                  class="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] px-2 py-0.5 rounded-full font-mono uppercase"
                >
                  UPCOMING GLOBAL
                </span>
                <span
                  v-else-if="event.status === 'global_active'"
                  class="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] px-2 py-0.5 rounded-full font-mono uppercase"
                >
                  GLOBAL ACTIVE
                </span>
              </div>
              <h3 class="text-base sm:text-xl font-black text-slate-100 truncate">
                {{ eventName }}
              </h3>
            </div>

            <button
              type="button"
              class="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors flex-shrink-0"
              :title="locale.t('common.close')"
              @click="handleClose"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
            <!-- Banner & Schedule Box -->
            <div class="rounded-2xl border border-ark-border/80 bg-slate-950 p-4 flex flex-col md:flex-row gap-4 items-center">
              <div class="w-full md:w-1/2 aspect-[2.6/1] sm:aspect-[2.8/1] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0 relative shadow-md">
                <img
                  :src="event.bannerPosterUrl"
                  :alt="eventName"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div class="w-full md:w-1/2 space-y-2.5 text-xs">
                <!-- CN Dates -->
                <div class="flex items-center gap-2 text-cyan-400 font-mono">
                  <Calendar class="w-4 h-4 flex-shrink-0" />
                  <span>
                    {{ locale.t('events.cnDates') }}:
                    <strong class="text-slate-100">{{ event.cnStartDate }} – {{ event.cnEndDate }}</strong>
                  </span>
                </div>

                <!-- Global Estimated Arrival -->
                <div v-if="event.globalEstimatedArrival" class="flex items-center gap-2 text-amber-300 font-mono">
                  <Clock class="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>
                    {{ locale.t('events.globalEstimated') }}:
                    <strong class="text-white">{{ event.globalEstimatedArrival }}</strong>
                  </span>
                </div>

                <!-- Summary Description -->
                <p class="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800/80">
                  {{ eventSummary }}
                </p>
              </div>
            </div>

            <!-- Featured Operators Section -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Sparkles class="w-4 h-4 text-amber-400" />
                  <span>{{ locale.t('events.featuredOps') }}</span>
                </h4>
                <span class="text-[11px] font-mono text-slate-400">
                  {{ event.sixStarOps.length + event.fiveStarOps.length }} {{ locale.currentLang === 'ru' ? 'оперативников' : 'operators' }}
                </span>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- 6 Star Box -->
                <div class="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
                  <div class="text-xs font-bold text-amber-400 mb-2.5 flex items-center justify-between font-mono">
                    <span class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                      6★ OPERATORS
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                      {{ event.sixStarOps.length }} {{ locale.currentLang === 'ru' ? 'опер.' : 'ops' }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      v-for="op in event.sixStarOps"
                      :key="op.charId"
                      class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/40 transition-colors"
                    >
                      <div class="w-9 h-9 rounded-lg overflow-hidden border-2 border-amber-400 flex-shrink-0 bg-slate-900 relative shadow-sm">
                        <img
                          :src="op.avatarUrl || getAvatarUrl(op.charId)"
                          :alt="op.name"
                          class="w-full h-full object-cover"
                          @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
                        />
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs font-bold text-slate-100 truncate">
                          {{ op.name }}
                        </div>
                        <div class="text-[10px] font-mono text-amber-400/90 flex items-center gap-1 mt-0.5">
                          <span>★★★★★★</span>
                          <span v-if="op.role" class="uppercase text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                            {{ op.role }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 5 Star Box -->
                <div class="bg-slate-900/80 p-3.5 rounded-2xl border border-yellow-500/30 flex flex-col justify-between">
                  <div class="text-xs font-bold text-yellow-300 mb-2.5 flex items-center justify-between font-mono">
                    <span class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
                      5★ OPERATORS
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-yellow-950 border border-yellow-800 text-yellow-300">
                      {{ event.fiveStarOps.length }} {{ locale.currentLang === 'ru' ? 'опер.' : 'ops' }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      v-for="op in event.fiveStarOps"
                      :key="op.charId"
                      class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-yellow-500/40 transition-colors"
                    >
                      <div class="w-9 h-9 rounded-lg overflow-hidden border-2 border-yellow-400 flex-shrink-0 bg-slate-900 relative shadow-sm">
                        <img
                          :src="op.avatarUrl || getAvatarUrl(op.charId)"
                          :alt="op.name"
                          class="w-full h-full object-cover"
                          @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
                        />
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs font-bold text-slate-100 truncate">
                          {{ op.name }}
                        </div>
                        <div class="text-[10px] font-mono text-yellow-300/90 flex items-center gap-1 mt-0.5">
                          <span>★★★★★</span>
                          <span v-if="op.role" class="uppercase text-[9px] px-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                            {{ op.role }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Headhunting Banner Notice (When event has no shop/farming) -->
            <div
              v-if="event.shopItems.length === 0 && event.farmingStages.length === 0"
              class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
            >
              <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <Radio class="w-5 h-5" />
              </div>
              <div class="space-y-1">
                <h5 class="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  {{ locale.currentLang === 'ru' ? 'Баннер призыва (Хедхантинг)' : 'Headhunting Recruitment Banner' }}
                </h5>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                  {{ locale.currentLang === 'ru'
                    ? 'Этот баннер является ротацией призыва оперативников (гача) и не содержит отдельного ивентового магазина с ресурсами или стадий фарминга.'
                    : 'This banner is an operator recruitment rotation (gacha) and does not feature a dedicated event token shop or farmable stages.'
                  }}
                </p>
              </div>
            </div>

            <!-- Event Shop Section (Only if event has shop items) -->
            <div v-if="event.shopItems.length > 0" class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <ShoppingBag class="w-4 h-4 text-cyan-400" />
                  <span>{{ locale.t('events.eventShop') }} ({{ event.shopItems.length }})</span>
                </h4>
                <span class="text-[10px] font-mono text-slate-400">
                  {{ locale.currentLang === 'ru' ? 'Лимитированные припасы' : 'Event Limited Stock' }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                <div
                  v-for="item in event.shopItems"
                  :key="item.itemId"
                  class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <ItemIcon :item-id="item.itemId" size="sm" :count="item.count" class="flex-shrink-0" />
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold text-slate-100 truncate" :title="locale.currentLang === 'ru' ? item.nameRu : item.nameEn">
                      {{ locale.currentLang === 'ru' ? item.nameRu : item.nameEn }}
                    </div>
                    <div class="text-[11px] font-mono font-bold text-cyan-400 mt-0.5">
                      x{{ item.count.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optimal Farming Stages Section -->
            <div v-if="event.farmingStages.length > 0" class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Zap class="w-4 h-4 text-amber-400" />
                  <span>{{ locale.t('events.farmingStages') }}</span>
                </h4>
                <span class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Penguin Statistics
                </span>
              </div>

              <!-- Robust 2-column or 3-column layout where text & badges NEVER collide -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="stg in event.farmingStages"
                  :key="stg.stageCode"
                  class="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                >
                  <!-- Left: Stage Code + Item Icon + Name -->
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <span class="font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-800/80 px-2 py-1 rounded-lg text-xs flex-shrink-0 shadow-inner">
                      {{ stg.stageCode }}
                    </span>
                    <ItemIcon :item-id="stg.itemId" size="sm" class="flex-shrink-0" />
                    <span
                      class="text-slate-100 text-xs font-semibold truncate"
                      :title="locale.currentLang === 'ru' ? stg.itemNameRu : stg.itemNameEn"
                    >
                      {{ locale.currentLang === 'ru' ? stg.itemNameRu : stg.itemNameEn }}
                    </span>
                  </div>

                  <!-- Right: Clean Non-Overlapping Drop Badges -->
                  <div class="flex items-center gap-1.5 font-mono flex-shrink-0">
                    <span
                      class="px-2 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-700 text-emerald-300 font-bold text-xs shadow-sm"
                      title="Drop Rate"
                    >
                      {{ stg.dropRatePercent }}%
                    </span>
                    <span
                      class="px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-700 text-amber-300 font-medium text-xs shadow-sm"
                      title="Sanity per Item"
                    >
                      ~{{ stg.sanityPerItem }}⚡
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 border-t border-ark-border flex items-center justify-between bg-slate-900/90 text-xs font-mono text-slate-400 flex-shrink-0">
            <span>Arknights CN / Global Event Database</span>
            <button
              type="button"
              class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold transition-colors shadow-sm"
              @click="handleClose"
            >
              {{ locale.t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
