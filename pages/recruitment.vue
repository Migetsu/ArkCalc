<script setup lang="ts">
import RecruitmentCalculator from '~/components/RecruitmentCalculator.vue'

useSeoMeta({
  title: 'Матрица рекрутинга (Теги) // ArkCalc',
  ogTitle: 'Калькулятор открытого найма (Recruitment) Arknights // ArkCalc PRTS',
  description: 'Калькулятор тегов найма Arknights: мгновенный подбор комбинаций для гарантированных 4★, 5★ Senior Operator и 6★ Top Operator без риска потери тегов.',
  ogDescription: 'Калькулятор тегов найма Arknights: расчет комбинаций для гарантированных 4★, 5★ и 6★ Top Operator.',
  ogImage: '/images/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Калькулятор рекрутинга Arknights // ArkCalc',
  twitterDescription: 'Гарантированные комбинации тегов для 4★, 5★ и 6★ Top Operator в Arknights.',
  twitterImage: '/images/og-image.png',
})
</script>

<template>
  <div class="ak-page">
    <div class="ak-page__header">
      <span class="ak-page__tag">MODULE // RCR-03</span>
      <h1 class="ak-page__title">Public Recruitment Calculator</h1>
      <p class="ak-page__desc">Select recruitment tags to find guaranteed 4★, 5★, and Top Operator combinations.</p>
    </div>

    <div class="ak-page__content">
      <RecruitmentCalculator />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__tag {
    font-size: 0.7rem;
    font-family: monospace;
    color: $ak-yellow;
    letter-spacing: 2px;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0;
    color: $ak-text-primary;
    line-height: 1.15;

    @media (min-width: 640px) {
      font-size: 1.75rem;
    }

    @media (min-width: 1024px) {
      font-size: 2rem;
    }
  }

  &__desc {
    color: $ak-text-secondary;
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.4;

    @media (min-width: 768px) {
      font-size: 0.95rem;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
  }
}
</style>
