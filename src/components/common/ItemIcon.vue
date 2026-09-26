<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { getItemIconUrl, PLACEHOLDER_ITEM_ICON } from '@/utils/imageUrl';

const props = withDefaults(
  defineProps<{
    itemId: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    count?: number;
    deficit?: number;
    showTooltip?: boolean;
    interactive?: boolean;
  }>(),
  {
    size: 'md',
    showTooltip: true,
    interactive: false,
  }
);

const gameData = useGameDataStore();
const imgError = ref(false);

const item = computed(() => gameData.getItem(props.itemId));
const rarity = computed(() => item.value?.rarity || 1);
const itemName = computed(() => item.value?.name || props.itemId);

const iconUrl = computed(() => {
  if (imgError.value) return PLACEHOLDER_ITEM_ICON;
  const iconId = item.value?.iconId || props.itemId;
  return getItemIconUrl(iconId);
});

function handleImageError() {
  imgError.value = true;
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-9 h-9 text-[10px]';
    case 'lg':
      return 'w-16 h-16 text-sm';
    case 'xl':
      return 'w-20 h-20 text-base';
    case 'md':
    default:
      return 'w-12 h-12 text-xs';
  }
});

const tierBorderClasses = computed(() => {
  switch (rarity.value) {
    case 5:
      return 'border-amber-400 bg-amber-950/20 shadow-amber-500/10 shadow-sm';
    case 4:
      return 'border-purple-400 bg-purple-950/20 shadow-purple-500/10 shadow-sm';
    case 3:
      return 'border-sky-400 bg-sky-950/20 shadow-sky-500/10 shadow-sm';
    case 2:
      return 'border-emerald-400 bg-emerald-950/20 shadow-emerald-500/10 shadow-sm';
    case 1:
    default:
      return 'border-slate-500 bg-slate-900/40';
  }
});
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center rounded-lg border-2 select-none transition-all group"
    :class="[sizeClasses, tierBorderClasses, interactive ? 'hover:scale-105 cursor-pointer' : '']"
    :title="showTooltip ? itemName : undefined"
  >
    <img
      :src="iconUrl"
      :alt="itemName"
      loading="lazy"
      class="w-full h-full object-contain p-1"
      @error="handleImageError"
    />

    <!-- Count Badge -->
    <span
      v-if="count !== undefined && count > 0"
      class="absolute -bottom-1.5 -right-1.5 bg-slate-900/90 text-slate-200 border border-slate-700 px-1 py-0.5 rounded font-mono font-bold leading-none pointer-events-none z-10"
      :class="props.size === 'sm' ? 'text-[9px]' : 'text-xs'"
    >
      {{ count > 9999 ? Math.floor(count / 1000) + 'k' : count }}
    </span>

    <!-- Deficit Badge (Red) -->
    <span
      v-if="deficit !== undefined && deficit > 0"
      class="absolute -top-1.5 -right-1.5 bg-red-600/95 text-white font-mono font-bold px-1.5 py-0.5 rounded shadow-md leading-none pointer-events-none z-10"
      :class="props.size === 'sm' ? 'text-[9px]' : 'text-xs'"
    >
      -{{ deficit > 9999 ? Math.floor(deficit / 1000) + 'k' : deficit }}
    </span>
  </div>
</template>
