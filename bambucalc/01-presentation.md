# Présentation

BambuCalc est une application web B2B permettant à un prestataire d'impression 3D sur imprimantes **Bambu Lab** de :

- **Calculer** les coûts (matière, électricité, main d'œuvre, marge) en 5 étapes guidées
- **Générer des devis PDF** professionnels avec coordonnées client
- **Gérer** l'ensemble des devis et clients depuis un dashboard admin complet
- **Envoyer** les devis par email directement au client (Brevo, avec PDF joint)
- **Encaisser** via Stripe (carte, Apple Pay, Google Pay), PayPal, virement, chèque ou espèces
- **Prendre des rendez-vous** via Calendly intégré, avec webhook BDD + notifications push
- **Notifier** en temps réel (Supabase Realtime + Web Push VAPID) admin et clients à chaque action

---

## Stack technique complète

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| **UI** | Vue.js | 3.5 | Framework réactif (Composition API + Options API) |
| **Build** | Vite | 8.0 | Bundler ultra-rapide, lazy loading, CSS modules |
| **Routage** | Vue Router | 5.0 | Navigation + guards auth/admin + maintenance |
| **État** | Pinia | 3.0 | Store calculateur global |
| **Icons** | Lucide Vue Next | 1.0 | Icônes SVG cohérentes (600+ icônes) |
| **Head/SEO** | @vueuse/head | 2.0 | Meta dynamiques, canonical, OG, Twitter |
| **PDF** | jsPDF + autotable | 4.2 / 5.0 | Génération devis PDF côté navigateur |
| **Auth + BDD** | Supabase | 2.106 | PostgreSQL + Auth JWT + RLS + Realtime |
| **Serverless** | Supabase Edge Functions | Deno | 10 fonctions backend sécurisées |
| **Email devis** | Brevo | API v3 | Devis PDF joint + bienvenue + rappel RDV |
| **Email contact** | Resend | — | Formulaire contact (sandbox gratuit) |
| **Paiements** | Stripe | — | Payment Element, webhooks, PaymentIntent |
| **Rendez-vous** | Calendly | Plan gratuit | Widget booking + webhook |
| **Push** | Web Push VAPID | — | Notifications navigateur (Chrome, FF, Edge) |
| **Hébergement** | Netlify | — | SPA + headers sécurité + redirects |
| **Tests unit.** | Vitest | 4.1 | 140 tests — utils, calculs, composants |
| **Tests E2E** | Playwright | 1.60 | 5 fichiers × 3 navigateurs |
| **Lint** | ESLint + OxLint | 10 / 1.67 | Qualité code |
| **Format** | Prettier | 3.8 | Formatage automatique |

---

## Modèle utilisateur

| Rôle | Obtenu comment | Ce qu'il peut faire |
|---|---|---|
| **Visiteur** | Non connecté | Landing, calculateur, contact, /rdv |
| **Invité** | Session anonyme Supabase | Calculateur + dashboard temporaire |
| **Client** | Inscription + confirmation email | Dashboard : devis, RDV, profil, notifications |
| **Admin** | Inscription + insertion manuelle dans `admins` | Tout — dashboard admin complet |

---

<div align="center">

**Suivant :** [Installation →](./02-installation.md)

</div>
