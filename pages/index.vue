<script setup lang="ts">
useHead({
  title: 'ArkCalc // PRTS Terminal',
})

const tools = [
  {
    title: 'Planner',
    code: 'PLN-01',
    description: 'Calculate operator promotion costs, materials, and Sanity requirements.',
    path: '/planner',
    accent: 'cyan',
  },
  {
    title: 'Gacha Calculator',
    code: 'GCH-02',
    description: 'Simulate headhunting probability, spark planning, and banner tracking.',
    path: '/gacha',
    accent: 'amber',
  },
  {
    title: 'Recruitment',
    code: 'RCR-03',
    description: 'Calculate guaranteed 4★, 5★, and Top Operator recruitment tag combinations.',
    path: '/recruitment',
    accent: 'yellow',
  },
  {
    title: 'Inventory',
    code: 'INV-04',
    description: 'Track materials, currencies, and farming targets synchronized with Penguin Stats.',
    path: '/inventory',
    accent: 'green',
  },
]
</script>

<template>
  <div class="ak-home">
    <!-- Header banner -->
    <section class="ak-banner">
      <div class="ak-banner__badge">SYSTEM STATUS: ALL OPERATIONAL</div>
      <h1 class="ak-banner__title">ARKCALC</h1>
      <p class="ak-banner__desc">
        Tactical Calculation and Resource Planning Terminal for Rhodes Island Operators.
      </p>
    </section>

    <!-- Navigation Cards Grid -->
    <section class="ak-grid">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.path"
        :to="tool.path"
        class="ak-card"
        :class="`ak-card--${tool.accent}`"
      >
        <div class="ak-card__header">
          <span class="ak-card__code">{{ tool.code }}</span>
          <span class="ak-card__arrow">→</span>
        </div>
        <h2 class="ak-card__title">{{ tool.title }}</h2>
        <p class="ak-card__desc">{{ tool.description }}</p>
        <div class="ak-card__footer">
          <span>INITIALIZE MODULE</span>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.ak-home {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.ak-banner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__badge {
    align-self: flex-start;
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
    font-family: monospace;
    letter-spacing: 1.5px;
    background: rgba($ak-cyan, 0.1);
    color: $ak-cyan;
    border-left: 2px solid $ak-cyan;
  }

  &__title {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 2px;
    margin: 0;
    color: $ak-text-primary;
    line-height: 1.05;

    @media (min-width: 640px) {
      font-size: 2.5rem;
      letter-spacing: 2.5px;
    }

    @media (min-width: 1024px) {
      font-size: 3rem;
      letter-spacing: 3px;
    }
  }

  &__desc {
    font-size: 0.95rem;
    color: $ak-text-secondary;
    max-width: 600px;
    margin: 0;
    line-height: 1.45;

    @media (min-width: 768px) {
      font-size: 1.1rem;
      line-height: 1.5;
    }
  }
}

.ak-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.ak-card {
  position: relative;
  background: rgba(26, 26, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.25s ease;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);

  &:hover {
    transform: translateY(-2px);
    background: rgba(36, 37, 42, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &--cyan:hover {
    border-color: rgba($ak-cyan, 0.5);
    box-shadow: 0 4px 20px rgba($ak-cyan, 0.15);
  }

  &--amber:hover {
    border-color: rgba($ak-amber, 0.5);
    box-shadow: 0 4px 20px rgba($ak-amber, 0.15);
  }

  &--yellow:hover {
    border-color: rgba($ak-yellow, 0.5);
    box-shadow: 0 4px 20px rgba($ak-yellow, 0.15);
  }

  &--green:hover {
    border-color: rgba($ak-green, 0.5);
    box-shadow: 0 4px 20px rgba($ak-green, 0.15);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: monospace;
    font-size: 0.75rem;
    color: $ak-text-muted;
  }

  &__arrow {
    font-size: 1.1rem;
    transition: transform 0.2s ease;
  }

  &:hover &__arrow {
    transform: translateX(4px);
    color: $ak-cyan;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 1px;
    margin: 0;
    color: $ak-text-primary;
  }

  &__desc {
    font-size: 0.9rem;
    color: $ak-text-secondary;
    margin: 0;
    line-height: 1.4;
    flex: 1;
  }

  &__footer {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
    font-family: monospace;
    font-size: 0.7rem;
    letter-spacing: 1px;
    color: $ak-cyan;
  }
}
</style>
