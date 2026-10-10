<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
  <!-- Global PRTS Terminal Toast Notifications -->
  <AppToastContainer />
  <!-- PWA Install, Update & Offline Status Notifications -->
  <PwaPrompt />
</template>
