<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameDataStore } from '@/stores/gamedata';
import { useLocaleStore } from '@/stores/locale';
import {
  simulateDps,
  ENEMY_PRESETS,
  SUPPORT_BUFF_PRESETS,
  type DpsBuffs,
  type EnemyPreset,
} from '@/services/dpsCalculatorService';
import type { OperatorSummary, OperatorModule } from '@/types/game';
import { getAvatarUrl, getSkillIconUrl } from '@/utils/imageUrl';
import {
  Swords,
  Zap,
  Target,
  Sparkles,
  BarChart3,
  Sliders,
  RotateCcw,
  Search,
  Check,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-vue-next';

const props = defineProps<{
  initialOperatorId?: string;
}>();

const emit = defineEmits<{
  (e: 'select-operator', opId: string): void;
}>();

const gameData = useGameDataStore();
const locale = useLocaleStore();

// Selected Operator state
const selectedOpId = ref<string>('');
const isOpPickerOpen = ref<boolean>(false);
const opSearchQuery = ref<string>('');
const opClassFilter = ref<string>('ALL');

// Operator Progression
const selectedElite = ref<number>(2);
const selectedLevel = ref<number>(90);
const selectedTrust = ref<number>(100);
const selectedPotential = ref<number>(1);
const selectedModuleId = ref<string>('');
const selectedModuleStage = ref<number>(3);
const selectedSkillIndex = ref<number>(2); // 0, 1, 2
const selectedSkillLevel = ref<number>(10); // 1..10 (10 = M3)

// Target Enemy State
const activeEnemyPresetId = ref<string>('defender');
const enemyHp = ref<number>(15000);
const enemyDef = ref<number>(1000);
const enemyRes = ref<number>(0);
const enemyCount = ref<number>(1);

// Active Buffs State
const activeSupporters = ref<Set<string>>(new Set());
const customBuffs = ref<DpsBuffs>({
  atkPercent: 0,
  flatAtk: 0,
  aspd: 0,
  fragilePercent: 0,
  defShredPercent: 0,
  flatDefShred: 0,
  resShredPercent: 0,
  flatResShred: 0,
  artsTakenPercent: 0,
});

// Advanced manual overrides
const customSkillMultiplier = ref<number>(0);
const customHitsPerAttack = ref<number>(0);
const showAdvancedSettings = ref<boolean>(false);
const activeCurveTab = ref<'def' | 'res'>('def');

// Initialize default operator (e.g. Młynar, Degenbrecher, SilverAsh, or first 6-star)
onMounted(() => {
  if (props.initialOperatorId && gameData.operators[props.initialOperatorId]) {
    setOperator(props.initialOperatorId);
  } else {
    // Default to a flagship DPS like Młynar or Thorns or first available 6*
    const preferred = ['char_374_alche', 'char_4025_apno', 'char_1033_mlynar', 'char_4082_degen', 'char_293_thorns', 'char_172_svrash'];
    const found = preferred.find((id) => gameData.operators[id]);
    if (found) {
      setOperator(found);
    } else {
      const first6Star = Object.values(gameData.operators).find((o) => o.rarity === 6);
      if (first6Star) setOperator(first6Star.id);
    }
  }
});

watch(
  () => props.initialOperatorId,
  (newId) => {
    if (newId && gameData.operators[newId]) {
      setOperator(newId);
    }
  }
);

function setOperator(opId: string) {
  selectedOpId.value = opId;
  const op = currentOperator.value;
  if (!op) return;

  const maxE = Math.max(0, op.phases.length - 1);
  selectedElite.value = maxE;
  const phase = op.phases[maxE] || op.phases[0];
  selectedLevel.value = phase ? phase.maxLevel : 90;

  // Set default to highest skill (usually S3 for 6*, S2 for 5*)
  const maxSkillIdx = Math.max(0, op.skills.length - 1);
  selectedSkillIndex.value = maxSkillIdx;
  selectedSkillLevel.value = 10; // M3

  // Default module
  if (op.modules && op.modules.length > 0) {
    selectedModuleId.value = op.modules[0].id;
    selectedModuleStage.value = 3;
  } else {
    selectedModuleId.value = '';
    selectedModuleStage.value = 0;
  }

  isOpPickerOpen.value = false;
  emit('select-operator', opId);
}

const currentOperator = computed<OperatorSummary | null>(() => {
  return gameData.operators[selectedOpId.value] || null;
});

const currentModule = computed<OperatorModule | null>(() => {
  if (!currentOperator.value || !selectedModuleId.value) return null;
  return currentOperator.value.modules.find((m) => m.id === selectedModuleId.value) || null;
});

const currentSkill = computed(() => {
  if (!currentOperator.value || !currentOperator.value.skills[selectedSkillIndex.value]) return null;
  return currentOperator.value.skills[selectedSkillIndex.value];
});

const currentSkillDetail = computed(() => {
  if (!currentSkill.value || !currentSkill.value.levels || currentSkill.value.levels.length === 0) return null;
  const lvlIdx = Math.max(0, Math.min(selectedSkillLevel.value - 1, currentSkill.value.levels.length - 1));
  return currentSkill.value.levels[lvlIdx] || null;
});

// Max level for current elite
const maxLevelForElite = computed(() => {
  if (!currentOperator.value) return 50;
  const phase = currentOperator.value.phases[selectedElite.value];
  return phase ? phase.maxLevel : 50;
});

watch(selectedElite, (newElite) => {
  if (!currentOperator.value) return;
  const phase = currentOperator.value.phases[newElite];
  if (phase && selectedLevel.value > phase.maxLevel) {
    selectedLevel.value = phase.maxLevel;
  }
});

// Combined buffs: presets + custom
const combinedBuffs = computed<DpsBuffs>(() => {
  const result: DpsBuffs = { ...customBuffs.value };

  for (const presetId of activeSupporters.value) {
    const preset = SUPPORT_BUFF_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      result.atkPercent += preset.atkPercent;
      result.flatAtk += preset.flatAtk;
      result.aspd += preset.aspd;
      result.fragilePercent += preset.fragilePercent;
      result.defShredPercent = Math.min(100, result.defShredPercent + preset.defShredPercent);
      result.flatDefShred += preset.flatDefShred;
      result.resShredPercent = Math.min(100, result.resShredPercent + preset.resShredPercent);
      result.flatResShred += preset.flatResShred;
      result.artsTakenPercent += preset.artsTakenPercent;
    }
  }

  return result;
});

function toggleSupporter(id: string) {
  if (activeSupporters.value.has(id)) {
    activeSupporters.value.delete(id);
  } else {
    activeSupporters.value.add(id);
  }
}

function applyEnemyPreset(preset: EnemyPreset) {
  activeEnemyPresetId.value = preset.id;
  enemyHp.value = preset.hp;
  enemyDef.value = preset.def;
  enemyRes.value = preset.res;
}

function resetBuffs() {
  activeSupporters.value.clear();
  customBuffs.value = {
    atkPercent: 0,
    flatAtk: 0,
    aspd: 0,
    fragilePercent: 0,
    defShredPercent: 0,
    flatDefShred: 0,
    resShredPercent: 0,
    flatResShred: 0,
    artsTakenPercent: 0,
  };
}

// Full simulation results
const simulation = computed(() => {
  if (!currentOperator.value) return null;

  return simulateDps({
    operator: currentOperator.value,
    elite: selectedElite.value,
    level: selectedLevel.value,
    trust: selectedTrust.value,
    potential: selectedPotential.value,
    module: currentModule.value,
    moduleStage: selectedModuleStage.value,
    skillDetail: currentSkillDetail.value,
    enemyHp: enemyHp.value,
    enemyDef: enemyDef.value,
    enemyRes: enemyRes.value,
    enemyCount: enemyCount.value,
    buffs: combinedBuffs.value,
    customSkillMultiplier: customSkillMultiplier.value > 0 ? customSkillMultiplier.value : undefined,
    customHitsPerAttack: customHitsPerAttack.value > 0 ? customHitsPerAttack.value : undefined,
  });
});

// Filter operators for picker
const filteredOperators = computed(() => {
  const query = opSearchQuery.value.trim().toLowerCase();
  const cls = opClassFilter.value;

  return Object.values(gameData.operators).filter((op) => {
    if (cls !== 'ALL' && op.profession !== cls) return false;
    if (!query) return true;
    return (
      op.name.toLowerCase().includes(query) ||
      (op.appellation && op.appellation.toLowerCase().includes(query)) ||
      op.id.toLowerCase().includes(query)
    );
  });
});

// SVG Chart coordinate calculations
const chartMaxDps = computed(() => {
  if (!simulation.value) return 1000;
  const list = activeCurveTab.value === 'def' ? simulation.value.defCurve : simulation.value.resCurve;
  let max = Math.max(...list.map((p) => Math.max(p.skillDps, p.normalDps)));
  return Math.max(100, Math.ceil(max * 1.15));
});

function getCurvePoints(isSkill: boolean): string {
  if (!simulation.value) return '';
  const list = activeCurveTab.value === 'def' ? simulation.value.defCurve : simulation.value.resCurve;
  const isDef = activeCurveTab.value === 'def';
  const maxX = isDef ? 3000 : 100;
  const maxY = chartMaxDps.value;

  return list
    .map((point) => {
      const xVal = isDef ? (point as any).def : (point as any).res;
      const yVal = isSkill ? point.skillDps : point.normalDps;
      const x = (xVal / maxX) * 460 + 20;
      const y = 180 - (yVal / maxY) * 160;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

// Marker X coordinate on chart
const targetMarkerX = computed(() => {
  const isDef = activeCurveTab.value === 'def';
  const val = isDef ? enemyDef.value : enemyRes.value;
  const maxX = isDef ? 3000 : 100;
  const clamped = Math.max(0, Math.min(maxX, val));
  return (clamped / maxX) * 460 + 20;
});
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
    <!-- Header Title Banner -->
    <div class="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Swords class="w-5 h-5" />
            </div>
            <div>
              <h1 class="text-xl md:text-2xl font-black text-slate-100 tracking-wide flex items-center gap-2">
                {{ locale.currentLang === 'ru' ? 'Симулятор боевого урона и DPS' : 'Combat & DPS Simulator' }}
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-semibold">
                  v2.0 PRO
                </span>
              </h1>
              <p class="text-xs md:text-sm text-slate-400 mt-0.5">
                {{ locale.currentLang === 'ru' ? 'Точный расчет одиночных ударов, частоты атак, бурст-скиллов и баффов команды с графиками пробития брони' : 'Accurate physical/arts calculation, ASPD frame-rate scaling, burst durations and enemy DEF/RES curves' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Switch Operator Button -->
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          @click="isOpPickerOpen = true"
        >
          <Search class="w-4 h-4" />
          <span>{{ locale.currentLang === 'ru' ? 'Выбрать оператора' : 'Change Operator' }}</span>
        </button>
      </div>
    </div>

    <!-- Main Grid: 2 Columns on Desktop -->
    <div v-if="currentOperator" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- LEFT COLUMN: Operator Setup & Controls (5 Cols) -->
      <div class="lg:col-span-5 space-y-5">
        
        <!-- Operator Card Summary -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md backdrop-blur-sm space-y-4">
          <div class="flex items-center gap-3.5">
            <div class="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-500/40 bg-slate-950 flex-shrink-0">
              <img :src="getAvatarUrl(currentOperator.id)" :alt="currentOperator.name" class="w-full h-full object-cover" />
              <div class="absolute bottom-0 right-0 px-1 py-0.5 bg-black/80 text-[10px] font-bold font-mono text-amber-400">
                ★{{ currentOperator.rarity }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-100 truncate">{{ currentOperator.name }}</h3>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {{ currentOperator.profession }}
                </span>
              </div>
              <p class="text-xs text-slate-400 truncate">{{ currentOperator.appellation || currentOperator.id }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-cyan-300">
                  {{ simulation?.damageType }} DMG
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  Base ATK: {{ simulation?.stats.atk }}
                </span>
              </div>
            </div>
          </div>

          <!-- Elite, Level & Progression Controls -->
          <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <!-- Elite Phase -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase text-slate-400 font-mono">
                {{ locale.currentLang === 'ru' ? 'Элита' : 'Elite' }}
              </label>
              <div class="grid grid-cols-3 gap-1">
                <button
                  v-for="e in currentOperator.phases.length"
                  :key="e - 1"
                  type="button"
                  class="py-1 text-xs font-bold rounded-lg border transition-all"
                  :class="selectedElite === e - 1 ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
                  @click="selectedElite = e - 1"
                >
                  E{{ e - 1 }}
                </button>
              </div>
            </div>

            <!-- Level Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-bold font-mono text-slate-400">
                <span>{{ locale.currentLang === 'ru' ? 'Уровень' : 'Level' }}</span>
                <span class="text-cyan-400 font-bold">{{ selectedLevel }} / {{ maxLevelForElite }}</span>
              </div>
              <input
                v-model.number="selectedLevel"
                type="range"
                min="1"
                :max="maxLevelForElite"
                class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <!-- Trust & Potential -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-bold font-mono text-slate-400">
                <span>{{ locale.currentLang === 'ru' ? 'Доверие (Trust)' : 'Trust' }}</span>
                <span class="text-emerald-400 font-bold">{{ selectedTrust }}%</span>
              </div>
              <input
                v-model.number="selectedTrust"
                type="range"
                min="0"
                max="100"
                step="10"
                class="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] font-bold uppercase text-slate-400 font-mono">
                {{ locale.currentLang === 'ru' ? 'Потенциал' : 'Potential' }}
              </label>
              <div class="flex gap-1">
                <button
                  v-for="p in 6"
                  :key="p"
                  type="button"
                  class="flex-1 py-1 text-[11px] font-mono font-bold rounded border transition-all"
                  :class="selectedPotential === p ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'"
                  @click="selectedPotential = p"
                >
                  {{ p }}
                </button>
              </div>
            </div>
          </div>

          <!-- Module Selector (if available) -->
          <div v-if="currentOperator.modules && currentOperator.modules.length > 0" class="space-y-2 pt-2 border-t border-slate-800">
            <label class="text-[10px] font-bold uppercase text-slate-400 font-mono">
              {{ locale.currentLang === 'ru' ? 'Модуль и ступень' : 'Module & Stage' }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                v-model="selectedModuleId"
                class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">{{ locale.currentLang === 'ru' ? 'Без модуля' : 'No Module' }}</option>
                <option v-for="mod in currentOperator.modules" :key="mod.id" :value="mod.id">
                  {{ mod.typeName }} ({{ mod.name }})
                </option>
              </select>

              <div v-if="selectedModuleId" class="flex gap-1">
                <button
                  v-for="stg in 3"
                  :key="stg"
                  type="button"
                  class="flex-1 py-1 text-xs font-bold font-mono rounded border transition-all"
                  :class="selectedModuleStage === stg ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'"
                  @click="selectedModuleStage = stg"
                >
                  Stage {{ stg }}
                </button>
              </div>
            </div>
          </div>

          <!-- Skill Selection -->
          <div v-if="currentOperator.skills && currentOperator.skills.length > 0" class="space-y-2 pt-2 border-t border-slate-800">
            <label class="text-[10px] font-bold uppercase text-slate-400 font-mono">
              {{ locale.currentLang === 'ru' ? 'Активный скилл' : 'Active Skill' }}
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="(sk, idx) in currentOperator.skills"
                :key="sk.skillId"
                type="button"
                class="p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center"
                :class="selectedSkillIndex === idx ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'"
                @click="selectedSkillIndex = idx"
              >
                <div class="w-8 h-8 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                  <img :src="getSkillIconUrl(sk.iconId || sk.skillId)" :alt="sk.name" class="w-full h-full object-cover" />
                </div>
                <span class="text-[11px] font-bold truncate max-w-full">S{{ idx + 1 }}</span>
              </button>
            </div>

            <!-- Skill Mastery Level -->
            <div class="flex items-center justify-between gap-2 pt-2">
              <span class="text-[11px] font-mono font-bold text-slate-300">
                {{ selectedSkillLevel <= 7 ? `Rank ${selectedSkillLevel}` : `Mastery ${selectedSkillLevel - 7} (M${selectedSkillLevel - 7})` }}
              </span>
              <div class="flex gap-1 overflow-x-auto pb-1 max-w-full">
                <button
                  v-for="lvl in 10"
                  :key="lvl"
                  type="button"
                  class="px-2 py-1 text-[10px] font-mono font-bold rounded border transition-all"
                  :class="selectedSkillLevel === lvl ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'"
                  @click="selectedSkillLevel = lvl"
                >
                  {{ lvl <= 7 ? lvl : `M${lvl - 7}` }}
                </button>
              </div>
            </div>

            <!-- Skill Description Preview -->
            <div v-if="currentSkillDetail" class="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
              <div class="text-cyan-400 font-bold mb-0.5">{{ currentSkill?.name }}</div>
              <div>{{ currentSkillDetail.description }}</div>
              <div class="flex gap-3 text-[10px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-800">
                <span>Duration: {{ currentSkillDetail.duration || 'Instant' }}s</span>
                <span>SP Cost: {{ currentSkillDetail.spCost }}</span>
                <span>Init: {{ currentSkillDetail.initSp }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Target Enemy Setup Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md backdrop-blur-sm space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Target class="w-4 h-4 text-rose-400" />
              {{ locale.currentLang === 'ru' ? 'Характеристики цели (Врага)' : 'Target Enemy Settings' }}
            </h4>
          </div>

          <!-- Quick Presets -->
          <div class="space-y-1.5">
            <label class="text-[10px] text-slate-400 font-mono uppercase">{{ locale.currentLang === 'ru' ? 'Пресеты противников' : 'Enemy Presets' }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                v-for="pre in ENEMY_PRESETS"
                :key="pre.id"
                type="button"
                class="px-2 py-1.5 text-[10px] rounded-lg border font-semibold transition-all text-left truncate"
                :class="activeEnemyPresetId === pre.id ? 'bg-rose-500 text-slate-950 border-rose-400 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'"
                @click="applyEnemyPreset(pre)"
              >
                {{ locale.currentLang === 'ru' ? pre.nameRu : pre.name }}
              </button>
            </div>
          </div>

          <!-- Enemy Sliders -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <!-- DEF Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">DEF (Защита)</span>
                <span class="text-rose-400 font-bold">{{ enemyDef }}</span>
              </div>
              <input
                v-model.number="enemyDef"
                type="range"
                min="0"
                max="3000"
                step="50"
                class="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <!-- RES Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">RES (Маг. сопр.)</span>
                <span class="text-blue-400 font-bold">{{ enemyRes }}</span>
              </div>
              <input
                v-model.number="enemyRes"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- HP Slider -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">HP цели</span>
                <span class="text-slate-200 font-bold">{{ enemyHp.toLocaleString() }}</span>
              </div>
              <input
                v-model.number="enemyHp"
                type="range"
                min="1000"
                max="200000"
                step="1000"
                class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <!-- Enemy Count -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-mono">
                <span class="text-slate-400">{{ locale.currentLang === 'ru' ? 'Кол-во целей' : 'Target Count' }}</span>
                <span class="text-slate-200 font-bold">{{ enemyCount }}</span>
              </div>
              <div class="flex gap-1">
                <button
                  v-for="cnt in 4"
                  :key="cnt"
                  type="button"
                  class="flex-1 py-1 text-xs font-mono font-bold rounded border transition-all"
                  :class="enemyCount === cnt ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'"
                  @click="enemyCount = cnt"
                >
                  {{ cnt }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Allied Buffs & Supporters -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md backdrop-blur-sm space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Sparkles class="w-4 h-4 text-amber-400" />
              {{ locale.currentLang === 'ru' ? 'Бафферы команды и дебаффы' : 'Allied Buffs & Support' }}
            </h4>
            <button
              v-if="activeSupporters.size > 0"
              type="button"
              class="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              @click="resetBuffs"
            >
              <RotateCcw class="w-3 h-3" />
              <span>{{ locale.currentLang === 'ru' ? 'Сброс' : 'Reset' }}</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="sup in SUPPORT_BUFF_PRESETS"
              :key="sup.id"
              type="button"
              class="p-2.5 rounded-xl border text-left transition-all relative overflow-hidden"
              :class="activeSupporters.has(sup.id) ? 'bg-amber-500/10 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/40' : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'"
              @click="toggleSupporter(sup.id)"
            >
              <div class="flex items-center justify-between text-xs font-bold mb-0.5">
                <span>{{ locale.currentLang === 'ru' ? sup.nameRu : sup.name }}</span>
                <Check v-if="activeSupporters.has(sup.id)" class="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p class="text-[10px] text-slate-400 leading-tight">
                {{ locale.currentLang === 'ru' ? sup.descriptionRu : sup.description }}
              </p>
            </button>
          </div>

          <!-- Toggle Advanced Manual Sliders -->
          <button
            type="button"
            class="w-full pt-2 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition-colors"
            @click="showAdvancedSettings = !showAdvancedSettings"
          >
            <Sliders class="w-3.5 h-3.5" />
            <span>{{ locale.currentLang === 'ru' ? 'Ручные модификаторы (% ATK, ASPD, Fragile)' : 'Manual Fine-Tuning Sliders' }}</span>
            <ChevronDown v-if="!showAdvancedSettings" class="w-3.5 h-3.5" />
            <ChevronUp v-else class="w-3.5 h-3.5" />
          </button>

          <div v-if="showAdvancedSettings" class="space-y-3 pt-3 border-t border-slate-800/80">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label class="text-[10px] font-mono text-slate-400">+% ATK Buff</label>
                <input v-model.number="customBuffs.atkPercent" type="number" step="5" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200" />
              </div>
              <div>
                <label class="text-[10px] font-mono text-slate-400">+Flat ATK</label>
                <input v-model.number="customBuffs.flatAtk" type="number" step="50" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200" />
              </div>
              <div>
                <label class="text-[10px] font-mono text-slate-400">+ASPD</label>
                <input v-model.number="customBuffs.aspd" type="number" step="5" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200" />
              </div>
              <div>
                <label class="text-[10px] font-mono text-slate-400">+% Fragile</label>
                <input v-model.number="customBuffs.fragilePercent" type="number" step="5" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Simulation Results & Analytics (7 Cols) -->
      <div v-if="simulation" class="lg:col-span-7 space-y-5">
        
        <!-- TOP HIGHLIGHT CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Skill Burst DPS Highlight -->
          <div class="relative overflow-hidden bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border border-cyan-500/50 rounded-2xl p-5 shadow-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Zap class="w-4 h-4" />
                {{ locale.currentLang === 'ru' ? 'Бурст DPS (Во время скилла)' : 'Skill Burst DPS' }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                {{ simulation.skillDuration }}s
              </span>
            </div>
            <div class="text-3xl md:text-4xl font-black text-cyan-200 font-mono tracking-tight">
              {{ simulation.skillBurstDps.toLocaleString() }}
              <span class="text-sm font-semibold text-slate-400">/ sec</span>
            </div>
            <div class="text-xs text-slate-400 mt-2 flex items-center justify-between border-t border-cyan-900/40 pt-2 font-mono">
              <span>{{ locale.currentLang === 'ru' ? 'Суммарный урон скилла:' : 'Total Burst Damage:' }}</span>
              <strong class="text-cyan-300 text-sm font-black">{{ simulation.totalSkillDamage.toLocaleString() }}</strong>
            </div>
          </div>

          <!-- Sustained Normal DPS -->
          <div class="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                <Swords class="w-4 h-4 text-slate-500" />
                {{ locale.currentLang === 'ru' ? 'Базовый DPS (Без скилла)' : 'Sustained Normal DPS' }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                Passive
              </span>
            </div>
            <div class="text-3xl md:text-4xl font-black text-slate-100 font-mono tracking-tight">
              {{ simulation.normalDps.toLocaleString() }}
              <span class="text-sm font-semibold text-slate-500">/ sec</span>
            </div>
            <div class="text-xs text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800 pt-2 font-mono">
              <span>{{ locale.currentLang === 'ru' ? 'Урон одного удара:' : 'Normal Hit Damage:' }}</span>
              <strong class="text-slate-200 text-sm font-bold">{{ simulation.normalDamagePerHit.toLocaleString() }}</strong>
            </div>
          </div>
        </div>

        <!-- Combat Metrics Detailed Breakdown Grid -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md backdrop-blur-sm space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <BarChart3 class="w-4 h-4 text-cyan-400" />
            {{ locale.currentLang === 'ru' ? 'Детальные боевые метрики' : 'Detailed Combat Metrics' }}
          </h4>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <!-- Final ATK -->
            <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
              <div class="text-[10px] text-slate-500 uppercase">{{ locale.currentLang === 'ru' ? 'Итоговая ATK' : 'Final ATK' }}</div>
              <div class="text-base font-bold text-slate-100 mt-0.5">{{ simulation.finalAtk.toLocaleString() }}</div>
            </div>

            <!-- Single Hit in Skill -->
            <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
              <div class="text-[10px] text-slate-500 uppercase">{{ locale.currentLang === 'ru' ? 'Удар под скиллом' : 'Skill Hit DMG' }}</div>
              <div class="text-base font-bold text-cyan-300 mt-0.5">{{ simulation.skillDamagePerHit.toLocaleString() }}</div>
            </div>

            <!-- Attack Interval -->
            <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
              <div class="text-[10px] text-slate-500 uppercase">{{ locale.currentLang === 'ru' ? 'Интервал атаки' : 'Atk Interval' }}</div>
              <div class="text-base font-bold text-slate-100 mt-0.5">{{ simulation.effectiveAttackInterval }}s</div>
            </div>

            <!-- Time to Kill (TTK) -->
            <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
              <div class="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                <Clock class="w-3 h-3 text-rose-400" />
                <span>{{ locale.currentLang === 'ru' ? 'Время убийства' : 'Time to Kill' }}</span>
              </div>
              <div class="text-base font-bold text-rose-300 mt-0.5">
                {{ simulation.timeToKillSeconds !== null ? `${simulation.timeToKillSeconds}s` : 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Defense / RES Shred Status -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono">
            <div class="flex items-center gap-2">
              <span class="text-slate-400">{{ locale.currentLang === 'ru' ? 'Эффективная защита врага:' : 'Effective Enemy DEF:' }}</span>
              <strong class="text-rose-400">{{ simulation.effectiveEnemyDef }} DEF</strong>
              <span v-if="enemyDef !== simulation.effectiveEnemyDef" class="text-[10px] text-emerald-400">
                (-{{ enemyDef - simulation.effectiveEnemyDef }})
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-400">{{ locale.currentLang === 'ru' ? 'Эффективный RES:' : 'Effective Enemy RES:' }}</span>
              <strong class="text-blue-400">{{ simulation.effectiveEnemyRes }} RES</strong>
              <span v-if="enemyRes !== simulation.effectiveEnemyRes" class="text-[10px] text-emerald-400">
                (-{{ enemyRes - simulation.effectiveEnemyRes }})
              </span>
            </div>
          </div>

          <!-- Minimum 5% damage warning if triggered -->
          <div
            v-if="simulation.minDamageFloorApplied"
            class="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2"
          >
            <AlertTriangle class="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              {{ locale.currentLang === 'ru' ? 'Внимание: защита врага превышает атаку оператора. Сработал минимальный порог урона в 5% от базовой ATK.' : 'Warning: Enemy DEF exceeds operator ATK. 5% minimum damage floor applied.' }}
            </span>
          </div>
        </div>

        <!-- INTERACTIVE SVG DAMAGE CURVE (Damage vs Enemy DEF & RES) -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md backdrop-blur-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <TrendingUp class="w-4 h-4 text-emerald-400" />
                {{ locale.currentLang === 'ru' ? 'Кривая масштабирования DPS' : 'Damage Scaling Curve' }}
              </h4>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {{ activeCurveTab === 'def' ? (locale.currentLang === 'ru' ? 'Зависимость DPS от брони противника (от 0 до 3000 DEF)' : 'DPS dependence on Enemy DEF (0 to 3000 DEF)') : (locale.currentLang === 'ru' ? 'Зависимость DPS от сопротивления магии (от 0 до 100 RES)' : 'DPS dependence on Enemy RES (0 to 100 RES)') }}
              </p>
            </div>

            <!-- Curve Type Toggle Tabs -->
            <div class="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold font-mono">
              <button
                type="button"
                class="px-3 py-1 rounded-lg transition-all"
                :class="activeCurveTab === 'def' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'"
                @click="activeCurveTab = 'def'"
              >
                DEF Curve
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-lg transition-all"
                :class="activeCurveTab === 'res' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'"
                @click="activeCurveTab = 'res'"
              >
                RES Curve
              </button>
            </div>
          </div>

          <!-- SVG Chart Area -->
          <div class="relative bg-slate-950/90 rounded-xl border border-slate-800 p-4 overflow-hidden">
            <svg class="w-full h-52 overflow-visible" viewBox="0 0 500 200">
              <!-- Grid lines -->
              <line x1="20" y1="20" x2="480" y2="20" stroke="#1e293b" stroke-dasharray="4" />
              <line x1="20" y1="73" x2="480" y2="73" stroke="#1e293b" stroke-dasharray="4" />
              <line x1="20" y1="126" x2="480" y2="126" stroke="#1e293b" stroke-dasharray="4" />
              <line x1="20" y1="180" x2="480" y2="180" stroke="#334155" />

              <!-- Axes Labels -->
              <text x="25" y="16" fill="#64748b" font-size="10" font-family="monospace">{{ chartMaxDps.toLocaleString() }} DPS</text>
              <text x="25" y="175" fill="#64748b" font-size="10" font-family="monospace">0</text>
              <text x="440" y="195" fill="#64748b" font-size="10" font-family="monospace">{{ activeCurveTab === 'def' ? '3000 DEF' : '100 RES' }}</text>

              <!-- Skill Burst DPS Curve (Cyan) -->
              <polyline
                fill="none"
                stroke="#06b6d4"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                :points="getCurvePoints(true)"
              />

              <!-- Sustained Normal DPS Curve (Slate/White) -->
              <polyline
                fill="none"
                stroke="#94a3b8"
                stroke-width="2"
                stroke-dasharray="3 3"
                stroke-linecap="round"
                stroke-linejoin="round"
                :points="getCurvePoints(false)"
              />

              <!-- Target Marker Vertical Line -->
              <line
                :x1="targetMarkerX"
                y1="10"
                :x2="targetMarkerX"
                y2="180"
                stroke="#f43f5e"
                stroke-width="2"
                stroke-dasharray="2 2"
              />
              <circle :cx="targetMarkerX" cy="20" r="4" fill="#f43f5e" />
              <text :x="targetMarkerX + 6" y="24" fill="#f43f5e" font-size="10" font-weight="bold" font-family="monospace">
                Target ({{ activeCurveTab === 'def' ? `${enemyDef} DEF` : `${enemyRes} RES` }})
              </text>
            </svg>

            <!-- Legend below chart -->
            <div class="flex items-center justify-center gap-6 text-xs font-mono font-semibold pt-2 border-t border-slate-900">
              <div class="flex items-center gap-2">
                <span class="w-3 h-1 bg-cyan-400 rounded-full"></span>
                <span class="text-cyan-300">{{ locale.currentLang === 'ru' ? 'Бурст скилла (Skill Burst)' : 'Skill Burst DPS' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-1 bg-slate-400 rounded-full border-dashed"></span>
                <span class="text-slate-400">{{ locale.currentLang === 'ru' ? 'Базовая атака (Normal)' : 'Normal DPS' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="text-rose-400">{{ locale.currentLang === 'ru' ? 'Текущий враг' : 'Target State' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- OPERATOR PICKER MODAL -->
    <Teleport to="body">
      <div
        v-if="isOpPickerOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        @click.self="isOpPickerOpen = false"
      >
        <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
          <!-- Picker Header -->
          <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
              <Search class="w-4 h-4 text-cyan-400" />
              {{ locale.currentLang === 'ru' ? 'Выберите оператора для симуляции' : 'Select Operator for DPS Simulation' }}
            </h3>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
              @click="isOpPickerOpen = false"
            >
              ✕
            </button>
          </div>

          <!-- Picker Search & Filters -->
          <div class="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2">
            <input
              v-model="opSearchQuery"
              type="text"
              placeholder="Поиск по имени (например, Młynar, SilverAsh, Degenbrecher)..."
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <div class="flex gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
              <button
                v-for="cls in ['ALL', 'GUARD', 'SNIPER', 'CASTER', 'SPECIAL', 'WARRIOR', 'TANK']"
                :key="cls"
                type="button"
                class="px-2.5 py-1 rounded-lg border transition-all"
                :class="opClassFilter === cls ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'"
                @click="opClassFilter = cls"
              >
                {{ cls }}
              </button>
            </div>
          </div>

          <!-- Picker Operators List -->
          <div class="p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
            <button
              v-for="op in filteredOperators"
              :key="op.id"
              type="button"
              class="flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left group"
              :class="selectedOpId === op.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-200'"
              @click="setOperator(op.id)"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                <img :src="getAvatarUrl(op.id)" :alt="op.name" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold truncate group-hover:text-cyan-400 transition-colors">{{ op.name }}</div>
                <div class="text-[10px] text-slate-500 font-mono">★{{ op.rarity }} • {{ op.profession }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
