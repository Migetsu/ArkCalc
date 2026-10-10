<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '~/stores/userStore'
import AccountSyncModal from '~/components/AccountSyncModal.vue'

const userStore = useUserStore()
const route = useRoute()

const isSidebarOpen = ref(false)
const isSyncModalOpen = ref(false)

const navLinks = [
  {
    name: 'Dashboard',
    path: '/',
    code: 'DSH-00',
    desc: 'Central command, countdowns & treasury',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Operator Planner',
    path: '/planner',
    code: 'PLN-01',
    desc: 'Promotion costs, mastery & farming deltas',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    name: 'Gacha Calculator',
    path: '/gacha',
    code: 'GCH-02',
    desc: 'Spark projections, timeline & CN schedule',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    name: 'Recruitment Matrix',
    path: '/recruitment',
    code: 'RCR-03',
    desc: 'Top Operator & guaranteed 4★/5★ tag combos',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7',
  },
  {
    name: 'Depot Inventory',
    path: '/inventory',
    code: 'INV-04',
    desc: 'Material stock, chips & Penguin Stats data',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    name: 'Settings',
    path: '/settings',
    code: 'SET-05',
    desc: 'Theme toggles, local cache & data reset',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openSyncModal = () => {
  isSidebarOpen.value = false
  isSyncModalOpen.value = true
}

// Automatically close drawer on route transition
watch(
  () => route.path,
  () => {
    closeSidebar()
  }
)

// Handle Escape key and body scroll lock
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isSidebarOpen.value) {
    closeSidebar()
  }
}

watch(isSidebarOpen, (open) => {
  if (typeof document !== 'undefined') {
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeyDown)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeyDown)
  }
})
</script>

<template>
  <header class="ak-navbar">
    <div class="ak-navbar__container">
      <!-- Brand Logo / Terminal ID -->
      <NuxtLink to="/" class="ak-navbar__brand" @click="closeSidebar">
        <div class="ak-navbar__logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" class="ak-icon">
            <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11.5h-13L12 6.5z" />
          </svg>
        </div>
        <div class="ak-navbar__brand-text">
          <span class="ak-navbar__title">ARKCALC</span>
          <span class="ak-navbar__subtitle">PRTS.SYSTEM // v4</span>
        </div>
      </NuxtLink>

      <!-- Right Header Actions (Doctor Card, Sync, Tactical Menu Button) -->
      <div class="ak-navbar__actions">
        <!-- Quick Doctor Status Card -->
        <button
          type="button"
          class="ak-status-card"
          title="Click to synchronize Arknights account"
          @click="openSyncModal"
        >
          <div
            class="ak-status-card__indicator"
            :class="{ 'ak-status-card__indicator--synced': userStore.isSynced }"
          />
          <div class="ak-status-card__meta">
            <span class="ak-status-card__name">{{ userStore.profile.username || 'Doctor' }}</span>
            <span class="ak-status-card__sub">
              LV.{{ userStore.profile.level || 1 }} [{{ userStore.profile.server || 'EN' }}]
            </span>
          </div>
        </button>

        <!-- Quick Sync Button -->
        <button
          type="button"
          class="ak-btn-sync"
          title="PRTS Account Synchronization"
          @click="openSyncModal"
        >
          <svg class="ak-btn-sync__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="ak-btn-sync__label">SYNC</span>
        </button>

        <!-- PRTS Tactical Burger / Off-canvas Menu Button -->
        <button
          type="button"
          class="ak-btn-menu"
          :class="{ 'ak-btn-menu--active': isSidebarOpen }"
          aria-label="Toggle tactical navigation sidebar"
          @click="toggleSidebar"
        >
          <div class="ak-btn-menu__icon-box">
            <span class="ak-bar ak-bar--1" />
            <span class="ak-bar ak-bar--2" />
            <span class="ak-bar ak-bar--3" />
          </div>
          <span class="ak-btn-menu__label">MENU</span>
        </button>
      </div>
    </div>

    <!-- Right-Side Sliding Tactical Sidebar -->
    <ClientOnly>
      <Teleport to="body">
        <!-- Backdrop Overlay -->
        <transition name="ak-sidebar-backdrop">
          <div
            v-if="isSidebarOpen"
            class="ak-sidebar-backdrop"
            aria-hidden="true"
            @click="closeSidebar"
          />
        </transition>

        <!-- Sidebar Drawer Panel -->
        <transition name="ak-sidebar-drawer">
          <aside
            v-if="isSidebarOpen"
            class="ak-sidebar-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Tactical Navigation Terminal"
          >
            <!-- Drawer Header / HUD bar -->
            <div class="ak-sidebar-drawer__header">
              <div class="ak-sidebar-drawer__brand">
                <span class="ak-sidebar-drawer__tag">PRTS // TACTICAL HUD</span>
                <h2 class="ak-sidebar-drawer__title">NAVIGATION</h2>
              </div>
              <button
                type="button"
                class="ak-sidebar-drawer__close"
                aria-label="Close menu"
                @click="closeSidebar"
              >
                <span class="ak-close-text">CLOSE</span>
                <span class="ak-close-icon">✕</span>
              </button>
            </div>

            <!-- Doctor Profile HUD Box inside Sidebar -->
            <div class="ak-sidebar-profile">
              <div class="ak-sidebar-profile__avatar-box">
                <img
                  v-if="userStore.profile.avatar_url"
                  :src="userStore.profile.avatar_url"
                  :alt="userStore.profile.username"
                  class="ak-sidebar-profile__avatar"
                  loading="lazy"
                  decoding="async"
                />
                <span v-else class="ak-sidebar-profile__avatar-fallback">DR</span>
                <span
                  class="ak-sidebar-profile__status-dot"
                  :class="{ 'ak-sidebar-profile__status-dot--synced': userStore.isSynced }"
                />
              </div>
              <div class="ak-sidebar-profile__info">
                <div class="ak-sidebar-profile__name-row">
                  <span class="ak-sidebar-profile__name">{{ userStore.profile.username || 'Doctor' }}</span>
                  <span class="ak-sidebar-profile__badge">LV.{{ userStore.profile.level || 1 }}</span>
                </div>
                <span class="ak-sidebar-profile__server">
                  SERVER: {{ userStore.profile.server || 'EN' }} // {{ userStore.isSynced ? 'SYNCED' : 'OFFLINE' }}
                </span>
              </div>
              <button
                type="button"
                class="ak-sidebar-profile__sync-btn"
                title="Open Account Synchronization"
                @click="openSyncModal"
              >
                SYNC
              </button>
            </div>

            <!-- Tactical Navigation Links -->
            <nav class="ak-sidebar-nav">
              <div class="ak-sidebar-nav__head">
                <span class="ak-sidebar-nav__label">TACTICAL MODULES</span>
                <span class="ak-sidebar-nav__count">0{{ navLinks.length }}</span>
              </div>
              <div class="ak-sidebar-nav__list">
                <NuxtLink
                  v-for="link in navLinks"
                  :key="link.path"
                  :to="link.path"
                  class="ak-sidebar-link"
                  active-class="ak-sidebar-link--active"
                  @click="closeSidebar"
                >
                  <div class="ak-sidebar-link__visual">
                    <div class="ak-sidebar-link__icon-box">
                      <svg class="ak-sidebar-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
                      </svg>
                    </div>
                  </div>
                  <div class="ak-sidebar-link__body">
                    <div class="ak-sidebar-link__title-row">
                      <span class="ak-sidebar-link__name">{{ link.name }}</span>
                      <span class="ak-sidebar-link__code">{{ link.code }}</span>
                    </div>
                    <span class="ak-sidebar-link__desc">{{ link.desc }}</span>
                  </div>
                  <div class="ak-sidebar-link__arrow">
                    <span>→</span>
                  </div>
                </NuxtLink>
              </div>
            </nav>

            <!-- Terminal System Diagnostics Footer -->
            <div class="ak-sidebar-footer">
              <div class="ak-sidebar-footer__diag">
                <span class="ak-sidebar-footer__item">
                  <span class="ak-diag-dot" /> PRTS KERNEL v4.12
                </span>
                <span class="ak-sidebar-footer__item">
                  STATUS: OPTIMAL
                </span>
              </div>
              <p class="ak-sidebar-footer__sub">
                RHODES ISLAND PHARMACEUTICAL SERVICES // SEC_04
              </p>
            </div>
          </aside>
        </transition>
      </Teleport>
    </ClientOnly>

    <!-- Account Sync Modal -->
    <AccountSyncModal v-model="isSyncModalOpen" />
  </header>
</template>

<style lang="scss" scoped>
.ak-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(18, 18, 20, 0.9);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba($ak-cyan, 0.4) 20%,
      rgba($ak-cyan, 0.8) 50%,
      rgba($ak-cyan, 0.4) 80%,
      transparent 100%
    );
  }

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;

    @media (min-width: 768px) {
      padding: 0 1.5rem;
      height: 64px;
      gap: 1.5rem;
    }
  }

  // Brand
  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: inherit;
    transition: opacity 0.2s ease;
    flex-shrink: 0;

    &:hover {
      opacity: 0.85;
    }

    @media (min-width: 768px) {
      gap: 0.75rem;
    }
  }

  &__logo-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($ak-cyan, 0.12);
    border: 1px solid rgba($ak-cyan, 0.4);
    color: $ak-cyan;
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);

    .ak-icon {
      width: 18px;
      height: 18px;
    }

    @media (min-width: 768px) {
      width: 36px;
      height: 36px;

      .ak-icon {
        width: 20px;
        height: 20px;
      }
    }
  }

  &__brand-text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: $ak-text-primary;
    line-height: 1.1;

    @media (min-width: 768px) {
      font-size: 1.2rem;
      letter-spacing: 2px;
    }
  }

  &__subtitle {
    font-size: 0.55rem;
    letter-spacing: 1px;
    color: $ak-cyan;
    font-family: monospace;

    @media (min-width: 768px) {
      font-size: 0.65rem;
      letter-spacing: 1.5px;
    }
  }

  // Right Header Actions
  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (min-width: 768px) {
      gap: 0.85rem;
    }
  }
}

// Doctor Status Card
.ak-status-card {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.55rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  @media (min-width: 768px) {
    padding: 0.35rem 0.75rem;
    gap: 0.6rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba($ak-cyan, 0.4);
  }

  &__indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: $ak-amber;
    box-shadow: 0 0 6px rgba($ak-amber, 0.8);

    &--synced {
      background-color: $ak-green;
      box-shadow: 0 0 6px rgba($ak-green, 0.8);
    }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  &__name {
    font-size: 0.72rem;
    font-weight: 700;
    color: $ak-text-primary;
    max-width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (min-width: 640px) {
      max-width: 120px;
    }

    @media (min-width: 768px) {
      font-size: 0.76rem;
      max-width: none;
    }
  }

  &__sub {
    font-size: 0.58rem;
    color: $ak-text-muted;

    @media (min-width: 768px) {
      font-size: 0.64rem;
    }
  }
}

// Sync Button
.ak-btn-sync {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  background: rgba($ak-cyan, 0.1);
  border: 1px solid rgba($ak-cyan, 0.35);
  color: $ak-cyan;
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));

  @media (min-width: 768px) {
    padding: 0.38rem 0.75rem;
    font-size: 0.75rem;
    letter-spacing: 1px;
    gap: 0.4rem;
  }

  &__icon {
    width: 13px;
    height: 13px;

    @media (min-width: 768px) {
      width: 14px;
      height: 14px;
    }
  }

  &__label {
    display: none;

    @media (min-width: 520px) {
      display: inline;
    }
  }

  &:hover {
    background: $ak-cyan;
    color: #000;
    box-shadow: 0 0 10px rgba($ak-cyan, 0.5);
  }
}

// PRTS Tactical Burger / Menu Trigger Button
.ak-btn-menu {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.65rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: $ak-text-primary;
  cursor: pointer;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));

  @media (min-width: 768px) {
    padding: 0.38rem 0.85rem;
    font-size: 0.76rem;
    gap: 0.55rem;
  }

  &__icon-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 16px;
    height: 13px;

    @media (min-width: 768px) {
      width: 18px;
      height: 14px;
    }
  }

  .ak-bar {
    display: block;
    width: 100%;
    height: 2px;
    background-color: $ak-cyan;
    border-radius: 1px;
    transition: transform 0.2s ease, opacity 0.2s ease;

    &--1 { width: 100%; }
    &--2 { width: 75%; }
    &--3 { width: 100%; }
  }

  &__label {
    display: none;

    @media (min-width: 480px) {
      display: inline;
    }
  }

  &:hover {
    background: rgba($ak-cyan, 0.15);
    border-color: $ak-cyan;
    color: $ak-cyan;
    box-shadow: 0 0 10px rgba($ak-cyan, 0.3);

    .ak-bar {
      background-color: #fff;
      &--2 { width: 100%; }
    }
  }

  &--active {
    background: rgba($ak-cyan, 0.2);
    border-color: $ak-cyan;
    color: $ak-cyan;
    box-shadow: 0 0 12px rgba($ak-cyan, 0.4);

    .ak-bar--1 {
      transform: translateY(5.5px) rotate(45deg);
    }
    .ak-bar--2 {
      opacity: 0;
    }
    .ak-bar--3 {
      transform: translateY(-5.5px) rotate(-45deg);
    }
  }
}

// -----------------------------------------------------------------------------
// Right-Side Sliding Tactical Sidebar
// -----------------------------------------------------------------------------
.ak-sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
}

.ak-sidebar-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  width: 100%;
  max-width: 380px;
  background: rgba(16, 17, 20, 0.96);
  backdrop-filter: blur(18px);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  outline: none;

  // Cyber edge accent
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      $ak-cyan 15%,
      rgba($ak-cyan, 0.8) 50%,
      $ak-cyan 85%,
      transparent 100%
    );
  }

  // Header
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.25);
  }

  &__brand {
    display: flex;
    flex-direction: column;
  }

  &__tag {
    font-size: 0.6rem;
    font-family: monospace;
    color: $ak-cyan;
    letter-spacing: 1.5px;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 800;
    color: $ak-text-primary;
    letter-spacing: 2px;
    margin: 0;
  }

  &__close {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: $ak-text-secondary;
    font-family: monospace;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($ak-red, 0.18);
      border-color: $ak-red;
      color: $ak-red;
      box-shadow: 0 0 8px rgba($ak-red, 0.4);
    }
  }
}

// Doctor Profile Card inside Sidebar
.ak-sidebar-profile {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin: 1rem 1.25rem;
  padding: 0.85rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);

  &__avatar-box {
    position: relative;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  &__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba($ak-cyan, 0.15);
    border: 1px solid rgba($ak-cyan, 0.4);
    color: $ak-cyan;
    font-family: monospace;
    font-size: 0.9rem;
    font-weight: 800;
  }

  &__status-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $ak-amber;
    border: 2px solid #101114;
    box-shadow: 0 0 6px rgba($ak-amber, 0.8);

    &--synced {
      background: $ak-green;
      box-shadow: 0 0 6px rgba($ak-green, 0.8);
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__name {
    font-size: 0.85rem;
    font-weight: 700;
    color: $ak-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__badge {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-cyan;
    background: rgba($ak-cyan, 0.12);
    padding: 0.1rem 0.35rem;
    border: 1px solid rgba($ak-cyan, 0.3);
  }

  &__server {
    font-size: 0.62rem;
    font-family: monospace;
    color: $ak-text-muted;
  }

  &__sync-btn {
    padding: 0.35rem 0.65rem;
    background: rgba($ak-cyan, 0.12);
    border: 1px solid $ak-cyan;
    color: $ak-cyan;
    font-family: monospace;
    font-size: 0.68rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $ak-cyan;
      color: #000;
      box-shadow: 0 0 8px rgba($ak-cyan, 0.5);
    }
  }
}

// Tactical Navigation Section
.ak-sidebar-nav {
  flex: 1;
  padding: 0.5rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__label {
    font-size: 0.65rem;
    font-family: monospace;
    font-weight: 700;
    color: $ak-text-muted;
    letter-spacing: 1.5px;
  }

  &__count {
    font-size: 0.65rem;
    font-family: monospace;
    color: $ak-cyan;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

// Sidebar Links
.ak-sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 3px solid transparent;
  color: $ak-text-secondary;
  text-decoration: none;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);

  &__visual {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  &__icon-box {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: $ak-text-muted;
    transition: all 0.2s ease;
  }

  &__icon {
    width: 16px;
    height: 16px;
  }

  &__code {
    font-size: 0.58rem;
    font-family: monospace;
    color: $ak-text-muted;
    letter-spacing: 0.5px;
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    font-size: 0.85rem;
    font-weight: 700;
    color: $ak-text-primary;
    letter-spacing: 0.5px;
  }

  &__desc {
    font-size: 0.65rem;
    color: $ak-text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__arrow {
    font-size: 0.85rem;
    color: $ak-text-muted;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    border-left-color: rgba($ak-cyan, 0.5);
    color: $ak-text-primary;

    .ak-sidebar-link__icon-box {
      background: rgba($ak-cyan, 0.12);
      border-color: rgba($ak-cyan, 0.4);
      color: $ak-cyan;
    }

    .ak-sidebar-link__arrow {
      transform: translateX(3px);
      color: $ak-cyan;
    }
  }

  &--active {
    background: rgba($ak-cyan, 0.08);
    border-color: rgba($ak-cyan, 0.3);
    border-left-color: $ak-cyan;
    box-shadow: inset 0 0 12px rgba($ak-cyan, 0.1);

    .ak-sidebar-link__name {
      color: $ak-cyan;
    }

    .ak-sidebar-link__icon-box {
      background: rgba($ak-cyan, 0.18);
      border-color: $ak-cyan;
      color: $ak-cyan;
      box-shadow: 0 0 8px rgba($ak-cyan, 0.3);
    }

    .ak-sidebar-link__code {
      color: $ak-cyan;
      font-weight: 700;
    }

    .ak-sidebar-link__arrow {
      color: $ak-cyan;
    }
  }
}

// Terminal Diagnostics Footer inside Sidebar
.ak-sidebar-footer {
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.3);

  &__diag {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: monospace;
    font-size: 0.65rem;
    color: $ak-text-secondary;
    margin-bottom: 0.35rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .ak-diag-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $ak-green;
    box-shadow: 0 0 5px rgba($ak-green, 0.8);
  }

  &__sub {
    font-size: 0.58rem;
    font-family: monospace;
    color: $ak-text-muted;
    margin: 0;
    letter-spacing: 0.5px;
  }
}

// -----------------------------------------------------------------------------
// Slide & Fade Transitions
// -----------------------------------------------------------------------------
.ak-sidebar-backdrop-enter-active,
.ak-sidebar-backdrop-leave-active {
  transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.ak-sidebar-backdrop-enter-from,
.ak-sidebar-backdrop-leave-to {
  opacity: 0;
}

.ak-sidebar-drawer-enter-active,
.ak-sidebar-drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.ak-sidebar-drawer-enter-from,
.ak-sidebar-drawer-leave-to {
  transform: translateX(100%);
}
</style>
