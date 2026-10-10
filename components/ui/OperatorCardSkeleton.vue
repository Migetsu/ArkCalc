<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'

withDefaults(
  defineProps<{
    count?: number
  }>(),
  {
    count: 8,
  }
)
</script>

<template>
  <div class="ak-op-grid-skeleton">
    <div
      v-for="i in count"
      :key="i"
      class="ak-op-skeleton-card"
    >
      <div class="ak-op-skeleton-card__top">
        <AppSkeleton width="48px" height="48px" rounded />
        <div class="ak-op-skeleton-card__meta">
          <AppSkeleton width="70%" height="0.85rem" variant="text" />
          <AppSkeleton width="45%" height="0.65rem" variant="text" />
          <AppSkeleton width="30%" height="0.6rem" variant="text" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-op-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.65rem;
}

.ak-op-skeleton-card {
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;

  &__top {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  &__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
}
</style>
