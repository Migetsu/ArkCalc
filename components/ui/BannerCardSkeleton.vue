<script setup lang="ts">
import AppSkeleton from './AppSkeleton.vue'
</script>

<template>
  <div class="ak-banner-skeleton">
    <!-- Art Placeholder -->
    <AppSkeleton height="120px" variant="rect" rounded />

    <!-- Countdown Timer Skeleton -->
    <div class="ak-banner-skeleton__timer">
      <AppSkeleton width="45%" height="0.65rem" variant="text" />
      <div class="ak-banner-skeleton__digits">
        <AppSkeleton width="45px" height="32px" rounded />
        <AppSkeleton width="45px" height="32px" rounded />
        <AppSkeleton width="45px" height="32px" rounded />
        <AppSkeleton width="45px" height="32px" rounded />
      </div>
    </div>

    <!-- Rate-up Operators Skeleton -->
    <div class="ak-banner-skeleton__ops">
      <AppSkeleton width="90px" height="28px" rounded />
      <AppSkeleton width="90px" height="28px" rounded />
      <AppSkeleton width="90px" height="28px" rounded />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ak-banner-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;

  &__timer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  &__digits {
    display: flex;
    gap: 0.5rem;
  }

  &__ops {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
