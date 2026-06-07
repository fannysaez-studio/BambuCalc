# Tests

BambuCalc dispose de deux niveaux de tests : des **tests unitaires Vitest** et des **tests E2E Playwright**.

---

## Lancer les tests

```sh
npm run test:unit              # Vitest — tests unitaires
npm run test:e2e               # Playwright — tests end-to-end (3 navigateurs)
npx playwright install         # à faire une seule fois avant les tests E2E
```

---

## Tests unitaires — Vitest (140 tests)

### Fichiers

| Fichier | Ce qui est testé |
|---|---|
| `src/stores/calculator.test.js` | Store Pinia — marges, calculs de coûts, sérialisation |
| `src/utils/quotes.test.js` | CRUD devis Supabase — getQuotes, saveQuote, archiveQuote |
| `src/utils/auth.test.js` | Helpers auth — inscription, connexion, déconnexion |
| `src/utils/generateQuotePDF.test.js` | Génération PDF — structure, données client, lignes items |
| `src/utils/rdvUtils.test.js` | Helpers RDV — formatage date/heure, LED présence/format |
| `src/utils/stripe.test.js` | Initialisation Stripe, createPaymentIntent |
| `src/composables/usePushNotifications.test.js` | Abonnement push, désabonnement, état isSubscribed |
| `src/components/ui/CookieBanner.test.js` | Affichage bandeau, consentement, chargement Stripe conditionnel |

### Ce qui est couvert

- Formules de calcul du calculateur (matière, machine, travail, marges standard/compétitif/premium/custom)
- Sérialisation et désérialisation du store (persistance localStorage)
- CRUD devis avec mock Supabase
- Génération du numéro de devis (`DEV-YYYY-NNNN`)
- Formatage des dates et heures des RDV
- Logique LED Format et Présence
- Nettoyage des blob: URLs au rechargement

---

## Tests E2E — Playwright (5 fichiers × 3 navigateurs)

Les tests E2E tournent sur **Chromium, Firefox et WebKit** (Safari).

### Fichiers

| Fichier | Ce qui est testé |
|---|---|
| `e2e/calculator.spec.js` | Navigation entre étapes, stepper, calculs en temps réel |
| `e2e/pages.spec.js` | Pages publiques — login, signup, contact, landing |
| `e2e/mobile.spec.js` | Rendu mobile (viewport Pixel 5 — 393×851) |
| `e2e/dashboard-tabs.spec.js` | Onglets dashboard client (nécessite `TEST_EMAIL` + `TEST_PASSWORD`) |
| `e2e/vue.spec.js` | Smoke test — application démarre et landing s'affiche |

### Helper partagé

```js
async function skipCookieBanner(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'essential')
  })
}
```

Utilisé dans tous les fichiers pour bypasser le bandeau cookie avant chaque test.

### Tests dashboard-tabs (authentification requise)

Ces tests nécessitent un vrai compte en base :

```env
TEST_EMAIL=test@example.com
TEST_PASSWORD=motdepasse
```

Sans ces variables, les 4 tests de navigation dashboard sont skippés automatiquement.

---

## Configuration

| Fichier | Rôle |
|---|---|
| `vitest.config.js` | Config Vitest — environnement jsdom, alias `@/` |
| `playwright.config.js` | Config Playwright — 3 navigateurs, baseURL `localhost:5173` |

---

<div align="center">

**Précédent :** [← SEO & Méta](./14-seo-meta.md) &nbsp;|&nbsp; **Retour à l'index :** [← README](../README.md)

</div>
