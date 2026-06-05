# Tests unitaires Vitest — BambuCalc

**Date :** 2026-05-29
**Scope :** 5 fichiers de tests co-localisés, ~37 tests au total

---

## Architecture

Fichiers co-localisés (`.test.js` à côté de la source). Vitest détecte automatiquement, jsdom déjà configuré.

## Fichiers et couverture

### 1. `src/stores/calculator.test.js` — 18 tests
Setup : `setActivePinia(createPinia())` dans `beforeEach`.

- `calculatedCosts` : matière seule, équipement seul, zéro poids/temps, AMS multi-couleurs
- `sellingPrices` : marge ami (15%), standard (40%), pro (65%), custom
- `marginPercent` : 3 presets + custom
- `projectCoeff` : figurine (1.30), série (0.85), standard (1.00), valeur inconnue → 1
- `displayClientName` : particulier (civilité + prénom + nom), entreprise (raison sociale)
- `purgeWeightAuto` : 1 couleur → 0, multi-couleurs → AMS calcul
- `resetForNewQuote` : champs client/projet vidés, paramètres équipement conservés

### 2. `src/utils/stripe.test.js` — 4 tests
Setup : `localStorage.clear()` dans `beforeEach`.

- `hasStripeConsent()` : false sans clé, true avec `'all'`, false avec `'essential'`
- `loadStripeConditionally()` : retourne `null` si consent !== 'all' (sans charger Stripe)

### 3. `src/utils/quotes.test.js` — 6 tests
Setup : `vi.mock('@/lib/supabase', ...)` au top du fichier.

- `getQuotes()` : retourne données mockées, propage erreur Supabase
- `archiveQuote(id)` : appelle `.update({ archived: true }).eq('id', id)`
- `saveQuote(quote)` : appelle `.insert()` avec les bonnes données, retourne l'enregistrement

### 4. `src/utils/auth.test.js` — 5 tests
Setup : `vi.mock('@/lib/supabase', ...)`.

- `login()` : appelle `signInWithPassword`, propage erreur
- `logout()` : appelle `signOut`
- `isAuthenticated()` : true si session présente, false sinon

### 5. `src/components/ui/CookieBanner.test.js` — 4 tests
Setup : `@vue/test-utils` mount + `createTestingPinia`.

- Banner non visible si `cookie_consent` dans localStorage
- Banner visible si pas de clé
- Clic "Tout accepter" → `localStorage.getItem('cookie_consent') === 'all'`
- Clic "Essentiel uniquement" → `localStorage.getItem('cookie_consent') === 'essential'`

## Contraintes

- Pas de vraie connexion Supabase ni Stripe dans les tests
- `vi.mock` pour les modules externe (supabase, stripe-js)
- `localStorage` via jsdom (déjà dans vitest.config.js `environment: 'jsdom'`)
- Isolation stricte : `beforeEach` remet l'état à zéro
