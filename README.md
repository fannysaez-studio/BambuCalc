# BambuCalc 🖨️

> Calculateur de coûts d'impression 3D pour imprimantes **Bambu Lab** — devis PDF, gestion clients, emails automatiques et paiements Stripe.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.98-3ecf8e?logo=supabase&logoColor=white)
![Licence MIT](https://img.shields.io/badge/Licence-MIT-blue)

---

## Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Stack](#stack)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Flux métier](#flux-métier)
- [Edge Functions](#edge-functions-supabase)
- [Commandes](#commandes)
- [Déploiement Netlify](#déploiement-netlify)
- [Dépannage](#dépannage)

---

## Vue d'ensemble

BambuCalc est une application web B2B permettant à un prestataire d'impression 3D de :

- **Calculer** les coûts (matière, électricité, main d'œuvre, marge)
- **Générer des devis PDF** professionnels avec coordonnées client
- **Gérer** l'ensemble des devis et clients depuis un dashboard admin
- **Envoyer** les devis par email directement au client (avec PDF joint)
- **Encaisser** via Stripe (paiement en ligne) ou virement/chèque

---

## Stack

### Frontend

| Technologie | Version | Rôle |
| --- | --- | --- |
| **Vue.js** | 3.5 | Framework UI |
| **Vite** | 8.0 | Build tool |
| **Vue Router** | 5.0 | Routage |
| **Pinia** | 3.0 | État global |
| **Lucide Vue** | 1.0 | Icônes |
| **jsPDF** | 4.2 | Génération PDF côté client |

### Backend & Services

| Technologie | Rôle |
| --- | --- |
| **Supabase** | Base de données PostgreSQL + Auth + Edge Functions |
| **Brevo** | Emails transactionnels (devis client + bienvenue) |
| **Stripe** | Paiements en ligne |
| **Netlify** | Hébergement frontend |

### Qualité

| Outil | Rôle |
| --- | --- |
| **ESLint + Prettier** | Linting et formatage |
| **Vitest** | Tests unitaires |
| **Playwright** | Tests E2E |

---

## Installation

### Prérequis

- **Node.js** 20.19.0+ ou 22.12.0+
- **npm** 10.0.0+

```sh
node --version   # v20+
npm --version    # 10+
```

### Étapes

```sh
# 1. Cloner
git clone <url-du-repo>
cd BambuCalc

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir .env.local avec vos clés (voir section suivante)

# 4. Lancer
npm run dev
# → http://localhost:5173
```

---

## Variables d'environnement

Créez `.env.local` à la racine du projet :

```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe — paiements en ligne (optionnel en dev)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

Les secrets backend (jamais exposés au navigateur) sont configurés dans **Supabase → Edge Functions → Secrets** :

```text
BREVO_API_KEY              → Clé API REST Brevo (xkeysib-...)
STRIPE_SECRET_KEY          → Clé secrète Stripe
STRIPE_WEBHOOK_SECRET      → Secret de validation des webhooks Stripe
SUPABASE_SERVICE_ROLE_KEY  → Clé service Supabase (auto-injectée)
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
│   │   ├── PrivacyPolicy.vue
│   │   └── MentionsLegales.vue
│   ├── router/             # index.js — routes + guards auth/admin
│   ├── stores/             # Pinia (calculator.js)
│   ├── utils/              # auth.js · quotes.js · stripe.js · generateQuotePDF.js
│   ├── lib/                # supabase.js
│   └── styles/             # admin-dashboard.css + modules CSS
├── supabase/
│   ├── migrations/         # 5 migrations versionnées
│   └── functions/
│       ├── _shared/        # cors.ts (CORS centralisé)
│       ├── send-quote-email/    # Email devis → client + notification admin
│       ├── send-welcome-email/  # Email bienvenue à l'inscription
│       ├── create-payment-intent/  # Création PaymentIntent Stripe
│       └── stripe-webhook/      # Réception événements Stripe
├── public/                 # Assets statiques (SVG, images)
├── netlify.toml            # Config Netlify (headers HTTP sécurité)
└── e2e/                    # Tests Playwright
```

---

## Flux métier

### Création d'un devis

```text
Utilisateur remplit le calculateur (4 étapes)
    ↓
Store Pinia → saveQuote() → Supabase (table quotes)
    ↓
Devis visible dans Dashboard client + Admin
```

### Envoi du devis par l'admin

```text
Admin : onglet "Gestion Devis" → bouton "Envoyer"
    ↓
Modal de prévisualisation (sujet, intro, total, PDF joint)
    ↓
Edge Function send-quote-email (Brevo)
    ├── Email CLIENT : devis complet + PDF joint
    └── Email ADMIN  : notification récapitulative
    ↓
Statut devis → "sent"
```

### Paiement Stripe

```text
Admin ajoute un lien Stripe dans "Gestion Devis"
    ↓
Client reçoit le lien par email → page de paiement Stripe
    ↓
Webhook Stripe → Edge Function stripe-webhook
    ↓
Statut devis → "paid"
```

### Variables email personnalisables

Dans l'onglet **Emails** du dashboard admin :

| Variable | Remplacée par |
| --- | --- |
| `[client]` | Prénom du client |
| `[client_nom]` | Civilité + nom |
| `[numéro]` | Numéro de devis |
| `[projet]` | Nom de la pièce |
| `[total]` | Montant TTC |

---

## Edge Functions Supabase

| Fonction | Déclencheur | Rôle |
| --- | --- | --- |
| `send-quote-email` | Admin clique "Envoyer" | Email devis au client (Brevo) + notification admin |
| `send-welcome-email` | Inscription utilisateur | Email de bienvenue (Brevo) |
| `create-payment-intent` | Client paie en ligne | Crée un PaymentIntent Stripe sécurisé |
| `stripe-webhook` | Événement Stripe | Met à jour le statut du devis en base |

### Déployer une fonction

```sh
npx supabase functions deploy send-quote-email
npx supabase functions deploy send-welcome-email
npx supabase functions deploy create-payment-intent
npx supabase functions deploy stripe-webhook
```

---

## Commandes

### Développement

```sh
npm run dev          # Serveur local → http://localhost:5173
npm run build        # Build production → dist/
npm run preview      # Prévisualiser le build
```

### Linting

```sh
npm run lint         # ESLint
npm run format       # Prettier
```

### Tests

```sh
# Unitaires
npm run test:unit
npm run test:unit -- --watch
npm run test:unit -- --coverage

# E2E
npx playwright install   # Une seule fois
npm run test:e2e
npm run test:e2e -- --headed   # Mode visible
```

### Supabase CLI

```sh
npx supabase secrets list                          # Voir les secrets
npx supabase secrets set CLE=valeur               # Ajouter un secret
npx supabase functions deploy <nom-fonction>       # Déployer une fonction
```

---

## Déploiement Netlify

1. **Créer un projet** sur [app.netlify.com](https://app.netlify.com) → importer depuis GitHub

2. **Build settings**

   ```text
   Branche      : main
   Commande     : npm run build
   Dossier dist : dist/
   ```

3. **Variables d'environnement** (Netlify → Site configuration → Environment)

   ```text
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_STRIPE_PUBLIC_KEY
   ```

4. **Déploiement continu**

   ```sh
   git push origin main
   # Netlify redéploie automatiquement
   ```

5. **Après le premier déploiement** (24-48h après SSL stable)
   Activer HSTS dans `netlify.toml` en décommentant les headers `Strict-Transport-Security`.

---

## Dépannage

### Supabase : variables manquantes

```text
[BambuCalc] Variables d'environnement Supabase manquantes.
```

→ Vérifiez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env.local`

### Edge Function : BREVO_API_KEY absente

```sh
npx supabase secrets list   # Vérifier que BREVO_API_KEY est présente
npx supabase secrets set BREVO_API_KEY=xkeysib-...
npx supabase functions deploy send-quote-email
```

### HMR ne fonctionne pas

```sh
rm -rf node_modules .vite
npm install
npm run dev
```

### Port 5173 déjà utilisé

```sh
npm run dev -- --port 3000
```

### Stripe webhook local

```sh
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe trigger payment_intent.succeeded
```

---

## Conformité légale

- **RGPD** : formulaire d'inscription avec consentement explicite, politique de confidentialité complète (`/privacy`)
- **LCEN** : page mentions légales (`/mentions-legales`)
- **Cookies** : bandeau de consentement, Stripe chargé uniquement après accord
- **Hébergement** : Netlify (USA — SCCs) + Supabase EU (Frankfurt)

---

## Ressources

- [Vue 3](https://vuejs.org/) · [Vite](https://vite.dev/) · [Pinia](https://pinia.vuejs.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Brevo API v3](https://developers.brevo.com/)
- [Stripe API](https://stripe.com/docs/api)

---

**Dernière mise à jour** : Mai 2026 — Fanny Saez
