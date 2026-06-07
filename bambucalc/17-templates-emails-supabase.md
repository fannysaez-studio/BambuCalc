# Templates Emails Supabase — BambuCalc

> 11 templates HTML à copier-coller dans **Supabase → Authentication → Email Templates**  
> Teal `#2e9cab` pour les emails auth · Violet `#7961E9` pour les emails sécurité

---

## Comment utiliser

Dans Supabase → Authentication → Email Templates :
1. Cliquer sur le template à modifier
2. Coller le **Subject** dans le champ Objet
3. Coller le **HTML** dans le champ Body
4. Cliquer "Save"

---

## AUTHENTIFICATION (couleur teal)

---

### 1. Confirmer l'inscription

**Subject :** `Confirmez votre adresse e-mail — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Confirmez votre adresse e-mail</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background-color:#2e9cab;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <rect x="2" y="8" width="20" height="10" rx="2" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 8V4a1 1 0 011-1h8a1 1 0 011 1v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="7" y="13" width="10" height="7" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="17.5" cy="11.5" r="1.2" fill="white"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">BambuCalc</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;line-height:1.3;">Confirmez votre adresse e-mail</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Bienvenue sur BambuCalc ! Pour finaliser la création de votre compte, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.</p>
            <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">Ce lien est valable <strong>24 heures</strong>.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#2e9cab;border-radius:10px;text-align:center;">
                  <a href="{{ .ConfirmationURL }}" style="display:block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">Confirmer mon adresse e-mail →</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">Si vous n'avez pas créé de compte sur BambuCalc, ignorez cet email.</p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 2. Inviter un utilisateur

**Subject :** `Vous êtes invité(e) sur BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Invitation BambuCalc</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#2e9cab;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <rect x="2" y="8" width="20" height="10" rx="2" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 8V4a1 1 0 011-1h8a1 1 0 011 1v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="7" y="13" width="10" height="7" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="17.5" cy="11.5" r="1.2" fill="white"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Vous avez été invité(e) !</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Vous avez reçu une invitation pour rejoindre <strong>BambuCalc</strong>, l'outil de gestion pour prestataires d'impression 3D.</p>
            <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">Cliquez ci-dessous pour créer votre compte et accéder à votre espace.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#2e9cab;border-radius:10px;text-align:center;">
                  <a href="{{ .ConfirmationURL }}" style="display:block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Accepter l'invitation →</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;">Ce lien est valable 24 heures. Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 3. Lien magique ou code OTP

**Subject :** `Votre code de connexion — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Code de connexion</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#2e9cab;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <rect x="2" y="8" width="20" height="10" rx="2" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 8V4a1 1 0 011-1h8a1 1 0 011 1v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="7" y="13" width="10" height="7" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="17.5" cy="11.5" r="1.2" fill="white"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Votre code de connexion</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Utilisez ce code à usage unique pour vous connecter à BambuCalc. Il expire dans <strong>10 minutes</strong>.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background-color:#f0f9ff;border:2px solid #2e9cab;border-radius:12px;padding:20px 40px;text-align:center;">
                  <span style="font-size:36px;font-weight:700;color:#2e9cab;letter-spacing:8px;">{{ .Token }}</span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;text-align:center;">Ou cliquez directement sur ce lien :</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#2e9cab;border-radius:10px;text-align:center;">
                  <a href="{{ .ConfirmationURL }}" style="display:block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Se connecter →</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;">Si vous n'avez pas demandé ce code, ignorez cet email et sécurisez votre compte.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 4. Changer l'adresse e-mail

**Subject :** `Confirmez votre nouvelle adresse e-mail — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Confirmez votre nouvelle adresse e-mail</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#2e9cab;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <rect x="2" y="8" width="20" height="10" rx="2" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 8V4a1 1 0 011-1h8a1 1 0 011 1v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="7" y="13" width="10" height="7" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="17.5" cy="11.5" r="1.2" fill="white"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Confirmez votre nouvelle adresse e-mail</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Vous avez demandé à modifier l'adresse e-mail associée à votre compte BambuCalc.</p>
            <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">Cliquez ci-dessous pour confirmer votre nouvelle adresse. Ce lien expire dans <strong>24 heures</strong>.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#2e9cab;border-radius:10px;text-align:center;">
                  <a href="{{ .ConfirmationURL }}" style="display:block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Confirmer la nouvelle adresse →</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;">Si vous n'avez pas demandé ce changement, contactez-nous immédiatement.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 5. Réinitialiser le mot de passe

**Subject :** `Réinitialisez votre mot de passe — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#2e9cab;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <rect x="2" y="8" width="20" height="10" rx="2" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 8V4a1 1 0 011-1h8a1 1 0 011 1v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="7" y="13" width="10" height="7" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="17.5" cy="11.5" r="1.2" fill="white"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Réinitialisez votre mot de passe</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Vous avez demandé à réinitialiser le mot de passe de votre compte BambuCalc.</p>
            <p style="margin:0 0 32px;font-size:15px;color:#4a5568;line-height:1.6;">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background-color:#2e9cab;border-radius:10px;text-align:center;">
                  <a href="{{ .ConfirmationURL }}" style="display:block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Choisir un nouveau mot de passe →</a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;text-align:center;">Si vous n'avez pas demandé de réinitialisation, ignorez cet email. Votre mot de passe reste inchangé.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 6. Réauthentification

**Subject :** `Vérifiez votre identité — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Vérification d'identité</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#2e9cab;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <rect x="2" y="8" width="20" height="10" rx="2" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.15)"/>
              <path d="M7 8V4a1 1 0 011-1h8a1 1 0 011 1v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="7" y="13" width="10" height="7" rx="1" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="17.5" cy="11.5" r="1.2" fill="white"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Vérifiez votre identité</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Pour effectuer cette opération sensible, veuillez confirmer votre identité avec le code ci-dessous. Il expire dans <strong>10 minutes</strong>.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background-color:#f0f9ff;border:2px solid #2e9cab;border-radius:12px;padding:20px 40px;text-align:center;">
                  <span style="font-size:36px;font-weight:700;color:#2e9cab;letter-spacing:8px;">{{ .Token }}</span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 0;font-size:13px;color:#9ca3af;text-align:center;">Si vous n'avez pas initié cette action, ignorez cet email et vérifiez la sécurité de votre compte.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## SÉCURITÉ (couleur violet)

---

### 7. Mot de passe modifié

**Subject :** `Votre mot de passe a été modifié — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Mot de passe modifié</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2H9V7c0-1.654 1.346-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Votre mot de passe a été modifié</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Le mot de passe de votre compte BambuCalc a été modifié avec succès.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Si vous êtes à l'origine de cette modification, vous pouvez ignorer cet email en toute sécurité.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#fff4e5;border-left:4px solid #ea6c0a;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;"><strong>Ce n'est pas vous ?</strong> Réinitialisez immédiatement votre mot de passe depuis la page de connexion et contactez-nous.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 8. Adresse e-mail modifiée

**Subject :** `Votre adresse e-mail a été modifiée — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Adresse e-mail modifiée</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2H9V7c0-1.654 1.346-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Votre adresse e-mail a été modifiée</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">L'adresse e-mail associée à votre compte BambuCalc a bien été mise à jour.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Désormais, utilisez votre nouvelle adresse pour vous connecter.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#fff4e5;border-left:4px solid #ea6c0a;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;"><strong>Ce n'est pas vous ?</strong> Contactez-nous immédiatement pour sécuriser votre compte.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 9. Numéro de téléphone changé

**Subject :** `Votre numéro de téléphone a été modifié — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Numéro de téléphone modifié</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2H9V7c0-1.654 1.346-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Numéro de téléphone modifié</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Le numéro de téléphone associé à votre compte BambuCalc a été mis à jour.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Si vous êtes à l'origine de cette modification, vous n'avez rien à faire.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#fff4e5;border-left:4px solid #ea6c0a;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;"><strong>Ce n'est pas vous ?</strong> Contactez-nous immédiatement pour sécuriser votre compte.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 10. Méthode de connexion liée

**Subject :** `Une nouvelle méthode de connexion a été ajoutée — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Méthode de connexion ajoutée</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2H9V7c0-1.654 1.346-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Nouvelle méthode de connexion ajoutée</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Une nouvelle méthode de connexion (ex : Google) a été associée à votre compte BambuCalc.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Si vous êtes à l'origine de cette action, vous pouvez ignorer cet email.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#fff4e5;border-left:4px solid #ea6c0a;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;"><strong>Ce n'est pas vous ?</strong> Contactez-nous immédiatement et changez votre mot de passe.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 11. Méthode de connexion supprimée

**Subject :** `Une méthode de connexion a été supprimée — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Méthode de connexion supprimée</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 2C9.243 2 7 4.243 7 7v2H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2H9V7c0-1.654 1.346-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Méthode de connexion supprimée</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Une méthode de connexion a été retirée de votre compte BambuCalc.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Si vous êtes à l'origine de cette action, vous pouvez ignorer cet email.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#fff4e5;border-left:4px solid #ea6c0a;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;"><strong>Ce n'est pas vous ?</strong> Contactez-nous immédiatement et sécurisez votre compte.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 12. Méthode MFA ajoutée

**Subject :** `Une double authentification a été activée sur votre compte — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>MFA ajoutée</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l4 2.18V11c0 3.14-2.12 6.1-4 7.07C10.12 17.1 8 14.14 8 11V7.18L12 5zm0 3a1 1 0 00-1 1v3a1 1 0 002 0V9a1 1 0 00-1-1zm0 5a1 1 0 100 2 1 1 0 000-2z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Double authentification activée</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Une méthode d'authentification multifacteur (MFA) a été ajoutée à votre compte BambuCalc.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Votre compte bénéficie désormais d'une couche de sécurité supplémentaire. Chaque connexion nécessitera une vérification via votre application d'authentification.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f0fdf4;border-left:4px solid #27ae60;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#166534;line-height:1.5;"><strong>Bonne pratique :</strong> conservez vos codes de secours dans un endroit sûr en cas de perte d'accès à votre application d'authentification.</p>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">Ce n'est pas vous ? Contactez-nous immédiatement et changez votre mot de passe.</p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

### 13. Méthode MFA supprimée

**Subject :** `La double authentification a été désactivée sur votre compte — BambuCalc`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>MFA supprimée</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <tr>
          <td style="background-color:#7961E9;padding:36px 40px;text-align:center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 16px;">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l4 2.18V11c0 3.14-2.12 6.1-4 7.07C10.12 17.1 8 14.14 8 11V7.18L12 5zm0 3a1 1 0 00-1 1v3a1 1 0 002 0V9a1 1 0 00-1-1zm0 5a1 1 0 100 2 1 1 0 000-2z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BambuCalc</p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;">Double authentification désactivée</h1>
            <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.6;">Une méthode d'authentification multifacteur (MFA) a été supprimée de votre compte BambuCalc.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">Si vous êtes à l'origine de cette action, votre compte n'est plus protégé par la double authentification.</p>
            <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#fff4e5;border-left:4px solid #ea6c0a;border-radius:0 8px 8px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;"><strong>Ce n'est pas vous ?</strong> Contactez-nous immédiatement, changez votre mot de passe et réactivez la double authentification.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Fanny Saez — BambuCalc</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Outil de gestion pour prestataires d'impression 3D Bambu Lab</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## Récapitulatif — où coller chaque template

| # | Template Supabase | Subject à copier | Couleur |
|---|---|---|---|
| 1 | Authentification → Confirmer l'inscription | `Confirmez votre adresse e-mail — BambuCalc` | Teal |
| 2 | Authentification → Inviter un utilisateur | `Vous êtes invité(e) sur BambuCalc` | Teal |
| 3 | Authentification → Lien magique ou code OTP | `Votre code de connexion — BambuCalc` | Teal |
| 4 | Authentification → Changer l'adresse e-mail | `Confirmez votre nouvelle adresse e-mail — BambuCalc` | Teal |
| 5 | Authentification → Réinitialiser le mot de passe | `Réinitialisez votre mot de passe — BambuCalc` | Teal |
| 6 | Authentification → Réauthentification | `Vérifiez votre identité — BambuCalc` | Teal |
| 7 | Sécurité → Mot de passe modifié | `Votre mot de passe a été modifié — BambuCalc` | Violet |
| 8 | Sécurité → Adresse e-mail modifiée | `Votre adresse e-mail a été modifiée — BambuCalc` | Violet |
| 9 | Sécurité → Numéro de téléphone changé | `Votre numéro de téléphone a été modifié — BambuCalc` | Violet |
| 10 | Sécurité → Méthode de connexion liée | `Une nouvelle méthode de connexion a été ajoutée — BambuCalc` | Violet |
| 11 | Sécurité → Méthode de connexion supprimée | `Une méthode de connexion a été supprimée — BambuCalc` | Violet |
| 12 | Sécurité → Méthode MFA ajoutée | `Une double authentification a été activée sur votre compte — BambuCalc` | Violet |
| 13 | Sécurité → Méthode MFA supprimée | `La double authentification a été désactivée sur votre compte — BambuCalc` | Violet |

> Quand tu auras un logo, remplace le bloc SVG bouclier par `<img src="URL_LOGO" width="48" height="48" alt="BambuCalc">` dans chaque header.
> Ces 2 templates MFA ne se déclenchent que si le MFA est activé dans Supabase → Authentication → Sign In / MFA.
