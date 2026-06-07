# Audit complet — BambuCalc

> Vision A–Z du projet · Mis à jour le 07 juin 2026 · Fanny Saez

---

## Sommaire

1. [Cadrage du projet](#1-cadrage-du-projet)
2. [Outils d'organisation](#2-outils-dorganisation)
3. [Maquettes & Architecture UX](#3-maquettes--architecture-ux)
4. [BDD — Conception](#4-bdd--conception)
5. [Structure Frontend](#5-structure-frontend)
6. [Interactivité Frontend](#6-interactivité-frontend)
7. [Back-End & Serverless](#7-back-end--serverless)
8. [Authentification & Rôles](#8-authentification--rôles)
9. [Sécurité](#9-sécurité)
10. [Documentation](#10-documentation)
11. [Déploiement](#11-déploiement)
12. [Tests](#12-tests)
13. [Performances & SEO](#13-performances--seo)
14. [Conformité légale & RGPD](#14-conformité-légale--rgpd)
15. [Résumé global](#15-résumé-global)

---

## 1. Cadrage du projet

### Contexte

BambuCalc est une application web **B2B** développée par Fanny Saez pour répondre à un besoin réel : gérer l'activité commerciale d'un prestataire d'impression 3D sur imprimantes Bambu Lab. L'outil couvre l'ensemble du flux métier de bout en bout.

### Objectifs

| Objectif | Solution implémentée |
|---|---|
| Calculer les coûts d'impression | Calculateur 8 étapes guidées avec Pinia |
| Générer des devis professionnels | jsPDF + autotable côté navigateur |
| Gérer les clients et devis | Dashboard admin complet (5 onglets) |
| Envoyer les devis par email | Brevo API v3 + PDF joint en base64 |
| Encaisser les paiements | Stripe Payment Element + PayPal + modes hors-ligne |
| Prendre des rendez-vous | Calendly intégré + webhook BDD |
| Notifier en temps réel | Supabase Realtime + Web Push VAPID |
| Maintenir des performances optimales | Lighthouse 100 desktop / 99 mobile |

### Public cible

- **Admin** (Fanny Saez) : gère tous les devis, clients, RDV, emails, statistiques
- **Clients** : consultent leurs devis, suivent leur statut, paient, prennent RDV
- **Visiteurs** : utilisent le calculateur public, remplissent le formulaire contact

---

## 2. Outils d'organisation

### Versionnement Git

- **Dépôt** : GitHub — `main` comme branche unique de production
- **Convention de commits** : [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat(scope):` — nouvelle fonctionnalité
  - `fix(scope):` — correction de bug
  - `style(scope):` — CSS/UI sans logique
  - `docs(scope):` — documentation
  - `refactor(scope):` — refactorisation sans comportement nouveau
- **Fréquence** : commits atomiques par fonctionnalité ou correction
- **Déploiement continu** : chaque `git push origin main` déclenche un build Netlify automatique

### Stack de développement

| Outil | Rôle |
|---|---|
| VS Code | Éditeur principal |
| Vite 8 | Serveur de développement HMR ultra-rapide |
| ESLint + OxLint | Qualité et cohérence du code |
| Prettier | Formatage automatique |
| Vitest | Tests unitaires |
| Playwright | Tests E2E |

---

## 3. Maquettes & Architecture UX

### Design system

| Élément | Valeur |
|---|---|
| Couleur principale (admin) | Violet `#7961E9` |
| Couleur principale (client) | Teal `#2e9cab` |
| Couleur accent | Orange `#ea6c0a` |
| Icônes | Lucide Vue Next (600+ SVG) |
| Police | Système (sans-serif natif) |
| Fond commun | `hero-vagues.svg` (10+ pages) |

### Architecture des vues

```
Landing (/)
  ↓ hero + features + CTA
Calculateur (/calculator/1 à 8)
  ↓ accordéon 8 étapes + stepper
  ↓ Pinia store (persistance)
Dashboard client (/dashboard)
  ↓ 3 onglets : Mes devis / Mes RDV / Mon profil
Dashboard admin (/admin)
  ↓ 5 onglets + 2 dropdowns
Page RDV (/rdv)
  ↓ stepper 3 étapes + Calendly embedded
Paiement (/pay/:quoteId)
  ↓ Stripe Payment Element
```

### Navigation

- **Desktop** : sidebar verticale collapsible (icône seule ↔ icône + label)
- **Mobile** : bottom bar fixe + bottom sheets slide-up
- **Cloche notifications** : panel desktop / bottom sheet mobile
- **Bouton RDV** : pill "Prendre RDV" desktop / bottom sheet mobile

---

## 4. BDD — Conception

### Hébergement

**PostgreSQL via Supabase Cloud** (région EU Frankfurt) — jamais de données en dehors de l'Union Européenne.

### Schéma des tables

| Table | Rôle | Clé primaire |
|---|---|---|
| `auth.users` | Authentification (gérée par Supabase) | `id` uuid |
| `profiles` | Données profil étendues | `id` uuid (FK → auth.users) |
| `admins` | Marqueur administrateur | `user_id` uuid (FK → auth.users) |
| `quotes` | Devis avec snapshot des coûts calculés | `id` uuid |
| `notifications` | Notifications in-app (Realtime) | `id` uuid |
| `push_subscriptions` | Souscriptions Web Push VAPID | `id` uuid |
| `appointments` | Rendez-vous Calendly synchronisés | `id` uuid |
| `email_settings` | Templates email personnalisables | `id` uuid |
| `contact_rate_limit` | Rate limiting formulaire contact | `id` uuid |

### Relations

```
auth.users
  ├── profiles (1:1, ON DELETE CASCADE)
  ├── admins (0:1, ON DELETE CASCADE)
  ├── quotes (1:N, ON DELETE CASCADE)
  ├── notifications (1:N, ON DELETE CASCADE)
  └── push_subscriptions (1:N, ON DELETE CASCADE)

quotes
  └── notifications (0:N, ON DELETE CASCADE)

appointments
  └── linked_quote_id → quotes (0:1, ON DELETE SET NULL)
```

### Row Level Security (RLS)

RLS activé sur **toutes les tables**. Chaque utilisateur n'accède qu'à ses propres données, côté serveur — le navigateur ne peut pas contourner ces règles.

| Table | Client | Admin | Service Role |
|---|---|---|---|
| `quotes` | CRUD ses propres devis | CRUD tous | — |
| `profiles` | R/U son profil | R tous | — |
| `admins` | SELECT seul (vérif is_admin) | SELECT | — |
| `notifications` | CRUD ses notifs | CRUD siennes | INSERT via triggers |
| `push_subscriptions` | CRUD ses subscriptions | — | SELECT all (envoi push) |
| `appointments` | SELECT ses RDV + UPDATE linked_quote_id | CRUD tous | INSERT (webhook) |
| `email_settings` | ❌ | R/U | — |
| `contact_rate_limit` | ❌ | ❌ | CRUD (Edge Function) |

### Triggers automatiques

| Trigger | Événement | Action |
|---|---|---|
| `on_auth_user_created` | Inscription | Crée un profil dans `profiles` |
| `on_quote_insert` | Nouveau devis | Notifie tous les admins (`new_quote`) |
| `on_quote_update` | Statut changé | Notifie le client (`status_changed` ou `quote_modified`) |

### Fonctions PostgreSQL

| Fonction | Type | Rôle |
|---|---|---|
| `is_admin()` | RPC | `true` si l'utilisateur courant est admin |
| `handle_new_user()` | trigger fn | Crée le profil à l'inscription |
| `admin_delete_user(uuid)` | RPC sécurisée | Suppression utilisateur (admin seulement) |
| `delete_own_account()` | RPC | Supprime son propre compte en cascade |
| `trigger_notify_new_quote()` | trigger fn | INSERT notifications pour les admins |
| `trigger_notify_quote_update()` | trigger fn | INSERT notification pour le client |

### Index de performance

```sql
quotes_user_id_idx          -- recherche devis par utilisateur
quotes_created_at_idx       -- tri chronologique
quotes_stripe_intent_idx    -- lookup webhook Stripe (partiel IS NOT NULL)
quotes_payment_status_idx   -- filtrage par statut paiement
```

---

## 5. Structure Frontend

### Stack

| Couche | Technologie | Version |
|---|---|---|
| Framework | Vue.js | 3.5 (Composition API + Options API) |
| Build | Vite | 8.0 |
| Routage | Vue Router | 5.0 |
| État global | Pinia | 3.0 |
| Icônes | Lucide Vue Next | 1.0 |
| SEO | @vueuse/head | 2.0 |
| PDF | jsPDF + autotable | 4.2 / 5.0 |

### 18 routes

| Route | Vue | Protection |
|---|---|---|
| `/` | Landing.vue | Publique |
| `/calculator/:step` | CalculatorStep.vue | Publique |
| `/login` | Login.vue | Redirige si connecté |
| `/signup` | Signup.vue | Redirige si connecté |
| `/reset-password` | ResetPassword.vue | Publique |
| `/dashboard` | Dashboard.vue | Auth requis |
| `/profile` | UserProfile.vue | Auth requis |
| `/admin` | AdminDashboard.vue | Auth + Admin requis |
| `/pay/:quoteId` | PaymentView.vue | Auth requis |
| `/contact` | Contact.vue | Publique |
| `/rdv` | BookingPage.vue | Publique |
| `/privacy` | PrivacyPolicy.vue | Publique |
| `/mentions-legales` | MentionsLegales.vue | Publique |
| `/maintenance` | Maintenance.vue | Publique |
| `/403` | Forbidden.vue | Publique |
| `/404` | NotFound.vue | Publique |

### Composants clés

```
src/components/
  ui/
    GlobalNav.vue         — sidebar + bottom bar + nav-island
    NotificationBell.vue  — cloche temps réel (panel / bottom sheet)
    CalendarPanel.vue     — bouton RDV (panel / bottom sheet)
    ToastMessage.vue      — notifications flash
    CookieBanner.vue      — consentement RGPD
    PasswordField.vue     — input mot de passe avec toggle
    QuotePreviewModal.vue — prévisualisation devis avant envoi
  calculator/             — 13 composants (étapes 1→8)
  admin/                  — 9 onglets AdminDashboard
```

### Lazy loading

Toutes les routes non critiques sont en import dynamique pour réduire le bundle initial :

```js
// Routes en lazy loading
Dashboard:    () => import('@/views/dashboard/Dashboard.vue')
AdminDash:    () => import('@/views/admin/AdminDashboard.vue')
Contact:      () => import('@/views/Contact.vue')
BookingPage:  () => import('@/views/BookingPage.vue')
PaymentView:  () => import('@/views/PaymentView.vue')
Landing:      () => import('@/views/Landing.vue')
// etc.
```

**Résultat** : bundle principal 326 KB (vs 872 KB sans lazy loading, −63 %).

---

## 6. Interactivité Frontend

### Calculateur (8 étapes)

| Étape | Composant | Données saisies |
|---|---|---|
| 1 | ProjectDetails.vue | Nom projet, imprimante, profil d'impression, buse |
| 2 | FilamentSection.vue | Matière, coût/kg, poids (g) |
| 3 | PrintingTime.vue | Durée impression (h:min), temps travail (min) |
| 4 | PricingSuggestions.vue | Marge Standard / Compétitif / Premium / Custom |
| 5 | CostBreakdown.vue | Récapitulatif TTC en temps réel |
| 6 | ClientInfo.vue | Coordonnées client + mode paiement |
| 7 | ProjectConditions.vue | CGV, conditions |
| 8 | Sauvegarde | Bouton → INSERT Supabase + notification admin |

**Formule de calcul :**

```
coût matière  = (poids_g / 1000) × coût_par_kg
coût machine  = heures_impression × 5 €/h
coût travail  = (minutes_travail / 60) × 15 €/h
sous-total    = matière + machine + travail + packaging
TVA           = sous-total × taux_TVA / 100
total TTC     = sous-total + TVA
prix vente    = total TTC × (1 + marge / 100)
```

### Formulaires

| Formulaire | Validation | Protection |
|---|---|---|
| Inscription | Email + mot de passe fort | Confirmation email Supabase |
| Connexion | Email + mot de passe | Rate limiting Supabase natif |
| Contact | Captcha math (A+B=?) frontend | Rate limiting serveur 3/10min IP hashée |
| Profil | Champs nom / email | Auth JWT obligatoire |
| Paiement | Stripe Payment Element natif | JWT + ownership + recalcul BDD |

### Appels API

| Action | Méthode | Cible |
|---|---|---|
| Charger les devis | `supabase.from('quotes').select()` | Supabase PostgreSQL |
| Sauvegarder un devis | `supabase.from('quotes').insert()` | Supabase PostgreSQL |
| Envoyer un devis email | `fetch('/functions/v1/send-quote-email')` | Edge Function |
| Créer un paiement | `fetch('/functions/v1/create-payment-intent')` | Edge Function |
| Soumettre le contact | `fetch('/functions/v1/send-contact-email')` | Edge Function |
| Charger les notifications | `supabase.from('notifications').select()` | Supabase PostgreSQL |
| Écouter les changements | `supabase.channel().on('postgres_changes')` | Supabase Realtime |

### Realtime

```js
supabase
  .channel('notifications-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    notifications.value.unshift(payload.new)
  })
  .subscribe()
```

→ La cloche se met à jour instantanément sans rechargement.

---

## 7. Back-End & Serverless

### 10 Edge Functions Supabase (Deno / TypeScript)

| Fonction | Fournisseur | Déclencheur | JWT requis |
|---|---|---|---|
| `send-quote-email` | Brevo | Admin "Envoyer" | ✅ + is_admin |
| `send-welcome-email` | Brevo | Inscription | ❌ (interne) |
| `send-contact-email` | Resend | Formulaire contact | ❌ + rate limit |
| `create-payment-intent` | Stripe | Client paie | ✅ + ownership |
| `stripe-webhook` | Stripe | Événement Stripe | ❌ + signature HMAC |
| `send-push` | VAPID | Admin manuel | ✅ + is_admin |
| `notify-new-quote` | VAPID | Devis créé | ❌ (interne trigger) |
| `notify-quote-update` | VAPID | Statut changé | ❌ (interne trigger) |
| `handle-calendly-webhook` | Calendly | RDV réservé/annulé | ❌ + secret URL |
| `remind-rdv` | Brevo + VAPID | Cron 24h avant | ❌ + service_role |

### Logique de sécurité par fonction

**`create-payment-intent`** — la plus critique :
1. Vérifie le JWT Supabase
2. Vérifie que le devis appartient à l'utilisateur (`user_id = auth.uid()`)
3. Bloque si `payment_status = 'paid'` (anti-doublon)
4. **Recalcule le montant depuis la BDD** — jamais depuis le body de la requête
5. Retourne `client_secret` Stripe

**`stripe-webhook`** :
- Signature HMAC vérifiée via `STRIPE_WEBHOOK_SECRET`
- Utilise `SERVICE_ROLE_KEY` (webhook serveur→serveur, contourne RLS volontairement)

**`send-contact-email`** :
- Rate limiting : 3 messages max / 10 min / IP (hash SHA-256 salé, IP jamais en clair)
- `htmlEscape()` sur tous les inputs avant interpolation HTML

### Brevo vs Resend

| | Brevo | Resend |
|---|---|---|
| Utilisé pour | Devis + bienvenue + rappel RDV | Formulaire contact |
| Avantage | Supporte les **pièces jointes** (PDF) | Sandbox gratuit sans domaine |

---

## 8. Authentification & Rôles

### Supabase Auth

- **JWT** : chaque utilisateur connecté reçoit un token signé (access + refresh)
- **Session** : gérée côté navigateur via `localStorage`
- **Confirmation email** : obligatoire à l'inscription avant de se connecter
- **Réinitialisation** : lien magique envoyé par email → `/reset-password`
- **Session anonyme** : les visiteurs peuvent utiliser le calculateur sans compte

### Rôles

| Rôle | Obtenu comment | Portée |
|---|---|---|
| **Visiteur** | Non connecté | Landing, calculateur, contact, /rdv |
| **Invité** | Session anonyme Supabase (auto) | Calculateur + dashboard temporaire |
| **Client** | Inscription + confirmation email | Dashboard : devis, RDV, profil, notifications |
| **Admin** | Inscription + `INSERT INTO admins (user_id)` | Tout — dashboard admin complet |

### Guard router (`beforeEach`)

```
1. Mode maintenance → /maintenance (sauf ?preview=SECRET)
2. Route /maintenance → laisse passer
3. Connecté sur /, /login, /signup → redirige dashboard ou admin
4. Route requiresAuth + non connecté → /login
5. Route requiresAdmin → RPC is_admin() → si false → /403
```

### Double vérification admin

La vérification admin se fait **deux fois** indépendamment :
1. **Frontend** (guard router) — empêche la navigation
2. **Base de données** (RLS) — bloque la requête SQL même si le router est contourné

---

## 9. Sécurité

> Section la plus critique — voir aussi `AUDIT.md` pour le détail des fixes.

### Couches de sécurité

| Couche | Mécanisme | État |
|---|---|---|
| Authentification | JWT Supabase signé | ✅ |
| Autorisation frontend | Guard router + is_admin() | ✅ |
| Autorisation BDD | RLS PostgreSQL (toutes tables) | ✅ |
| Autorisation Edge Functions | JWT + vérif is_admin ou ownership | ✅ |
| Webhooks | Signature HMAC (Stripe) / Secret URL (Calendly) | ✅ |
| Injection XSS | htmlEscape() sur tous les inputs contact | ✅ |
| Injection SQL | Requêtes paramétrées via Supabase JS SDK | ✅ |
| Rate limiting | 3 msg / 10 min / IP hashée (formulaire contact) | ✅ |
| CORS | Origines restreintes : bambucalc.netlify.app + localhost | ✅ |
| HTTPS | Enforced par Netlify (HSTS max-age=31536000) | ✅ |
| CSP | Content-Security-Policy stricte (netlify.toml) | ✅ |
| Cookies | Stripe chargé uniquement après consentement explicite | ✅ |
| Mots de passe | Jamais stockés — gérés par Supabase Auth (bcrypt) | ✅ |
| Secrets | Jamais exposés au navigateur (Edge Function secrets) | ✅ |
| Double paiement | Bloqué côté serveur (`payment_status = 'paid'`) | ✅ |
| IP contact | Hash SHA-256 salé — jamais stockée en clair | ✅ |

### Headers HTTP (netlify.toml)

```
X-Frame-Options:           DENY
X-Content-Type-Options:    nosniff
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy:   (voir ci-dessous)
```

### CSP complète

```
default-src 'self'
script-src  'self' https://js.stripe.com https://assets.calendly.com
frame-src   https://js.stripe.com https://calendly.com
connect-src 'self' https://*.supabase.co https://api.stripe.com
            https://api.brevo.com https://api.calendly.com
            https://accounts.google.com
style-src   'self' 'unsafe-inline'
img-src     'self' data: https: blob:
font-src    'self' data:
worker-src  blob:
object-src  'none'
base-uri    'self'
```

### RLS — Politique complète par table

#### `quotes`

```sql
-- Client : ses propres devis uniquement
SELECT WHERE auth.uid() = user_id
INSERT WITH CHECK auth.uid() = user_id
UPDATE WHERE auth.uid() = user_id
DELETE WHERE auth.uid() = user_id

-- Admin : tous les devis
SELECT, UPDATE, DELETE (toutes lignes)
```

#### `profiles`

```sql
-- Client : son propre profil
SELECT WHERE id = auth.uid()
UPDATE WHERE id = auth.uid()

-- Admin : tous les profils
SELECT (toutes lignes)
```

#### `notifications`

```sql
-- Tout utilisateur : ses propres notifications
SELECT, UPDATE, DELETE WHERE user_id = auth.uid()

-- INSERT : uniquement via triggers SECURITY DEFINER (pas de policy INSERT)
```

#### `push_subscriptions`

```sql
-- Client : ses propres souscriptions
ALL WHERE user_id = auth.uid()

-- service_role : SELECT all (pour envoi push par Edge Functions)
```

#### `appointments`

```sql
-- Client : ses propres RDV (lecture) + UPDATE linked_quote_id
SELECT WHERE invitee_email = auth.email()
UPDATE WHERE invitee_email = auth.email()  -- linked_quote_id uniquement

-- Admin : tout
SELECT, UPDATE, DELETE (toutes lignes)

-- INSERT : service_role uniquement (webhook Calendly)
```

#### `email_settings`

```sql
-- Admin uniquement
SELECT, UPDATE WHERE is_admin()
```

#### `contact_rate_limit`

```sql
-- Aucune policy utilisateur — uniquement service_role (Edge Function)
```

### Mots de passe

Les mots de passe **ne sont jamais stockés** dans la base de données BambuCalc. Supabase Auth gère l'ensemble du cycle d'authentification (hachage bcrypt, tokens, refresh). BambuCalc ne manipule jamais un mot de passe en clair.

### Protection anti-CSRF

Les Edge Functions Supabase utilisent des tokens JWT Bearer — ils ne reposent pas sur des cookies de session, ce qui les rend naturellement immunisés contre les attaques CSRF.

### Secrets — jamais exposés au navigateur

```text
BREVO_API_KEY           → supabase secrets (jamais dans .env.local)
RESEND_API_KEY          → supabase secrets
STRIPE_SECRET_KEY       → supabase secrets
STRIPE_WEBHOOK_SECRET   → supabase secrets
VAPID_PRIVATE_KEY       → supabase secrets
CALENDLY_WEBHOOK_SECRET → supabase secrets
SUPABASE_SERVICE_ROLE_KEY → auto-injectée par Supabase
```

Seules les clés publiques (`VITE_*`) sont exposées au navigateur — elles ne permettent aucune action privilegiée sans JWT valide.

### Fixes de sécurité appliqués (30/05/2026)

| Fix | Détail |
|---|---|
| `send-push` JWT obligatoire | Tout appel sans Bearer token valide → 401 |
| CORS restreint | `Access-Control-Allow-Origin: *` → liste explicite d'origines |
| htmlEscape contact | Tous les inputs utilisateur échappés avant HTML |
| Rate limiting contact | 3 messages / 10 min / IP hashée côté serveur |

---

## 10. Documentation

### Fichiers de documentation

| Fichier | Contenu |
|---|---|
| `README.md` | Entrée courte — architecture globale + table des matières + démarrage rapide |
| `AUDIT.md` | Audit sécurité détaillé avec fixes appliqués |
| `bambucalc/01-presentation.md` | Stack complète avec versions + modèle utilisateur |
| `bambucalc/02-installation.md` | Prérequis, étapes, toutes les variables d'env |
| `bambucalc/03-structure.md` | Arborescence complète + conventions de nommage |
| `bambucalc/04-flux-metier.md` | Tous les flux métier (calculateur → paiement → RDV) |
| `bambucalc/05-edge-functions.md` | 10 fonctions — détail, secrets, déploiement |
| `bambucalc/06-commandes.md` | Scripts npm + déploiement Netlify |
| `bambucalc/07-depannage.md` | Problèmes fréquents et solutions |
| `bambucalc/08-conformite.md` | RGPD, LCEN, cookies, données collectées |
| `bambucalc/09-lighthouse.md` | Scores 100/99 + historique optimisations |
| `bambucalc/10-base-de-donnees.md` | Schéma complet, tables, RLS, triggers, migrations |
| `bambucalc/11-roles-securite.md` | Guard router, RLS par table, audit Edge Functions |
| `bambucalc/12-notifications-push.md` | Notifs in-app Realtime + Web Push VAPID |
| `bambucalc/13-rdv-calendly.md` | Webhook Calendly, RdvTab, rappel 24h |
| `bambucalc/14-seo-meta.md` | Meta pour les 16 pages + JSON-LD + sitemap |
| `bambucalc/15-tests.md` | Vitest + Playwright — couverture et config |
| `bambucalc/16-audit-complet.md` | Ce document — vision A–Z |

---

## 11. Déploiement

### Frontend — Netlify

| Étape | Détail |
|---|---|
| Build | `npm run build` → `dist/` |
| Hébergement | Netlify CDN (HTTPS automatique) |
| CI/CD | `git push origin main` → build automatique |
| Variables d'env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLIC_KEY`, `VITE_VAPID_PUBLIC_KEY`, `VITE_PREVIEW_SECRET` |
| Redirects | `netlify.toml` — SPA fallback `/* → /index.html 200` |
| Headers sécurité | `netlify.toml` — CSP, HSTS, X-Frame-Options… |
| Sitemap | Généré automatiquement au build via `scripts/update-sitemap.js` |

### Back-End — Supabase

| Composant | Hébergement |
|---|---|
| PostgreSQL | Supabase Cloud (Frankfurt EU) |
| Edge Functions | Supabase Edge (Deno Deploy) |
| Realtime | Supabase Realtime (WebSocket) |
| Storage | Supabase Storage (non utilisé en prod) |

### Déploiement des Edge Functions

```sh
npx supabase functions deploy <nom-fonction> --no-verify-jwt
```

> `--no-verify-jwt` est obligatoire : la clé anon (`sb_publishable_*`) n'est pas un JWT signé.

---

## 12. Tests

### Tests unitaires — Vitest (140 tests)

| Fichier | Ce qui est couvert |
|---|---|
| `calculator.test.js` | Marges, calculs coûts, sérialisation Pinia |
| `quotes.test.js` | CRUD devis Supabase (mock) |
| `auth.test.js` | Inscription, connexion, déconnexion |
| `generateQuotePDF.test.js` | Structure PDF, données client, items |
| `rdvUtils.test.js` | Formatage date/heure, LED présence/format |
| `stripe.test.js` | Initialisation Stripe, PaymentIntent |
| `usePushNotifications.test.js` | Abonnement push, désabonnement |
| `CookieBanner.test.js` | Consentement, chargement Stripe conditionnel |

### Tests E2E — Playwright (5 fichiers × 3 navigateurs)

| Fichier | Pages testées |
|---|---|
| `calculator.spec.js` | Navigation étapes, stepper, calculs temps réel |
| `pages.spec.js` | Login, signup, contact, landing |
| `mobile.spec.js` | Rendu mobile (viewport Pixel 5 — 393×851) |
| `dashboard-tabs.spec.js` | Onglets dashboard (requiert compte test) |
| `vue.spec.js` | Smoke test — app démarre + landing visible |

**3 navigateurs** : Chromium, Firefox, WebKit (Safari)

---

## 13. Performances & SEO

### Lighthouse (PageSpeed Insights — 05/06/2026)

| | Performances | Accessibilité | Bonnes pratiques | SEO |
|---|:---:|:---:|:---:|:---:|
| Desktop | **100** | **100** | **100** | **100** |
| Mobile | **99** | **100** | **100** | **100** |

### Optimisations appliquées

| Optimisation | Impact |
|---|---|
| Lazy loading routes (Landing, Dashboard, Admin…) | Bundle 872 KB → 326 KB (−63 %) |
| `transition: all` → propriétés spécifiques | Élimine repaint Compositor |
| Suppression `backdrop-filter` Landing | Élimine compositing layer inutile |
| Preload `hero-vagues.svg` et `maintenance.svg` | LCP résolu dès le HTML initial |
| ledPulse : `box-shadow` → `transform + opacity` | Animation purement composite (GPU) |
| Pas de `manualChunks` Vite | Évite la régression 97→89 mobile |

### SEO technique

- `@vueuse/head` — meta dynamiques sur 16 pages (title, description, OG, Twitter, canonical, robots)
- `index.html` — JSON-LD `WebApplication` + meta globales OG/Twitter
- `sitemap.xml` — généré au build, routes publiques uniquement
- `robots.txt` — configuration appropriée
- Pas de doublon `<title>` ou `<meta>` (useHead remplace, ne duplique pas)

---

## 14. Conformité légale & RGPD

### Pages légales

| Page | URL | Contenu |
|---|---|---|
| Politique de confidentialité | `/privacy` | Traitement des données, RGPD, droits utilisateurs |
| Mentions légales | `/mentions-legales` | Éditeur, hébergeur, propriété intellectuelle (LCEN) |

### Données collectées

| Donnée | Stockée où | Durée |
|---|---|---|
| Email, nom | Supabase auth.users + profiles | Jusqu'à suppression du compte |
| Devis | Supabase quotes | Jusqu'à suppression |
| Rendez-vous | Supabase appointments | Jusqu'à suppression |
| Souscriptions push | Supabase push_subscriptions | Jusqu'à désabonnement |
| IP contact (hashée SHA-256) | contact_rate_limit | 10 minutes (auto-nettoyage) |
| Paiements | Stripe (jamais côté Supabase) | Géré par Stripe |

### Droits des utilisateurs

| Droit | Implémentation |
|---|---|
| Droit d'accès | Dashboard client — toutes les données visibles |
| Droit de suppression | Bouton "Supprimer mon compte" → `delete_own_account()` (cascade) |
| Portabilité | Export PDF des devis depuis le dashboard |
| Consentement cookies | Bandeau RGPD — Stripe chargé uniquement après accord |

### Hébergement

- **Frontend** : Netlify (USA — SCCs en place)
- **BDD + Back-End** : Supabase Cloud Frankfurt (UE) — données jamais hors EU

---

## 15. Résumé global

### Vision d'ensemble

BambuCalc est une application SaaS complète et production-ready qui couvre l'intégralité du flux métier d'un prestataire d'impression 3D. Chaque couche est sécurisée indépendamment des autres (défense en profondeur).

### Points forts

| Domaine | Niveau |
|---|---|
| Architecture | SPA Vue 3 + serverless Deno — découplé et scalable |
| Sécurité | Défense en profondeur : RLS + JWT + CSP + HSTS + rate limiting |
| Performances | Lighthouse 100 desktop / 99 mobile |
| Documentation | 16 fichiers .md couvrant chaque aspect du projet |
| Tests | 140 Vitest + Playwright 3 navigateurs |
| Conformité | RGPD + LCEN + cookies conformes |
| Déploiement | CI/CD automatique via git push |
| Temps réel | Supabase Realtime + Web Push VAPID |

### Bilan sécurité

| Couche | État |
|---|---|
| Guard router frontend | ✅ Double vérification auth + admin |
| RLS PostgreSQL | ✅ Toutes tables, toutes opérations |
| Edge Functions | ✅ JWT / signature / rate limit selon contexte |
| Headers HTTP | ✅ CSP, HSTS, X-Frame-Options, CORS |
| Mots de passe | ✅ Jamais stockés — bcrypt Supabase Auth |
| Secrets | ✅ Jamais exposés au navigateur |
| XSS | ✅ htmlEscape() + CSP strict |
| CSRF | ✅ JWT Bearer (pas de cookie de session) |
| Rate limiting | ✅ Contact 3/10min IP hashée côté serveur |
| Double paiement | ✅ Bloqué côté serveur |

---

<div align="center">

**Retour à l'index :** [← README](../README.md)

</div>
