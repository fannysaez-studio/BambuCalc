// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? ''
const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')  ?? ''
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ADMIN_EMAIL   = 'fannysaez.pro@gmail.com'
const BRAND_COLOR   = '#2e9cab'

// ── Utilitaires ───────────────────────────────────────────────────────────────

// Génère une ligne label / valeur 100% inline, sans flexbox (compatibilité Gmail)
function row(label: string, value: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:8px 0;font-size:14px;color:#718096;border-bottom:1px solid #f0f4f8;">${label}</td>
    <td style="padding:8px 0;font-size:14px;font-weight:700;color:#1b2f39;text-align:right;border-bottom:1px solid #f0f4f8;">${value}</td>
  </tr>
</table>`
}

function fmtEur(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

function paymentLabel(method: string) {
  const map: Record<string, string> = {
    virement: 'Virement bancaire',
    cheque:   'Chèque',
    cb:       'Carte bancaire',
    especes:  'Espèces',
    paypal:   'PayPal',
  }
  return map[method] ?? method ?? 'Virement bancaire'
}

// ── Lecture email_settings ────────────────────────────────────────────────────

async function fetchEmailSettings() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log('[DB] SUPABASE_URL ou SERVICE_KEY absent — valeurs par défaut utilisées')
    return {}
  }
  try {
    const res  = await fetch(`${SUPABASE_URL}/rest/v1/email_settings?select=*&limit=1`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    })
    const rows = await res.json()
    console.log('[DB] email_settings HTTP:', res.status, '— lignes:', Array.isArray(rows) ? rows.length : typeof rows)
    return Array.isArray(rows) && rows.length ? rows[0] : {}
  } catch (e) {
    console.log('[DB] exception fetchEmailSettings:', String(e))
    return {}
  }
}

// ── Envoi Brevo ───────────────────────────────────────────────────────────────

async function sendViaBrevo(payload: object, label: string): Promise<void> {
  const to      = (payload as any).to
  const subject = (payload as any).subject
  const hasAtt  = Array.isArray((payload as any).attachment) && (payload as any).attachment.length > 0

  console.log(`[Brevo][${label}] ── DÉBUT ENVOI ──`)
  console.log(`[Brevo][${label}] to        : ${JSON.stringify(to)}`)
  console.log(`[Brevo][${label}] subject   : ${subject}`)
  console.log(`[Brevo][${label}] PDF joint : ${hasAtt}`)

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: {
      'api-key':      BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const rawBody = await res.text()

  console.log(`[Brevo][${label}] Statut HTTP : ${res.status}`)
  console.log(`[Brevo][${label}] Body brut   : ${rawBody.slice(0, 500)}`)

  if (!res.ok) {
    throw new Error(`Brevo "${label}" échoué (HTTP ${res.status}): ${rawBody}`)
  }

  console.log(`[Brevo][${label}] ✓ Email accepté par Brevo`)
}

// ── Handler principal ─────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return handlePreflight(req)

  // ── Authentification obligatoire ──────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return errorResponse('Token d\'authentification requis', 401)
  }
  const userToken = authHeader.replace('Bearer ', '')
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${userToken}` },
  })
  if (!userRes.ok) {
    return errorResponse('Token invalide ou session expirée', 401)
  }
  // ──────────────────────────────────────────────────────────────

  // ── LOG 1 : Entrée de la fonction ─────────────────────────────
  console.log('═══════════════════════════════════════════════')
  console.log('[INIT] send-quote-email — requête reçue')
  console.log('[INIT] méthode :', req.method)

  // ── LOG 2 : Présence des secrets ──────────────────────────────
  console.log(`[SECRETS] BREVO_API_KEY présente  : ${BREVO_API_KEY.length > 0 ? 'OUI' : 'NON ⚠️'} (longueur : ${BREVO_API_KEY.length})`)
  console.log(`[SECRETS] SUPABASE_URL présente   : ${SUPABASE_URL.length > 0 ? 'OUI' : 'NON'}`)
  console.log(`[SECRETS] SERVICE_KEY présente    : ${SERVICE_KEY.length > 0 ? 'OUI' : 'NON'}`)

  // Blocage immédiat si clé Brevo absente
  if (!BREVO_API_KEY) {
    const msg = 'BREVO_API_KEY vide — ajoutez le secret dans le dashboard Supabase puis redéployez'
    console.log('[ERREUR FATALE]', msg)
    return errorResponse(msg, 500)
  }

  try {
    // ── LOG 3 : Lecture du body ───────────────────────────────────
    const rawBody = await req.text()
    console.log('[BODY] taille brute (chars) :', rawBody.length)
    console.log('[BODY] aperçu :', rawBody.slice(0, 200))

    const body = JSON.parse(rawBody)
    const { quote, pdfBase64, filename } = body

    if (!quote) {
      console.log('[ERREUR] Champ "quote" absent du body')
      return errorResponse('No quote data', 400)
    }

    // ── LOG 4 : Informations devis & PDF ─────────────────────────
    console.log('[DEVIS] numéro     :', quote.quote_number ?? '—')
    console.log('[DEVIS] client     :', quote.client_email ?? 'AUCUN EMAIL CLIENT')
    console.log('[PDF]   présent    :', pdfBase64 ? 'OUI' : 'NON')
    console.log('[PDF]   longueur   :', pdfBase64?.length ?? 0, 'chars base64')
    console.log('[PDF]   filename   :', filename ?? '—')

    // ── Paramètres email_settings ─────────────────────────────────
    const dbSettings    = await fetchEmailSettings()
    const senderName    = dbSettings.sender_name        || 'BambuCalc'
    const replyTo       = dbSettings.reply_to           || ADMIN_EMAIL
    const customSubject = dbSettings.email_subject      || 'Votre devis [senderName] — [numéro]'
    const customIntro   = dbSettings.email_intro_client || ''

    console.log('[SETTINGS] senderName :', senderName)
    console.log('[SETTINGS] replyTo    :', replyTo)

    // ── Construction données client ───────────────────────────────
    const clientDisplay =
      quote.client_name ||
      [quote.client_first_name, quote.client_last_name].filter(Boolean).join(' ') ||
      '—'

    const adresse = [
      quote.client_address,
      quote.client_postal_code,
      quote.client_city,
      quote.client_country,
    ].filter(Boolean).join(', ')

    const civility        = quote.client_civility ? quote.client_civility + ' ' : ''
    const lastName        = quote.client_last_name || ''
    const clientFirstName = quote.client_first_name || clientDisplay.split(' ')[0] || clientDisplay
    const clientPolite    = civility + (lastName || clientFirstName)

    const introText = customIntro
      ? customIntro
          .replace(/\[client\]/gi,     clientFirstName)
          .replace(/\[client_nom\]/gi, clientPolite)
          .replace(/\[civilité\]/gi,   civility.trim())
          .replace(/\[numéro\]/gi,     quote.quote_number ?? '')
          .replace(/\[projet\]/gi,     quote.project_name ?? '')
          .replace(/\[total\]/gi,      fmtEur(quote.total_cost ?? 0))
      : `Bonjour ${clientDisplay},<br/>Voici le récapitulatif de votre devis. N'hésitez pas à nous contacter pour toute question.`

    // ── HTML admin ────────────────────────────────────────────────
    const adminHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>a{color:${BRAND_COLOR};}body{margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;}</style>
</head>
<body bgcolor="#f0f4f8" style="margin:0;padding:0;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f4f8">
  <tr><td align="center" style="padding:40px 16px;">

    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- HEADER -->
      <tr>
        <td bgcolor="#2e9cab" style="padding:28px 32px;background:linear-gradient(135deg,${BRAND_COLOR},#3fb2bf);">
          <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">🖨️ Nouveau devis ${senderName}</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Un devis vient d'être sauvegardé</p>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:28px 32px;">

          <!-- Badge numéro -->
          <p style="display:inline-block;background:#e8f7f9;color:#1f7f97;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;margin:0 0 18px;">${quote.quote_number ?? '—'}</p>

          <!-- Section Client -->
          <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#a0aec0;margin:20px 0 8px;">Client</p>
          ${row('Nom', clientDisplay)}
          ${quote.client_email ? row('Email', `<a href="mailto:${quote.client_email}" style="color:${BRAND_COLOR};">${quote.client_email}</a>`) : ''}
          ${quote.client_phone ? row('Téléphone', quote.client_phone) : ''}
          ${adresse ? row('Adresse', adresse) : ''}

          <!-- Section Devis -->
          <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#a0aec0;margin:20px 0 8px;">Devis</p>
          ${row('Pièce', quote.project_name ?? '—')}
          ${row('Matière', quote.material ?? '—')}
          ${row('Quantité', `${quote.quantity ?? 1} unité(s)`)}
          ${row('Paiement', paymentLabel(quote.payment_method))}
          ${quote.deposit_percent > 0 ? row('Acompte', `${quote.deposit_percent}%`) : ''}

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8f7f9;border-radius:10px;margin-top:16px;">
            <tr>
              <td style="padding:14px 16px;font-size:15px;font-weight:800;color:#1b2f39;">Total TTC</td>
              <td style="padding:14px 16px;font-size:18px;font-weight:800;color:${BRAND_COLOR};text-align:right;">${fmtEur(quote.total_cost ?? 0)}</td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td bgcolor="#f7f9fc" style="padding:20px 32px;text-align:center;font-size:12px;color:#a0aec0;">
          ${senderName} — <a href="mailto:${ADMIN_EMAIL}" style="color:#a0aec0;">${ADMIN_EMAIL}</a>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

    // ── Pièce jointe PDF ──────────────────────────────────────────
    const attachments: Array<{ filename: string; content: string }> = []
    if (pdfBase64) {
      attachments.push({ filename: filename || `devis-${quote.quote_number || 'bambucalc'}.pdf`, content: pdfBase64 })
      console.log('[PDF] pièce jointe préparée :', attachments[0].filename)
    }

    // ── Envoi notification admin ──────────────────────────────────
    await sendViaBrevo({
      sender:  { name: senderName, email: ADMIN_EMAIL },
      to:      [{ email: ADMIN_EMAIL }],
      subject: `📋 Nouveau devis ${quote.quote_number ?? ''} — ${clientDisplay}`,
      htmlContent: adminHtml,
    }, 'admin')

    // ── Envoi email client ────────────────────────────────────────
    if (quote.client_email) {
      const clientHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>a{color:${BRAND_COLOR};}body{margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;}</style>
</head>
<body bgcolor="#f0f4f8" style="margin:0;padding:0;background:#f0f4f8;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f4f8">
  <tr><td align="center" style="padding:40px 16px;">

    <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- HEADER -->
      <tr>
        <td bgcolor="#2e9cab" style="padding:28px 32px;background:linear-gradient(135deg,${BRAND_COLOR},#3fb2bf);">
          <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">🖨️ Votre devis ${senderName}</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Impression 3D professionnelle</p>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:28px 32px;">

          <!-- Intro personnalisée -->
          <p style="font-size:15px;color:#4a5568;line-height:1.7;margin:0 0 24px;">${introText}</p>

          <!-- Badge numéro -->
          <p style="display:inline-block;background:#e8f7f9;color:#1f7f97;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;margin:0 0 18px;">${quote.quote_number ?? '—'}</p>

          <!-- Section commande -->
          <p style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#a0aec0;margin:20px 0 8px;">Détail de la commande</p>
          ${row('Pièce', quote.project_name ?? '—')}
          ${row('Matière', quote.material ?? '—')}
          ${row('Quantité', `${quote.quantity ?? 1} unité(s)`)}
          ${row('Mode de paiement', paymentLabel(quote.payment_method))}
          ${quote.deposit_percent > 0 ? row('Acompte demandé', `${quote.deposit_percent}%`) : ''}

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8f7f9;border-radius:10px;margin-top:16px;">
            <tr>
              <td style="padding:14px 16px;font-size:15px;font-weight:800;color:#1b2f39;">Total TTC</td>
              <td style="padding:14px 16px;font-size:18px;font-weight:800;color:${BRAND_COLOR};text-align:right;">${fmtEur(quote.total_cost ?? 0)}</td>
            </tr>
          </table>

          <!-- Notes éventuelles -->
          ${quote.quote_notes ? `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f9fc;border-radius:10px;margin-top:16px;">
            <tr><td style="padding:14px 16px;font-size:13px;color:#4a5568;line-height:1.6;">
              <strong>Notes :</strong><br/>${quote.quote_notes}
            </td></tr>
          </table>` : ''}

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td bgcolor="#f7f9fc" style="padding:20px 32px;text-align:center;font-size:12px;color:#a0aec0;">
          ${senderName} — <a href="mailto:${ADMIN_EMAIL}" style="color:#a0aec0;">${ADMIN_EMAIL}</a>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

      await sendViaBrevo({
        sender:  { name: senderName, email: ADMIN_EMAIL },
        to:      [{ email: quote.client_email }],
        replyTo: { email: replyTo },
        subject: customSubject
          .replace(/\[numéro\]/gi,     quote.quote_number ?? '')
          .replace(/\[senderName\]/gi, senderName)
          .replace(/\[projet\]/gi,     quote.project_name ?? '')
          .replace(/\[client\]/gi,     clientFirstName)
          .replace(/\[client_nom\]/gi, clientPolite),
        htmlContent: clientHtml,
        ...(attachments.length ? { attachment: attachments.map(a => ({ name: a.filename, content: a.content })) } : {}),
      }, 'client')
    } else {
      console.log('[EMAIL] pas d\'adresse client — envoi client ignoré')
    }

    console.log('[SUCCÈS] tous les emails ont été acceptés par Brevo')
    console.log('═══════════════════════════════════════════════')

    return jsonResponse({ ok: true })

  } catch (err) {
    console.log('[ERREUR FATALE]', String(err))
    console.log('═══════════════════════════════════════════════')
    return errorResponse(String(err), 500)
  }
})
