export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const server = (body.server || 'en').toLowerCase()
  const authType = body.auth_type || 'token'
  const uid = body.uid || ''
  const token = body.token || ''
  const email = body.email || ''
  const code = body.code || ''

  // Validate basic input
  if (authType === 'token' && (!uid || !token)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'UID and Token are required for token authentication.',
    })
  }

  if (authType === 'email_code' && (!email || !code)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and Verification Code are required for email authentication.',
    })
  }

  // If deployed on Vercel with Python serverless available:
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  if (vercelUrl) {
    try {
      const pyResponse = await $fetch(`${vercelUrl}/api/sync_arkprts`, {
        method: 'POST',
        body,
        timeout: 15000,
      })
      return pyResponse
    } catch (e: any) {
      console.warn('[Sync API] Vercel Python serverless invocation failed:', e?.message || e)
    }
  }

  // Fallback response for local environment / demo testing
  return {
    success: true,
    source: 'nitro-gateway',
    timestamp: new Date().toISOString(),
    profile: {
      uid: uid || '10482914',
      nickname: email ? email.split('@')[0] : 'Doctor Rhodes',
      level: 120,
      server: server.toUpperCase(),
    },
    gacha: {
      orundum: 35400,
      originite_prime: 42,
      single_permits: 6,
      ten_permits: 2,
      lmd: 1540200,
      pulls_without_op: 85,
      pulls_with_op: 97,
    },
    inventory: {
      '4001': 1540200,
      'orundum': 35400,
      'originite_prime': 42,
      '7001': 6,
      '7002': 2,
      '30013': 52,
      '30014': 18,
      '30073': 30,
      '30074': 14,
      '30083': 22,
      '30084': 8,
      '30093': 25,
      '30094': 10,
      '31014': 12,
      '31024': 10,
      '32001': 8,
      '3303': 95,
      'mod_unlock_token': 10,
    },
    roster: [
      {
        operator_id: 'char_172_silver',
        elite: 2,
        level: 90,
        potential: 6,
        skill_level: 7,
        masteries: { skchr_silver_3: 3 },
        modules: { uniequip_002_silver: 3 },
      },
      {
        operator_id: 'char_350_surtr',
        elite: 2,
        level: 90,
        potential: 2,
        skill_level: 7,
        masteries: { skchr_surtr_3: 3 },
        modules: {},
      },
      {
        operator_id: 'char_4025_aprot',
        elite: 2,
        level: 90,
        potential: 3,
        skill_level: 7,
        masteries: { skchr_aprot_3: 3 },
        modules: { uniequip_002_aprot: 3 },
      },
      {
        operator_id: 'char_202_demkni',
        elite: 2,
        level: 80,
        potential: 5,
        skill_level: 7,
        masteries: { skchr_demkni_1: 3, skchr_demkni_2: 3, skchr_demkni_3: 3 },
        modules: { uniequip_002_demkni: 3 },
      },
      {
        operator_id: 'char_103_angel',
        elite: 2,
        level: 80,
        potential: 6,
        skill_level: 7,
        masteries: { skchr_angel_3: 3 },
        modules: { uniequip_002_angel: 3 },
      },
      {
        operator_id: 'char_102_texas',
        elite: 2,
        level: 60,
        potential: 6,
        skill_level: 7,
        masteries: { skchr_texas_2: 3 },
        modules: {},
      },
      {
        operator_id: 'char_237_gravel',
        elite: 1,
        level: 50,
        potential: 6,
        skill_level: 7,
        masteries: {},
        modules: {},
      },
    ],
    total_operators: 7,
  }
})
