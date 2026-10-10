<script setup lang="ts">
useHead({
  title: 'Planner // ArkCalc',
})
</script>

<template>
  <div class="ak-page">
    <div class="ak-page__header">
      <span class="ak-page__tag">MODULE // PLN-01</span>
      <h1 class="ak-page__title">Operator Promotion Planner</h1>
      <p class="ak-page__desc">Plan operator elite promotions, skill levels, masteries, and modules.</p>
    </div>

    <div class="ak-page__content">
      <div class="ak-placeholder-card">
        <div class="ak-placeholder-card__icon">📋</div>
        <h2>Planner Module Ready</h2>
        <p>Select operators to calculate required elite materials, EXP, LMD, and farming sanity.</p>
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
    color: $ak-cyan;
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
    color: $ak-cyan;
    margin: 0;
  }

  p {
    color: $ak-text-secondary;
    max-width: 500px;
    margin: 0;
  }
}
</style>
