<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type {
  OperatorSummary,
  OperatorSkin,
  OperatorSkill,
  SkillLevelDetail,
  OperatorModule,
  ModuleStageDetail,
} from '@/types/game';
import { useGameDataStore } from '@/stores/gamedata';
import AttackRangeGrid from '@/components/operator/AttackRangeGrid.vue';
import {
  getTranslatedTalents,
  getTranslatedQuote,
  getTranslatedModules,
  getTranslatedSkillInfo,
  getTranslatedSkinInfo,
  needsTranslation,
  translateText,
  hasChinese,
  getQuickSkillName,
} from '@/services/translationService';
import {
  cleanArknightsTalentNameRu,
  cleanArknightsTalentTextRu,
} from '@/data/arknightsGlossary';
import {
  getAvatarUrl,
  getCharacterPortraitUrl,
  getCharacterPortraitFallbackUrl,
  getCharacterPortraitSecondaryFallbackUrl,
  getSkinIllustrationUrl,
  getSkinIllustrationFallbackUrl,
  getSkinAvatarUrl,
  getEquipIconUrl,
  getEquipIconFallbackUrl,
  getSkillIconUrl,
  getSkillIconFallbackUrl,
  PLACEHOLDER_AVATAR,
  PLACEHOLDER_EQUIP_ICON,
} from '@/utils/imageUrl';
import {
  getArchetypeName,
  getArchetypeTraitRu,
  getProfessionName,
  getOperatorTag,
} from '@/data/materialTranslations';
import {
  getSpTypeName,
  getSkillTypeName,
  getSkillRankLabel,
  formatSkillDuration,
} from '@/utils/skillUtils';
import {
  formatModuleAttributeName,
  formatModuleAttributeValue,
  getModuleStageLabel,
} from '@/utils/moduleUtils';
import {
  X,
  Shield,
  Swords,
  Zap,
  UserCheck,
  Layers,
  Palette,
  Maximize2,
  Flame,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from 'lucide-vue-next';

const gameData = useGameDataStore();

const props = defineProps<{
  operator: OperatorSummary | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-plan', operator: OperatorSummary): void;
}>();

// ==================== STATE DECLARATIONS ====================
// Selected outfit identifier: 'default_1', 'default_2', or skin.skinId
const selectedSkinId = ref<string>('default_2');

// Fullscreen high-resolution art modal state
const isArtFullscreen = ref<boolean>(false);

// Selected skill index (0 = S1, 1 = S2, 2 = S3)
const selectedSkillIndex = ref<number>(0);

// Selected skill rank/mastery level (1 to 10)
const selectedSkillLevel = ref<number>(10);

// Selected module index (0, 1, 2)
const selectedModuleIndex = ref<number>(0);

// Selected module stage (1, 2, 3)
const selectedModuleStage = ref<number>(3);

// Collapsible module story
const showModuleStory = ref<boolean>(false);

// Dynamic translations for skill name & description
const dynamicSkillName = ref<string>('');
const dynamicSkillDesc = ref<string>('');

// Dynamic translation for the current skin's name, brand, content, dialog
const dynamicSkinName = ref<string>('');
const dynamicSkinBrand = ref<string>('');
const dynamicSkinContent = ref<string>('');
const dynamicSkinDialog = ref<string>('');

// Dynamic operator wiki translations
const dynamicTalents = ref<any[]>([]);
const dynamicQuote = ref<string>('');
const dynamicTrait = ref<string>('');
const dynamicModules = ref<OperatorModule[]>([]);
const isTranslating = ref<boolean>(false);

// ==================== COMPUTED PROPERTIES ====================
const maxElite = computed(() => {
  return props.operator ? Math.max(0, props.operator.phases.length - 1) : 0;
});

// All buy/special skins for this operator
const specialSkins = computed<OperatorSkin[]>(() => {
  if (!props.operator?.skins) return [];
  return props.operator.skins.filter((s) => s.isBuySkin || s.skinId.includes('@'));
});

// Currently selected skin object (or null if default E0/E2)
const currentSelectedSkin = computed<OperatorSkin | null>(() => {
  if (selectedSkinId.value === 'default_1' || selectedSkinId.value === 'default_2') {
    return null;
  }
  return specialSkins.value.find((s) => s.skinId === selectedSkinId.value) || null;
});

// Art URL
const currentArtUrl = computed(() => {
  if (!props.operator) return '';
  if (currentSelectedSkin.value) {
    return getSkinIllustrationUrl(currentSelectedSkin.value.portraitId);
  }
  const elite = selectedSkinId.value === 'default_2' ? 2 : 1;
  return getCharacterPortraitUrl(props.operator.id, elite);
});

// Currently selected skill object
const currentSkill = computed<OperatorSkill | null>(() => {
  if (!props.operator?.skills || props.operator.skills.length === 0) return null;
  return props.operator.skills[selectedSkillIndex.value] || props.operator.skills[0] || null;
});

// Currently selected skill level detail (1 to 10)
const currentSkillLevelDetail = computed<SkillLevelDetail | null>(() => {
  const s = currentSkill.value;
  if (!s || !s.levels || s.levels.length === 0) return null;
  const lvl = Math.min(selectedSkillLevel.value, s.levels.length);
  return s.levels[lvl - 1] || s.levels[s.levels.length - 1] || null;
});

// Currently selected module object (from dynamicModules)
const currentModule = computed<OperatorModule | null>(() => {
  if (!dynamicModules.value || dynamicModules.value.length === 0) return null;
  const idx = Math.min(selectedModuleIndex.value, dynamicModules.value.length - 1);
  return dynamicModules.value[idx] || dynamicModules.value[0] || null;
});

// Currently selected module stage detail (Stage 1, 2, 3)
const currentModuleStageDetail = computed<ModuleStageDetail | null>(() => {
  const m = currentModule.value;
  if (!m || !m.stages || m.stages.length === 0) return null;
  return m.stages.find((s) => s.stage === selectedModuleStage.value) || m.stages[0] || null;
});

// ==================== METHODS ====================
function openFullscreenArt() {
  isArtFullscreen.value = true;
}

function closeFullscreenArt() {
  isArtFullscreen.value = false;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isArtFullscreen.value) {
    isArtFullscreen.value = false;
    e.stopPropagation();
  }
}

function handleSkillIconError(event: Event, iconId: string) {
  const img = event.target as HTMLImageElement;
  const fallback = getSkillIconFallbackUrl(iconId);
  if (img.src !== fallback) {
    img.src = fallback;
  }
}

function handleEquipIconError(event: Event, iconId: string) {
  const img = event.target as HTMLImageElement;
  if (!img.dataset.fallbackTried) {
    img.dataset.fallbackTried = 'true';
    img.src = getEquipIconFallbackUrl(iconId);
  } else {
    img.src = PLACEHOLDER_EQUIP_ICON;
  }
}

function handleArtError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (!props.operator) return;
  const step = parseInt(img.dataset.fallbackStep || '0', 10);

  if (currentSelectedSkin.value) {
    const pId = currentSelectedSkin.value.portraitId;
    if (step === 0) {
      img.dataset.fallbackStep = '1';
      img.src = getSkinIllustrationFallbackUrl(pId);
    } else if (step === 1) {
      img.dataset.fallbackStep = '2';
      img.src = `https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/skin/${encodeURIComponent(pId)}b.png`;
    } else if (step === 2) {
      img.dataset.fallbackStep = '3';
      img.src = getCharacterPortraitUrl(props.operator.id, 1);
    }
  } else {
    const elite = selectedSkinId.value === 'default_2' ? 2 : 1;
    if (step === 0) {
      img.dataset.fallbackStep = '1';
      img.src = getCharacterPortraitFallbackUrl(props.operator.id, elite);
    } else if (step === 1) {
      img.dataset.fallbackStep = '2';
      img.src = getCharacterPortraitSecondaryFallbackUrl(props.operator.id, elite);
    } else if (step === 2) {
      img.dataset.fallbackStep = '3';
      img.src = `https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/skin/${props.operator.id}_${elite}b.png`;
    }
  }
}

function handleOpenPlan() {
  if (props.operator) {
    emit('open-plan', props.operator);
    emit('close');
  }
}

function getDisplaySkillName(skill: OperatorSkill, sIdx: number): string {
  if (selectedSkillIndex.value === sIdx && dynamicSkillName.value && !hasChinese(dynamicSkillName.value)) {
    return dynamicSkillName.value;
  }
  const quick = getQuickSkillName(
    props.operator?.id || '',
    skill.skillId,
    skill.name,
    gameData.itemLanguage
  );
  if (quick && !hasChinese(quick)) {
    return quick;
  }
  if (skill.name && !hasChinese(skill.name)) {
    return skill.name;
  }
  return gameData.itemLanguage === 'ru' ? `Навык ${sIdx + 1}` : `Skill ${sIdx + 1}`;
}

async function resolveSkillTranslations() {
  const detail = currentSkillLevelDetail.value;
  if (!detail || !currentSkill.value) {
    dynamicSkillName.value = '';
    dynamicSkillDesc.value = '';
    return;
  }

  const lang = gameData.itemLanguage;

  try {
    const res = await getTranslatedSkillInfo(
      props.operator?.id || '',
      currentSkill.value.skillId,
      detail.name,
      detail.description,
      detail.nameCn,
      detail.descriptionCn,
      lang
    );
    dynamicSkillName.value = res.name;
    dynamicSkillDesc.value = res.description;
  } catch {
    dynamicSkillName.value = detail.name || '';
    dynamicSkillDesc.value = detail.description || '';
  }
}

async function resolveSkinTranslations() {
  const skin = currentSelectedSkin.value;
  if (!skin) {
    dynamicSkinName.value = '';
    dynamicSkinBrand.value = '';
    dynamicSkinContent.value = '';
    dynamicSkinDialog.value = '';
    return;
  }

  const lang = gameData.itemLanguage;

  try {
    const res = await getTranslatedSkinInfo(
      props.operator?.id || '',
      skin.skinId,
      skin.skinName,
      skin.skinGroupName,
      skin.content || '',
      skin.dialog || '',
      lang
    );
    dynamicSkinName.value = res.skinName;
    dynamicSkinBrand.value = res.skinGroupName;
    dynamicSkinContent.value = res.content;
    dynamicSkinDialog.value = res.dialog;
  } catch {
    dynamicSkinName.value = skin.skinName;
    dynamicSkinBrand.value = skin.skinGroupName;
    dynamicSkinContent.value = skin.content || '';
    dynamicSkinDialog.value = skin.dialog || '';
  }
}

async function resolveDynamicTranslations() {
  if (!props.operator) return;
  const op = props.operator;
  const lang = gameData.itemLanguage;

  dynamicTalents.value = op.talents || [];
  dynamicQuote.value = op.itemDesc || '';
  dynamicTrait.value = op.description || '';
  dynamicModules.value = op.modules || [];

  const hasLocalRuTalents = lang === 'ru';
  const needsTalents = hasLocalRuTalents || (op.talents || []).some((t) =>
    (t.candidates || []).some(
      (c: any) => needsTranslation(c.name, lang) || needsTranslation(c.description, lang)
    )
  );
  const needsQuote = needsTranslation(op.itemDesc, lang);
  const needsTrait = needsTranslation(op.description, lang);
  const needsModules = (op.modules || []).some(
    (m) =>
      needsTranslation(m.name, lang) ||
      (m.stages || []).some(
        (s: any) =>
          needsTranslation(s.traitChange, lang) ||
          needsTranslation(s.talentChange?.name, lang) ||
          needsTranslation(s.talentChange?.description, lang)
      )
  );

  if (needsTalents || needsQuote || needsTrait || needsModules) {
    isTranslating.value = true;
    try {
      const [tlTalents, tlQuote, tlTrait, tlModules] = await Promise.all([
        needsTalents ? getTranslatedTalents(op.id, op.talents || [], lang) : Promise.resolve(op.talents || []),
        needsQuote ? getTranslatedQuote(op.id, op.itemDesc || '', op.itemDescCn, lang) : Promise.resolve(op.itemDesc || ''),
        needsTrait ? translateText(op.description || '', lang) : Promise.resolve(op.description || ''),
        needsModules ? getTranslatedModules(op.id, op.modules || [], lang) : Promise.resolve(op.modules || []),
      ]);
      dynamicTalents.value = tlTalents || [];
      dynamicQuote.value = tlQuote || '';
      dynamicTrait.value = tlTrait || '';
      dynamicModules.value = tlModules || [];
    } catch (err) {
      console.warn('Failed to resolve dynamic translations:', err);
    } finally {
      isTranslating.value = false;
    }
  }
}

// ==================== LIFECYCLE & WATCHERS ====================
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Reset to E2 or E0 on operator change
watch(
  () => props.operator?.id,
  () => {
    isArtFullscreen.value = false;
    selectedSkillIndex.value = 0;
    selectedModuleIndex.value = 0;
    selectedModuleStage.value = 3;
    showModuleStory.value = false;
    if (props.operator) {
      const maxEl = Math.max(0, props.operator.phases.length - 1);
      selectedSkinId.value = maxEl >= 2 ? 'default_2' : 'default_1';
      const firstSkill = props.operator.skills?.[0];
      selectedSkillLevel.value = firstSkill?.levels?.length || 7;
    }
  },
  { immediate: true }
);

watch(
  () => [
    currentSkill.value?.skillId,
    selectedSkillLevel.value,
    gameData.itemLanguage,
  ],
  () => {
    resolveSkillTranslations();
  },
  { immediate: true }
);

watch(
  () => [currentSelectedSkin.value?.skinId, gameData.itemLanguage],
  () => {
    resolveSkinTranslations();
  },
  { immediate: true }
);

watch(
  () => [props.operator?.id, props.isOpen, gameData.itemLanguage],
  () => {
    if (props.isOpen && props.operator) {
      resolveDynamicTranslations();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-if="isOpen && operator"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    @click.self="emit('close')"
  >
    <div
      class="bg-ark-darker border border-ark-border rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
    >
      <!-- Header -->
      <div class="px-6 py-4 bg-ark-card border-b border-ark-border flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-12 h-12 rounded-xl overflow-hidden border border-ark-border bg-slate-900 flex-shrink-0 shadow">
            <img
              :src="getAvatarUrl(operator.id)"
              :alt="operator.name"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).src = PLACEHOLDER_AVATAR"
            />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-lg text-slate-100 truncate">{{ operator.name }}</h3>
              <span class="text-amber-400 font-mono text-sm tracking-widest font-bold flex-shrink-0">
                {{ '★'.repeat(operator.rarity) }}
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span class="text-cyan-400 font-bold">{{ getProfessionName(operator.profession, gameData.itemLanguage) }}</span>
              &bull;
              <span>{{ getArchetypeName(operator.subProfessionId, gameData.itemLanguage) }}</span>
              <span v-if="operator.appellation && operator.appellation !== operator.name" class="text-slate-500">
                ({{ operator.appellation }})
              </span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-200">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Full Art & Visuals (5 cols) -->
          <div class="lg:col-span-5 flex flex-col items-center space-y-4">
            <!-- Art Card -->
            <div
              class="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-ark-border overflow-hidden flex items-center justify-center shadow-inner group cursor-zoom-in transition-all hover:border-cyan-500/50"
              :title="gameData.itemLanguage === 'ru' ? 'Нажмите, чтобы открыть арт во весь экран' : 'Click to view full-resolution art'"
              @click="openFullscreenArt"
            >
              <!-- Background tactical grid lines -->
              <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <!-- Full Character / Skin Illustration -->
              <img
                :key="`${operator.id}_${selectedSkinId}`"
                :src="currentArtUrl"
                :alt="operator.name"
                class="w-full h-full object-contain p-2 select-none pointer-events-none drop-shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                @error="handleArtError"
              />

              <!-- Fullscreen Expand Trigger (Bottom-Right) -->
              <div class="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 group-hover:bg-cyan-950/90 border border-slate-700/80 group-hover:border-cyan-500/60 text-xs font-mono font-bold text-slate-300 group-hover:text-cyan-200 shadow-lg backdrop-blur-md transition-all">
                <Maximize2 class="w-3.5 h-3.5" />
                <span>{{ gameData.itemLanguage === 'ru' ? 'Во весь экран' : 'Fullscreen' }}</span>
              </div>

              <!-- Position Badge (Top-Left) -->
              <div class="absolute top-3 left-3 pointer-events-none">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider bg-slate-900/85 border border-ark-border text-cyan-300 shadow">
                  {{ operator.position === 'MELEE' ? (gameData.itemLanguage === 'ru' ? 'Ближний бой (Melee)' : 'Melee') : (gameData.itemLanguage === 'ru' ? 'Дальний бой (Ranged)' : 'Ranged') }}
                </span>
              </div>
            </div>

            <!-- Skin & Outfit Switcher Bar -->
            <div class="w-full space-y-2">
              <div class="flex items-center justify-between px-1">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette class="w-3.5 h-3.5 text-cyan-400" />
                  {{ gameData.itemLanguage === 'ru' ? 'Облики и скины' : 'Outfits & Skins' }}
                </span>
                <span v-if="specialSkins.length > 0" class="text-[11px] font-mono text-slate-500">
                  {{ specialSkins.length + (maxElite >= 2 ? 2 : 1) }} {{ gameData.itemLanguage === 'ru' ? 'доступно' : 'total' }}
                </span>
              </div>

              <div class="w-full flex items-center gap-2.5 overflow-x-auto pt-1 pb-3 px-1 custom-scrollbar">
                <!-- Default E0 -->
                <button
                  type="button"
                  class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5"
                  :class="[
                    selectedSkinId === 'default_1'
                      ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-900/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  ]"
                  @click="selectedSkinId = 'default_1'"
                >
                  <span>{{ gameData.itemLanguage === 'ru' ? 'Базовый (E0)' : 'Default (E0)' }}</span>
                </button>

                <!-- Elite 2 (if available) -->
                <button
                  v-if="maxElite >= 2"
                  type="button"
                  class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5"
                  :class="[
                    selectedSkinId === 'default_2'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-900/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  ]"
                  @click="selectedSkinId = 'default_2'"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  <span>{{ gameData.itemLanguage === 'ru' ? 'Элита 2 (E2)' : 'Elite 2 (E2)' }}</span>
                </button>

                <!-- Special & Store Skins -->
                <button
                  v-for="(skin, idx) in specialSkins"
                  :key="skin.skinId"
                  type="button"
                  class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 max-w-[200px]"
                  :class="[
                    selectedSkinId === skin.skinId
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  ]"
                  @click="selectedSkinId = skin.skinId"
                  :title="skin.skinName || `Skin #${idx + 1}`"
                >
                  <img
                    :src="getSkinAvatarUrl(skin.avatarId)"
                    class="w-4 h-4 rounded-full object-cover flex-shrink-0"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <span class="truncate">
                    {{ selectedSkinId === skin.skinId && dynamicSkinName ? dynamicSkinName : (skin.skinName || `Skin #${idx + 1}`) }}
                  </span>
                </button>
              </div>

              <!-- Selected Special Skin Lore Card -->
              <div
                v-if="currentSelectedSkin"
                class="w-full p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 text-xs space-y-1.5 shadow-sm animate-fade-in"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="font-bold text-purple-300 truncate">
                    {{ dynamicSkinName || currentSelectedSkin.skinName || 'Special Outfit' }}
                  </div>
                  <div v-if="dynamicSkinBrand || currentSelectedSkin.skinGroupName" class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 border border-purple-800/60 text-purple-300 flex-shrink-0">
                    {{ dynamicSkinBrand || currentSelectedSkin.skinGroupName }}
                  </div>
                </div>

                <!-- Illustrator -->
                <div v-if="currentSelectedSkin.drawerList && currentSelectedSkin.drawerList.length > 0" class="text-[11px] text-slate-400">
                  <span class="text-slate-500">{{ gameData.itemLanguage === 'ru' ? 'Художник: ' : 'Illustrator: ' }}</span>
                  <span class="text-slate-300 font-medium">{{ currentSelectedSkin.drawerList.join(', ') }}</span>
                </div>

                <!-- Voice line / Dialog -->
                <div v-if="dynamicSkinDialog || currentSelectedSkin.dialog" class="text-[11px] italic text-purple-200/90 border-l-2 border-purple-500/50 pl-2 py-0.5">
                  &ldquo;{{ dynamicSkinDialog || currentSelectedSkin.dialog }}&rdquo;
                </div>

                <!-- Lore description -->
                <div v-if="dynamicSkinContent || currentSelectedSkin.content" class="text-[11px] text-slate-400 leading-relaxed">
                  {{ dynamicSkinContent || currentSelectedSkin.content }}
                </div>
              </div>
            </div>

            <!-- Recruitment Tags -->
            <div v-if="operator.tagList && operator.tagList.length > 0" class="w-full p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>{{ gameData.itemLanguage === 'ru' ? 'Теги оперативника' : 'Operator Tags' }}</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in operator.tagList"
                  :key="tag"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 shadow-sm"
                >
                  {{ getOperatorTag(tag, gameData.itemLanguage) }}
                </span>
              </div>
            </div>

            <!-- Attack Range Grid Component -->
            <div class="w-full">
              <AttackRangeGrid :operator="operator" :initial-elite="maxElite >= 2 ? 2 : 0" />
            </div>
          </div>

          <!-- Right: Combat Attributes & Mechanics (7 cols) -->
          <div class="lg:col-span-7 space-y-5">
            <!-- Combat Stats Grid -->
            <div class="p-4 bg-ark-card rounded-2xl border border-ark-border space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap class="w-4 h-4 text-amber-400" />
                {{ gameData.itemLanguage === 'ru' ? 'Боевые характеристики (Макс. уровень)' : 'Combat Stats (Max Level)' }}
              </h4>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Здоровье (HP)' : 'Max HP' }}</span>
                  <span class="text-base font-mono font-bold text-emerald-400">{{ operator.attributes?.hp || '&mdash;' }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Атака (ATK)' : 'Attack (ATK)' }}</span>
                  <span class="text-base font-mono font-bold text-red-400">{{ operator.attributes?.atk || '&mdash;' }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Защита (DEF)' : 'Defense (DEF)' }}</span>
                  <span class="text-base font-mono font-bold text-sky-400">{{ operator.attributes?.def || '&mdash;' }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Сопр. магии (RES)' : 'Resist (RES)' }}</span>
                  <span class="text-base font-mono font-bold text-purple-400">{{ operator.attributes?.res ?? 0 }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Блок (Block)' : 'Block Count' }}</span>
                  <span class="text-base font-mono font-bold text-amber-300">{{ operator.attributes?.blockCnt || 1 }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Стоимость (DP)' : 'Deploy Cost' }}</span>
                  <span class="text-base font-mono font-bold text-cyan-300">{{ operator.attributes?.cost || '&mdash;' }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Интервал атаки' : 'Attack Interval' }}</span>
                  <span class="text-base font-mono font-bold text-slate-300">{{ operator.attributes?.attackTime }}{{ gameData.itemLanguage === 'ru' ? 'с' : 's' }}</span>
                </div>
                <div class="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span class="text-[10px] text-slate-500 font-mono block">{{ gameData.itemLanguage === 'ru' ? 'Перезарядка' : 'Redeploy Time' }}</span>
                  <span class="text-base font-mono font-bold text-slate-300">{{ operator.attributes?.respawnTime }}{{ gameData.itemLanguage === 'ru' ? 'с' : 's' }}</span>
                </div>
              </div>
            </div>

            <!-- Class Trait -->
            <div v-if="(dynamicTrait || operator.description) || getArchetypeTraitRu(operator.subProfessionId)" class="p-4 bg-ark-card rounded-2xl border border-ark-border space-y-1.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Swords class="w-4 h-4" />
                  {{ gameData.itemLanguage === 'ru' ? 'Особенность класса (Trait)' : 'Class Trait' }}
                </h4>
                <span class="text-[10px] font-mono text-slate-500">
                  {{ getArchetypeName(operator.subProfessionId, 'en') }}
                </span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                {{ gameData.itemLanguage === 'ru' ? (getArchetypeTraitRu(operator.subProfessionId) || dynamicTrait || operator.description) : (dynamicTrait || operator.description || getArchetypeTraitRu(operator.subProfessionId)) }}
              </p>
              <p v-if="gameData.itemLanguage === 'ru' && (dynamicTrait || operator.description) && getArchetypeTraitRu(operator.subProfessionId)" class="text-[11px] text-slate-500 italic mt-1 pt-1 border-t border-slate-800/80">
                EN: {{ dynamicTrait || operator.description }}
              </p>
            </div>

            <!-- Skills & Masteries Section -->
            <div
              v-if="operator.skills && operator.skills.length > 0 && currentSkill"
              class="p-4 bg-ark-card rounded-2xl border border-ark-border space-y-4"
            >
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame class="w-4 h-4 text-amber-400" />
                  {{ gameData.itemLanguage === 'ru' ? 'Навыки и мастерства (Skills)' : 'Skills & Masteries' }}
                </h4>
                <span class="text-[10px] font-mono text-slate-500">
                  {{ operator.skills.length }} {{ gameData.itemLanguage === 'ru' ? 'навыка' : 'skills' }}
                </span>
              </div>

              <!-- Skill Selector Tabs (S1, S2, S3) -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  v-for="(skill, sIdx) in operator.skills"
                  :key="skill.skillId"
                  type="button"
                  class="p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 relative overflow-hidden"
                  :class="[
                    selectedSkillIndex === sIdx
                      ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500 text-slate-100 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  ]"
                  @click="selectedSkillIndex = sIdx"
                >
                  <div class="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      :src="getSkillIconUrl(skill.iconId)"
                      :alt="skill.name"
                      class="w-full h-full object-contain"
                      @error="handleSkillIconError($event, skill.iconId)"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase"
                        :class="selectedSkillIndex === sIdx ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'"
                      >
                        S{{ sIdx + 1 }}
                      </span>
                      <span class="text-xs font-bold truncate">
                        {{ getDisplaySkillName(skill, sIdx) }}
                      </span>
                    </div>
                    <span v-if="skill.levels && skill.levels.length > 7" class="text-[10px] text-amber-400/80 font-mono block mt-0.5">
                      M1 &bull; M2 &bull; M3
                    </span>
                    <span v-else class="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {{ gameData.itemLanguage === 'ru' ? 'Ранг 1-7' : 'Rank 1-7' }}
                    </span>
                  </div>
                </button>
              </div>

              <!-- Selected Skill Details Card -->
              <div v-if="currentSkill && currentSkillLevelDetail" class="space-y-3 pt-1">
                <!-- Skill Level / Rank Segmented Bar -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 font-medium">
                      {{ gameData.itemLanguage === 'ru' ? 'Уровень навыка / Мастерство:' : 'Skill Level / Mastery:' }}
                    </span>
                    <span class="font-mono font-bold" :class="selectedSkillLevel >= 8 ? 'text-amber-400' : 'text-cyan-400'">
                      {{ getSkillRankLabel(selectedSkillLevel, gameData.itemLanguage) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                      v-for="lvl in (currentSkill.levels?.length || 7)"
                      :key="lvl"
                      type="button"
                      class="flex-1 min-w-[36px] py-1.5 rounded-lg text-xs font-mono font-bold transition-all border text-center"
                      :class="[
                        selectedSkillLevel === lvl
                          ? (lvl >= 8
                              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-900/30'
                              : 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-900/30')
                          : (lvl >= 8
                              ? 'bg-slate-900/90 border-amber-500/30 text-amber-300/80 hover:border-amber-400 hover:text-amber-200'
                              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200')
                      ]"
                      @click="selectedSkillLevel = lvl"
                    >
                      {{ lvl <= 7 ? lvl : `M${lvl - 7}` }}
                    </button>
                  </div>
                </div>

                <!-- Parameters Row (SP, Trigger, Duration) -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <!-- SP Cost & Initial SP -->
                  <div class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-0.5">
                    <span class="text-[10px] text-slate-500 font-mono block">
                      {{ gameData.itemLanguage === 'ru' ? 'SP (Старт / Стоимость)' : 'SP (Init / Cost)' }}
                    </span>
                    <span class="font-mono font-bold text-cyan-300">
                      {{ (currentSkillLevelDetail.skillType === 'PASSIVE' || (currentSkillLevelDetail.spCost === 0 && currentSkillLevelDetail.initSp === 0)) ? '&mdash;' : `${currentSkillLevelDetail.initSp} / ${currentSkillLevelDetail.spCost}` }}
                    </span>
                  </div>

                  <!-- SP Recovery Type -->
                  <div class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-0.5">
                    <span class="text-[10px] text-slate-500 font-mono block">
                      {{ gameData.itemLanguage === 'ru' ? 'Зарядка SP' : 'SP Recovery' }}
                    </span>
                    <span class="font-mono font-bold text-slate-200 truncate block">
                      {{ currentSkillLevelDetail.skillType === 'PASSIVE' ? (gameData.itemLanguage === 'ru' ? 'Пассивный' : 'Passive') : getSpTypeName(currentSkillLevelDetail.spType, gameData.itemLanguage) }}
                    </span>
                  </div>

                  <!-- Trigger / Activation Type -->
                  <div class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-0.5">
                    <span class="text-[10px] text-slate-500 font-mono block">
                      {{ gameData.itemLanguage === 'ru' ? 'Активация' : 'Activation' }}
                    </span>
                    <span class="font-mono font-bold text-slate-200 truncate block">
                      {{ getSkillTypeName(currentSkillLevelDetail.skillType, gameData.itemLanguage) }}
                    </span>
                  </div>

                  <!-- Duration -->
                  <div class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-0.5">
                    <span class="text-[10px] text-slate-500 font-mono block">
                      {{ gameData.itemLanguage === 'ru' ? 'Длительность' : 'Duration' }}
                    </span>
                    <span class="font-mono font-bold text-amber-300">
                      {{ formatSkillDuration(currentSkillLevelDetail.duration, currentSkillLevelDetail.skillType, dynamicSkillDesc || currentSkillLevelDetail.description, currentSkillLevelDetail.isInfinite, gameData.itemLanguage) }}
                    </span>
                  </div>
                </div>

                <!-- Skill Description Content -->
                <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {{ (!hasChinese(dynamicSkillName) ? dynamicSkillName : null) || getDisplaySkillName(currentSkill, selectedSkillIndex) }}
                    </span>
                    <span class="text-[10px] font-mono text-slate-500">
                      {{ getSkillRankLabel(selectedSkillLevel, gameData.itemLanguage) }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 leading-relaxed">
                    {{ dynamicSkillDesc || currentSkillLevelDetail.description }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Talents -->
            <div v-if="dynamicTalents && dynamicTalents.length > 0" class="p-4 bg-ark-card rounded-2xl border border-ark-border space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Shield class="w-4 h-4" />
                  {{ gameData.itemLanguage === 'ru' ? 'Таланты (Talents)' : 'Talents' }}
                </h4>
                <span v-if="isTranslating" class="text-[10px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  Translating...
                </span>
              </div>

              <div class="space-y-2.5">
                <div
                  v-for="(talent, tIdx) in dynamicTalents"
                  :key="tIdx"
                  class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1"
                >
                  <template v-if="talent.candidates && talent.candidates.length > 0">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-bold text-slate-200">
                        {{ (gameData.itemLanguage === 'ru' ? cleanArknightsTalentNameRu(talent.candidates[talent.candidates.length - 1].name) : talent.candidates[talent.candidates.length - 1].name) || `Talent ${tIdx + 1}` }}
                      </span>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                        {{ gameData.itemLanguage === 'ru' ? `E${talent.candidates[talent.candidates.length - 1].unlockPhase} Открытие` : `Unlock E${talent.candidates[talent.candidates.length - 1].unlockPhase}` }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed">
                      {{ gameData.itemLanguage === 'ru' ? cleanArknightsTalentTextRu(talent.candidates[talent.candidates.length - 1].description) : talent.candidates[talent.candidates.length - 1].description }}
                    </p>
                  </template>
                </div>
              </div>
            </div>

            <!-- Equip Modules (Interactive Viewer) -->
            <div v-if="dynamicModules && dynamicModules.length > 0" class="p-4 bg-ark-card rounded-2xl border border-ark-border space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Layers class="w-4 h-4" />
                  {{ gameData.itemLanguage === 'ru' ? 'Модули экипировки' : 'Equip Modules' }}
                </h4>
                <span class="text-[11px] font-mono text-slate-500">
                  {{ dynamicModules.length }} {{ dynamicModules.length === 1 ? (gameData.itemLanguage === 'ru' ? 'модуль' : 'module') : (gameData.itemLanguage === 'ru' ? 'модуля' : 'modules') }}
                </span>
              </div>

              <!-- Module Tabs (Selector) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <button
                  v-for="(mod, mIdx) in dynamicModules"
                  :key="mod.id"
                  type="button"
                  class="flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all"
                  :class="[
                    selectedModuleIndex === mIdx
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  ]"
                  @click="selectedModuleIndex = mIdx"
                >
                  <div class="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      :src="getEquipIconUrl(mod.uniEquipIcon)"
                      :alt="mod.name"
                      class="w-full h-full object-contain"
                      @error="handleEquipIconError($event, mod.uniEquipIcon)"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span
                        class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border uppercase"
                        :class="[
                          (mod.typeName2 || '').toUpperCase() === 'X'
                            ? 'bg-sky-950 text-sky-300 border-sky-700'
                            : (mod.typeName2 || '').toUpperCase() === 'Y'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : 'bg-rose-950 text-rose-300 border-rose-700'
                        ]"
                      >
                        {{ mod.typeName2 || 'MOD' }}
                      </span>
                      <span class="text-xs font-bold truncate" :class="selectedModuleIndex === mIdx ? 'text-amber-200' : 'text-slate-200'">
                        {{ mod.name }}
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono block truncate mt-0.5">
                      {{ gameData.itemLanguage === 'ru' ? `Ветка: ${mod.typeName1}` : `Branch: ${mod.typeName1}` }}
                    </span>
                  </div>
                </button>
              </div>

              <!-- Selected Module Details Card -->
              <div v-if="currentModule" class="space-y-3 pt-1">
                <!-- Stage Selector (Stage 1, 2, 3) -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 font-medium">
                      {{ gameData.itemLanguage === 'ru' ? 'Уровень модуля:' : 'Module Stage:' }}
                    </span>
                    <span class="font-mono font-bold text-amber-400">
                      {{ getModuleStageLabel(selectedModuleStage, gameData.itemLanguage) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                      v-for="stg in (currentModule.stages?.length || 3)"
                      :key="stg"
                      type="button"
                      class="flex-1 min-w-[70px] py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all border text-center"
                      :class="[
                        selectedModuleStage === stg
                          ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-900/30'
                          : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      ]"
                      @click="selectedModuleStage = stg"
                    >
                      {{ getModuleStageLabel(stg, gameData.itemLanguage) }}
                    </button>
                  </div>
                </div>

                <!-- Combat Stat Bonuses Grid -->
                <div v-if="currentModuleStageDetail?.attributes && currentModuleStageDetail.attributes.length > 0" class="space-y-1.5">
                  <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    {{ gameData.itemLanguage === 'ru' ? 'Бонусы к характеристикам:' : 'Attribute Bonuses:' }}
                  </span>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div
                      v-for="attr in currentModuleStageDetail.attributes"
                      :key="attr.key"
                      class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-0.5"
                    >
                      <span class="text-[10px] text-slate-500 font-mono block truncate">
                        {{ formatModuleAttributeName(attr.key, gameData.itemLanguage) }}
                      </span>
                      <span class="font-mono font-bold text-emerald-400 text-sm">
                        {{ formatModuleAttributeValue(attr.key, attr.value, gameData.itemLanguage) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Trait Addition / Override -->
                <div v-if="currentModuleStageDetail?.traitChange" class="p-3.5 bg-slate-900/90 rounded-xl border border-sky-900/40 space-y-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-950 text-sky-400 border border-sky-800">
                      {{ gameData.itemLanguage === 'ru' ? 'Особенность класса (Trait)' : 'Class Trait Update' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 leading-relaxed font-sans">
                    {{ currentModuleStageDetail.traitChange }}
                  </p>
                </div>

                <!-- Talent Upgrade -->
                <div v-if="currentModuleStageDetail?.talentChange" class="p-3.5 bg-slate-900/90 rounded-xl border border-purple-900/40 space-y-1.5">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-950 text-purple-400 border border-purple-800">
                        {{ gameData.itemLanguage === 'ru' ? 'Улучшение таланта' : 'Talent Upgrade' }}
                      </span>
                      <span v-if="currentModuleStageDetail.talentChange.name" class="text-xs font-bold text-purple-300">
                        {{ currentModuleStageDetail.talentChange.name }}
                      </span>
                    </div>
                  </div>
                  <p v-if="currentModuleStageDetail.talentChange.description" class="text-xs text-slate-300 leading-relaxed font-sans">
                    {{ currentModuleStageDetail.talentChange.description }}
                  </p>
                </div>

                <!-- Module Lore / Story Accordion -->
                <div v-if="currentModule.desc" class="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    class="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
                    @click="showModuleStory = !showModuleStory"
                  >
                    <span class="flex items-center gap-1.5">
                      <BookOpen class="w-3.5 h-3.5 text-amber-400" />
                      {{ gameData.itemLanguage === 'ru' ? 'История модуля (Lore)' : 'Module Lore Story' }}
                    </span>
                    <component :is="showModuleStory ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-500" />
                  </button>
                  <div v-if="showModuleStory" class="mt-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-400 whitespace-pre-line leading-relaxed font-sans">
                    {{ currentModule.desc }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Lore / Flavor Quote -->
            <div v-if="dynamicQuote || operator.itemDesc" class="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 italic text-xs text-slate-400">
              &laquo;{{ dynamicQuote || operator.itemDesc }}&raquo;
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-ark-card border-t border-ark-border flex items-center justify-between gap-3">
        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          @click="emit('close')"
        >
          {{ gameData.itemLanguage === 'ru' ? 'Закрыть' : 'Close' }}
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all active:scale-95"
          @click="handleOpenPlan"
        >
          <UserCheck class="w-4 h-4 stroke-[2.5]" />
          {{ gameData.itemLanguage === 'ru' ? 'Настроить план прокачки' : 'Configure Plan' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Fullscreen High-Resolution Art Lightbox Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isArtFullscreen && operator"
        class="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl select-none"
        @click.self="closeFullscreenArt"
      >
        <!-- Top Bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-10 flex-shrink-0">
          <div class="flex items-center gap-3">
            <span class="font-extrabold text-base sm:text-lg text-slate-100">{{ operator.name }}</span>
            <span class="text-amber-400 font-mono text-sm tracking-widest font-bold">
              {{ '★'.repeat(operator.rarity) }}
            </span>
            <span class="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-800/60 text-cyan-300">
              {{ currentSelectedSkin ? (dynamicSkinName || currentSelectedSkin.skinName) : (selectedSkinId === 'default_2' ? (gameData.itemLanguage === 'ru' ? 'Элита 2' : 'Elite 2') : (gameData.itemLanguage === 'ru' ? 'Базовый' : 'Default')) }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {{ gameData.itemLanguage === 'ru' ? 'ESC или клик для закрытия' : 'ESC or click outside to close' }}
            </span>
            <button
              type="button"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              :title="gameData.itemLanguage === 'ru' ? 'Закрыть' : 'Close'"
              @click="closeFullscreenArt"
            >
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Main High-Res Art Viewport -->
        <div
          class="flex-1 w-full h-full overflow-hidden flex items-center justify-center p-3 sm:p-6 cursor-zoom-out"
          @click="closeFullscreenArt"
        >
          <img
            :key="`${operator.id}_${selectedSkinId}_fs`"
            :src="currentArtUrl"
            :alt="operator.name"
            class="max-w-full max-h-[85vh] w-auto h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] select-none pointer-events-none transition-all duration-300"
            @error="handleArtError"
          />
        </div>

        <!-- Bottom Outfits Quick Bar in Fullscreen -->
        <div
          v-if="specialSkins.length > 0 || maxElite >= 2"
          class="px-6 pt-2 pb-3.5 border-t border-slate-800/80 bg-slate-900/70 backdrop-blur-md flex items-center justify-center gap-2.5 overflow-x-auto custom-scrollbar z-10 flex-shrink-0"
          @click.stop
        >
          <button
            type="button"
            class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all"
            :class="[
              selectedSkinId === 'default_1'
                ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            ]"
            @click="selectedSkinId = 'default_1'"
          >
            {{ gameData.itemLanguage === 'ru' ? 'Базовый (E0)' : 'Default (E0)' }}
          </button>

          <button
            v-if="maxElite >= 2"
            type="button"
            class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5"
            :class="[
              selectedSkinId === 'default_2'
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            ]"
            @click="selectedSkinId = 'default_2'"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>{{ gameData.itemLanguage === 'ru' ? 'Элита 2 (E2)' : 'Elite 2 (E2)' }}</span>
          </button>

          <button
            v-for="(skin, idx) in specialSkins"
            :key="skin.skinId"
            type="button"
            class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 max-w-[200px]"
            :class="[
              selectedSkinId === skin.skinId
                ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
            ]"
            @click="selectedSkinId = skin.skinId"
          >
            <img
              :src="getSkinAvatarUrl(skin.avatarId)"
              class="w-4 h-4 rounded-full object-cover flex-shrink-0"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span class="truncate">
              {{ selectedSkinId === skin.skinId && dynamicSkinName ? dynamicSkinName : (skin.skinName || `Skin #${idx + 1}`) }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
