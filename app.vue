<template>
  <div class="ark-app">
    <NuxtRouteAnnouncer />
    <main class="ark-main">
      <h1>ArkCalc</h1>
      <p class="ark-subtitle">Arknights Calculator & Planner</p>
    </main>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  background-color: $ak-bg-main;
  color: $ak-text-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.ark-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.ark-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  h1 {
    color: $ak-cyan;
    font-size: 2.5rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .ark-subtitle {
    color: $ak-text-secondary;
    font-size: 1rem;
    letter-spacing: 1px;
  }
}
</style>
