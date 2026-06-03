# Design : Devis multi-pièces (6 étapes admin)

**Date :** 2026-06-03  
**Statut :** Approuvé

---

## Objectif

Permettre à l'admin de créer un devis contenant plusieurs pièces distinctes sur un seul et même document, chacune avec son propre nom, quantité, poids, filament et image de référence. Le total du devis est la somme de toutes les pièces.

---

## Nouvelle structure des 6 étapes (admin)

| # | Label | Composant | Ce qui change |
|---|-------|-----------|--------------|
| 1 | Projet & Matière | `ProjectMatter.vue` | Inchangé — le filament sélectionné ici sert de valeur par défaut pour les nouvelles pièces |
| 2 | Client | `ProjectDetails.vue` | On retire la section "Pièce & Impression" et la section "Conditions du devis" |
| 3 | Pièces & Conditions | `ProjectPieces.vue` (nouveau) | Liste de pièces + conditions du devis |
| 4 | Temps | `PrintingTime.vue` | On retire le champ "Poids" (déplacé en étape 3) |
| 5 | Tarifs | `PricingSuggestions.vue` | Inchangé |
| 6 | Coûts | `CostBreakdown.vue` | Mis à jour pour afficher le détail par pièce |

Les étapes client (4 étapes) restent inchangées.

---

## Modèle de données — Store

### Remplacement des champs plats par un tableau `pieces`

**Champs supprimés du store :**
- `projectName`, `quantity`, `weight`, `lossPercent`, `colorCount`, `purgeWaste`
- `materialId`, `material`, `costPerKg`
- `referenceImage`, `referenceImageUrl`
- Getter `purgeWeightAuto` supprimé (calcul déplacé dans chaque pièce)

**Champs conservés (globaux) :**
- `defaultMaterialId`, `defaultMaterial`, `defaultCostPerKg`, `defaultLossPercent` (renommés depuis les champs actuels — servent de modèle à la création d'une nouvelle pièce)

**Getter `sellingPrices` mis à jour :**
- `qty` = `pieces.reduce((s, p) => s + p.quantity, 0)` au lieu de `state.quantity`

**Nouveau champ `pieces` :**

```js
pieces: [
  {
    id: 'piece-1',           // identifiant unique (nanoid ou Date.now())
    name: '',                // nom de la pièce
    quantity: 1,             // quantité
    weight: 0,               // poids par pièce (g) — issu de Bambu Studio
    lossPercent: 5,          // % perte matière, hérité du filament sélectionné
    colorCount: 1,           // nb couleurs (1–4)
    purgeWaste: 0,           // g purge AMS, calculé auto (weight × 0.25 × (colorCount-1))
    materialId: null,        // ID catalogue Supabase
    material: 'PLA+',        // nom du filament
    costPerKg: 16.99,        // coût €/kg
    referenceImage: null,    // File object (temporaire, upload)
    referenceImageUrl: '',   // URL publique Supabase Storage
  }
]
```

La première pièce est pré-remplie avec le filament de l'étape 1 lors de la création.

### Calcul du coût matière (getter `calculatedCosts`)

```
Pour chaque pièce i :
  totalWeight_i = (weight_i × qty_i) × (1 + lossPercent_i / 100)
                + (colorCount_i > 1 ? purgeWaste_i × qty_i : 0)
  materialCost_i = (totalWeight_i / 1000) × costPerKg_i

materialCost total = Σ materialCost_i
```

Coûts équipement et main d'œuvre : **inchangés, globaux** (basés sur le temps d'impression total de l'étape 4).

`totalQuantity` = somme de toutes les `quantity_i` (utilisé pour `costPerUnit`).

---

## Composant `ProjectPieces.vue` (nouveau)

### Section "Pièces & Impression"

Pour chaque pièce, une carte contenant :
- **En-tête** : "Pièce N" + bouton `×` (visible si nbPièces > 1)
- **Ligne 1** : Nom de la pièce (large) + Quantité
- **Ligne 2** : Poids (g) + Filament (hérité par défaut, toggle "Changer" pour ouvrir le sélecteur catalogue compact)
- **Nb couleurs** : mêmes boutons pill que l'étape 1, badge AMS auto si > 1
- **Image de référence** : zone upload compacte (hauteur 80px), aperçu miniature

**Bouton `+ Ajouter une pièce`** en bas de la liste — ajoute une nouvelle carte vide avec le filament par défaut de l'étape 1.

### Section "Conditions du devis"

Identique à ce qui existe dans `ProjectDetails.vue` aujourd'hui :
- Mode de paiement, Acompte %, Validité (jours)
- Délai de fabrication, Livraison / Retrait
- Notes / Conditions particulières

---

## Modifications des composants existants

### `ProjectMatter.vue` (étape 1)
- Supprimer : le champ "Quantité" (les quantités sont désormais par pièce à l'étape 3)
- Garder : type projet, description, sélecteur filament, nb couleurs
- Le filament sélectionné ici est enregistré en `store.defaultMaterialId/material/costPerKg` pour pré-remplir les nouvelles pièces

### `ProjectDetails.vue` (étape 2)
- Supprimer : section "Pièce & Impression" (nom, quantité, image)
- Supprimer : section "Conditions du devis"
- Supprimer : props et emits correspondants
- Garder : meta-bar (N° devis, date, validité) + section client complète

### `PrintingTime.vue`
- Supprimer : prop `weight`, `purgeWaste`, leur affichage et badge AMS
- Garder : durée impression, temps de travail, taux horaire
- Ajouter (read-only, info) : récapitulatif du poids total calculé depuis les pièces

### `CostBreakdown.vue`
- Ajouter une section "Détail pièces" : tableau avec nom / qté / poids total / coût matière par pièce
- Le reste (équipement, main d'œuvre, total TTC) reste identique

### `QuotePreviewModal.vue`
- Remplacer la ligne "Pièce + Quantité" par un tableau des pièces
- Chaque ligne : miniature image (80×80px, clic = zoom plein écran), nom, qté, coût unitaire HT, sous-total HT
- Grand total HT / TVA / TTC en bas
- Mention "TVA non applicable, art. 293 B du CGI" si taxRate = 0

### `CalculatorStep.vue`
- Ajouter étape 3 (`ProjectPieces`) — décaler anciens steps 3→4, 4→5, 5→6
- Mettre à jour la validation étape 3 : au moins 1 pièce avec un nom non vide
- Mettre à jour `previewQuote` et `saveQuote` pour inclure `items`

---

## Base de données

Ajouter une colonne `items JSONB` sur la table `quotes` (migration Supabase).

Le payload de sauvegarde inclut `items: store.pieces.map(p => ({ name, quantity, weight, material, costPerKg, lossPercent, colorCount, purgeWaste, referenceImageUrl }))`.

Les images sont uploadées dans `quote-images/` comme aujourd'hui, une par pièce.

**Rétrocompatibilité** : les devis existants (sans colonne `items`) s'affichent avec une seule pièce reconstituée depuis `project_name` + `quantity` + `reference_image_url`.

---

## Images dans le devis — taille et zoom

- Dans le formulaire (étape 3) : zone upload **compacte** (hauteur fixe 80px, objet contain)
- Dans l'aperçu devis : **miniature 80×80px** par ligne de pièce, clic = modal zoom (plein écran, image en taille réelle)
- Dans le PDF imprimé : miniature 80×80px dans la colonne de gauche

---

## Ce qui ne change pas

- Design visuel (couleurs, typographie, cards, animations)
- Flow client (4 étapes) — inchangé
- Étapes 1, 5 (Tarifs) admin — inchangées
- Logique de calcul équipement / main d'œuvre
- Système de numérotation des devis
- Envoi email / notifications
