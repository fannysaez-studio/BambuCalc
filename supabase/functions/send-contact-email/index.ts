// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const ADMIN_EMAIL    = 'fannysaez.pro@gmail.com'
const SENDER_EMAIL   = 'onboarding@resend.dev'
const BRAND_COLOR    = '#2e9cab'

serve(async (req) => {
  if (req.method === 'OPTIONS') return handlePreflight()

  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) return errorResponse('Champs manquants', 400)

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nouveau message de contact – BambuCalc</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND_COLOR},#3fb2bf);padding:32px 40px 24px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">✉</div>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.02em;">Nouveau message de contact</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Reçu depuis bambucalc.netlify.app/contact</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:32px 40px 28px;">

      <!-- Expéditeur -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f7f9fc;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#a0aec0;">Nom</span>
            <div style="margin-top:4px;font-size:15px;font-weight:600;color:#1b2f39;">${name}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 18px;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#a0aec0;">Email</span>
            <div style="margin-top:4px;">
              <a href="mailto:${email}" style="font-size:15px;font-weight:600;color:${BRAND_COLOR};text-decoration:none;">${email}</a>
            </div>
          </td>
        </tr>
      </table>

      <!-- Message -->
      <div style="margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#a0aec0;margin-bottom:10px;">Message</div>
        <div style="background:#f7f9fc;border-left:3px solid ${BRAND_COLOR};border-radius:0 8px 8px 0;padding:16px 18px;font-size:14px;color:#2d3748;line-height:1.7;white-space:pre-wrap;">${message}</div>
      </div>

      <!-- Répondre -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="mailto:${email}?subject=Re: votre message BambuCalc"
               style="display:inline-block;background:linear-gradient(180deg,#3fb2bf 0%,${BRAND_COLOR} 100%);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:13px 36px;border-radius:10px;box-shadow:0 6px 18px rgba(46,156,171,0.28);">
              Répondre à ${name} →
            </a>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f7f9fc;padding:16px 40px;text-align:center;font-size:12px;color:#a0aec0;border-top:1px solid #e2e8f0;">
      BambuCalc — <a href="https://bambucalc.netlify.app" style="color:${BRAND_COLOR};text-decoration:none;">bambucalc.netlify.app</a>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`

    // Email à l'admin
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     `BambuCalc Contact <${SENDER_EMAIL}>`,
        to:       [ADMIN_EMAIL],
        reply_to: email,
        subject:  `📩 Message de ${name} — BambuCalc`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return errorResponse(body, 500)
    }

    // Email de confirmation à l'expéditeur
    const confirmHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND_COLOR},#3fb2bf);padding:32px 40px 24px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">✓</div>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">Message bien reçu !</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px 28px;">
      <p style="margin:0 0 16px;font-size:15px;color:#1b2f39;line-height:1.7;">
        Bonjour <strong>${name}</strong>,<br/>
        Merci pour votre message. Nous vous répondrons dans les 24h.
      </p>
      <div style="background:#f7f9fc;border-left:3px solid ${BRAND_COLOR};border-radius:0 8px 8px 0;padding:14px 16px;font-size:13px;color:#718096;line-height:1.6;white-space:pre-wrap;">${message}</div>
    </td>
  </tr>
  <tr>
    <td style="background:#f7f9fc;padding:16px 40px;text-align:center;font-size:12px;color:#a0aec0;border-top:1px solid #e2e8f0;">
      BambuCalc — <a href="https://bambucalc.netlify.app" style="color:${BRAND_COLOR};text-decoration:none;">bambucalc.netlify.app</a>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     `BambuCalc <${SENDER_EMAIL}>`,
        to:       [email],
        reply_to: ADMIN_EMAIL,
        subject:  'Votre message a bien été reçu — BambuCalc',
        html:     confirmHtml,
      }),
    }).catch(() => {})

    return jsonResponse({ ok: true })
  } catch (err) {
    return errorResponse(String(err), 500)
  }
})
