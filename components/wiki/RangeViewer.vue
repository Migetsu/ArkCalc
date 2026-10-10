<script setup lang="ts">
import { ref, computed } from 'vue'
import rawRanges from '~/assets/data/ranges.json'
import type { RangeData, RangeGrid } from '~/types'

const props = withDefaults(
  defineProps<{
    /** Single rangeId (if no E0/E2 distinction or for generic display) */
    rangeId?: string
    /** Range ID specifically for Elite 0 */
    rangeIdE0?: string
    /** Range ID specifically for Elite 2 */
    rangeIdE2?: string
    /** Optional operator name to display above grid */
    operatorName?: string
    /** Initial phase to display: 0 (E0), 2 (E2), or 'compare' */
    initialPhase?: 0 | 2 | 'compare'
    /** Compact display mode for small cards */
    compact?: boolean
  }>(),
  {
    rangeId: '',
    rangeIdE0: '',
    rangeIdE2: '',
    operatorName: '',
    initialPhase: 0,
    compact: false,
  }
)

const rangesMap = rawRanges as Record<string, RangeData>

// Resolved Range IDs
const resolvedE0Id = computed(() => props.rangeIdE0 || props.rangeId || '0-1')
const resolvedE2Id = computed(() => props.rangeIdE2 || props.rangeId || resolvedE0Id.value)

// Has different E2 range?
const hasE2Upgrade = computed(() => {
  return (
    Boolean(props.rangeIdE2) &&
    Boolean(resolvedE0Id.value) &&
    resolvedE0Id.value !== resolvedE2Id.value
  )
})

// Current selected view mode: 0 (E0), 2 (E2), or 'compare'
const currentMode = ref<0 | 2 | 'compare'>(
  hasE2Upgrade.value && props.initialPhase === 2
    ? 2
    : props.initialPhase === 'compare' && hasE2Upgrade.value
    ? 'compare'
    : 0
)

// Active Range Data based on mode
const activeRangeData = computed<RangeData | null>(() => {
  const targetId = currentMode.value === 2 ? resolvedE2Id.value : resolvedE0Id.value
  return rangesMap[targetId] || null
})

const e0RangeData = computed<RangeData | null>(() => {
  return rangesMap[resolvedE0Id.value] || null
})

const e2RangeData = computed<RangeData | null>(() => {
  return rangesMap[resolvedE2Id.value] || null
})

// Set of coordinates for E0: "row,col"
const e0TileSet = computed<Set<string>>(() => {
  const set = new Set<string>()
  if (e0RangeData.value && Array.isArray(e0RangeData.value.grids)) {
    for (const g of e0RangeData.value.grids) {
      set.add(`${g.row},${g.col}`)
    }
  }
  return set
})

// Set of coordinates for E2: "row,col"
const e2TileSet = computed<Set<string>>(() => {
  const set = new Set<string>()
  if (e2RangeData.value && Array.isArray(e2RangeData.value.grids)) {
    for (const g of e2RangeData.value.grids) {
      set.add(`${g.row},${g.col}`)
    }
  }
  return set
})

// Bounding box calculations (including (0,0) for operator)
const gridBounds = computed(() => {
  let minRow = 0
  let maxRow = 0
  let minCol = 0
  let maxCol = 0

  const allGrids: RangeGrid[] = []
  if (e0RangeData.value?.grids) allGrids.push(...e0RangeData.value.grids)
  if (e2RangeData.value?.grids) allGrids.push(...e2RangeData.value.grids)

  for (const g of allGrids) {
    if (g.row < minRow) minRow = g.row
    if (g.row > maxRow) maxRow = g.row
    if (g.col < minCol) minCol = g.col
    if (g.col > maxCol) maxCol = g.col
  }

  // Row lines: In math Cartesian coordinates row > 0 is UP, row < 0 is DOWN.
  // We want to render rows from top (maxRow) down to bottom (minRow).
  const rows: number[] = []
  for (let r = maxRow; r >= minRow; r--) {
    rows.push(r)
  }

  // Col columns: from left (minCol) to right (maxCol)
  const cols: number[] = []
  for (let c = minCol; c <= maxCol; c++) {
    cols.push(c)
  }

  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    rows,
    cols,
    totalRows: rows.length,
    totalCols: cols.length,
  }
})

// Check tile state
type TileState = 'operator' | 'attack' | 'expanded' | 'empty'

const getTileState = (row: number, col: number): TileState => {
  const isOp = row === 0 && col === 0
  const key = `${row},${col}`

  if (currentMode.value === 0) {
    if (isOp) return 'operator'
    return e0TileSet.value.has(key) ? 'attack' : 'empty'
  }

  if (currentMode.value === 2) {
    if (isOp) return 'operator'
    return e2TileSet.value.has(key) ? 'attack' : 'empty'
  }

  // Compare mode: highlight new tiles from E2 in 'expanded'
  if (isOp) return 'operator'
  const inE0 = e0TileSet.value.has(key)
  const inE2 = e2TileSet.value.has(key)

  if (inE0) return 'attack'
  if (inE2) return 'expanded'
  return 'empty'
}

// Tile counts and stats
const currentTileCount = computed(() => {
  if (currentMode.value === 0) return e0RangeData.value?.grids.length || 0
  if (currentMode.value === 2) return e2RangeData.value?.grids.length || 0
  return e2RangeData.value?.grids.length || e0RangeData.value?.grids.length || 0
})

const e0TileCount = computed(() => e0RangeData.value?.grids.length || 0)
const e2TileCount = computed(() => e2RangeData.value?.grids.length || 0)
const diffTileCount = computed(() => Math.max(0, e2TileCount.value - e0TileCount.value))
</script>

<template>
  <div class="ak-range-viewer" :class="{ 'is-compact': compact }">
    <!-- Header with Range ID & Phase Switcher -->
    <div class="ak-range-viewer__header">
      <div class="ak-range-title-group">
        <span class="ak-range-tag">PRTS // ATTACK RANGE MATRIX</span>
        <h4 v-if="operatorName" class="ak-range-operator">{{ operatorName }}</h4>
        <span class="ak-range-id-badge">
          ID: {{ currentMode === 2 ? resolvedE2Id : resolvedE0Id }}
        </span>
      </div>

      <!-- Phase Toggle Buttons (E0 / E2 / Compare) -->
      <div v-if="hasE2Upgrade" class="ak-range-toggles">
        <button
          type="button"
          class="ak-range-btn"
          :class="{ 'is-active': currentMode === 0 }"
          @click="currentMode = 0"
        >
          <span class="ak-btn-dot">◈</span>
          ELITE 0
        </button>

        <button
          type="button"
          class="ak-range-btn"
          :class="{ 'is-active': currentMode === 2 }"
          @click="currentMode = 2"
        >
          <span class="ak-btn-dot">◈◈◈</span>
          ELITE 2
        </button>

        <button
          type="button"
          class="ak-range-btn ak-range-btn--diff"
          :class="{ 'is-active': currentMode === 'compare' }"
          @click="currentMode = 'compare'"
        >
          <span class="ak-btn-dot">◰</span>
          РАСШИРЕНИЕ (+{{ diffTileCount }})
        </button>
      </div>

      <!-- Single phase badge if no E2 upgrade -->
      <div v-else class="ak-range-single-badge">
        <span class="ak-single-pill">ФИКСИРОВАННЫЙ РАДИУС (E0 / E2)</span>
      </div>
    </div>

    <!-- Tactical Radar Grid Canvas -->
    <div class="ak-range-grid-canvas">
      <!-- Radar Background Decoration Lines -->
      <div class="ak-radar-bg">
        <div class="ak-radar-axis-x"></div>
        <div class="ak-radar-axis-y"></div>
      </div>

      <!-- Grid Layout -->
      <div
        class="ak-range-grid"
        :style="{
          '--grid-cols': gridBounds.totalCols,
          '--grid-rows': gridBounds.totalRows,
        }"
      >
        <div
          v-for="r in gridBounds.rows"
          :key="`row-${r}`"
          class="ak-grid-row"
        >
          <div
            v-for="c in gridBounds.cols"
            :key="`cell-${r}-${c}`"
            class="ak-grid-cell"
            :class="[
              `is-${getTileState(r, c)}`,
              { 'is-center-row': r === 0 },
              { 'is-center-col': c === 0 },
            ]"
            :title="`Клетка [Строка ${r}, Колонка ${c}]`"
          >
            <!-- Cell Content based on state -->
            <!-- 1. Operator Tile -->
            <template v-if="getTileState(r, c) === 'operator'">
              <div class="ak-cell-op">
                <span class="ak-op-beacon"></span>
                <span class="ak-op-glyph">OP</span>
                <span class="ak-op-dir">▶</span>
              </div>
            </template>

            <!-- 2. Standard Attack Tile -->
            <template v-else-if="getTileState(r, c) === 'attack'">
              <div class="ak-cell-attack">
                <span class="ak-attack-inner"></span>
              </div>
            </template>

            <!-- 3. Expanded Tile (Elite 2 bonus) -->
            <template v-else-if="getTileState(r, c) === 'expanded'">
              <div class="ak-cell-expanded">
                <span class="ak-expanded-tag">+E2</span>
              </div>
            </template>

            <!-- 4. Empty slot outside attack zone -->
            <template v-else>
              <div class="ak-cell-empty"></div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Range Statistics Footer -->
    <div class="ak-range-footer">
      <div class="ak-range-stat">
        <span class="ak-range-stat__k">ВСЕГО КЛЕТОК:</span>
        <strong class="ak-range-stat__v">{{ currentTileCount }}</strong>
      </div>

      <div class="ak-range-stat">
        <span class="ak-range-stat__k">МАКС. ДАЛЬНОСТЬ:</span>
        <strong class="ak-range-stat__v">{{ Math.max(0, gridBounds.maxCol) }} вперед</strong>
      </div>

      <div class="ak-range-legend">
        <div class="ak-legend-item">
          <span class="ak-legend-dot ak-legend-dot--op"></span>
          <span>Оператор</span>
        </div>
        <div class="ak-legend-item">
          <span class="ak-legend-dot ak-legend-dot--atk"></span>
          <span>Зона атаки</span>
        </div>
        <div v-if="hasE2Upgrade" class="ak-legend-item">
          <span class="ak-legend-dot ak-legend-dot--exp"></span>
          <span>Новые клетки (E2)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ak-range-viewer {
  background: #111827;
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-left: 3px solid #00e5ff;
  border-radius: 4px;
  padding: 1.25rem;
  font-family: var(--font-mono, 'JetBrains Mono', 'Consolas', monospace);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
}

.ak-range-viewer.is-compact {
  padding: 0.85rem;
  gap: 0.85rem;
}

/* -------------------------------------------------------------------------- */
/* Header */
/* -------------------------------------------------------------------------- */
.ak-range-viewer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  padding-bottom: 0.85rem;
}

.ak-range-title-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.ak-range-tag {
  font-size: 0.65rem;
  font-weight: 800;
  color: #00e5ff;
  letter-spacing: 0.1em;
}

.ak-range-operator {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.ak-range-id-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(75, 85, 99, 0.4);
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
  color: #94a3b8;
}

.ak-range-toggles {
  display: flex;
  gap: 0.3rem;
  background: #0f172a;
  border: 1px solid rgba(75, 85, 99, 0.4);
  padding: 0.2rem;
  border-radius: 2px;
}

.ak-range-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.35rem 0.7rem;
  border-radius: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.15s ease;
}

.ak-range-btn:hover {
  color: #ffffff;
}

.ak-range-btn.is-active {
  background: rgba(0, 229, 255, 0.15);
  color: #00e5ff;
}

.ak-range-btn--diff.is-active {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.ak-btn-dot {
  font-size: 0.65rem;
}

.ak-single-pill {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* -------------------------------------------------------------------------- */
/* Tactical Grid Canvas */
/* -------------------------------------------------------------------------- */
.ak-range-grid-canvas {
  position: relative;
  background: radial-gradient(circle at center, #0f172a 0%, #0b0e14 100%);
  border: 1px solid rgba(75, 85, 99, 0.35);
  border-radius: 3px;
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  overflow-x: auto;
}

.ak-range-viewer.is-compact .ak-range-grid-canvas {
  padding: 1rem 0.5rem;
  min-height: 140px;
}

/* Radar Backdrop Lines */
.ak-radar-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.15;
}

.ak-radar-axis-x {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #00e5ff;
}

.ak-radar-axis-y {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #00e5ff;
}

/* Grid Matrix */
.ak-range-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
}

.ak-grid-row {
  display: flex;
  gap: 4px;
}

.ak-grid-cell {
  width: 44px;
  height: 44px;
  border-radius: 3px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.ak-range-viewer.is-compact .ak-grid-cell {
  width: 32px;
  height: 32px;
}

/* Cell Types */
/* Empty Tile */
.ak-grid-cell.is-empty {
  border: 1px dashed rgba(75, 85, 99, 0.25);
  background: rgba(15, 23, 42, 0.3);
}

.ak-cell-empty {
  width: 100%;
  height: 100%;
}

/* Attack Tile */
.ak-grid-cell.is-attack {
  background: rgba(0, 229, 255, 0.18);
  border: 1px solid rgba(0, 229, 255, 0.6);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.15), inset 0 0 8px rgba(0, 229, 255, 0.1);
}

.ak-grid-cell.is-attack:hover {
  background: rgba(0, 229, 255, 0.3);
  border-color: #00e5ff;
}

.ak-cell-attack {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ak-attack-inner {
  width: 8px;
  height: 8px;
  background: #00e5ff;
  border-radius: 1px;
  opacity: 0.6;
}

/* Operator Tile */
.ak-grid-cell.is-operator {
  background: linear-gradient(135deg, rgba(255, 106, 0, 0.3), rgba(255, 183, 3, 0.25));
  border: 2px solid #ff6a00;
  box-shadow: 0 0 16px rgba(255, 106, 0, 0.4), inset 0 0 10px rgba(255, 106, 0, 0.25);
  z-index: 2;
}

.ak-cell-op {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.ak-op-beacon {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 106, 0, 0.5);
  border-radius: 2px;
  animation: pulseBeacon 2s infinite ease-out;
  pointer-events: none;
}

@keyframes pulseBeacon {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.ak-op-glyph {
  font-size: 0.75rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.05em;
  text-shadow: 0 0 6px rgba(255, 106, 0, 0.8);
}

.ak-range-viewer.is-compact .ak-op-glyph {
  font-size: 0.6rem;
}

.ak-op-dir {
  position: absolute;
  right: 2px;
  font-size: 0.55rem;
  color: #ffb703;
}

/* Expanded Tile (E2 Bonus) */
.ak-grid-cell.is-expanded {
  background: rgba(245, 158, 11, 0.25);
  border: 1px solid #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.3), inset 0 0 8px rgba(245, 158, 11, 0.15);
  animation: highlightExpand 2s infinite alternate ease-in-out;
}

@keyframes highlightExpand {
  0% {
    border-color: rgba(245, 158, 11, 0.5);
  }
  100% {
    border-color: #f59e0b;
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
  }
}

.ak-cell-expanded {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ak-expanded-tag {
  font-size: 0.6rem;
  font-weight: 800;
  color: #f59e0b;
}

.ak-range-viewer.is-compact .ak-expanded-tag {
  font-size: 0.5rem;
}

/* -------------------------------------------------------------------------- */
/* Footer & Legend */
/* -------------------------------------------------------------------------- */
.ak-range-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
  padding-top: 0.75rem;
}

.ak-range-stat {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.ak-range-stat__k {
  color: #64748b;
  font-weight: 700;
  font-size: 0.65rem;
}

.ak-range-stat__v {
  color: #00e5ff;
  font-weight: 800;
}

.ak-range-legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.7rem;
  color: #94a3b8;
}

.ak-legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ak-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.ak-legend-dot--op {
  background: #ff6a00;
  box-shadow: 0 0 6px #ff6a00;
}

.ak-legend-dot--atk {
  background: #00e5ff;
  box-shadow: 0 0 6px #00e5ff;
}

.ak-legend-dot--exp {
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
}
</style>
