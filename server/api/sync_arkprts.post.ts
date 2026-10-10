import { loginWithYostarEmailCode, fetchLiveArknightsData } from '~/server/utils/yostarAuth'

export default defineEventHandler(async (event): Promise<any> => {
  const body = await readBody(event)

  const server = (body.server || 'en').toLowerCase()
  const authType = body.auth_type || 'email_code'
  const uid = body.uid || ''
  const token = body.token || ''
  const email = (body.email || '').trim()
  const code = (body.code || '').trim()

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

  // 1. Live Yostar Email Code Authentication
  if (authType === 'email_code') {
    try {
      console.log(`[PRTS Sync] Authenticating ${email} with Yostar (${server.toUpperCase()})...`)
      const { channelUid, token: yostarToken } = await loginWithYostarEmailCode(email, code, server)
      console.log(`[PRTS Sync] Yostar login successful for ${email}. Fetching live Arknights data...`)

      const liveData = await fetchLiveArknightsData(server, channelUid, yostarToken, email)
      console.log(`[PRTS Sync] Successfully synchronized ${liveData.total_operators} operators for ${liveData.profile.nickname}`)
      return liveData
    } catch (err: any) {
      console.error('[PRTS Sync Error]:', err?.message || err)
      throw createError({
        statusCode: 400,
        statusMessage: err?.message || 'Failed to authenticate with Arknights servers. Check your verification code.',
      })
    }
  }

  // 2. Token-based login
  if (authType === 'token') {
    try {
      const liveData = await fetchLiveArknightsData(server, uid, token)
      return liveData
    } catch (err: any) {
      console.error('[PRTS Token Sync Error]:', err?.message || err)
      throw createError({
        statusCode: 400,
        statusMessage: err?.message || 'Token synchronization failed.',
      })
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid authentication mode specified.',
  })
})
