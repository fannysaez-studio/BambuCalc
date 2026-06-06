# Structure du projet

## Arborescence complète

```text
BambuCalc/
│
├── public/                         ← Fichiers statiques servis tels quels
│   ├── favicon.ico
│   ├── manifest.json               ← PWA manifest (icônes, couleur, nom)
│   ├── robots.txt
│   ├── sitemap.xml                 ← Généré par scripts/update-sitemap.js au build
│   ├── sw.js                       ← Service Worker (cache PWA)
│   └── assets/
│       ├── icons/                  ← icon.svg, icon-maskable.svg (PWA)
│       ├── svg/
│       │   ├── shared/             ← hero-vagues.svg (fond commun 10+ pages)
│       │   ├── auth/               ← login-hero, signUp-hero, new-password-hero
│       │   ├── errors/             ← 403.svg, 404.svg
│       │   ├── dashboard/          ← hero-userDashboard, hero-adminDashboard
│       │   ├── contact/            ← contact-hero.svg
│       │   ├── rdv/                ← prendre-rdv.svg
│       │   └── maintenance/        ← maintenance.svg (preload dans index.html)
│       └── webp/
│           └── landing/            ← bambu lab P2S Combo.webp, bambuLab Filament.webp
│
├── src/
│   ├── main.js                     ← Point d'entrée Vue (app, router, pinia, head)
│   ├── App.vue                     ← Shell global (sidebar, layout, cookie banner)
│   │
│   ├── router/
│   │   └── index.js                ← 18 routes + beforeEach (auth, admin, maintenance)
│   │
│   ├── stores/
│   │   └── calculator.js           ← Pinia — état du calculateur + devis en cours
│   │   └── navigation.js           ← Pinia — état sidebar (collapsed, mobile)
│   │
│   ├── lib/
│   │   └── supabase.js             ← Client Supabase (singleton)
│   │
│   ├── utils/
│   │   ├── auth.js                 ← Helpers inscription/connexion/déconnexion
│   │   ├── quotes.js               ← CRUD devis Supabase, génération numéro devis
│   │   ├── stripe.js               ← Initialisation Stripe + createPaymentIntent
│   │   ├── generateQuotePDF.js     ← jsPDF — mise en page et export du devis
│   │   ├── rdvUtils.js             ← Helpers RDV (fmtDate, fmtTime, ledPresence…)
│   │   └── pushNotifications.js    ← Composable usePushNotifications (VAPID)
│   │
│   ├── composables/
│   │   ├── useAdminRealtime.js     ← Canal Realtime admin (devis, notifs live)
│   │   └── useClientRealtime.js    ← Canal Realtime client (statut devis live)
│   │
│   ├── styles/
│   │   ├── Calculator.module.css   ← Styles CSS Modules du calculateur
│   │   └── *.css                   ← Styles globaux et variables CSS
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                     ← Composants globaux réutilisables
│   │   │   ├── GlobalNav.vue       ← Sidebar desktop + bottom bar mobile + nav-island
│   │   │   ├── NotificationBell.vue← Cloche notifs (panel desktop / bottom sheet mobile)
│   │   │   ├── CalendarPanel.vue   ← Bouton "Prendre RDV" (panel / bottom sheet)
│   │   │   ├── ToastMessage.vue    ← Notifications flash (succès/erreur)
│   │   │   ├── CookieBanner.vue    ← Bandeau RGPD + consentement Stripe
│   │   │   ├── PasswordField.vue   ← Input mot de passe avec toggle visibilité
│   │   │   └── QuotePreviewModal.vue ← Prévisualisation devis avant envoi email
│   │   │
│   │   ├── calculator/             ← 11 composants — étapes du calculateur
│   │   │   ├── Calculator.vue      ← Shell accordéon 5 étapes + stepper
│   │   │   ├── ProjectDetails.vue  ← Étape 1 — nom, imprimante, profil, buse
│   │   │   ├── FilamentSection.vue ← Étape 2 — matière, coût/kg, poids
│   │   │   ├── PrintingTime.vue    ← Étape 3 — heures, minutes, temps travail
│   │   │   ├── PricingSuggestions.vue ← Étape 4 — marges Standard/Compétitif/Premium/Custom
│   │   │   ├── CostBreakdown.vue   ← Étape 5 — récapitulatif TTC
│   │   │   ├── AdvancedSettings.vue← Paramètres avancés (packaging, taxes)
│   │   │   ├── ProductionSeries.vue← Mode série (quantité, remise, rebut)
│   │   │   ├── CatalogueSection.vue← Catalogue avec LED de statut
│   │   │   ├── ClientInfo.vue      ← Coordonnées client + mode paiement préféré
│   │   │   ├── ProjectConditions.vue ← CGV et conditions du projet
│   │   │   ├── ProjectMatter.vue   ← Résumé matière
│   │   │   ├── ProjectPieces.vue   ← Gestion des pièces multiples
│   │   │   └── ProjectProjet.vue   ← Résumé projet
│   │   │
│   │   └── admin/                  ← 9 onglets du dashboard admin
│   │       ├── ClientsTab.vue      ← Liste clients, recherche, suppression
│   │       ├── QuotesTab.vue       ← Tous les devis (vue lecture admin)
│   │       ├── GestionDevisTab.vue ← Actions : envoyer, statut, lien paiement
│   │       ├── ArchivesTab.vue     ← Devis archivés
│   │       ├── EmailsTab.vue       ← Templates email personnalisables
│   │       ├── RdvTab.vue          ← Tableau RDV Calendly + Format/Présence LED
│   │       ├── CatalogueTab.vue    ← Catalogue produits/services
│   │       ├── StatsTab.vue        ← Statistiques (devis, paiements)
│   │       └── SettingsTab.vue     ← Paramètres admin (profil, notifications)
│   │
│   └── views/
│       ├── Landing.vue             ← Page d'accueil publique (hero, features, CTA)
│       ├── Contact.vue             ← Formulaire contact + captcha math + rate limit
│       ├── BookingPage.vue         ← Page RDV — stepper 1→2→3 + widget Calendly
│       ├── PaymentView.vue         ← Paiement Stripe Payment Element
│       ├── MentionsLegales.vue     ← Mentions légales (LCEN)
│       ├── PrivacyPolicy.vue       ← Politique de confidentialité (RGPD)
│       ├── Maintenance.vue         ← Page maintenance (ledPulse animé)
│       ├── Forbidden.vue           ← Page 403
│       ├── NotFound.vue            ← Page 404
│       ├── auth/
│       │   ├── Login.vue           ← Connexion (email/password + liens légaux)
│       │   ├── Signup.vue          ← Inscription + RGPD checkbox + liens légaux
│       │   └── ResetPassword.vue   ← Réinitialisation mot de passe
│       ├── calculator/
│       │   └── CalculatorStep.vue  ← Vue wrapper — charge Calculator.vue par étape
│       ├── dashboard/
│       │   ├── Dashboard.vue       ← Dashboard client (3 onglets + mode invité)
│       │   └── UserProfile.vue     ← Profil utilisateur (identité + sécurité)
│       └── admin/
│           └── AdminDashboard.vue  ← Dashboard admin (5 onglets + 2 dropdowns)
│
├── supabase/
│   ├── schema.sql                  ← Schéma initial (profiles, quotes, RLS, index)
│   ├── migrations/                 ← 20+ migrations versionnées chronologiquement
│   └── functions/
│       ├── _shared/
│       │   ├── cors.ts             ← Headers CORS (origines restreintes)
│       │   └── push-helpers.ts     ← Helpers VAPID partagés entre fonctions
│       ├── send-quote-email/       ← Email devis + PDF Brevo
│       ├── send-welcome-email/     ← Email bienvenue Brevo
│       ├── send-contact-email/     ← Email contact Resend + rate limiting
│       ├── create-payment-intent/  ← Stripe PaymentIntent sécurisé
│       ├── stripe-webhook/         ← Webhook Stripe → statut devis
│       ├── send-push/              ← Push VAPID admin → clients
│       ├── notify-new-quote/       ← Push admin quand nouveau devis
│       ├── notify-quote-update/    ← Push client quand statut devis change
│       ├── handle-calendly-webhook/← Webhook Calendly → appointments + notifs
│       └── remind-rdv/             ← Rappel RDV 24h avant (email + push)
│
├── e2e/                            ← Tests Playwright (5 fichiers × 3 navigateurs)
├── scripts/
│   ├── update-sitemap.js           ← Génère sitemap.xml au build
│   └── generate-vapid.mjs          ← Génère les clés VAPID
├── bambucalc/                      ← Documentation complète du projet (ce dossier)
├── AUDIT.md                        ← Audit sécurité complet
├── index.html                      ← Shell HTML (preloads LCP, JSON-LD, meta globales)
├── netlify.toml                    ← Build + redirects SPA + headers sécurité HTTP
├── vite.config.js                  ← Configuration Vite
├── vitest.config.js                ← Configuration Vitest
├── playwright.config.js            ← Configuration Playwright (3 navigateurs)
└── package.json                    ← Dépendances + scripts npm
```

---

## Conventions de nommage

| Type | Convention | Exemple |
|---|---|---|
| Composants Vue | PascalCase | `NotificationBell.vue` |
| Vues | PascalCase | `AdminDashboard.vue` |
| Utils / Composables | camelCase | `generateQuotePDF.js` |
| Migrations SQL | `YYYYMMDDNNNNNN_description.sql` | `20260531000000_notifications.sql` |
| CSS Modules | `ComponentName.module.css` | `Calculator.module.css` |

---

<div align="center">

**Précédent :** [← Installation](./02-installation.md) &nbsp;|&nbsp; **Suivant :** [Flux métier →](./04-flux-metier.md)

</div>
