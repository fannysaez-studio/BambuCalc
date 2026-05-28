# BambuCalc

> Calculateur de coûts d'impression 3D pour imprimantes **Bambu Lab** — devis PDF, gestion clients, emails automatiques et paiements multi-méthodes.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.106-3ecf8e?logo=supabase&logoColor=white)
![Licence MIT](https://img.shields.io/badge/Licence-MIT-blue)

---

## Vue d'ensemble

BambuCalc est une application web B2B permettant à un prestataire d'impression 3D de :

- **Calculer** les coûts (matière, électricité, main d'œuvre, marge)
- **Générer des devis PDF** professionnels avec coordonnées client
- **Gérer** l'ensemble des devis et clients depuis un dashboard admin
- **Envoyer** les devis par email directement au client (avec PDF joint)
- **Encaisser** via Stripe (carte, Apple Pay, Google Pay), PayPal, virement, chèque ou espèces — le client choisit sa préférence dans le formulaire

---

## Stack

| Technologie                 | Rôle                                 |
| --------------------------- | ------------------------------------ |
| **Vue.js 3.5** + Vite 8     | Framework UI + build                 |
| **Vue Router 5** + Pinia 3  | Routage + état global                |
| **jsPDF 4**                 | Génération PDF côté client           |
| **Supabase**                | PostgreSQL + Auth + Edge Functions   |
| **Brevo**                   | Emails transactionnels               |
| **Stripe**                  | Paiements en ligne (Payment Element) |
| **Netlify**                 | Hébergement frontend                 |
| **Vitest** + **Playwright** | Tests unitaires + E2E                |

---

## Installation

```sh
git clone <url-du-repo> && cd BambuCalc
npm install
cp .env.example .env.local   # remplir avec vos clés
npm run dev                  # → http://localhost:5173
```

---

## Variables d'environnement

`.env.local` (frontend) :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLIC_KEY=pk_live_...   # pk_test_... en dev
```

Secrets backend dans **Supabase → Edge Functions → Secrets** :

```text
BREVO_API_KEY              → xkeysib-...
STRIPE_SECRET_KEY          → sk_live_... (ou sk_test_...)
STRIPE_WEBHOOK_SECRET      → whsec_...
SUPABASE_SERVICE_ROLE_KEY  → auto-injectée
```

---

## Structure du projet

```text
BambuCalc/
├── src/
│   ├── components/
│   │   ├── admin/          # 8 onglets admin (ClientsTab, QuotesTab, EmailsTab…)
│   │   ├── calculator/     # Étapes du calculateur (11 composants)
│   │   └── ui/             # Composants globaux (NavBar, Toast, CookieBanner…)
│   ├── views/
│   │   ├── auth/           # Login, Signup, ResetPassword
│   │   ├── calculator/     # CalculatorStep
│   │   ├── dashboard/      # Dashboard, UserProfile
│   │   ├── admin/          # AdminDashboard
│   │   ├── Landing.vue
│   │   ├── Contact.vue
│   │   ├── PaymentView.vue
│   │   ├── PrivacyPolicy.vue
│   │   └── MentionsLegales.vue
│   ├── router/             # index.js — routes + guards auth/admin
│   ├── stores/             # Pinia (calculator.js)
│   ├── utils/              # auth.js · quotes.js · stripe.js · generateQuotePDF.js
│   ├── lib/                # supabase.js
│   └── styles/             # modules CSS
├── supabase/
│   ├── migrations/         # 5 migrations versionnées
│   └── functions/          # send-quote-email · send-welcome-email · create-payment-intent · stripe-webhook
├── netlify.toml            # Headers HTTP sécurité
└── e2e/                    # Tests Playwright
```

---

## Flux métier

### Création d'un devis

```text
Calculateur (5 étapes) → saveQuote() → Supabase (quotes)
→ Devis visible Dashboard client + Admin
```

### Envoi par l'admin

```text
Admin → "Gestion Devis" → bouton "Envoyer"
→ Modal prévisualisation → Edge Function send-quote-email (Brevo)
   ├── Email CLIENT : devis + PDF joint
   └── Email ADMIN  : notification
→ Statut "sent"
```

### Paiement

Le client choisit son mode dans le formulaire (`ClientInfo.vue`) :

| Méthode                        | Traitement                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| Carte / Apple Pay / Google Pay | Automatisé via Stripe Payment Element + webhook                   |
| PayPal                         | Préférence enregistrée — admin envoie un lien PayPal manuellement |
| Virement / Chèque / Espèces    | Hors-ligne — suivi manuel                                         |

> Le **Stripe Payment Element** (`layout: 'tabs'`) affiche automatiquement les méthodes activées dans le Stripe Dashboard (dont PayPal si activé côté Stripe).

### Variables email personnalisables

`[client]` · `[client_nom]` · `[numéro]` · `[projet]` · `[total]`

---

## Edge Functions Supabase

| Fonction                | Déclencheur      | Rôle                                     |
| ----------------------- | ---------------- | ---------------------------------------- |
| `send-quote-email`      | Admin "Envoyer"  | Email devis client (Brevo) + notif admin |
| `send-welcome-email`    | Inscription      | Email de bienvenue (Brevo)               |
| `create-payment-intent` | Client paie      | Crée un PaymentIntent Stripe sécurisé    |
| `stripe-webhook`        | Événement Stripe | Met à jour le statut en base             |

```sh
npx supabase functions deploy send-quote-email --no-verify-jwt
npx supabase functions deploy send-welcome-email --no-verify-jwt
npx supabase functions deploy create-payment-intent --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

> **`--no-verify-jwt` est obligatoire** : la clé anon Supabase (`sb_publishable_*`) n'est pas un JWT signé. Sans ce flag, le déploiement échoue avec une erreur d'authentification.

---

## Commandes

```sh
npm run dev          # → http://localhost:5173
npm run build        # build → dist/
npm run lint         # ESLint + Prettier
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (npx playwright install au premier lancement)
```

---

## Déploiement Netlify

1. Importer le repo sur [app.netlify.com](https://app.netlify.com) — build `npm run build`, dossier `dist/`
2. Ajouter les variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLIC_KEY`
3. `git push origin main` redéclenche le déploiement automatiquement
4. Après 24-48h (SSL stable) : décommenter les headers `Strict-Transport-Security` dans `netlify.toml`

---

## Dépannage

**Variables Supabase manquantes** → vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env.local`

**BREVO_API_KEY absente** →

```sh
npx supabase secrets set BREVO_API_KEY=xkeysib-...
npx supabase functions deploy send-quote-email --no-verify-jwt
```

**Tester le webhook Stripe en local** →

```sh
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe trigger payment_intent.succeeded
```

---

## Conformité légale

- **RGPD** : consentement explicite à l'inscription, politique de confidentialité (`/privacy`)
- **LCEN** : mentions légales (`/mentions-legales`)
- **Cookies** : bandeau de consentement, Stripe chargé uniquement après accord
- **Hébergement** : Netlify (USA — SCCs) + Supabase EU (Frankfurt)

---

## Ressources

[Vue 3](https://vuejs.org/) · [Supabase](https://supabase.com/docs) · [Brevo API](https://developers.brevo.com/) · [Stripe API](https://stripe.com/docs/api)

---

**Dernière mise à jour** : 28 mai 2026 — Fanny Saez
