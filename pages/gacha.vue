<script setup lang="ts">
useHead({
  title: 'Gacha Calculator // ArkCalc',
})
</script>

<template>
  <div class="ak-page">
    <div class="ak-page__header">
      <span class="ak-page__tag">MODULE // GCH-02</span>
      <h1 class="ak-page__title">Headhunting & Spark Calculator</h1>
      <p class="ak-page__desc">Simulate gacha pulls, calculate 300-spark safety margins, and evaluate pull odds.</p>
    </div>

    <div class="ak-page__content">
      <div class="ak-placeholder-card">
        <div class="ak-placeholder-card__icon">💎</div>
        <h2>Headhunting Module Ready</h2>
        <p>Calculate pulls from Orundum, Originite Prime, and Headhunting Permits with pity rate curve simulation.</p>
      </div>
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
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    color: $ak-text-primary;
  }

  &__desc {
    color: $ak-text-secondary;
    margin: 0;
  }
}

.ak-placeholder-card {
  background: rgba(26, 26, 30, 0.6);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &__icon {
    font-size: 3rem;
  }

  h2 {
    color: $ak-amber;
    margin: 0;
  }

  p {
    color: $ak-text-secondary;
    max-width: 500px;
    margin: 0;
  }
}
</style>
