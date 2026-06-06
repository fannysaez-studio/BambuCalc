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

---

## Vue d'ensemble

BambuCalc est un outil SaaS complet développé par **Fanny Saez** pour gérer l'activité d'un prestataire d'impression 3D sur imprimantes Bambu Lab. Il couvre l'ensemble du flux métier : du calcul des coûts jusqu'au paiement, en passant par la gestion des RDV et les notifications temps réel.

### Fonctionnalités principales

| Domaine | Ce que ça fait |
|---|---|
| **Calculateur 5 étapes** | Calcule matière + machine + main d'œuvre + marge → devis en temps réel |
| **Devis PDF** | Génération côté client via jsPDF, export professionnel avec coordonnées client |
| **Dashboard client** | Mes devis / Mes RDV / Mon profil — avec stats et mode invité |
| **Dashboard admin** | Clients, devis, emails, RDV, catalogue, statistiques, paramètres |
| **Emails automatiques** | Devis (Brevo + PDF joint), bienvenue (Brevo), contact (Resend), rappel RDV (Brevo) |
| **Paiements** | Stripe Payment Element (carte, Apple Pay, Google Pay), PayPal, virement, chèque, espèces |
| **Rendez-vous** | Calendly intégré — booking page + webhook → BDD + notifications |
| **Notifications in-app** | Cloche temps réel Supabase Realtime, lecture/suppression |
| **Push web** | Notifications navigateur VAPID — nouveaux devis, statuts, RDV |
| **Mode maintenance** | Activation par variable d'env, bypass par secret URL |
| **SEO complet** | `useHead()` sur 16 pages, JSON-LD, sitemap.xml, canonical, OG/Twitter |
| **Sécurité** | RLS PostgreSQL, JWT Edge Functions, CSP, HSTS, CORS restreint, rate limiting |

---

## Documentation complète

| # | Page | Ce qu'on y trouve |
|---|---|---|
| 01 | [Présentation & stack](./bambucalc/01-presentation.md) | Services, technologies, architecture |
| 02 | [Installation](./bambucalc/02-installation.md) | Prérequis, étapes, variables d'environnement |
| 03 | [Structure du projet](./bambucalc/03-structure.md) | Arborescence complète et rôle de chaque fichier |
| 04 | [Flux métier](./bambucalc/04-flux-metier.md) | Devis, envoi, paiement, notifications, RDV, rappels |
| 05 | [Edge Functions](./bambucalc/05-edge-functions.md) | 10 fonctions Supabase — détail, secrets, déploiement |
| 06 | [Commandes & Déploiement](./bambucalc/06-commandes.md) | Scripts dev/test/build et Netlify |
| 07 | [Dépannage](./bambucalc/07-depannage.md) | Problèmes fréquents et solutions |
| 08 | [Conformité légale](./bambucalc/08-conformite.md) | RGPD, LCEN, cookies, hébergement |
| 09 | [Performances Lighthouse](./bambucalc/09-lighthouse.md) | 100 desktop / 99 mobile — métriques détaillées |
| 10 | [Base de données](./bambucalc/10-base-de-donnees.md) | Schéma complet, tables, RLS, triggers, index |
| 11 | [Rôles & Sécurité](./bambucalc/11-roles-securite.md) | Guard router, RLS par table, audit Edge Functions |
| 12 | [Notifications & Push](./bambucalc/12-notifications-push.md) | Notifs in-app Realtime + Web Push VAPID |
| 13 | [RDV & Calendly](./bambucalc/13-rdv-calendly.md) | Webhook Calendly, table appointments, admin RdvTab |
| 14 | [SEO & Méta](./bambucalc/14-seo-meta.md) | Titres, descriptions, OG, canonical pour les 16 pages |

---

## Démarrage rapide

```sh
git clone <url-du-repo> && cd BambuCalc
npm install
cp .env.example .env.local   # remplir avec vos clés Supabase + Stripe
npm run dev                  # → http://localhost:5173
```

Variables minimales dans `.env.local` :
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | Vue 3.5 + Vite 8 | Framework UI + build |
| **Routage** | Vue Router 5 | Navigation + guards auth/admin |
| **État** | Pinia 3 | Store calculateur |
| **Icons** | Lucide Vue Next | Icônes cohérentes |
| **Head** | @vueuse/head | Meta SEO dynamiques |
| **PDF** | jsPDF 4 + jspdf-autotable | Génération devis PDF côté client |
| **Auth + DB** | Supabase (PostgreSQL) | Auth, RLS, Realtime, Storage |
| **Serverless** | Supabase Edge Functions (Deno) | Emails, paiements, push, webhooks |
| **Email devis** | Brevo | Devis + PDF joint, bienvenue, rappel RDV |
| **Email contact** | Resend | Formulaire de contact |
| **Paiements** | Stripe | Payment Element + webhook |
| **RDV** | Calendly | Booking + webhook vers BDD |
| **Push** | Web Push VAPID | Notifications navigateur |
| **Hébergement** | Netlify | Frontend SPA + headers HTTP |
| **Tests** | Vitest + Playwright | 140 tests unitaires + 5 fichiers E2E |

---

## Performances Lighthouse (PageSpeed Insights)

| | Performances | Accessibilité | Bonnes pratiques | SEO |
|---|:---:|:---:|:---:|:---:|
| Desktop | **100** | **100** | **100** | **100** |
| Mobile | **99** | **100** | **100** | **100** |

→ [Voir le rapport complet](./bambucalc/09-lighthouse.md)

---

## Rôles utilisateurs

| Rôle | Accès | Identification |
|---|---|---|
| **Visiteur** | Landing, calculateur, contact, /rdv | Non connecté |
| **Client** | Dashboard + ses devis + ses RDV + profil | Connecté, non admin |
| **Admin** | Tout — dashboard admin complet | Entrée dans table `admins` |

---

**Dernière mise à jour** : 06 juin 2026 — Fanny Saez
