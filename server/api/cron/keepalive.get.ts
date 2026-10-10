import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl =
    config.public.supabaseUrl ||
    process.env.NUXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://bihelrjtkeaytsrxuppl.supabase.co'
  const supabaseKey =
    config.public.supabaseAnonKey ||
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    targetUrl: supabaseUrl,
  }

  // 1. Ping Supabase GoTrue Auth Health
  try {
    const authRes = await $fetch<any>(`${supabaseUrl}/auth/v1/health`, {
      headers: supabaseKey ? { apikey: supabaseKey } : {},
      timeout: 8000,
    })
    results.auth = { status: 'healthy', data: authRes }
  } catch (err: any) {
    results.auth = { status: 'error', message: err.message }
  }

  // 2. Ping Supabase PostgREST REST Root
  try {
    const restRes = await $fetch<any>(`${supabaseUrl}/rest/v1/`, {
      headers: supabaseKey
        ? {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          }
        : {},
      timeout: 8000,
    })
    results.postgrest = { status: 'healthy', tablesCount: Object.keys(restRes?.definitions || {}).length }
  } catch (err: any) {
    results.postgrest = { status: 'error', message: err.message }
  }

  const isSuccess =
    results.auth?.status === 'healthy' || results.postgrest?.status === 'healthy'

  return {
    success: isSuccess,
    message: isSuccess
      ? 'Supabase database keepalive pulse acknowledged (prevents AFK inactivity pause)'
      : 'Supabase ping encountered errors',
    details: results,
  }
})
