<script setup lang="ts">
import BannerTimeline from '~/components/BannerTimeline.vue'

useHead({
  title: 'Gacha & Banner Timeline // ArkCalc',
})
</script>

<template>
  <div class="ak-page">
    <div class="ak-page__header">
      <span class="ak-page__tag">MODULE // GCH-02</span>
      <h1 class="ak-page__title">Headhunting & Banner Timeline</h1>
      <p class="ak-page__desc">
        Track upcoming CN banners, calculate estimated Global release dates with 175-day offset, and plan sparks.
      </p>
    </div>

    <div class="ak-page__content">
      <BannerTimeline :initial-offset-days="175" />
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
    gap: 0.5rem;
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
  }
}
</style>
