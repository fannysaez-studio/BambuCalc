# Design — Dashboard client avec onglets

**Date :** 2026-06-02  
**Statut :** Approuvé

---

## Contexte

Le dashboard client (`Dashboard.vue`) est actuellement une page à défilement vertical avec : hero, stats, Mes devis, Mes rendez-vous, Archives. Le profil est une page séparée (`/profile`). L'objectif est d'introduire une navigation par onglets pour structurer l'expérience, et d'intégrer le profil inline.

---

## Décisions de design (validées)

| Question | Choix |
|---|---|
| Position des stats | Dans l'onglet "Mes devis" uniquement |
| Style des onglets | Pills avec icône (identique à l'admin) |
| Profil inline | Identité + Sécurité uniquement (pas de devis, déjà dans un autre onglet) |

---

## Structure de la page

```
Hero bar (toujours visible)
  └─ Bonjour Fanny ! + bouton Nouveau devis + cloche mobile

Bannière invité (si isAnonymous, toujours visible)

Tab bar (pills avec icône)
  ├─ 📄 Mes devis        [badge: nb devis]
  ├─ 📅 Mes rendez-vous  [badge: nb RDV à venir]
  └─ 👤 Mon profil

Contenu (change selon l'onglet actif)
```

---

## Onglet "Mes devis"

Contenu actuel déplacé ici :
- 4 cartes stats (Devis créés, Coût moyen, Matière, Total)
- Tableau/cartes des devis actifs
- Block archives (toggle)

---

## Onglet "Mes rendez-vous"

Section existante déplacée ici :
- Filtres pills : À venir / Passés / Annulés
- Tableau desktop + cartes mobile
- Devis liés, format badge, objet

---

## Onglet "Mon profil" (inline)

Deux colonnes côte à côte (desktop) / empilées (mobile) :

**Colonne Identité**
- Email (lecture seule)
- Membre depuis (lecture seule)
- Prénom, Nom, Téléphone, Entreprise (éditables)
- Bouton Sauvegarder

**Colonne Sécurité**
- Nouveau mot de passe + Confirmer
- Bouton Changer le mot de passe
- Bouton Se déconnecter

*Supprimé par rapport à UserProfile.vue : la colonne stats + liste devis (déjà dans l'onglet Mes devis).*

La page `/profile` continue d'exister telle quelle — pas de suppression ni redirection.

---

## Icônes manquantes à ajouter

### Admin — panel-title (panel-header interne)
| Composant | Titre actuel | Icône |
|---|---|---|
| `ClientsTab.vue` | Clients | `Users` |
| `QuotesTab.vue` | Tous les devis | `FileText` |
| `GestionDevisTab.vue` | Devis sauvegardés / Transmettre | `Send` / `FileText` |
| `ArchivesTab.vue` | Archives | `Archive` |
| `RdvTab.vue` | Rendez-vous | `CalendarDays` |
| `StatsTab.vue` | Statistiques & Business | `TrendingUp` |
| `SettingsTab.vue` | Paramètres de calcul | `SlidersHorizontal` |

### Client — Dashboard.vue
| Section | Icône à ajouter |
|---|---|
| "Mes devis" (quotes-header) | `FileText` |

---

## Fichiers touchés

- `src/views/dashboard/Dashboard.vue` — refonte complète avec onglets
- `src/components/admin/ClientsTab.vue` — icône panel-title
- `src/components/admin/QuotesTab.vue` — icône panel-title
- `src/components/admin/GestionDevisTab.vue` — icône panel-title
- `src/components/admin/ArchivesTab.vue` — icône panel-title
- `src/components/admin/RdvTab.vue` — icône panel-title
- `src/components/admin/StatsTab.vue` — icône panel-title
- `src/components/admin/SettingsTab.vue` — icône panel-title

---

## Comportement mobile

- Tab bar : pills scrollable horizontalement (`overflow-x: auto`, scrollbar masquée)
- Onglet Mes devis : stats 2×2 + cartes devis (comportement actuel)
- Onglet Mon profil : colonnes empilées verticalement

---

## Ce qui ne change pas

- Route `/profile` conservée telle quelle
- Realtime quotes (canal dashboard-quotes)
- Logique d'archivage, PDF, modal confirmation
- RLS appointments (déjà en prod)
