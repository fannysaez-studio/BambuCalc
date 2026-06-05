# Vertical Sidebar Navigation — Design Spec

**Date:** 2026-06-03  
**Scope:** Remplacement de la `nav-island` (pill flottante horizontale) par une sidebar verticale collapsible, desktop et tablette uniquement.

---

## Contexte

La navigation actuelle (`GlobalNav.vue`) affiche une pill flottante centrée en bas de l'écran sur desktop/tablette (≥769px) et une bottom tab bar sur mobile (≤768px). La pill est jugée peu élégante sur grand écran. L'objectif est de la remplacer par une sidebar verticale fixe à gauche, plus moderne et originale.

La bottom tab bar mobile est **inchangée**.

---

## Comportement

### États
| État | Largeur | Contenu |
|---|---|---|
| Réduit (défaut) | 60px | Icônes centrées uniquement |
| Étendu | 220px | Icônes + labels alignés à gauche |

- Le toggle se fait via un bouton flèche (`ChevronRight` / `ChevronLeft`) positionné en bas de la sidebar.
- L'état est persisté dans `localStorage` (clé `bambu_sidebar_open`) pour être conservé entre les pages.
- La sidebar **flotte par-dessus** le contenu (pas de push du layout). Position `fixed`, `z-index: 9999`.

### Interaction
- Clic sur la flèche → toggle réduit/étendu.
- Pas d'expand au hover (contraire à ce qui avait été envisagé — l'utilisateur a choisi le toggle manuel).

---

## Apparence

### Style
- Fond : `rgba(255, 255, 255, 0.88)`
- Backdrop filter : `blur(20px) saturate(1.6)`
- Bordure droite : `1px solid rgba(255, 255, 255, 0.70)`
- Ombre : `2px 0 16px rgba(0, 0, 0, 0.08)` vers la droite
- Coins droits : légèrement arrondis côté droit (`border-radius: 0 16px 16px 0`)
- Hauteur : `100dvh`, collée au bord gauche, sans marge

### Logo (état étendu uniquement)
- Badge-mark (identique à Landing/Login) + texte "BambuCalc" en état étendu
- En état réduit : badge-mark seul (centré)

### Items
- Icône : 20px, couleur `#94a3b8` au repos, `#2e9cab` sur actif/hover
- Label : `font-size: 0.82rem`, `font-weight: 600`, couleur `#4a5568`
- Item actif : fond `rgba(46, 156, 171, 0.10)`, icône + label `#2e9cab`, pastille indicateur à gauche
- Hover : fond `rgba(46, 156, 171, 0.08)`, couleur teal
- Padding item : `0.6rem 1rem` (étendu) / `0.6rem` centré (réduit)

### Séparateur
`flex: 1` entre items principaux et actions du bas (CalendarPanel, NotificationBell, Déconnexion).

---

## Animation

| Propriété | Valeur |
|---|---|
| Transition width | `0.28s cubic-bezier(0.4, 0, 0.2, 1)` |
| Labels : opacity | `0 → 1`, `0.15s ease` avec `delay: 0.1s` (étendu) |
| Labels : transform | `translateX(-6px) → translateX(0)` |
| Flèche : rotation | `rotate(0deg) → rotate(180deg)`, `0.28s ease` |
| Overflow | `hidden` pendant la transition |

---

## Structure des items

### Haut (ordre)
1. Logo BambuCalc (non-cliquable en réduit, lien `/` en étendu)
2. Accueil `/` — icône `Home`
3. Contact `/contact` — icône `Mail`
4. Admin `/admin` — icône `ShieldCheck` (si `isAdminUser`)
5. Dashboard `/dashboard` — icône `LayoutGrid` (si `isAuth` et non admin)
6. Connexion `/login` — icône `LogIn` (si `!isAuth`)

### Bas (séparé par flex spacer)
7. CalendarPanel (composant existant, si `isAuth`)
8. NotificationBell (composant existant, si `isAuth`)
9. Déconnexion — icône `LogOut`, couleur danger au hover (si `isAuth`)

---

## Responsive

| Breakpoint | Comportement |
|---|---|
| `≥ 769px` | Sidebar verticale visible, pill masquée |
| `≤ 768px` | Sidebar masquée (`display: none`), bottom tab bar inchangée |

---

## Fichier modifié

- `src/components/ui/GlobalNav.vue` — remplacement du bloc `.nav-island` et de ses styles par la nouvelle sidebar. La section `.nav-bar` (mobile) et sa logique sont conservées telles quelles.

---

## Hors scope

- Aucune modification des pages qui masquent déjà la nav (landing, login, signup, calculator, etc.)
- Aucune modification de la bottom tab bar mobile
- Pas de sous-menus ou items expandables dans la sidebar
