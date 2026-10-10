<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'

withDefaults(
  defineProps<{
    rows?: number
  }>(),
  {
    rows: 4,
  }
)
</script>

<template>
  <div class="ak-farming-skeleton-table">
    <div
      v-for="r in rows"
      :key="r"
      class="ak-farming-skeleton-row"
    >
      <!-- Material Cell -->
      <div class="ak-fs-cell ak-fs-cell--mat">
        <AppSkeleton width="36px" height="36px" rounded />
        <div class="ak-fs-meta">
          <AppSkeleton width="100px" height="0.85rem" variant="text" />
          <AppSkeleton width="60px" height="0.65rem" variant="text" />
        </div>
      </div>

      <!-- Stage Cell -->
      <div class="ak-fs-cell ak-fs-cell--stage">
        <AppSkeleton width="80px" height="26px" rounded />
      </div>

      <!-- Rate Cell -->
      <div class="ak-fs-cell ak-fs-cell--rate">
        <AppSkeleton width="50px" height="0.85rem" variant="text" />
        <AppSkeleton width="70px" height="0.65rem" variant="text" />
      </div>

      <!-- Ratio Cell -->
      <div class="ak-fs-cell ak-fs-cell--ratio">
        <AppSkeleton width="65px" height="0.95rem" variant="text" />
      </div>

      <!-- Runs Cell -->
      <div class="ak-fs-cell ak-fs-cell--runs">
        <AppSkeleton width="55px" height="0.85rem" variant="text" />
      </div>

      <!-- Cost Cell -->
      <div class="ak-fs-cell ak-fs-cell--cost">
        <AppSkeleton width="70px" height="0.85rem" variant="text" />
      </div>

      <!-- Alt Cell -->
      <div class="ak-fs-cell ak-fs-cell--alt">
        <AppSkeleton width="50px" height="22px" rounded />
        <AppSkeleton width="50px" height="22px" rounded />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-farming-skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.ak-farming-skeleton-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.ak-fs-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;

  &--mat {
    flex: 2;
    min-width: 160px;
  }

  &--stage {
    flex: 1.2;
    min-width: 90px;
  }

  &--rate {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  &--ratio {
    flex: 1;
  }

  &--runs {
    flex: 1;
  }

  &--cost {
    flex: 1;
  }

  &--alt {
    flex: 1.5;
    gap: 0.35rem;
  }
}

.ak-fs-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
