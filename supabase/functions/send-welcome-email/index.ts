// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const ADMIN_EMAIL   = 'fannysaez.pro@gmail.com'
const BRAND_COLOR    = '#2e9cab'

serve(async (req) => {
  if (req.method === 'OPTIONS') return handlePreflight()

  try {
    const { email, firstName, lastName, appUrl = 'https://bambucalc.fr' } = await req.json()
    if (!email) return errorResponse('No email', 400)

    const displayName   = [firstName, lastName].filter(Boolean).join(' ') || 'là'
    const firstNameOnly = firstName || displayName

    const ctaUrl = `${appUrl}/calculator`

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bienvenue sur BambuCalc</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND_COLOR},#3fb2bf);padding:36px 40px 28px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">🖨️</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">Bienvenue sur BambuCalc !</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Votre outil de devis impression 3D</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:36px 40px 28px;">

      <!-- Salutation -->
      <p style="margin:0 0 24px;font-size:16px;color:#1b2f39;line-height:1.7;">
        Bonjour <strong>${firstNameOnly}</strong>,<br/>
        Votre compte BambuCalc est prêt. Vous pouvez dès maintenant créer vos premiers devis d'impression 3D en quelques clics.
      </p>

      <!-- Features -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding:14px 16px;background:#f7f9fc;border-radius:10px 10px 0 0;border-bottom:1px solid #e2e8f0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:14px;">⚡</td>
              <td>
                <div style="font-weight:700;font-size:14px;color:#1b2f39;">Calcul instantané</div>
                <div style="font-size:13px;color:#718096;margin-top:2px;">Coût matière, énergie, main d'œuvre — calculé automatiquement.</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#f7f9fc;border-bottom:1px solid #e2e8f0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:14px;">📄</td>
              <td>
                <div style="font-weight:700;font-size:14px;color:#1b2f39;">Devis PDF professionnel</div>
                <div style="font-size:13px;color:#718096;margin-top:2px;">Générez et envoyez vos devis avec les coordonnées client.</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#f7f9fc;border-bottom:1px solid #e2e8f0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:14px;">📬</td>
              <td>
                <div style="font-weight:700;font-size:14px;color:#1b2f39;">Envoi par email automatique</div>
                <div style="font-size:13px;color:#718096;margin-top:2px;">Votre client reçoit le récapitulatif directement dans sa boîte.</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;background:#f7f9fc;border-radius:0 0 10px 10px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:14px;">📊</td>
              <td>
                <div style="font-weight:700;font-size:14px;color:#1b2f39;">Suivi des devis</div>
                <div style="font-size:13px;color:#718096;margin-top:2px;">Retrouvez l'historique et le statut de toutes vos commandes.</div>
              </td>
            </tr></table>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${ctaUrl}"
               style="display:inline-block;background:linear-gradient(180deg,#3fb2bf 0%,${BRAND_COLOR} 100%);color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;box-shadow:0 6px 18px rgba(46,156,171,0.30);letter-spacing:0.01em;">
              Créer mon premier devis →
            </a>
          </td>
        </tr>
      </table>

      <!-- Note -->
      <p style="margin:24px 0 0;font-size:13px;color:#a0aec0;text-align:center;line-height:1.6;">
        Une question ? Répondez simplement à cet email.<br/>
        Nous sommes là pour vous aider.
      </p>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f7f9fc;padding:18px 40px;text-align:center;font-size:12px;color:#a0aec0;border-top:1px solid #e2e8f0;">
      BambuCalc — <a href="mailto:${ADMIN_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${ADMIN_EMAIL}</a>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:      { name: 'BambuCalc', email: ADMIN_EMAIL },
        to:          [{ email }],
        replyTo:     { email: ADMIN_EMAIL },
        subject:     `Bienvenue sur BambuCalc, ${firstNameOnly} ! 🖨️`,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return errorResponse(body, 500)
    }

    return jsonResponse({ ok: true })
  } catch (err) {
    return errorResponse(String(err), 500)
  }
})
