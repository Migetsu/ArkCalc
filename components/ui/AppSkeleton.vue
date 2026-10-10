<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    variant?: 'text' | 'rect' | 'circle' | 'card'
    shimmer?: boolean
    rounded?: boolean
  }>(),
  {
    width: '100%',
    height: '1rem',
    variant: 'rect',
    shimmer: true,
    rounded: false,
  }
)
</script>

<template>
  <div
    class="ak-skeleton"
    :class="[
      `ak-skeleton--${variant}`,
      {
        'ak-skeleton--shimmer': shimmer,
        'ak-skeleton--rounded': rounded,
      },
    ]"
    :style="{
      width: width,
      height: height,
    }"
    aria-hidden="true"
  />
</template>

<style lang="scss" scoped>
.ak-skeleton {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  display: block;

  &--rounded {
    border-radius: 4px;
  }

  &--circle {
    border-radius: 50%;
  }

  &--card {
    border-radius: 4px;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  }

  &--text {
    border-radius: 2px;
    margin-bottom: 0.25rem;
  }

  &--shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba($ak-cyan, 0.08) 50%,
      transparent 100%
    );
    animation: ak-shimmer 1.6s infinite ease-in-out;
  }
}

@keyframes ak-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
