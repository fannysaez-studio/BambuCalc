# BambuCalc 🖨️

Calculateur de coûts d'impression 3D avancé pour imprimantes **Bambu Lab** avec tableau de bord administrateur, gestion de devis, paiements Stripe & PayPal et génération de PDF.

**Stack moderne** : Vue 3 • Vite • Supabase • Stripe • PayPal • Resend • Vitest • ESLint

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Stack technologique](#-stack-technologique)
- [Prérequis](#-prérequis)
- [Installation rapide](#-installation-rapide)
- [Structure du projet](#-structure-du-projet)
- [Configuration IDE](#-configuration-ide-recommandée)
- [Commandes disponibles](#-commandes-disponibles)
  - [Développement](#développement)
  - [Build et production](#build-et-production)
  - [Tests](#tests)
- [Configuration](#️-configuration)
- [Variables d'environnement](#-variables-denvironnement)
- [Architecture](#-architecture)
- [Système de devis](#-système-de-devis)
- [Guide de développement](#-guide-de-développement)
- [Déploiement](#-déploiement)
- [Dépannage](#-dépannage)
- [Contribution](#-contribution)

---

## 👀 Vue d'ensemble

BambuCalc est une application web moderne pour :

- **Calculer les coûts d'impression** (matériau, temps, électricité)
- **Gérer les devis et clients** (dashboard admin)
- **Traiter les paiements** (intégration Stripe)
- **Générer des PDF** (devis et factures)
- **Configurer des prix** (tarifs dynamiques)

**Fonctionnalités principales** :
✅ Authentification utilisateur (Supabase Auth)  
✅ Dashboard admin multi-onglets  
✅ Gestion des archives et catalogues  
✅ Système d'email transactionnel  
✅ Intégration paiements (Stripe + PayPal)  
✅ Génération PDF avancée  
✅ UI réactive avec Lucide icons  
✅ État centralisé (Pinia)

---

## 🛠️ Stack technologique

### Frontend

| Tech           | Version | Rôle                    |
| -------------- | ------- | ----------------------- |
| **Vue.js**     | 3.5.32  | Framework UI réactif    |
| **Vite**       | 8.0.8   | Build tool ultra-rapide |
| **Vue Router** | 5.0.4   | Routage client          |
| **Pinia**      | 3.0.4   | Gestion d'état          |
| **Lucide Vue** | 1.0.0   | Bibliothèque d'icônes   |

### Backend & Services

| Tech         | Version | Rôle                              |
| ------------ | ------- | --------------------------------- |
| **Supabase** | 2.98.2  | BDD PostgreSQL + Auth + Functions |
| **Stripe**   | 9.6.0   | Paiements par carte               |
| **PayPal**   | latest  | Paiements PayPal                  |
| **Resend**   | latest  | Emails transactionnels            |
| **jsPDF**    | 4.2.1   | Génération PDF                    |

<!-- ### DevTools

| Tech           | Version | Rôle               |
| -------------- | ------- | ------------------ |
| **Vitest**     | 4.1.4   | Tests unitaires    |
| **Playwright** | 1.59.1  | Tests E2E          |
| **ESLint**     | 10.2.1  | Linting JavaScript |
| **Prettier**   | 3.8.3   | Formatage code     | -->

### Environnement

- **Node.js** : ^20.19.0 || >=22.12.0
- **Type** : ES Modules (ESM)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** 20.19.0+ ou 22.12.0+ ([télécharger](https://nodejs.org/))
- **npm** 10.0.0+ (fourni avec Node.js)
- **Git** pour le versioning
- **Navigateur moderne** (Chrome, Firefox, Edge)

### Vérifier l'installation

```sh
node --version    # v20.19.0 ou plus
npm --version     # 10.0.0 ou plus
git --version     # 2.0.0 ou plus
```

---

## 🚀 Installation rapide

### 1️⃣ Cloner le repository

```sh
git clone <your-repo-url>
cd BambuCalc
```

### 2️⃣ Installer les dépendances

```sh
npm install
```

### 3️⃣ Configurer les variables d'environnement

```sh
cp .env.example .env.local
# Puis éditer .env.local avec vos clés
```

### 4️⃣ Démarrer le serveur de développement

```sh
npm run dev
```

L'app sera disponible à : **<http://localhost:5173>**

---

## 📁 Structure du projet

```
BambuCalc/
├── src/
│   ├── components/            # Composants Vue réutilisables
│   │   ├── admin/             # Dashboard admin (8 onglets)
│   │   ├── calculator/        # Modules calculateur (11 composants)
│   │   └── ui/                # Composants globaux (NavBar, Toast, etc.)
│   ├── views/                 # Pages principales (auth, calculator, dashboard)
│   ├── router/                # Configuration Vue Router
│   ├── stores/                # Store Pinia (gestion d'état)
│   ├── utils/                 # Fonctions métier (auth, PDF, Stripe)
│   ├── config/                # Configuration de l'app
│   ├── lib/                   # Clients services (Supabase)
│   └── styles/                # CSS globaux et modules
├── supabase/
│   ├── migrations/            # Migrations BDD (5 fichiers)
│   └── functions/             # Edge Functions TypeScript (4 functions)
├── e2e/                       # Tests Playwright
├── docs/                      # Documentation (plans, specs)
├── public/                    # Assets statiques
└── [config files]             # .gitignore, vite.config.js, package.json, etc.
```

**Points clés** :

- 📱 **src/** : Code source (Vue, Router, Store, Utils)
- 🗄️ **supabase/** : BDD PostgreSQL + Edge Functions
- ✅ **e2e/** : Tests d'intégration Playwright
- 📚 **docs/** : Spécifications et plans de développement

---

## 🎨 Configuration IDE recommandée

### VS Code (Recommandé)

Installez ces extensions :

1. **[Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)** (remplace Vetur)
2. **[Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)**
3. **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)**
4. **[Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)**
5. **[Vitest Explorer](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)**

### Configuration `.vscode/settings.json`

```json
{
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "eslint.validate": ["javascript", "vue"],
  "eslint.codeAction.showDocumentation": true
}
```

### Navigateurs recommandés

- **Chrome/Edge** : [Vue.js DevTools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox** : [Vue.js DevTools](https://addons.mozilla.org/firefox/addon/vue-js-devtools/)

Activez les **Custom Object Formatters** dans DevTools pour une meilleure inspection du state Pinia.

---

## ⚙️ Commandes disponibles

### 🔄 Développement

| Commande                     | Effet                                                 |
| ---------------------------- | ----------------------------------------------------- |
| `npm run dev`                | Serveur dev avec HMR (<http://localhost:5173>)        |
| `npm run dev -- --port 3000` | Sur un port personnalisé                              |
| `npm run preview`            | Serveur de preview du build (<http://localhost:5173>) |

```sh
npm run dev
# Appuyez sur q pour quitter
```

### 🏗️ Build et production

| Commande          | Effet                                |
| ----------------- | ------------------------------------ |
| `npm run build`   | Build production minifié (→ `dist/`) |
| `npm run preview` | Prévisualiser le build localement    |

```sh
npm run build
npm run preview  # Test le build avant déploiement
```

### 🧪 Tests

#### Tests unitaires (Vitest)

```sh
npm run test:unit                    # Tous les tests
npm run test:unit -- --watch         # Mode watch (re-exécute à chaque modification)
npm run test:unit -- --coverage      # Avec rapport de couverture
npm run test:unit -- src/utils/      # Tester un dossier spécifique
npm run test:unit -- fileName.spec   # Test spécifique
```

#### Tests E2E (Playwright)

```sh
# Installation des navigateurs (une fois)
npx playwright install

# Lancer les tests
npm run test:e2e                              # Tous les navigateurs
npm run test:e2e -- --project=chromium       # Chrome uniquement
npm run test:e2e -- --project=firefox        # Firefox uniquement
npm run test:e2e -- --debug                  # Mode debug (UI interactive)
npm run test:e2e -- --headed                 # Visible (non headless)
npm run test:e2e -- vue.spec.js              # Test spécifique

# En CI
npm run build
npm run test:e2e
```

### 🗄️ Supabase Local Development

```sh
# Démarrer Supabase en local
supabase start

# Arrêter
supabase stop

# Appliquer les migrations
supabase migration up

# Réinitialiser la BDD
supabase db reset
```

### 💳 Paiements - Local Testing

```sh
# Écouter les webhooks Stripe localement
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Tester un événement (ex: paiement réussi)
stripe trigger charge.succeeded

# Pour PayPal : utiliser le sandbox
# https://developer.sandbox.paypal.com
```

### 📦 Dépendances & Sécurité

```sh
# Vérifier les packages outdated
npm outdated

# Audit de sécurité
npm audit

# Corriger les vulnérabilités
npm audit fix
```

---

## 🛠️ Configuration

### Vite (`vite.config.js`)

- **Port défaut** : 5173
- **Alias** : `@/` → `src/`
- **Plugins** : Vue, JSX, DevTools

### Vitest (`vitest.config.js`)

- **Environnement** : jsdom
- **Exclude** : tests E2E

### ESLint (`eslint.config.js`)

- **Parser** : Vue + JavaScript
- **Règles** : Best practices & sécurité
- **Prettier** : Intégré pour éviter les conflits

---

## 🌍 Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx...

# PayPal
VITE_PAYPAL_CLIENT_ID=ABC123...

# Resend (emails)
RESEND_API_KEY=re_xxx...

# API
VITE_API_BASE_URL=https://api.example.com

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_TRACKING=false
```

**Notes** :

- Les variables commençant par `VITE_` sont exposées au frontend
- `.env.local` est gitignorée (ne pas commiter)
- Créez `.env.production` pour la prod (déploiement uniquement)

---

## 🏗️ Architecture

### Flux de données

```
Views (Pages Vue)
    ↓
Components (Composants réutilisables)
    ↓
Store (Pinia - État global)
    ↓
Utils (Fonctions métier)
    ↓
Services (Supabase, Stripe)
```

### Gestion d'état (Pinia)

**Store** : `src/stores/calculator.js`

```javascript
import { defineStore } from 'pinia'

export const useCalculatorStore = defineStore('calculator', {
  state: () => ({
    projects: [],
    selectedProject: null,
  }),
  getters: {
    totalCost() {
      return /* ... */
    },
  },
  actions: {
    async fetchProjects() {
      /* ... */
    },
  },
})
```

**Utilisation en composant** :

```javascript
import { useCalculatorStore } from '@/stores/calculator'

const store = useCalculatorStore()
console.log(store.projects)
```

### Authentification

**Module** : `src/utils/auth.js`

- Login/Signup via Supabase Auth
- Persistent session (localStorage)
- Protected routes (Router guards)

### Paiements

**Module** : `src/utils/stripe.js`

- Intégration Stripe.js
- Création de Payment Intents
- Webhooks (Supabase Functions)

### Génération PDF

**Module** : `src/utils/generateQuotePDF.js`

- jsPDF + jsPDF-AutoTable
- Templates de devis
- Export client-side

---

## � Système de devis

### Flux complet (Client → Admin → Paiement)

**1️⃣ Création (Client remplit le formulaire)**

```
Calculateur Vue3 → Store Pinia → Supabase BDD
                   ↓
         Données capturées :
         • Pièce (matière, poids, profil)
         • Imprimante (modèle, buse)
         • Client (nom, email, adresse, SIRET)
         • Coûts (matériau, électricité, MOD)
```

**2️⃣ Gestion Admin (Deux vues)**

| Composant                                                       | Rôle                                                            |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| [QuotesTab.vue](src/components/admin/QuotesTab.vue)             | Vue tableau complète, filtre par client, export PDF global      |
| [GestionDevisTab.vue](src/components/admin/GestionDevisTab.vue) | Gestion active : modifier, télécharger, changer statut, envoyer |

**Statuts** : `pending` → `sent` → `accepted` / `refused`

**3️⃣ Génération PDF (Client-side)**

```javascript
// src/utils/generateQuotePDF.js
const doc = generateQuotePDFDoc(quote)
// ✓ Retourne jsPDF avec layout complet
// • En-tête BambuCalc (teal gradient)
// • Infos devis (dates, statut badge)
// • Client & Prestataire (deux colonnes)
// • Tableau prestations (jsPDF-AutoTable)
// • Totaux HT/TTC/TVA/Acompte
// • Conditions paiement (Stripe/PayPal)
```

**4️⃣ Email Transactionnel (Resend)**

Quand l'admin envoie le devis :

```
Admin clique "Envoyer"
    ↓
Supabase Function: send-quote-email/
    ↓
Fonction génère 2 emails :
  • Email ADMIN : recap + client details
  • Email CLIENT : intro personnalisée + PDF + Stripe link
    ↓
Template personnalisable :
  • Sujet : "Votre devis BambuCalc — [numéro]"
  • Intro : "Bonjour [client], voici..." (avec variables)
  • Pièces jointes : PDF devis + CGV optionnelle
    ↓
Statut auto → "sent"
```

**Variables email** : `[client]` · `[client_nom]` · `[numéro]` · `[projet]` · `[total]`

**5️⃣ Paiement (Stripe Payment Link)**

```
Admin ajoute lien Stripe dans "Gestion des devis" (Page 2)
    ↓
Client reçoit email avec lien
    ↓
Client clique → Page de paiement Stripe
    ↓
Webhook Stripe → Supabase Function: stripe-webhook/
    ↓
Statut quote auto → "accepted" + Email confirmation
```

### Structure BDD (Supabase)

```sql
-- Table: quotes
- id (UUID)
- user_id (FK users)
- quote_number (TEXT) -- "DEVIS-2026-001"
- project_name (TEXT)
- client_name, email, phone, address, city, postal_code, country
- client_siret, client_vat_number
- material (TEXT) -- "PLA Gold"
- printer_model (TEXT) -- "x1c", "p2s-combo"
- weight (FLOAT) -- grammes
- quantity (INT)
- cost_per_unit (FLOAT) -- TTC
- total_cost (FLOAT)
- tax_rate (INT) -- 20%
- payment_method (TEXT) -- "virement", "cb", "paypal"
- stripe_payment_link (TEXT) -- lien de paiement
- status (TEXT) -- "pending", "sent", "accepted", "refused"
- created_at, updated_at (TIMESTAMP)

-- Table: email_settings (Admin config)
- sender_name (TEXT)
- reply_to (EMAIL)
- email_subject (TEXT) -- avec [variables]
- email_intro_client (TEXT)
```

### Points clés d'intégration

| Fichier                                                                   | Rôle                              |
| ------------------------------------------------------------------------- | --------------------------------- |
| [AdminDashboard.vue](src/views/admin/AdminDashboard.vue)                  | Container principal + modal envoi |
| [EmailsTab.vue](src/components/admin/EmailsTab.vue)                       | Config templates + preview email  |
| [send-quote-email/index.ts](supabase/functions/send-quote-email/index.ts) | Edge Function Resend              |
| [generateQuotePDF.js](src/utils/generateQuotePDF.js)                      | PDF client-side (jsPDF)           |
| [stripe.js](src/utils/stripe.js)                                          | Helper paiements Stripe           |

---

## �📖 Guide de développement

### Créer un nouveau composant

```vue
<!-- src/components/MyComponent.vue -->
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <button @click="handleClick">{{ label }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: String,
  label: { type: String, default: 'Click me' },
})

const emit = defineEmits(['action'])

const handleClick = () => {
  emit('action')
}
</script>

<style module>
.my-component {
  padding: 1rem;
  border: 1px solid #e0e0e0;
}
</style>
```

### Utiliser le store Pinia

```javascript
import { useCalculatorStore } from '@/stores/calculator'

const store = useCalculatorStore()

// Lecture
console.log(store.projects)

// Modification directe (recommandée)
store.selectedProject = store.projects[0]

// Via action
await store.fetchProjects()

// Accès getter
console.log(store.totalCost)
```

### Appels API Supabase

```javascript
import { supabase } from '@/lib/supabase'

// Lire
const { data, error } = await supabase.from('projects').select('*')

// Créer
await supabase.from('projects').insert({ name: 'New Project' })

// Mettre à jour
await supabase.from('projects').update({ name: 'Updated' }).eq('id', projectId)

// Supprimer
await supabase.from('projects').delete().eq('id', projectId)
```

### Ajouter une nouvelle route

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MyPage from '@/views/MyPage.vue'

const routes = [
  {
    path: '/my-page',
    component: MyPage,
    meta: { requiresAuth: true },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### Tests unitaires

```javascript
// src/utils/myFunction.spec.js
import { describe, it, expect } from 'vitest'
import { myFunction } from './myFunction'

describe('myFunction', () => {
  it('should return sum', () => {
    expect(myFunction(2, 3)).toBe(5)
  })
})
```

### Tests E2E

```javascript
// e2e/example.spec.js
import { test, expect } from '@playwright/test'

test('calculate total cost', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('input[name="weight"]')
  await page.fill('input[name="weight"]', '100')
  await page.click('button:has-text("Calculate")')

  const result = await page.textContent('[data-testid="total"]')
  expect(result).toContain('€')
})
```

---

## 🚢 Déploiement

### Netlify (Configuration existante)

1. **Connecter le repository**

   ```
   https://app.netlify.com/
   → Importer un projet → GitHub
   ```

2. **Build settings**

   ```
   Branch: main
   Build command: npm run build
   Publish directory: dist/
   Environment: Node 20
   ```

3. **Variables d'environnement**

   ```
   Site settings → Environment
   Ajouter :
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_STRIPE_PUBLIC_KEY
   - VITE_PAYPAL_CLIENT_ID
   - RESEND_API_KEY
   ```

4. **Déployer**

   ```sh
   git push origin main
   # Netlify redéploiera automatiquement
   ```

---

## ❓ Dépannage

### HMR ne fonctionne pas

```sh
# Arrêter le serveur (Ctrl+C)
rm -rf node_modules .vite
npm install
npm run dev
```

### Port 5173 déjà utilisé

```sh
npm run dev -- --port 3000
```

### Tests Playwright échouent

```sh
npx playwright install
npx playwright install-deps  # Dépendances système
npm run test:e2e -- --debug
```

### ESLint erreurs

```sh
npm run lint
npm run format
```

### Supabase : Forbidden access to auth endpoint

```
Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local
```

### Stripe webhook fail

```
Vérifier la clé secrète Stripe dans Supabase Functions
Tester avec: stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

---

## 🤝 Contribution

1. **Fork** le repository
2. **Créer une branche** : `git checkout -b feat/ma-feature`
3. **Commiter** : `git commit -m "✨ Ajouter ma feature"`
4. **Push** : `git push origin feat/ma-feature`
5. **Pull Request** vers `main`

**Standards** :

- Linting : `npm run lint` (obligatoire)
- Tests : Ajouter des tests pour toute nouvelle feature
- Commits : Messages clairs avec emojis

---

## 📄 Licence

MIT © 2026 BambuCalc

---

## 📚 Ressources utiles

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Guide](https://vite.dev/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Ref](https://stripe.com/docs/api)
- [PayPal Docs](https://developer.paypal.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Vitest Guide](https://vitest.dev/)

---

**Besoin d'aide ?**  
Consultez la [documentation complète](./docs/) ou créez une issue sur GitHub.

**Dernière mise à jour** : Mai 2026
