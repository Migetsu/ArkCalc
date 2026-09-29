import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) || 'https://bihelrjtkeaytsrxuppl.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaGVscmp0a2VheXRzcnh1cHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODU4NTQsImV4cCI6MjEwNjI2MTg1NH0.ra2cpUd7h6ngiBeGnrLvmpOhFgIJEQsXNMxhDQgiIiQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
