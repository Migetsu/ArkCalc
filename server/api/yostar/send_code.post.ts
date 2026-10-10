import { sendYostarEmailCode } from '~/server/utils/yostarAuth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = (body.email || '').trim()
  const server = (body.server || 'en').toLowerCase()

  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid Yostar email address.',
    })
  }

  try {
    const result = await sendYostarEmailCode(email, server)
    return result
  } catch (err: any) {
    console.error('[Yostar Send Code Error]:', err?.message || err)
    throw createError({
      statusCode: 400,
      statusMessage: err?.message || 'Failed to send verification code from Yostar servers.',
    })
  }
})
