<script setup lang="ts">
useHead({
  title: 'Recruitment // ArkCalc',
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
      <div class="ak-placeholder-card">
        <div class="ak-placeholder-card__icon">🎯</div>
        <h2>Recruitment Calculator Ready</h2>
        <p>Input available tags to calculate possible operator outcomes and guarantee thresholds without tag dropping.</p>
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
    color: $ak-yellow;
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
    color: $ak-yellow;
    margin: 0;
  }

  p {
    color: $ak-text-secondary;
    max-width: 500px;
    margin: 0;
  }
}
</style>
