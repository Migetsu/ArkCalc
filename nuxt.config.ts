// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/supabase',
  ],

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
