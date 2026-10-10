<script setup lang="ts">
import { computed } from 'vue'
import type { CatalogOperator } from '~/types'

const props = defineProps<{
  isOpen: boolean
  operator: CatalogOperator | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

const rarityColor = computed(() => {
  if (!props.operator) return '#ff6a00'
  switch (props.operator.rarity) {
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

const goToPlanner = () => {
  if (!props.operator) return
  emit('close')
  router.push(`/planner?op=${props.operator.id}`)
}
</script>

<template>
  <div v-if="isOpen && operator" class="ak-modal-overlay" @click.self="emit('close')">
    <div class="ak-modal-box" :style="{ '--rarity-theme': rarityColor }">
      <!-- Modal Top Bar -->
      <div class="ak-modal-box__head">
        <div class="ak-modal-box__title-group">
          <span class="ak-modal-box__tag">PRTS ARCHIVE // OPERATOR DOSSIER</span>
          <h2 class="ak-modal-box__title">{{ operator.name }}</h2>
        </div>
        <button
          type="button"
          class="ak-modal-box__close"
          title="Закрыть"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="ak-modal-box__body">
        <!-- Left: Operator Artwork & Visual Badges -->
        <div class="ak-dossier-visual">
          <div class="ak-dossier-portrait">
            <img
              :src="operator.avatar"
              :alt="operator.name"
              class="ak-dossier-portrait__img"
              loading="lazy"
              decoding="async"
              @error="($event.target as HTMLImageElement).src = '/images/operators/placeholder.png'"
            />
            <span class="ak-dossier-portrait__rarity">{{ '★'.repeat(operator.rarity) }}</span>
          </div>

          <div class="ak-dossier-badges">
            <div class="ak-badge-item">
              <span class="ak-badge-item__k">CLASS</span>
              <strong class="ak-badge-item__v">{{ operator.profession }}</strong>
            </div>
            <div class="ak-badge-item">
              <span class="ak-badge-item__k">POSITION</span>
              <strong class="ak-badge-item__v">{{ operator.position }}</strong>
            </div>
            <div class="ak-badge-item">
              <span class="ak-badge-item__k">FACTION</span>
              <strong class="ak-badge-item__v">{{ operator.faction }}</strong>
            </div>
            <div v-if="operator.subProfessionId" class="ak-badge-item">
              <span class="ak-badge-item__k">BRANCH</span>
              <strong class="ak-badge-item__v">{{ operator.subProfessionId.toUpperCase() }}</strong>
            </div>
          </div>
        </div>

        <!-- Right: Information & Tactical Data -->
        <div class="ak-dossier-content">
          <!-- Code Name & Appellation -->
          <div class="ak-dossier-section">
            <div class="ak-section-header">
              <span class="ak-section-title">IDENTIFICATION & CODENAME</span>
            </div>
            <div class="ak-id-row">
              <div class="ak-id-chip">
                <span class="ak-id-label">OPERATOR ID:</span>
                <code>{{ operator.id }}</code>
              </div>
              <div v-if="operator.appellation" class="ak-id-chip">
                <span class="ak-id-label">APPELLATION:</span>
                <strong>{{ operator.appellation }}</strong>
              </div>
            </div>
          </div>

          <!-- Tactical Trait / Description -->
          <div v-if="operator.description" class="ak-dossier-section">
            <div class="ak-section-header">
              <span class="ak-section-title">TACTICAL TRAIT & COMBAT ROLE</span>
            </div>
            <p class="ak-dossier-desc">{{ operator.description }}</p>
          </div>

          <!-- Lore Quote / Profile -->
          <div v-if="operator.itemDesc" class="ak-dossier-section">
            <div class="ak-section-header">
              <span class="ak-section-title">OPERATOR ARCHIVE PROFILE</span>
            </div>
            <blockquote class="ak-dossier-quote">
              "{{ operator.itemDesc }}"
            </blockquote>
          </div>

          <!-- Recruitment & Combat Tags -->
          <div v-if="operator.tagList && operator.tagList.length > 0" class="ak-dossier-section">
            <div class="ak-section-header">
              <span class="ak-section-title">RECRUITMENT TAGS</span>
            </div>
            <div class="ak-tags-list">
              <span
                v-for="tag in operator.tagList"
                :key="tag"
                class="ak-tag-pill"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Skills Summary -->
          <div v-if="operator.skills && operator.skills.length > 0" class="ak-dossier-section">
            <div class="ak-section-header">
              <span class="ak-section-title">COMBAT SKILLS ({{ operator.skills.length }})</span>
            </div>
            <div class="ak-skills-grid">
              <div
                v-for="(sk, sIdx) in operator.skills"
                :key="sk.skillId || sIdx"
                class="ak-skill-card"
              >
                <span class="ak-skill-card__badge">S{{ sIdx + 1 }}</span>
                <span class="ak-skill-card__name">{{ sk.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer Actions -->
      <div class="ak-modal-box__foot">
        <button
          type="button"
          class="ak-btn-dismiss"
          @click="emit('close')"
        >
          ЗАКРЫТЬ
        </button>
        <button
          type="button"
          class="ak-btn-planner-jump"
          @click="goToPlanner"
        >
          <span>РАССЧИТАТЬ В ПЛАНИРОВЩИКЕ ПРОКАЧКИ</span>
          <span class="ak-btn-arrow">➜</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.ak-modal-box {
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  background: rgba($ak-bg-secondary, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-top: 3px solid var(--rarity-theme, #00d4ff);
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(var(--rarity-theme), 0.2);
  clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%);
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__tag {
    font-size: 0.65rem;
    font-family: monospace;
    color: var(--rarity-theme, $ak-cyan);
    letter-spacing: 2px;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0.2rem 0 0;
    color: #fff;
    letter-spacing: 0.5px;
  }

  &__close {
    background: transparent;
    border: none;
    color: $ak-text-muted;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.2rem 0.5rem;
    transition: color 0.2s ease;

    &:hover {
      color: $ak-red;
    }
  }

  &__body {
    padding: 1.5rem;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &__foot {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.35);
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Visual Left Column
.ak-dossier-visual {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ak-dossier-portrait {
  width: 100%;
  aspect-ratio: 1;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  overflow: hidden;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__rarity {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.85);
    color: #ffc400;
    text-align: center;
    font-size: 0.75rem;
    letter-spacing: 2px;
    padding: 0.2rem 0;
  }
}

.ak-dossier-badges {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ak-badge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.55rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-family: monospace;
  font-size: 0.72rem;

  &__k {
    color: $ak-text-muted;
  }

  &__v {
    color: $ak-text-primary;
  }
}

// Right Content Column
.ak-dossier-content {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.ak-dossier-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.ak-section-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ak-section-title {
  font-size: 0.65rem;
  font-family: monospace;
  font-weight: 800;
  color: $ak-cyan;
  letter-spacing: 1.5px;
}

.ak-id-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ak-id-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  font-size: 0.72rem;

  code {
    color: #f3e8ff;
  }
}

.ak-id-label {
  color: $ak-text-muted;
}

.ak-dossier-desc {
  font-size: 0.85rem;
  color: $ak-text-primary;
  line-height: 1.45;
  margin: 0;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.6rem 0.8rem;
  border-left: 2px solid $ak-cyan;
}

.ak-dossier-quote {
  margin: 0;
  font-size: 0.82rem;
  color: $ak-text-secondary;
  font-style: italic;
  line-height: 1.45;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.6rem 0.8rem;
  border-left: 2px solid #a855f7;
}

.ak-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ak-tag-pill {
  padding: 0.2rem 0.55rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: monospace;
  font-size: 0.72rem;
}

.ak-skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.4rem;
}

.ak-skill-card {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.55rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);

  &__badge {
    font-size: 0.68rem;
    font-weight: 800;
    font-family: monospace;
    background: $ak-cyan;
    color: #000;
    padding: 0.05rem 0.3rem;
  }

  &__name {
    font-size: 0.75rem;
    color: $ak-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Action Buttons
.ak-btn-dismiss {
  padding: 0.55rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.4);
  }
}

.ak-btn-planner-jump {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: rgba($ak-cyan, 0.15);
  border: 1px solid $ak-cyan;
  color: $ak-cyan;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $ak-cyan;
    color: #000;
    box-shadow: 0 0 14px rgba($ak-cyan, 0.4);
  }

  .ak-btn-arrow {
    font-weight: 800;
  }
}
</style>
