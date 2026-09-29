export default async function handler(req: any, res: any) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bihelrjtkeaytsrxuppl.supabase.co';
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaGVscmp0a2VheXRzcnh1cHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODU4NTQsImV4cCI6MjEwNjI2MTg1NH0.ra2cpUd7h6ngiBeGnrLvmpOhFgIJEQsXNMxhDQgiIiQ';

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/app_health?select=*`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    const data = await response.json();
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      status: response.status,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to ping Supabase',
    });
  }
}
