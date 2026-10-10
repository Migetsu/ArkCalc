<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOperatorDetails } from '~/composables/useOperatorDetails'
import type { OperatorSkillDetailed, OperatorSkillLevel } from '~/types'

const route = useRoute()
const router = useRouter()
const operatorId = computed(() => String(route.params.id || ''))

const { operator, isLoading, error, fetchOperator, getAttributesAt } = useOperatorDetails()

// -----------------------------------------------------------------------------
// Interactive Phase & Level State
// -----------------------------------------------------------------------------
const selectedPhaseIdx = ref<number>(0)
const selectedLevel = ref<number>(1)

// Selected level per skill: skillId -> level (1..10)
const selectedSkillLevels = ref<Record<string, number>>({})

onMounted(async () => {
  if (operatorId.value) {
    const data = await fetchOperator(operatorId.value)
    if (data && data.phases.length > 0) {
      // Default to highest phase (Elite 2 for 6★, Elite 1 for 3★, etc.)
      const maxPhaseIdx = data.phases.length - 1
      selectedPhaseIdx.value = maxPhaseIdx
      selectedLevel.value = data.phases[maxPhaseIdx]?.maxLevel || 1

      // Default all skills to max level available (10 for M3, or 7)
      if (Array.isArray(data.detailedSkills)) {
        for (const sk of data.detailedSkills) {
          selectedSkillLevels.value[sk.skillId] = sk.levels.length || 1
        }
      }
    }
  }
})

// Current phase data
const currentPhase = computed(() => {
  if (!operator.value || !operator.value.phases[selectedPhaseIdx.value]) {
    return null
  }
  return operator.value.phases[selectedPhaseIdx.value]!
})

// Max level for the currently selected phase
const currentMaxLevel = computed(() => {
  return currentPhase.value?.maxLevel || 50
})

// Watch phase change to clamp or set level
watch(selectedPhaseIdx, (newIdx) => {
  if (operator.value && operator.value.phases[newIdx]) {
    const maxL = operator.value.phases[newIdx]!.maxLevel
    if (selectedLevel.value > maxL) {
      selectedLevel.value = maxL
    }
  }
})

// Current interpolated attributes at the selected phase & level
const currentAttributes = computed(() => {
  return getAttributesAt(selectedPhaseIdx.value, selectedLevel.value)
})

// -----------------------------------------------------------------------------
// Theme & Rarity Colors
// -----------------------------------------------------------------------------
const rarityColor = computed(() => {
  if (!operator.value) return '#ff6a00'
  switch (operator.value.rarity) {
    case 6:
      return '#ff6a00'
    case 5:
      return '#ffb703'
    case 4:
      return '#bb86fc'
    case 3:
      return '#00b4d8'
    case 2:
      return '#80ed99'
    default:
      return '#9e9e9e'
  }
})

// -----------------------------------------------------------------------------
// Navigation Actions
// -----------------------------------------------------------------------------
const goToPlanner = () => {
  if (!operator.value) return
  router.push(`/planner?op=${operator.value.id}`)
}

const goBackToCatalog = () => {
  router.push('/operators')
}

// -----------------------------------------------------------------------------
// Skill Helpers
// -----------------------------------------------------------------------------
const getSkillSelectedLevel = (sk: OperatorSkillDetailed): number => {
  return selectedSkillLevels.value[sk.skillId] || sk.levels.length || 1
}

const setSkillLevel = (sk: OperatorSkillDetailed, lvl: number) => {
  selectedSkillLevels.value[sk.skillId] = lvl
}

const getCurrentSkillData = (sk: OperatorSkillDetailed): OperatorSkillLevel => {
  const lvl = getSkillSelectedLevel(sk)
  const found = sk.levels[lvl - 1] || sk.levels[0]
  if (found) return found
  return {
    level: 1,
    name: sk.name,
    description: '',
    skillType: 'AUTO',
    spType: 'INCREASE_WITH_TIME',
    spCost: 0,
    initSp: 0,
    duration: 0,
  }
}

const formatSpType = (spType: string) => {
  switch (spType) {
    case 'INCREASE_WITH_TIME':
      return 'Автопополнение (Per Second)'
    case 'INCREASE_WHEN_ATTACK':
      return 'При атаке (Attacking)'
    case 'INCREASE_WHEN_TAKEN_DAMAGE':
      return 'При получении урона (On Hit)'
    default:
      return 'Пассивный'
  }
}

const formatSkillType = (skillType: string) => {
  switch (skillType) {
    case 'MANUAL':
      return 'Ручная активация'
    case 'AUTO':
      return 'Автоматическая активация'
    case 'PASSIVE':
      return 'Пассивный навык'
    default:
      return skillType
  }
}

// -----------------------------------------------------------------------------
// SEO Meta
// -----------------------------------------------------------------------------
useSeoMeta({
  title: () =>
    operator.value
      ? `${operator.value.name} (${operator.value.rarity}★ ${operator.value.profession}) // Характеристики и навыки Arknights`
      : 'Оперативник // ArkCalc PRTS',
  ogTitle: () =>
    operator.value
      ? `${operator.value.name} — Досье, статы и скиллы // ArkCalc`
      : 'Досье оперативника // ArkCalc',
  description: () =>
    operator.value
      ? `Детальная база данных ${operator.value.name} (${operator.value.profession}): базовые характеристики HP, ATK, DEF, Cost на Elite 0, 1, 2, список скиллов с расчетом СП и таланты.`
      : 'База характеристик и навыков оперативников Arknights',
  ogImage: () => operator.value?.portrait || operator.value?.avatar || '/images/og-image.png',
  twitterImage: () => operator.value?.portrait || operator.value?.avatar || '/images/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="ak-operator-detail-page" :style="{ '--theme-rarity': rarityColor }">
    <div class="ak-container">
      <!-- 1. Top Navigation Bar -->
      <nav class="ak-top-nav">
        <button
          type="button"
          class="ak-btn-back"
          title="Вернуться к каталогу"
          @click="goBackToCatalog"
        >
          <span class="ak-btn-back__arrow">⟵</span>
          ВЕРНУТЬСЯ В КАТАЛОГ ОПЕРАТИВНИКОВ
        </button>

        <div v-if="operator" class="ak-top-nav__actions">
          <button
            type="button"
            class="ak-btn-planner"
            title="Перейти к планировщику прокачки"
            @click="goToPlanner"
          >
            <span class="ak-btn-planner__icon">⚡</span>
            РАССЧИТАТЬ В ПЛАНИРОВЩИКЕ ПРОКАЧКИ ➜
          </button>
        </div>
      </nav>

      <!-- 2. Loading State -->
      <div v-if="isLoading && !operator" class="ak-loading-box">
        <div class="ak-loading-spinner"></div>
        <h3 class="ak-loading-title">ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ PRTS...</h3>
        <p class="ak-loading-sub">Загрузка тактических данных и таблиц характеристик Aceship</p>
      </div>

      <!-- 3. Error State -->
      <div v-else-if="error && !operator" class="ak-error-box">
        <div class="ak-error-icon">⚠️</div>
        <h3 class="ak-error-title">ОПЕРАТИВНИК НЕ НАЙДЕН</h3>
        <p class="ak-error-desc">{{ error }}</p>
        <button type="button" class="ak-btn-back-center" @click="goBackToCatalog">
          ВЕРНУТЬСЯ В КАТАЛОГ
        </button>
      </div>

      <!-- 4. Main Operator Content -->
      <div v-else-if="operator" class="ak-operator-layout">
        <!-- Header Banner Section -->
        <header class="ak-hero-banner">
          <div class="ak-hero-banner__glow"></div>
          <div class="ak-hero-banner__content">
            <div class="ak-hero-meta">
              <span class="ak-code-tag">PRTS // OP-DOSSIER-{{ operator.id.toUpperCase() }}</span>
              <span class="ak-hero-stars">{{ '★'.repeat(operator.rarity) }}</span>
            </div>

            <h1 class="ak-hero-name">
              {{ operator.name }}
              <span v-if="operator.appellation" class="ak-hero-appellation">
                // {{ operator.appellation }}
              </span>
            </h1>

            <div class="ak-hero-badges">
              <span class="ak-badge ak-badge--class">
                <span class="ak-badge__lbl">КЛАСС:</span>
                <strong>{{ operator.profession }}</strong>
              </span>

              <span v-if="operator.subProfessionId" class="ak-badge ak-badge--branch">
                <span class="ak-badge__lbl">ВЕТКА:</span>
                <strong>{{ operator.subProfessionId.toUpperCase() }}</strong>
              </span>

              <span class="ak-badge ak-badge--pos">
                <span class="ak-badge__lbl">ПОЗИЦИЯ:</span>
                <strong>{{ operator.position }}</strong>
              </span>

              <span class="ak-badge ak-badge--faction">
                <span class="ak-badge__lbl">ФРАКЦИЯ:</span>
                <strong>{{ operator.faction }}</strong>
              </span>
            </div>

            <!-- Tags -->
            <div v-if="operator.tagList && operator.tagList.length > 0" class="ak-hero-tags">
              <span v-for="tag in operator.tagList" :key="tag" class="ak-tag-pill">
                #{{ tag }}
              </span>
            </div>
          </div>
        </header>

        <!-- Two Column Main Body -->
        <div class="ak-main-grid">
          <!-- Left Column: Visual Portrait & Tactical Lore -->
          <aside class="ak-visual-col">
            <div class="ak-portrait-card">
              <div class="ak-portrait-frame">
                <img
                  :src="operator.avatar"
                  :alt="operator.name"
                  class="ak-portrait-img"
                  loading="eager"
                  @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
                />
                <div class="ak-portrait-overlay"></div>
                <div class="ak-portrait-scanline"></div>
              </div>

              <div class="ak-portrait-info">
                <div class="ak-portrait-info__row">
                  <span class="ak-k">ID В СИСТЕМЕ:</span>
                  <span class="ak-v">{{ operator.id }}</span>
                </div>
                <div class="ak-portrait-info__row">
                  <span class="ak-k">РЕДКОСТЬ:</span>
                  <span class="ak-v ak-v--rarity">{{ operator.rarity }} ЗВЕЗД(Ы)</span>
                </div>
                <div class="ak-portrait-info__row">
                  <span class="ak-k">БАЗОВЫЙ ИНТЕРВАЛ:</span>
                  <span class="ak-v">{{ currentAttributes?.baseAttackTime || '—' }}с</span>
                </div>
                <div class="ak-portrait-info__row">
                  <span class="ak-k">ВРЕМЯ ПЕРЕЗАРЯДКИ:</span>
                  <span class="ak-v">{{ currentAttributes?.respawnTime || '—' }}с</span>
                </div>
              </div>
            </div>

            <!-- Operator Tactical Profile & Quotes -->
            <div v-if="operator.itemUsage || operator.description || operator.itemDesc" class="ak-lore-card">
              <div class="ak-card-title">
                <span class="ak-card-title__tag">// LORE</span>
                <h3>ТАКТИЧЕСКОЕ ОПИСАНИЕ</h3>
              </div>

              <div v-if="operator.itemUsage" class="ak-lore-item">
                <span class="ak-lore-label">ПРИМЕНЕНИЕ В ОТРЯДЕ:</span>
                <p class="ak-lore-text">{{ operator.itemUsage }}</p>
              </div>

              <div v-if="operator.itemDesc" class="ak-lore-item">
                <span class="ak-lore-label">ДОСЬЕ КАДРОВОГО ОТДЕЛА:</span>
                <p class="ak-lore-text">{{ operator.itemDesc }}</p>
              </div>

              <div v-if="operator.description" class="ak-lore-item">
                <span class="ak-lore-label">ОСОБЕННОСТИ БОЯ:</span>
                <p class="ak-lore-text">{{ operator.description }}</p>
              </div>
            </div>

            <!-- Talents -->
            <div v-if="operator.talents && operator.talents.length > 0" class="ak-talents-card">
              <div class="ak-card-title">
                <span class="ak-card-title__tag">// TALENTS</span>
                <h3>ТАЛАНТЫ ОПЕРАТИВНИКА</h3>
              </div>

              <div class="ak-talents-list">
                <div
                  v-for="(t, idx) in operator.talents"
                  :key="idx"
                  class="ak-talent-item"
                >
                  <div class="ak-talent-head">
                    <span class="ak-talent-name">{{ t.name }}</span>
                    <span class="ak-talent-cond">
                      {{ t.unlockPhase === 2 ? 'Elite 2' : t.unlockPhase === 1 ? 'Elite 1' : 'Базовый' }}
                    </span>
                  </div>
                  <p class="ak-talent-desc">{{ t.description }}</p>
                </div>
              </div>
            </div>
          </aside>

          <!-- Right Column: Interactive Stats Simulator & Skills -->
          <section class="ak-content-col">
            <!-- 1. Stats Simulator Card -->
            <div class="ak-panel-card">
              <div class="ak-panel-header">
                <div class="ak-panel-title">
                  <span class="ak-panel-tag">// PARAMETERS</span>
                  <h2>БАЗОВЫЕ ХАРАКТЕРИСТИКИ И ПРОГРЕССИЯ</h2>
                </div>

                <!-- Phase Tabs (Elite 0, 1, 2) -->
                <div class="ak-phase-tabs">
                  <button
                    v-for="(phase, pIdx) in operator.phases"
                    :key="pIdx"
                    type="button"
                    class="ak-phase-tab"
                    :class="{ 'is-active': selectedPhaseIdx === pIdx }"
                    @click="selectedPhaseIdx = pIdx"
                  >
                    <span class="ak-phase-tab__icon">
                      {{ pIdx === 0 ? '◈' : pIdx === 1 ? '◈◈' : '◈◈◈' }}
                    </span>
                    ELITE {{ pIdx }}
                  </button>
                </div>
              </div>

              <!-- Level Control Slider -->
              <div class="ak-level-controller">
                <div class="ak-level-readout">
                  <span class="ak-level-label">ТЕКУЩИЙ УРОВЕНЬ:</span>
                  <div class="ak-level-val-group">
                    <span class="ak-level-cur">LV. {{ selectedLevel }}</span>
                    <span class="ak-level-max">/ {{ currentMaxLevel }}</span>
                  </div>
                </div>

                <div class="ak-slider-wrap">
                  <input
                    v-model.number="selectedLevel"
                    type="range"
                    min="1"
                    :max="currentMaxLevel"
                    step="1"
                    class="ak-level-slider"
                  />
                </div>

                <div class="ak-level-presets">
                  <button
                    type="button"
                    class="ak-preset-btn"
                    :class="{ 'is-selected': selectedLevel === 1 }"
                    @click="selectedLevel = 1"
                  >
                    LV 1
                  </button>
                  <button
                    v-if="currentMaxLevel >= 50"
                    type="button"
                    class="ak-preset-btn"
                    :class="{ 'is-selected': selectedLevel === 50 }"
                    @click="selectedLevel = 50"
                  >
                    LV 50
                  </button>
                  <button
                    type="button"
                    class="ak-preset-btn ak-preset-btn--max"
                    :class="{ 'is-selected': selectedLevel === currentMaxLevel }"
                    @click="selectedLevel = currentMaxLevel"
                  >
                    MAX (LV {{ currentMaxLevel }})
                  </button>
                </div>
              </div>

              <!-- Main Stats Visual Dashboard -->
              <div class="ak-stats-dashboard">
                <!-- HP Card -->
                <div class="ak-stat-box ak-stat-box--hp">
                  <div class="ak-stat-box__head">
                    <span class="ak-stat-box__name">MAX HP</span>
                    <span class="ak-stat-box__val">{{ currentAttributes?.maxHp || 0 }}</span>
                  </div>
                  <div class="ak-stat-bar-track">
                    <div
                      class="ak-stat-bar-fill ak-stat-bar-fill--hp"
                      :style="{
                        width: `${Math.min(100, ((currentAttributes?.maxHp || 0) / 4500) * 100)}%`
                      }"
                    ></div>
                  </div>
                </div>

                <!-- ATK Card -->
                <div class="ak-stat-box ak-stat-box--atk">
                  <div class="ak-stat-box__head">
                    <span class="ak-stat-box__name">ATK (АТАКА)</span>
                    <span class="ak-stat-box__val">{{ currentAttributes?.atk || 0 }}</span>
                  </div>
                  <div class="ak-stat-bar-track">
                    <div
                      class="ak-stat-bar-fill ak-stat-bar-fill--atk"
                      :style="{
                        width: `${Math.min(100, ((currentAttributes?.atk || 0) / 1200) * 100)}%`
                      }"
                    ></div>
                  </div>
                </div>

                <!-- DEF Card -->
                <div class="ak-stat-box ak-stat-box--def">
                  <div class="ak-stat-box__head">
                    <span class="ak-stat-box__name">DEF (ЗАЩИТА)</span>
                    <span class="ak-stat-box__val">{{ currentAttributes?.def || 0 }}</span>
                  </div>
                  <div class="ak-stat-bar-track">
                    <div
                      class="ak-stat-bar-fill ak-stat-bar-fill--def"
                      :style="{
                        width: `${Math.min(100, ((currentAttributes?.def || 0) / 1000) * 100)}%`
                      }"
                    ></div>
                  </div>
                </div>

                <!-- COST Card -->
                <div class="ak-stat-box ak-stat-box--cost">
                  <div class="ak-stat-box__head">
                    <span class="ak-stat-box__name">COST (DP)</span>
                    <span class="ak-stat-box__val">{{ currentAttributes?.cost || 0 }}</span>
                  </div>
                  <div class="ak-stat-bar-track">
                    <div
                      class="ak-stat-bar-fill ak-stat-bar-fill--cost"
                      :style="{
                        width: `${Math.min(100, ((currentAttributes?.cost || 0) / 35) * 100)}%`
                      }"
                    ></div>
                  </div>
                </div>

                <!-- BLOCK Card -->
                <div class="ak-stat-box ak-stat-box--sub">
                  <div class="ak-stat-box__head">
                    <span class="ak-stat-box__name">БЛОК</span>
                    <span class="ak-stat-box__val">{{ currentAttributes?.blockCnt || 0 }}</span>
                  </div>
                  <span class="ak-stat-box__sub">Количество целей</span>
                </div>

                <!-- RES Card -->
                <div class="ak-stat-box ak-stat-box--sub">
                  <div class="ak-stat-box__head">
                    <span class="ak-stat-box__name">RES (СОПР.)</span>
                    <span class="ak-stat-box__val">{{ currentAttributes?.magicResistance || 0 }}</span>
                  </div>
                  <span class="ak-stat-box__sub">Магич. защита</span>
                </div>
              </div>

              <!-- Progression Table Across Phases -->
              <div class="ak-progression-table-wrap">
                <h4 class="ak-prog-title">Сравнение максимумов по фазам (Elite Phases)</h4>
                <table class="ak-prog-table">
                  <thead>
                    <tr>
                      <th>ФАЗА</th>
                      <th>MAX LV</th>
                      <th>HP (MAX)</th>
                      <th>ATK (MAX)</th>
                      <th>DEF (MAX)</th>
                      <th>COST</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(p, idx) in operator.phases"
                      :key="idx"
                      :class="{ 'is-current-row': selectedPhaseIdx === idx }"
                    >
                      <td class="ak-td-phase">
                        <span class="ak-phase-dot" :class="{ 'is-active': selectedPhaseIdx === idx }"></span>
                        Elite {{ idx }}
                      </td>
                      <td>Lv {{ p.maxLevel }}</td>
                      <td>{{ p.maxAttributes.maxHp }}</td>
                      <td>{{ p.maxAttributes.atk }}</td>
                      <td>{{ p.maxAttributes.def }}</td>
                      <td>{{ p.maxAttributes.cost }} DP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 2. Skills Module Card -->
            <div class="ak-panel-card ak-panel-card--skills">
              <div class="ak-panel-header">
                <div class="ak-panel-title">
                  <span class="ak-panel-tag">// TACTICAL SKILLS</span>
                  <h2>БОЕВЫЕ НАВЫКИ И СТОИМОСТЬ СП</h2>
                </div>
              </div>

              <div
                v-if="!operator.detailedSkills || operator.detailedSkills.length === 0"
                class="ak-no-skills"
              >
                Оперативник не имеет активных боевых навыков.
              </div>

              <div v-else class="ak-skills-list">
                <div
                  v-for="(sk, sIdx) in operator.detailedSkills"
                  :key="sk.skillId"
                  class="ak-skill-card"
                >
                  <!-- Skill Header -->
                  <div class="ak-skill-card__head">
                    <!-- Icon -->
                    <div class="ak-skill-icon-frame">
                      <img
                        :src="sk.icon"
                        :alt="sk.name"
                        class="ak-skill-icon"
                        loading="lazy"
                        @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
                      />
                    </div>

                    <!-- Title & Badges -->
                    <div class="ak-skill-info">
                      <div class="ak-skill-title-row">
                        <span class="ak-skill-slot">SKILL {{ sIdx + 1 }}</span>
                        <h3 class="ak-skill-title">{{ getCurrentSkillData(sk).name }}</h3>
                        <span class="ak-skill-unlock">
                          {{ sk.unlockPhase === 2 ? 'Elite 2' : sk.unlockPhase === 1 ? 'Elite 1' : 'Elite 0' }}
                        </span>
                      </div>

                      <div class="ak-skill-types">
                        <span class="ak-type-pill ak-type-pill--sp">
                          SP: {{ formatSpType(getCurrentSkillData(sk).spType) }}
                        </span>
                        <span class="ak-type-pill ak-type-pill--trigger">
                          {{ formatSkillType(getCurrentSkillData(sk).skillType) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Skill Level Selector Pills (1..7, M1..M3) -->
                  <div class="ak-skill-lvl-selector">
                    <span class="ak-lvl-sel-label">УРОВЕНЬ НАВЫКА:</span>
                    <div class="ak-lvl-pills">
                      <button
                        v-for="lvl in sk.levels.length"
                        :key="lvl"
                        type="button"
                        class="ak-lvl-pill"
                        :class="{
                          'is-active': getSkillSelectedLevel(sk) === lvl,
                          'is-mastery': lvl > 7,
                        }"
                        @click="setSkillLevel(sk, lvl)"
                      >
                        {{ lvl <= 7 ? `Rank ${lvl}` : `M${lvl - 7}` }}
                      </button>
                    </div>
                  </div>

                  <!-- SP & Duration Tactical Matrix -->
                  <div class="ak-skill-sp-matrix">
                    <div class="ak-sp-cell">
                      <span class="ak-sp-cell__k">СТОИМОСТЬ СП:</span>
                      <strong class="ak-sp-cell__v ak-sp-cell__v--cost">
                        {{ getCurrentSkillData(sk).spCost }}
                      </strong>
                    </div>

                    <div class="ak-sp-cell">
                      <span class="ak-sp-cell__k">НАЧАЛЬНЫЙ ЗАПАС СП:</span>
                      <strong class="ak-sp-cell__v ak-sp-cell__v--init">
                        {{ getCurrentSkillData(sk).initSp }}
                      </strong>
                    </div>

                    <div class="ak-sp-cell">
                      <span class="ak-sp-cell__k">ДЛИТЕЛЬНОСТЬ:</span>
                      <strong class="ak-sp-cell__v">
                        {{
                          getCurrentSkillData(sk).duration > 0
                            ? `${getCurrentSkillData(sk).duration} сек`
                            : 'Мгновенный'
                        }}
                      </strong>
                    </div>
                  </div>

                  <!-- Skill Description Box -->
                  <div class="ak-skill-desc-box">
                    <p class="ak-skill-desc-text">
                      {{ getCurrentSkillData(sk).description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ak-operator-detail-page {
  min-height: 100vh;
  background-color: #0b0e14;
  color: #e2e8f0;
  font-family: var(--font-mono, 'JetBrains Mono', 'Consolas', monospace);
  padding: 1.5rem 1rem 5rem;
}

.ak-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* -------------------------------------------------------------------------- */
/* Top Navigation */
/* -------------------------------------------------------------------------- */
.ak-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ak-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.55rem 1rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ak-btn-back:hover {
  background: rgba(0, 229, 255, 0.1);
  border-color: #00e5ff;
  color: #ffffff;
  transform: translateX(-2px);
}

.ak-btn-back__arrow {
  color: #00e5ff;
}

.ak-btn-planner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(14, 165, 233, 0.3));
  border: 1px solid #00e5ff;
  color: #00e5ff;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.6rem 1.25rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.2);
}

.ak-btn-planner:hover {
  background: #00e5ff;
  color: #0b0e14;
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
}

/* -------------------------------------------------------------------------- */
/* States */
/* -------------------------------------------------------------------------- */
.ak-loading-box,
.ak-error-box {
  background: #111827;
  border: 1px dashed rgba(75, 85, 99, 0.5);
  border-radius: 4px;
  padding: 5rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ak-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 229, 255, 0.2);
  border-top-color: #00e5ff;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1.25rem;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.ak-loading-title,
.ak-error-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem;
}

.ak-loading-sub,
.ak-error-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.ak-error-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.ak-btn-back-center {
  margin-top: 1.5rem;
  background: #00e5ff;
  color: #0b0e14;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

/* -------------------------------------------------------------------------- */
/* Hero Banner */
/* -------------------------------------------------------------------------- */
.ak-hero-banner {
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-left: 5px solid var(--theme-rarity, #00e5ff);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.ak-hero-banner__glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background: radial-gradient(circle, var(--theme-rarity, #00e5ff) 0%, transparent 70%);
  opacity: 0.08;
  pointer-events: none;
}

.ak-hero-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ak-code-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 0.1em;
}

.ak-hero-stars {
  font-size: 1rem;
  font-weight: 800;
  color: var(--theme-rarity, #ff6a00);
  letter-spacing: -0.05em;
}

.ak-hero-name {
  font-size: 2.25rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ak-hero-appellation {
  font-size: 1.15rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.ak-hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ak-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.5);
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 2px;
}

.ak-badge__lbl {
  color: #64748b;
  font-weight: 800;
  font-size: 0.65rem;
}

.ak-badge strong {
  color: #ffffff;
}

.ak-badge--branch {
  border-color: rgba(0, 229, 255, 0.4);
}

.ak-badge--branch strong {
  color: #00e5ff;
}

.ak-hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ak-tag-pill {
  font-size: 0.7rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
}

/* -------------------------------------------------------------------------- */
/* Main Grid */
/* -------------------------------------------------------------------------- */
.ak-main-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.75rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .ak-main-grid {
    grid-template-columns: 1fr;
  }
}

/* -------------------------------------------------------------------------- */
/* Visual Left Column */
/* -------------------------------------------------------------------------- */
.ak-visual-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ak-portrait-card {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  overflow: hidden;
}

.ak-portrait-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #0f172a;
  overflow: hidden;
  border-bottom: 2px solid var(--theme-rarity, #00e5ff);
}

.ak-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ak-portrait-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(11, 14, 20, 0.85));
}

.ak-portrait-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.ak-portrait-info__row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(75, 85, 99, 0.2);
  padding-bottom: 0.35rem;
}

.ak-portrait-info__row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.ak-k {
  color: #64748b;
  font-weight: 700;
}

.ak-v {
  color: #ffffff;
  font-weight: 800;
}

.ak-v--rarity {
  color: var(--theme-rarity, #ff6a00);
}

.ak-lore-card,
.ak-talents-card {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  padding: 1.25rem;
}

.ak-card-title {
  margin-bottom: 1rem;
}

.ak-card-title__tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 0.1em;
}

.ak-card-title h3 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0.2rem 0 0;
}

.ak-lore-item {
  margin-bottom: 0.85rem;
}

.ak-lore-item:last-child {
  margin-bottom: 0;
}

.ak-lore-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #64748b;
  display: block;
  margin-bottom: 0.2rem;
}

.ak-lore-text {
  font-size: 0.75rem;
  line-height: 1.5;
  color: #cbd5e1;
  margin: 0;
}

.ak-talents-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ak-talent-item {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 2px;
  padding: 0.75rem;
}

.ak-talent-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.ak-talent-name {
  font-size: 0.8rem;
  font-weight: 800;
  color: #ffffff;
}

.ak-talent-cond {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
}

.ak-talent-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0;
}

/* -------------------------------------------------------------------------- */
/* Right Content Column */
/* -------------------------------------------------------------------------- */
.ak-content-col {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.ak-panel-card {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 4px;
  padding: 1.5rem;
}

.ak-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  padding-bottom: 1rem;
}

.ak-panel-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 0.1em;
  display: block;
}

.ak-panel-title h2 {
  font-size: 1.25rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0.2rem 0 0;
}

/* Phase Tabs */
.ak-phase-tabs {
  display: flex;
  gap: 0.35rem;
  background: #0f172a;
  padding: 0.25rem;
  border-radius: 3px;
  border: 1px solid rgba(75, 85, 99, 0.4);
}

.ak-phase-tab {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.4rem 0.85rem;
  cursor: pointer;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
}

.ak-phase-tab:hover {
  color: #ffffff;
}

.ak-phase-tab.is-active {
  background: rgba(0, 229, 255, 0.15);
  color: #00e5ff;
}

.ak-phase-tab__icon {
  font-size: 0.7rem;
}

/* Level Controller */
.ak-level-controller {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 3px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ak-level-readout {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ak-level-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
}

.ak-level-val-group {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.ak-level-cur {
  font-size: 1.35rem;
  font-weight: 900;
  color: #00e5ff;
}

.ak-level-max {
  font-size: 0.85rem;
  color: #64748b;
}

.ak-slider-wrap {
  width: 100%;
}

.ak-level-slider {
  width: 100%;
  accent-color: #00e5ff;
  cursor: pointer;
}

.ak-level-presets {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.ak-preset-btn {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ak-preset-btn:hover {
  color: #ffffff;
  border-color: #00e5ff;
}

.ak-preset-btn.is-selected {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
  color: #00e5ff;
}

/* Stats Visual Dashboard */
.ak-stats-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ak-stat-box {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 3px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ak-stat-box__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.ak-stat-box__name {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
}

.ak-stat-box__val {
  font-size: 1.4rem;
  font-weight: 900;
  color: #ffffff;
}

.ak-stat-box--hp .ak-stat-box__val {
  color: #10b981;
}

.ak-stat-box--atk .ak-stat-box__val {
  color: #f59e0b;
}

.ak-stat-box--def .ak-stat-box__val {
  color: #3b82f6;
}

.ak-stat-box--cost .ak-stat-box__val {
  color: #bb86fc;
}

.ak-stat-bar-track {
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.ak-stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.ak-stat-bar-fill--hp {
  background: #10b981;
}

.ak-stat-bar-fill--atk {
  background: #f59e0b;
}

.ak-stat-bar-fill--def {
  background: #3b82f6;
}

.ak-stat-bar-fill--cost {
  background: #bb86fc;
}

.ak-stat-box__sub {
  font-size: 0.65rem;
  color: #64748b;
}

/* Progression Table */
.ak-progression-table-wrap {
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  padding-top: 1.25rem;
}

.ak-prog-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: #94a3b8;
  margin: 0 0 0.75rem;
  letter-spacing: 0.05em;
}

.ak-prog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.ak-prog-table th {
  background: #0f172a;
  color: #64748b;
  font-weight: 800;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.4);
}

.ak-prog-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.2);
  color: #cbd5e1;
}

.ak-prog-table tr.is-current-row td {
  background: rgba(0, 229, 255, 0.06);
  color: #ffffff;
}

.ak-td-phase {
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ak-phase-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4b5563;
}

.ak-phase-dot.is-active {
  background: #00e5ff;
}

/* -------------------------------------------------------------------------- */
/* Skills Module */
/* -------------------------------------------------------------------------- */
.ak-skills-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ak-skill-card {
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-left: 3px solid #00e5ff;
  border-radius: 3px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ak-skill-card__head {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.ak-skill-icon-frame {
  width: 64px;
  height: 64px;
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.6);
  border-radius: 4px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ak-skill-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ak-skill-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.ak-skill-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ak-skill-slot {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
}

.ak-skill-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.ak-skill-unlock {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 700;
}

.ak-skill-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ak-type-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
}

.ak-type-pill--sp {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.ak-type-pill--trigger {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

/* Skill Level Selector */
.ak-skill-lvl-selector {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  padding-top: 0.75rem;
}

.ak-lvl-sel-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
}

.ak-lvl-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ak-lvl-pill {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.55rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ak-lvl-pill:hover {
  color: #ffffff;
  border-color: #00e5ff;
}

.ak-lvl-pill.is-active {
  background: rgba(0, 229, 255, 0.2);
  border-color: #00e5ff;
  color: #00e5ff;
}

.ak-lvl-pill.is-mastery {
  border-color: rgba(245, 158, 11, 0.4);
}

.ak-lvl-pill.is-mastery.is-active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #f59e0b;
}

/* SP & Duration Matrix */
.ak-skill-sp-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  background: #111827;
  padding: 0.75rem;
  border-radius: 2px;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.ak-sp-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ak-sp-cell__k {
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 700;
}

.ak-sp-cell__v {
  font-size: 1.1rem;
  color: #ffffff;
}

.ak-sp-cell__v--cost {
  color: #f59e0b;
}

.ak-sp-cell__v--init {
  color: #00e5ff;
}

/* Skill Description */
.ak-skill-desc-box {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(75, 85, 99, 0.3);
  padding: 0.85rem;
  border-radius: 2px;
}

.ak-skill-desc-text {
  font-size: 0.8rem;
  line-height: 1.6;
  color: #e2e8f0;
  margin: 0;
  white-space: pre-wrap;
}

.ak-no-skills {
  color: #64748b;
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 0;
}
</style>
