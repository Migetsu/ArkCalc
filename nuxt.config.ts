// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'ArkCalc // PRTS Tactical Terminal',
      titleTemplate: '%s // ArkCalc PRTS',
      htmlAttrs: {
        lang: 'ru',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0d1117' },
        { name: 'description', content: 'Тактический терминал Доктора Arknights: планировщик прокачки оперативников, калькулятор круток и искр, матрица рекрутинга и инвентарь склада.' },
        { name: 'keywords', content: 'Arknights, ArkCalc, PRTS, калькулятор прокачки, гача, рекрутинг, расчет круток, склад, материалы, Penguin Stats, Spark Calculator' },
        { name: 'author', content: 'ArkCalc Terminal' },
        { name: 'robots', content: 'index, follow' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'ArkCalc' },

        // Open Graph Global
        { property: 'og:site_name', content: 'ArkCalc // PRTS Tactical Terminal' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ru_RU' },
        { property: 'og:title', content: 'ArkCalc // PRTS Тактический терминал Arknights' },
        { property: 'og:description', content: 'Универсальный помощник Доктора: расчет материалов прокачки, калькулятор искр и круток, матрица рекрутинга 4★/5★/6★ и учет склада.' },
        { property: 'og:image', content: '/images/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: 'ArkCalc PRTS Tactical Terminal Interface Preview' },

        // Twitter Cards Global
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ArkCalc // PRTS Тактический терминал Arknights' },
        { name: 'twitter:description', content: 'Универсальный помощник Доктора: калькулятор прокачки, искр, рекрутинга и склад материалов.' },
        { name: 'twitter:image', content: '/images/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ArkCalc - Arknights PRTS Tactical Terminal',
      short_name: 'ArkCalc',
      description: 'Arknights planning assistant: operator promotions, gacha spark projections, recruitment tags and depot inventory.',
      theme_color: '#0d1117',
      background_color: '#0a0d14',
      display: 'standalone',
      orientation: 'portrait-primary',
      start_url: '/',
      scope: '/',
      lang: 'ru',
      categories: ['games', 'utilities'],
      icons: [
        {
          src: '/pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/PuppiizSunniiz\/Arknight-Images\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'arkcalc-operator-avatars',
            expiration: {
              maxEntries: 600,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/arknights\.wiki\.gg\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'arkcalc-wiki-assets',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/penguin-stats\.io\/PenguinStats\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'arkcalc-penguin-api',
            expiration: {
              maxEntries: 40,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
            },
            networkTimeoutSeconds: 4,
          },
        },
        {
          urlPattern: /\/api\/(events|banners|operators|penguin\/matrix).*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'arkcalc-local-api',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 12, // 12 hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /\/images\/(items|operators)\/.*\.(png|jpg|webp|svg)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'arkcalc-static-images',
            expiration: {
              maxEntries: 400,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  supabase: {
    redirect: false,
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '',
    },
  },

  typescript: {
    strict: true,
  },

  css: [
    '~/assets/scss/main.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: (content: string, id: string) => {
            if (id.includes('_variables.scss')) {
              return content
            }
            return `@use "~/assets/scss/_variables.scss" as *;\n${content}`
          },
        },
      },
    },
  },
})
