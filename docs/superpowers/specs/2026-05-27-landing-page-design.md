# BambuCalc — Landing Page · Design Spec
**Date** : 2026-05-27  
**Auteure** : Fanny Saez  
**Statut** : Approuvé ✓

---

## 1. Contexte & objectif

Remplacer l'actuelle landing page (route `/`, fichier `src/views/Landing.vue`) par une vraie page marketing multi-sections scrollable. La nouvelle landing doit être **visuellement indiscernable** du reste de l'app : même fond SVG, même glassmorphism, mêmes tokens CSS.

**L'ancienne landing (2 colonnes fixes plein-écran) est supprimée.** Les routes `/login` et `/signup` restent inchangées.

---

## 2. Stack & contraintes

- **Vue 3** (Options API, comme le reste du codebase)  
- **lucide-vue-next** pour tous les icônes  
- **Pas de dépendance nouvelle** — CSS scoped uniquement  
- **Images** : `/public/bambu lab P2S Combo.webp` + `/public/bambuLab Filament.webp` + `/public/hero-vagues.svg`  
- **GlobalNav** : cachée sur la route `landing` (déjà configuré dans `GlobalNav.vue`)  
- **Route** : `/` · `meta: { layout: 'landing' }` — inchangé  

---

## 3. Design system — tokens exacts

| Token | Valeur |
|---|---|
| Fond teal panel | `rgba(177, 229, 226, 0.65)` |
| Fond white panel | `rgba(255, 255, 255, 0.65)` |
| Backdrop filter | `blur(16px) saturate(1.2)` |
| Inset border teal | `inset 0 0 0 1px rgba(255,255,255,0.28)` |
| Shadow white panel | `-8px 0 20px rgba(29,18,43,0.08)` |
| Border radius section | `28px` (coins extérieurs) / `0` (joints) |
| Fond SVG | `url('/hero-vagues.svg')` · `cover` · `fixed` |
| Overlay fond | `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.14))` |
| Couleur primaire | `#2e9cab` |
| Btn primary gradient | `linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%)` |
| Btn primary shadow | `0 10px 22px rgba(25,108,133,0.28)` |
| Feature card bg | `#f9fefe` |
| Feature card border | `#cfe4e5` |
| Padding page | `1rem` (desktop) / `0.5rem` (mobile) |
| Gap entre sections | `1rem` |

---

## 4. Architecture des sections

La page est composée de **blocs empilés verticalement**, chacun suivant le pattern 2 colonnes teal/blanc. Elle scroll librement (contrairement à l'ancienne landing fixée à `100dvh`).

### Section 1 — Hero (reprend et enrichit l'actuelle)

**Structure** : `grid-template-columns: 1fr 1fr`

**Panneau gauche (teal)** — `border-radius: 28px 0 0 28px`
- Badge BambuCalc (CSS identique à l'existant : `.visual-badge` + `.badge-mark`)
- `<h1>` : "Calculez vos impressions 3D sans friction"
- `<p>` : sous-titre actuel
- Composition images : `bambu lab P2S Combo.webp` + `bambuLab Filament.webp` en rotation `-10deg` (style actuel conservé)

**Panneau droit (blanc)** — `border-radius: 0 28px 28px 0`
- Kicker texte teal uppercased
- `<h2>` : "Tout ce qu'il faut pour passer du prototype au devis."
- Description
- Grille 2×2 des 4 feature cards (icônes Lucide : `BarChart3`, `DollarSign`, `Zap`, `Download`)
- 2 boutons CTA : "Créer un compte" (btn primary gradient) + "Se connecter" (btn white)
- Liens légaux (mentions + privacy)

### Section 2 — Comment ça marche (nouvelle)

**Structure** : `grid-template-columns: 1fr 1fr`

**Panneau gauche (teal)** — 3 étapes numérotées (cercles blancs avec chiffre teal)
1. Configurez votre impression (filament, temps machine, paramètres)
2. Ajustez vos marges (taux horaire, remises volume, marge cible)
3. Exportez votre devis (PDF ou lien de paiement Stripe client)

**Panneau droit (blanc)** — aperçu UI calculateur
- Titre + description
- Mini-preview de l'interface calculateur avec des valeurs réalistes (PLA 200g, 3h, marge 30% → 25,22 €)
- Bouton "Essayer gratuitement" → `/calculator/1`

### Section 3 — Tarifs (nouvelle)

**Structure** : `grid-template-columns: 1fr 1fr` — **inversée** (blanc gauche, teal droite)

**Panneau gauche (blanc)** — carte tarifaire
- Badge "🎉 Accès complet gratuit"
- Prix : "0 €"
- Mention : "Pendant la phase de lancement · bambucalc.fr"
- Liste 6 items avec ✓ teal
- 2 CTAs : "Créer un compte" + "Se connecter"

**Panneau droit (teal)** — accroche
- `<h2>` : "Simple. Gratuit au lancement."
- Texte persuasif court
- Bouton blanc "Commencer maintenant →" → `/signup`

### Footer

**Structure** : `grid-template-columns: 1fr 1fr` — même pattern 2 colonnes

**Gauche (teal)** : badge BambuCalc  
**Droite (blanc)** : liens légaux (Mentions légales · Confidentialité · Contact) + copyright

---

## 5. Responsive

### Mobile ≤ 768px
- `grid-template-columns: 1fr` — colonnes empilées
- `padding: 0.5rem`
- Panneau teal toujours en premier (visuellement en haut)
- Images hero réduites (`width: min(100%, 150px)` / `230px`)
- Feature cards : layout horizontal (icône gauche + texte droite, comme l'actuelle)
- Boutons CTA : `flex-direction: row`, pleine largeur

### Tablette 769px–1024px
- `grid-template-columns: 1fr` — même que mobile
- `padding: 0.75rem`
- Sections plus généreuses en hauteur (`min-height: 52vh` pour hero visual)

### Desktop ≥ 1025px
- `grid-template-columns: 1fr 1fr`
- `padding: 1rem`
- Hero : `min-height: 85vh`
- `background-attachment: fixed` pour l'effet parallaxe du SVG

---

## 6. Navigation propre à la landing

La `GlobalNav` étant masquée sur `/`, la landing inclut ses propres liens :
- **Hero card** : boutons "Créer un compte" (`/signup`) + "Se connecter" (`/login`)
- **Section Tarifs** : bouton "Commencer maintenant" (`/signup`)
- **Footer** : liens Mentions légales, Confidentialité, Contact
- Pas de navbar sticky — navigation par scroll suffisante sur une page courte

---

## 7. Composant Vue — structure

```
src/views/Landing.vue          ← fichier existant, remplacé intégralement
```

Le fichier reste monolithique (pas de sous-composants) pour cohérence avec le reste du codebase (`Login.vue`, `Signup.vue` sont aussi monolithiques). CSS `<style scoped>` uniquement.

**Imports** :
```js
import { BarChart3, DollarSign, Zap, Download } from 'lucide-vue-next'
```

---

## 8. Ce qui NE change PAS

- Route `/` et sa `meta` — inchangées
- Routes `/login`, `/signup`, `/calculator`, `/dashboard` — inchangées
- `GlobalNav.vue` — inchangée
- `App.vue` — inchangée
- `variables.css`, `global.css` — inchangées
- Toutes les autres vues — inchangées

---

## 9. Figma

Générer la maquette Figma (via MCP figma connecté) en parallèle de l'implémentation :
- Frame desktop 1440×900
- Frame mobile 390×844
- Auto-layout sur chaque section
- Composants : Badge BambuCalc, Feature Card, Step, Pricing Card, Footer
- Styles de couleur et typographie correspondant aux tokens ci-dessus

---

## 10. Critères de succès

- [ ] Visuellement indiscernable du reste de l'app (wave bg, glassmorphism, same tokens)
- [ ] Scrollable, multi-sections
- [ ] Responsive mobile / tablette / desktop
- [ ] Lucide icons (pas d'emojis)
- [ ] Images webp réelles utilisées dans le hero
- [ ] CTAs fonctionnels (`/signup`, `/login`, `/calculator/1`)
- [ ] Liens légaux dans le footer
- [ ] Aucune dépendance nouvelle
