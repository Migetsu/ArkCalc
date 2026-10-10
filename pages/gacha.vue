<script setup lang="ts">
import { ref } from 'vue'
import BannerTimeline from '~/components/BannerTimeline.vue'
import GachaCalculator from '~/components/GachaCalculator.vue'

useHead({
  title: 'Gacha & Banner Timeline // ArkCalc',
})

const activeTab = ref<'calculator' | 'timeline'>('calculator')
</script>

<template>
  <div class="ak-page">
    <div class="ak-page__header">
      <span class="ak-page__tag">MODULE // GCH-02</span>
      <h1 class="ak-page__title">Headhunting & Spark Planner</h1>
      <p class="ak-page__desc">
        Project your gacha resources, calculate spark margins, and track upcoming CN banners with a 175-day Global offset.
      </p>

      <!-- Module Sub-Tabs -->
      <div class="ak-tabs">
        <button
          type="button"
          class="ak-tab-btn"
          :class="{ 'ak-tab-btn--active': activeTab === 'calculator' }"
          @click="activeTab = 'calculator'"
        >
          <span class="ak-tab-btn__code">01</span>
          PULL CALCULATOR
        </button>
        <button
          type="button"
          class="ak-tab-btn"
          :class="{ 'ak-tab-btn--active': activeTab === 'timeline' }"
          @click="activeTab = 'timeline'"
        >
          <span class="ak-tab-btn__code">02</span>
          BANNER TIMELINE
        </button>
      </div>
    </div>

    <div class="ak-page__content">
      <keep-alive>
        <GachaCalculator v-if="activeTab === 'calculator'" />
        <BannerTimeline v-else :initial-offset-days="175" />
      </keep-alive>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__tag {
    font-size: 0.7rem;
    font-family: monospace;
    color: $ak-amber;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 2.2rem;
    font-weight: 800;
    margin: 0;
    color: $ak-text-primary;
  }

  &__desc {
    color: $ak-text-secondary;
    margin: 0;
    max-width: 750px;
    line-height: 1.45;
  }
}

.ak-tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.5rem;
}

.ak-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: $ak-text-secondary;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);

  &__code {
    font-size: 0.65rem;
    color: $ak-text-muted;
  }

  &:hover {
    color: $ak-text-primary;
    background: rgba(255, 255, 255, 0.06);
  }

  &--active {
    background: rgba($ak-amber, 0.12);
    color: $ak-amber;
    border-color: rgba($ak-amber, 0.5);

    .ak-tab-btn__code {
      color: $ak-amber;
    }
  }
}
</style>
