<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '~/stores/userStore'

const userStore = useUserStore()
const isMobileMenuOpen = ref(false)

const navLinks = [
  {
    name: 'Planner',
    path: '/planner',
    code: 'PLN-01',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    name: 'Gacha',
    path: '/gacha',
    code: 'GCH-02',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    name: 'Recruitment',
    path: '/recruitment',
    code: 'RCR-03',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7',
  },
  {
    name: 'Inventory',
    path: '/inventory',
    code: 'INV-04',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="ak-navbar">
    <div class="ak-navbar__container">
      <!-- Brand Logo / Terminal ID -->
      <NuxtLink to="/" class="ak-navbar__brand" @click="closeMobileMenu">
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

      <!-- Desktop Navigation Links -->
      <nav class="ak-navbar__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="ak-nav-item"
          active-class="ak-nav-item--active"
        >
          <span class="ak-nav-item__code">{{ link.code }}</span>
          <svg class="ak-nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
          </svg>
          <span class="ak-nav-item__label">{{ link.name }}</span>
          <span class="ak-nav-item__indicator" />
        </NuxtLink>
      </nav>

      <!-- User Info & Terminal Status -->
      <div class="ak-navbar__status">
        <div class="ak-status-card">
          <div class="ak-status-card__indicator" :class="{ 'ak-status-card__indicator--synced': userStore.isSynced }" />
          <div class="ak-status-card__meta">
            <span class="ak-status-card__name">{{ userStore.profile.username || 'Doctor' }}</span>
            <span class="ak-status-card__sub">
              LV.{{ userStore.profile.level || 1 }} [{{ userStore.profile.server || 'EN' }}]
            </span>
          </div>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          class="ak-navbar__burger"
          :class="{ 'ak-navbar__burger--active': isMobileMenuOpen }"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <transition name="ak-drawer">
      <div v-if="isMobileMenuOpen" class="ak-navbar__mobile-menu">
        <nav class="ak-navbar__mobile-nav">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="ak-mobile-nav-item"
            active-class="ak-mobile-nav-item--active"
            @click="closeMobileMenu"
          >
            <span class="ak-mobile-nav-item__code">{{ link.code }}</span>
            <svg class="ak-mobile-nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
            </svg>
            <span class="ak-mobile-nav-item__label">{{ link.name }}</span>
          </NuxtLink>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
.ak-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(18, 18, 20, 0.88);
  backdrop-filter: blur(12px);
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
    padding: 0 1.5rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  // Brand
  &__brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.85;
    }
  }

  &__logo-icon {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($ak-cyan, 0.12);
    border: 1px solid rgba($ak-cyan, 0.4);
    color: $ak-cyan;
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);

    .ak-icon {
      width: 20px;
      height: 20px;
    }
  }

  &__brand-text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 2px;
    color: $ak-text-primary;
    line-height: 1.1;
  }

  &__subtitle {
    font-size: 0.65rem;
    letter-spacing: 1.5px;
    color: $ak-cyan;
    font-family: monospace;
  }

  // Desktop Navigation
  &__nav {
    display: none;
    align-items: center;
    gap: 0.5rem;

    @media (min-width: 768px) {
      display: flex;
    }
  }

  // User status widget
  &__status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  // Mobile Hamburger
  &__burger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 28px;
    height: 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    @media (min-width: 768px) {
      display: none;
    }

    span {
      display: block;
      width: 100%;
      height: 2px;
      background-color: $ak-text-primary;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    &--active {
      span:nth-child(1) {
        transform: translateY(9px) rotate(45deg);
      }
      span:nth-child(2) {
        opacity: 0;
      }
      span:nth-child(3) {
        transform: translateY(-9px) rotate(-45deg);
      }
    }
  }

  // Mobile drawer dropdown
  &__mobile-menu {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(18, 18, 20, 0.98);
    padding: 1rem 1.5rem;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

// Nav link item styling
.ak-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: $ak-text-secondary;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));

  &__code {
    font-size: 0.65rem;
    font-family: monospace;
    opacity: 0.5;
    letter-spacing: 0;
  }

  &__icon {
    width: 16px;
    height: 16px;
  }

  &__indicator {
    position: absolute;
    bottom: -1px;
    left: 10%;
    right: 10%;
    height: 2px;
    background: transparent;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }

  &:hover {
    color: $ak-text-primary;
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &--active {
    color: $ak-cyan;
    background: rgba($ak-cyan, 0.08);
    border-color: rgba($ak-cyan, 0.35);

    .ak-nav-item__code {
      opacity: 0.9;
      color: $ak-cyan;
    }

    .ak-nav-item__indicator {
      background: $ak-cyan;
      box-shadow: 0 0 8px rgba($ak-cyan, 0.8);
    }
  }
}

// Mobile nav item
.ak-mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: $ak-text-secondary;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.02);
  border-left: 2px solid transparent;
  transition: all 0.2s ease;

  &__code {
    font-size: 0.7rem;
    font-family: monospace;
    color: $ak-text-muted;
  }

  &__icon {
    width: 18px;
    height: 18px;
  }

  &--active {
    color: $ak-cyan;
    background: rgba($ak-cyan, 0.1);
    border-left-color: $ak-cyan;

    .ak-mobile-nav-item__code {
      color: $ak-cyan;
    }
  }
}

// Doctor Status Card
.ak-status-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: monospace;

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
    font-size: 0.75rem;
    font-weight: 600;
    color: $ak-text-primary;
  }

  &__sub {
    font-size: 0.65rem;
    color: $ak-text-muted;
  }
}

// Transitions
.ak-drawer-enter-active,
.ak-drawer-leave-active {
  transition: all 0.25s ease;
}

.ak-drawer-enter-from,
.ak-drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
