<div align="center">

# BambuCalc

> Application web B2B pour prestataires d'impression 3D **Bambu Lab** — calculateur de coûts, devis PDF, gestion clients, emails automatiques, paiements multi-méthodes, rendez-vous Calendly et notifications push.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.106-3ecf8e?logo=supabase&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.0-f7d336?logo=pinia&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-paiements-635bff?logo=stripe&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-email-0B996E)
![Resend](https://img.shields.io/badge/Resend-contact-000000)
![Calendly](https://img.shields.io/badge/Calendly-rdv-006BFF)
![Lighthouse](https://img.shields.io/badge/Lighthouse-100%20%2F%2099-00C853?logo=googlechrome&logoColor=white)
![Licence MIT](https://img.shields.io/badge/Licence-MIT-blue)

</div>

---

<div align="center">

## Architecture globale

</div>

```
Navigateur (Vue 3 SPA)
  │
  ├── Supabase JS SDK ──► Supabase Cloud (Frankfurt)
  │     ├── auth.users          (authentification JWT)
  │     ├── PostgreSQL (RLS)    (toutes les tables métier)
  │     ├── Realtime            (notifications live)
  │     └── Edge Functions      (10 fonctions Deno)
  │           ├── Brevo         (emails devis, bienvenue, rappel)
  │           ├── Resend        (email contact)
  │           ├── Stripe        (PaymentIntent + webhook)
  │           ├── Calendly      (webhook RDV)
  │           └── VAPID         (push navigateur)
  │
  └── Netlify CDN              (build dist/ + headers HTTP)
```

---

<div align="center">

## Documentation complète

| #   | Page                                                         | Ce qu'on y trouve                                     |
| --- | ------------------------------------------------------------ | ----------------------------------------------------- |
| 01  | [Présentation & stack](./bambucalc/01-presentation.md)       | Services, technologies, architecture                  |
| 02  | [Installation](./bambucalc/02-installation.md)               | Prérequis, étapes, variables d'environnement          |
| 03  | [Structure du projet](./bambucalc/03-structure.md)           | Arborescence complète et rôle de chaque fichier       |
| 04  | [Flux métier](./bambucalc/04-flux-metier.md)                 | Devis, envoi, paiement, notifications, RDV, rappels   |
| 05  | [Edge Functions](./bambucalc/05-edge-functions.md)           | 10 fonctions Supabase — détail, secrets, déploiement  |
| 06  | [Commandes & Déploiement](./bambucalc/06-commandes.md)       | Scripts dev/test/build et Netlify                     |
| 07  | [Dépannage](./bambucalc/07-depannage.md)                     | Problèmes fréquents et solutions                      |
| 08  | [Conformité légale](./bambucalc/08-conformite.md)            | RGPD, LCEN, cookies, hébergement                      |
| 09  | [Performances Lighthouse](./bambucalc/09-lighthouse.md)      | 100 desktop / 99 mobile — métriques détaillées        |
| 10  | [Base de données](./bambucalc/10-base-de-donnees.md)         | Schéma complet, tables, RLS, triggers, index          |
| 11  | [Rôles & Sécurité](./bambucalc/11-roles-securite.md)         | Guard router, RLS par table, audit Edge Functions     |
| 12  | [Notifications & Push](./bambucalc/12-notifications-push.md) | Notifs in-app Realtime + Web Push VAPID               |
| 13  | [RDV & Calendly](./bambucalc/13-rdv-calendly.md)             | Webhook Calendly, table appointments, admin RdvTab    |
| 14  | [SEO & Méta](./bambucalc/14-seo-meta.md)                     | Titres, descriptions, OG, canonical pour les 16 pages |
| 15  | [Tests](./bambucalc/15-tests.md)                             | Vitest (140 tests) + Playwright E2E (5 fichiers × 3 navigateurs) |

</div>

---

## Démarrage rapide

```sh
git clone <url-du-repo> && cd BambuCalc
npm install
cp .env.example .env.local   # remplir avec vos clés Supabase + Stripe
npm run dev                  # → http://localhost:5173
```

---

Variables minimales dans `.env.local` :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

<div align="center">

[Variables complètes et secrets backend](./bambucalc/02-installation.md)

---

**Dernière mise à jour** : 07 juin 2026 — Fanny Saez

</div>
