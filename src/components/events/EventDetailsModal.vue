<script setup lang="ts">
import { computed } from 'vue';
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
  CheckCircle2,
} from 'lucide-vue-next';

const props = defineProps<{
  event: ArknightsEvent | null;
  isOpen: boolean;
  isApplied: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggleApply', eventId: string): void;
}>();

const locale = useLocaleStore();

const eventName = computed(() => {
  if (!props.event) return '';
  if (locale.currentLang === 'ru') return props.event.nameRu;
  if (locale.currentLang === 'cn') return props.event.nameCn;
  return props.event.nameEn;
});

const eventSummary = computed(() => {
  if (!props.event) return '';
  if (locale.currentLang === 'ru') return props.event.summaryRu;
  if (locale.currentLang === 'cn') return props.event.summaryCn;
  return props.event.summaryEn;
});

const headerTag = computed(() => {
  if (!props.event) return '';
  if (locale.currentLang === 'ru') return props.event.headerTagRu;
  if (locale.currentLang === 'cn') return props.event.headerTagCn;
  return props.event.headerTagEn;
});

function handleClose() {
  emit('close');
}

function handleToggleApply() {
  if (props.event) {
    emit('toggleApply', props.event.id);
  }
}
</script>

<template>
  <div
    v-if="isOpen && event"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    @click.self="handleClose"
  >
    <div
      class="bg-ark-card border border-ark-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-ark-border flex items-center justify-between bg-slate-900/90 gap-3">
        <div class="min-w-0">
          <div class="inline-block bg-cyan-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded tracking-wide font-mono uppercase mb-1">
            {{ headerTag }}
          </div>
          <h3 class="text-lg sm:text-xl font-black text-slate-100 truncate">
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
      <div class="p-5 overflow-y-auto space-y-6">
        <!-- Banner & Schedule Box -->
        <div class="rounded-xl overflow-hidden border border-ark-border/80 bg-slate-950 flex flex-col md:flex-row gap-4 p-3.5 items-center">
          <div class="w-full md:w-1/2 aspect-[3.2/1] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0 relative">
            <img
              :src="event.bannerPosterUrl"
              :alt="eventName"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div class="w-full md:w-1/2 space-y-2 text-xs font-mono">
            <div class="flex items-center gap-2 text-cyan-400 font-bold">
              <Calendar class="w-4 h-4" />
              <span>{{ locale.t('events.cnDates') }}: <strong class="text-slate-100">{{ event.cnStartDate }} – {{ event.cnEndDate }}</strong></span>
            </div>

            <div v-if="event.globalEstimatedArrival" class="flex items-center gap-2 text-amber-300">
              <Sparkles class="w-4 h-4" />
              <span>{{ locale.t('events.globalEstimated') }}: <strong class="text-white">{{ event.globalEstimatedArrival }}</strong></span>
            </div>

            <p class="text-xs text-slate-400 font-sans leading-relaxed pt-1">
              {{ eventSummary }}
            </p>
          </div>
        </div>

        <!-- Featured Operators Section -->
        <div>
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <Sparkles class="w-4 h-4 text-amber-400" />
            <span>{{ locale.t('events.featuredOps') }}</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- 6 Star -->
            <div class="bg-slate-900/70 p-3 rounded-xl border border-amber-500/20">
              <div class="text-[11px] font-bold text-amber-400 mb-2 flex items-center justify-between">
                <span>6★ OPERATORS</span>
                <span class="text-[10px] text-amber-300/70 font-mono">{{ event.sixStarOps.length }}干员</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="op in event.sixStarOps"
                  :key="op.charId"
                  class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800"
                >
                  <div class="w-8 h-8 rounded overflow-hidden border-b-2 border-amber-400 flex-shrink-0 bg-slate-900">
                    <img
                      :src="op.avatarUrl || getAvatarUrl(op.charId)"
                      :alt="op.name"
                      class="w-full h-full object-cover"
                      @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
                    />
                  </div>
                  <div class="text-xs font-medium text-slate-200 pr-1">
                    {{ op.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 5 Star -->
            <div class="bg-slate-900/70 p-3 rounded-xl border border-yellow-500/20">
              <div class="text-[11px] font-bold text-yellow-300 mb-2 flex items-center justify-between">
                <span>5★ OPERATORS</span>
                <span class="text-[10px] text-yellow-300/70 font-mono">{{ event.fiveStarOps.length }}干员</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="op in event.fiveStarOps"
                  :key="op.charId"
                  class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800"
                >
                  <div class="w-8 h-8 rounded overflow-hidden border-b-2 border-yellow-300 flex-shrink-0 bg-slate-900">
                    <img
                      :src="op.avatarUrl || getAvatarUrl(op.charId)"
                      :alt="op.name"
                      class="w-full h-full object-cover"
                      @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
                    />
                  </div>
                  <div class="text-xs font-medium text-slate-200 pr-1">
                    {{ op.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Shop Section -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShoppingBag class="w-4 h-4 text-cyan-400" />
              <span>{{ locale.t('events.eventShop') }} ({{ event.shopItems.length }})</span>
            </h4>

            <!-- Apply to calculator toggle -->
            <button
              type="button"
              class="py-1.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
              :class="[
                isApplied
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              ]"
              @click="handleToggleApply"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>
                {{ isApplied ? locale.t('events.appliedToCalc') : locale.t('events.applyToCalc') }}
              </span>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <div
              v-for="item in event.shopItems"
              :key="item.itemId"
              class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono"
            >
              <ItemIcon :item-id="item.itemId" size="sm" :count="item.count" />
              <div class="min-w-0 flex-1">
                <div class="text-[11px] font-bold text-slate-200 truncate">
                  {{ locale.currentLang === 'ru' ? item.nameRu : locale.currentLang === 'cn' ? item.nameCn : item.nameEn }}
                </div>
                <div class="text-[10px] text-cyan-400 font-bold">
                  x{{ item.count.toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Farming Stages Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Zap class="w-4 h-4 text-amber-400" />
              <span>{{ locale.t('events.farmingStages') }}</span>
            </h4>
            <span class="text-[10px] font-mono text-emerald-400">
              Penguin Statistics Data
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            <div
              v-for="stg in event.farmingStages"
              :key="stg.stageCode"
              class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono"
            >
              <div class="flex items-center gap-2">
                <span class="font-bold text-cyan-300 bg-cyan-950 border border-cyan-800/80 px-2 py-0.5 rounded text-xs">
                  {{ stg.stageCode }}
                </span>
                <ItemIcon :item-id="stg.itemId" size="sm" />
                <span class="text-slate-200 text-xs font-medium truncate max-w-[100px]">
                  {{ locale.currentLang === 'ru' ? stg.itemNameRu : stg.itemNameEn }}
                </span>
              </div>

              <div class="text-right">
                <div class="text-[11px] text-emerald-400 font-bold">
                  {{ stg.dropRatePercent }}%
                </div>
                <div class="text-[10px] text-amber-400">
                  ~{{ stg.sanityPerItem }}⚡
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3 border-t border-ark-border flex items-center justify-between bg-slate-900/80 text-xs font-mono text-slate-400">
        <span>Arknights CN / Global Event Database</span>
        <button
          type="button"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors"
          @click="handleClose"
        >
          {{ locale.t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>
