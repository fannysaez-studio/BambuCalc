# Page Maintenance — Design Spec
Date : 2026-05-30

## Résumé

Créer une page `/maintenance` plein écran qui intercepte toutes les routes quand l'app est en maintenance. Activée via variable d'environnement Vite, désactivée par redéploiement.

---

## Layout & Visuel

**Format** : Plein écran, fond bord à bord (pas de layout 2 panneaux comme 403/404).

**Fond** :
```css
background:
  radial-gradient(ellipse 130% 55% at 50% -5%, rgba(177,229,226,0.58) 0%, transparent 65%),
  linear-gradient(180deg, #eef9f8 0%, #f7fcfc 50%, #ffffff 100%);
```
Même esprit que `hero-vagues.svg` — teal très clair en haut, blanc vers le bas.

**Structure de la page** (de haut en bas) :
1. Icône `Home` (Lucide) — cercle blanc, coin haut gauche, lien vers `/`
2. Badge LED teal — coin haut droit, texte "En maintenance", LED pulsante
3. Illustration `maintenance.svg` — centrée, animée (float in)
4. Titre `Maintenance en cours` — bold, grande taille, une seule ligne
5. Sous-titre — une seule ligne : *"BambuCalc est temporairement indisponible pour une mise à jour. Nous revenons très vite !"*
6. Brand `BAMBUCALC` — centré en bas, petit, teal, opacité réduite

---

## Badge LED

- Position : `absolute`, coin haut droit (`top: 1.1rem; right: 1.1rem`)
- Couleur : teal BambuCalc (`#2e9cab`)
- Background : `rgba(46,156,171,0.1)` · Border : `1.5px solid rgba(46,156,171,0.35)`
- LED dot : `background: #2e9cab`, animation pulse `box-shadow` 2s infinite
- Texte : "En maintenance" — uppercase, `letter-spacing: 0.06em`, `font-weight: 700`

---

## Animation

- Illustration : `floatIn` — `translateY(24px) scale(0.96)` → normal, `0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`
- Même keyframe que les pages 403/404 pour cohérence

---

## Navigation masquée

```css
/* global style */
.page-maintenance .nav-island,
.page-maintenance .nav-bar { display: none !important; }
```
Classe `page-maintenance` ajoutée au `body` via `mounted()` / retirée via `unmounted()`.

---

## Route

```js
{ path: '/maintenance', name: 'maintenance', component: () => import('@/views/Maintenance.vue') }
```

- Ajoutée dans `src/router/index.js`
- `'maintenance'` ajouté à `isFullscreenRoute` dans `App.vue` (supprime le padding de `.page-wrap`)

---

## Mode maintenance — router guard

Variable d'environnement : `VITE_MAINTENANCE_MODE` dans `.env`

```js
// Dans router.beforeEach, AVANT les vérifications d'auth :
if (import.meta.env.VITE_MAINTENANCE_MODE === 'true' && to.name !== 'maintenance') {
  return next({ name: 'maintenance' })
}
```

- Toutes les routes redirigent vers `/maintenance` quand le flag est actif
- La route `/maintenance` elle-même est toujours accessible
- Pour activer : `VITE_MAINTENANCE_MODE=true` dans `.env` (ou variable Netlify) + redéploiement
- Pour désactiver : supprimer/passer à `false` + redéploiement

---

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `src/views/Maintenance.vue` | Créer |
| `src/router/index.js` | Ajouter route + guard maintenance |
| `src/App.vue` | Ajouter `'maintenance'` à `isFullscreenRoute` |
| `.env.example` | Documenter `VITE_MAINTENANCE_MODE=false` |

---

## Responsive

- **Desktop / tablette / mobile** : même page plein écran, pas de breakpoints spécifiques nécessaires
- L'illustration se redimensionne avec `width: min(92%, 420px)`
- Le sous-titre passe en `white-space: normal` sur mobile si trop long
- Même pattern que 403/404 : `min-height: 100dvh`, `page-wrap--fullscreen` via `isFullscreenRoute`
