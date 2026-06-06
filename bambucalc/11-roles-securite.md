# Rôles & Sécurité

Audit réalisé le 30/05/2026, mis à jour le 05/06/2026. Tout est sur `main`.

---

## Rôles utilisateurs

| Rôle | Comment l'obtenir | Accès |
|---|---|---|
| **Visiteur** | Non connecté | Landing, /calculator, /contact, /rdv, /privacy, /mentions-legales |
| **Invité** | Session anonyme Supabase (auto) | Calculateur + dashboard temporaire (devis non persistés) |
| **Client** | Inscription + confirmation email | Dashboard : ses devis, ses RDV, son profil, notifications |
| **Admin** | Inscription + `INSERT INTO admins (user_id)` dans SQL Editor | Tout — dashboard admin, tous les devis, tous les clients, tous les RDV |

---

## Routes frontend — tableau d'accès

| Route | Visiteur | Client | Admin | Protection |
|---|---|---|---|---|
| `/` | ✅ | ↩️ dashboard | ↩️ admin | Guard : redirige si connecté |
| `/calculator/:step` | ✅ | ✅ | ✅ | Publique — voulu pour invités |
| `/login` `/signup` | ✅ | ↩️ dashboard | ↩️ admin | Guard : redirige si session active |
| `/reset-password` | ✅ | ✅ | ✅ | Publique |
| `/dashboard` | ↩️ login | ✅ | ✅ | `requiresAuth: true` |
| `/profile` | ↩️ login | ✅ | ✅ | `requiresAuth: true` |
| `/pay/:quoteId` | ↩️ login | ✅ si son devis | ✅ | `requiresAuth: true` + ownership Edge Fn |
| `/admin` | ↩️ login | ↩️ **403** | ✅ | `requiresAuth + requiresAdmin` → RPC `is_admin()` |
| `/rdv` `/contact` | ✅ | ✅ | ✅ | Publiques |
| `/privacy` `/mentions-legales` | ✅ | ✅ | ✅ | Publiques |
| `/maintenance` | ✅ | ✅ | ✅ | Publique (guard peut rediriger tout le monde ici) |
| `/403` `/404` | ✅ | ✅ | ✅ | Pages d'erreur publiques |

### Ordre d'exécution du guard `beforeEach`

```
1. Mode maintenance activé ? → redirige vers /maintenance (sauf bypass secret)
2. Route = /maintenance → laisse passer
3. Utilisateur connecté sur /, /login, /signup → redirige vers dashboard ou admin
4. Route requiresAuth + non connecté → redirige vers /login
5. Route requiresAdmin → appel RPC is_admin() → si false → /403
```

### Double vérification admin

La vérification admin est faite **deux fois** :
1. Côté frontend (guard router) — empêche la navigation
2. Côté BDD (RLS) — bloque la requête SQL même si quelqu'un contourne le router

---

## RLS PostgreSQL — par table

### Table `quotes`

| Opération | Client | Admin |
|---|---|---|
| SELECT | Ses propres devis (`user_id = auth.uid()`) | Tous les devis |
| INSERT | Ses propres devis (`with check: auth.uid() = user_id`) | ✅ |
| UPDATE | Ses propres devis | Tous les devis |
| DELETE | Ses propres devis | Tous les devis |

### Table `profiles`

| Opération | Client | Admin |
|---|---|---|
| SELECT | Son profil (`id = auth.uid()`) | Tous les profils |
| UPDATE | Son profil | ✅ |

### Table `admins`

| Opération | Client | Admin |
|---|---|---|
| SELECT | ✅ (pour vérifier is_admin) | ✅ |
| INSERT/DELETE | ❌ | Via SQL Editor uniquement |

### Table `notifications`

| Opération | Accès |
|---|---|
| SELECT | Ses propres notifications |
| UPDATE (marquer lu) | Ses propres notifications |
| DELETE | Ses propres notifications |
| INSERT | Uniquement via triggers `SECURITY DEFINER` |

### Table `push_subscriptions`

| Opération | Client | Service role (Edge Fn) |
|---|---|---|
| ALL | Ses propres souscriptions | Tout (pour envoi push) |

### Table `appointments`

| Opération | Client | Admin |
|---|---|---|
| SELECT | RDV où `invitee_email` = son email | Tous |
| UPDATE/DELETE | ❌ | ✅ |
| INSERT | ❌ | Via `service_role` (webhook Calendly) |

### Table `email_settings`

| Opération | Client | Admin |
|---|---|---|
| SELECT | ❌ | ✅ |
| UPDATE | ❌ | ✅ |

---

## Sécurité des Edge Functions

| Fonction | JWT | Vérification |
|---|---|---|
| `send-quote-email` | ✅ obligatoire | `is_admin` dans admins |
| `create-payment-intent` | ✅ obligatoire | `user_id = auth.uid()` sur le devis + recalcul montant BDD |
| `stripe-webhook` | Non (webhook Stripe) | Signature `STRIPE_WEBHOOK_SECRET` |
| `send-push` | ✅ obligatoire | `is_admin` dans admins |
| `handle-calendly-webhook` | Non (webhook Calendly) | `CALENDLY_WEBHOOK_SECRET` en paramètre URL |
| `send-contact-email` | Non (public) | Rate limiting IP hash + htmlEscape |
| `remind-rdv` | Non (cron) | `SERVICE_ROLE_KEY` (jamais exposée) |

---

## Headers HTTP (netlify.toml)

| Header | Valeur | Protège contre |
|---|---|---|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite d'URL dans Referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | API sensibles |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Downgrade HTTP |
| `Content-Security-Policy` | (voir netlify.toml) | XSS, injections |

### CSP détaillée

```
default-src 'self'
script-src  'self' https://js.stripe.com https://assets.calendly.com
frame-src   https://js.stripe.com https://calendly.com
connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.brevo.com
            https://api.calendly.com https://accounts.google.com
style-src   'self' 'unsafe-inline'
img-src     'self' data: https: blob:
font-src    'self' data:
worker-src  blob:
object-src  'none'
base-uri    'self'
```

---

## Autres protections appliquées

| Protection | Détail |
|---|---|
| Rate limiting contact | 3 messages max / 10 min / IP (hash SHA-256 salé) côté serveur |
| htmlEscape contact | Tous les inputs utilisateur échappés avant interpolation HTML |
| CORS Edge Functions | Origines restreintes : `bambucalc.netlify.app` + `localhost:5173/4173` |
| Cookie Stripe | Stripe.js chargé uniquement après consentement cookie |
| SESSION_ROLE_KEY | Jamais exposée côté navigateur, uniquement dans Edge Functions |
| Bypass maintenance | Secret URL `?preview=<VITE_PREVIEW_SECRET>` stocké dans localStorage |

---

<div align="center">

**Précédent :** [← Base de données](./10-base-de-donnees.md) &nbsp;|&nbsp; **Suivant :** [Notifications & Push →](./12-notifications-push.md)

</div>
