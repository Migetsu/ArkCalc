// api/arknights/send-code.ts
import { sendYostarCode, type ArknightsServer } from './_yostarClient.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const email = body?.email;
    const server: ArknightsServer = body?.server || 'en';

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Укажите корректный адрес электронной почты' });
    }

    await sendYostarCode(email, server);

    return res.status(200).json({
      success: true,
      message: `Код подтверждения отправлен на почту ${email}`,
    });
  } catch (err: any) {
    console.error('send-code error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Ошибка отправки кода с сервера Yostar',
    });
  }
}
