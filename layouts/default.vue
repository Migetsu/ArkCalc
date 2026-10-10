<script setup lang="ts">
import AppNavbar from '~/components/AppNavbar.vue'
</script>

<template>
  <div class="ak-layout">
    <!-- Navigation Bar -->
    <AppNavbar />

    <!-- Main Content Area -->
    <main class="ak-layout__main">
      <div class="ak-layout__container">
        <slot />
      </div>
    </main>

    <!-- PRTS Terminal Footer -->
    <footer class="ak-footer">
      <div class="ak-footer__container">
        <div class="ak-footer__left">
          <span class="ak-footer__org">RHODES ISLAND PHARMACEUTICAL SERVICES</span>
          <span class="ak-footer__tag">PRTS SYSTEM TERMINAL // SEC_LEVEL: 04</span>
        </div>
        <div class="ak-footer__right">
          <span class="ak-footer__indicator" />
          <span class="ak-footer__status">SYSTEM STATUS: OPTIMAL</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
.ak-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $ak-bg-main;
  color: $ak-text-primary;
  position: relative;
  overflow-x: hidden;

  // Background subtle tech grid
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  &__main {
    flex: 1;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 2rem 1.5rem;
    flex: 1;
  }
}

.ak-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 14, 16, 0.95);
  padding: 1.25rem 0;
  font-family: monospace;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  &__left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__org {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: $ak-text-secondary;
  }

  &__tag {
    font-size: 0.65rem;
    color: $ak-text-muted;
    letter-spacing: 1px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: $ak-cyan;
    box-shadow: 0 0 6px rgba($ak-cyan, 0.8);
  }

  &__status {
    font-size: 0.7rem;
    letter-spacing: 1px;
    color: $ak-cyan;
  }
}
</style>
