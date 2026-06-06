# Performances Lighthouse

> Testé le **05 juin 2026** · [bambucalc.netlify.app](https://bambucalc.netlify.app/)  
> Outil : Google PageSpeed Insights (Lighthouse 12)

---

## Scores actuels (mis à jour session 05/06/2026)

| | Performances | Accessibilité | Bonnes pratiques | SEO |
|---|:---:|:---:|:---:|:---:|
| 🖥️ Desktop | **100** | **100** | **100** | **100** |
| 📱 Mobile  | **99**  | **100** | **100** | **100** |

---

## Desktop — 100 / 100

![Lighthouse Desktop 100/100](./assets/lighthouse-desktop.png)

| Indicateur | Valeur |
|---|---|
| First Contentful Paint | 0,6 s |
| Largest Contentful Paint | 0,6 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0,017 |
| Speed Index | 0,9 s |

---

## Mobile — 99 / 100

![Lighthouse Mobile 99/100](./assets/lighthouse-mobile.png)

| Indicateur | Valeur |
|---|---|
| First Contentful Paint | 1,4 s |
| Largest Contentful Paint | 1,4 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 4,3 s |

---

## Historique des optimisations

### Session 05/06/2026 — 97 → 99 mobile

| Action | Impact |
|---|---|
| `transition: all` → propriétés spécifiques sur Landing.vue | Élimine les repaint de l'onglet Compositor |
| Suppression `backdrop-filter` sur Landing.vue | Élimine compositing layer inutile |
| `Maintenance.vue` en import statique (eager) | Supprime le chunk lazy fetch au démarrage |
| `preload` maintenance.svg dans index.html | LCP Maintenance.vue découvert dès le HTML |
| `preload` hero-vagues.svg dans index.html | LCP background-image résolu sans attente CSS |
| ledPulse : `box-shadow` → `transform + opacity` | Animation purement composite (GPU) |

### Session 29/05/2026 — Scores initiaux

| Action | Impact |
|---|---|
| Lazy loading `CalculatorStep` + `Login` + `Signup` | Bundle 872 KB → 326 KB (-63 %) |
| Preconnect Supabase | DNS résolu en avance |
| PWA manifest + service worker | Install/fetch offline |
| Routes `Dashboard`, `Admin`, `Contact`… | Déjà en lazy loading |

---

## Ce qui reste à faire avant mise en ligne

Quand le mode maintenance sera désactivé :

1. **Supprimer** `<link rel="preload" href="/assets/svg/maintenance/maintenance.svg">` dans `index.html`
   → Ce preload sert uniquement pendant la maintenance. Il ne doit pas être sur la landing en prod.

2. **Remettre** `Maintenance.vue` en import lazy dans `router/index.js` :
   ```js
   // Avant mise en ligne :
   { path: '/maintenance', component: () => import('@/views/Maintenance.vue') }
   ```

3. **Tester** PageSpeed sur `/` (landing) en mobile — attendu 99 maintenu.

---

## Pourquoi pas Lighthouse CI sur Netlify ?

Lighthouse CI sur les serveurs Netlify donne des résultats peu fiables (variabilité ±10 points selon la charge serveur). La référence utilisée est **Google PageSpeed Insights** (https://pagespeed.web.dev/) qui utilise des machines Google dédiées.

---

<div align="center">

**Précédent :** [← Conformité légale](./08-conformite.md) &nbsp;|&nbsp; **Suivant :** [Base de données →](./10-base-de-donnees.md)

</div>
