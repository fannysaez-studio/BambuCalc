# CookieBanner — Refonte Bottom Sheet

**Date :** 2026-05-29
**Composant :** `src/components/ui/CookieBanner.vue`
**Scope :** Remplacement du bandeau fixe actuel par un bottom sheet animé

---

## Contexte

Le CookieBanner actuel est fonctionnel mais visuellement basique. Sur mobile, le texte et l'icône sont masqués (`display: none`), ce qui laisse l'utilisateur sans contexte. La refonte vise un composant plus original et mobile-first, sans modifier la logique JavaScript existante.

## Design choisi : Frosted Glass Bottom Sheet

### Comportement

- **Desktop** (≥601px) : carte flottante pill centrée, `max-width: 560px`, coins arrondis 20px partout, box-shadow marqué, flottante au-dessus du contenu.
- **Mobile** (≤600px) : bottom sheet pleine largeur, `border-radius: 20px 20px 0 0`, overlay semi-transparent derrière.
- **Animation entrée** : `translateY(+100%) → translateY(0)` avec `cubic-bezier(0.34, 1.56, 0.64, 1)` (effet spring).
- **Animation sortie** : `translateY(0) → translateY(+100%)` + fade-out.

### Structure HTML

```
drag handle (barre décorative)
├── Icône ShieldCheck (Lucide) + Titre "Votre vie privée"
├── Texte description + lien Politique de confidentialité
├── Accordion "Personnaliser ▾" (toggle)
│   ├── 🔒 Essentiels — navigation, authentification (toujours actifs)
│   └── 💳 Stripe/Paiement — traitement sécurisé si vous payez
└── Boutons
    ├── [Essentiel uniquement]
    └── [Tout accepter] (gradient teal, shimmer au hover)
```

### Éléments visuels originaux

| Élément | Détail |
|---|---|
| Drag handle | `width: 40px; height: 4px; border-radius: 2px; background: #e2e8f0` centré en haut |
| Icône | `ShieldCheck` Lucide (déjà installé dans le projet) — couleur teal brand |
| Shimmer bouton accept | `::after` pseudo-element avec `linear-gradient` qui translate de gauche à droite au hover |
| Spring animation | `cubic-bezier(0.34, 1.56, 0.64, 1)` — rebond léger à l'entrée |
| Accordion Personnaliser | Transition `max-height: 0 → 200px` + `opacity: 0 → 1`, chevron rotate 180° |
| Overlay mobile | `rgba(15, 23, 42, 0.3)` derrière sur ≤600px uniquement |

### Couleurs utilisées

- Teal brand : `#2e9cab` / `#3fb2bf` (identique au reste de l'app)
- Background : `rgba(255, 255, 255, 0.97)` + `backdrop-filter: blur(12px)`
- Essentiels badge : `background: #f0f4f8; color: #718096`
- Stripe badge : `background: #e8f7f9; color: #1f7f97`

## Logique JavaScript — inchangée

La logique existante est conservée à 100% :
- `localStorage` clé `cookie_consent` = `'essential'` | `'all'`
- Event global `cookie-consent` (detail: `{ level }`) pour Stripe
- Écoute de `show-cookie-banner` pour réouverture
- Fonctions `accept()` et `decline()` identiques

## Ce qui change uniquement

- Le template HTML (structure bottom sheet + accordion)
- Les styles CSS (animation, layout, frosted glass)
- Ajout de `ref(false)` pour l'état expand de l'accordion
- Import `ShieldCheck`, `ChevronDown` depuis `lucide-vue-next`
