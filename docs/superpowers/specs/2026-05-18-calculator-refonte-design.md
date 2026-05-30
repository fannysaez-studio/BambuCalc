# BambuCalc — Refonte Calculateur Client & Admin Stock
**Date :** 2026-05-18
**Statut :** Approuvé

---

## 1. Admin Catalogue — LED Réapprovisionnement

- Nouvelle valeur `stock_status` : `'Réapprovisionnement'` (LED bleue `#3b82f6`)
- SQL : DROP + recreate CHECK constraint pour inclure la 4ème valeur
- AdminDashboard.vue : option dans le select + classe CSS `.mat-stock-led--reorder`

---

## 2. Correction navigation (bug freeze)

**Cause identifiée :** `created()` async dans CalculatorStep.vue appelle `checkIsAdmin()` sans try/catch. Si Supabase est lent ou session absente → le composant reste bloqué.

**Fix :** try/catch + fallback `isAdmin = false` sur erreur. Pas de timeout arbitraire.

---

## 3. Nouvelle structure des 5 étapes (vue client/invité)

### Étape 1 — Projet & Matière
- **Type de projet** : select (Pièce unique · Décoration · Porte-clés/Goodies · Figurine · Carte de visite 3D · Stand QR Code · Autre)
- **Description du projet** : textarea libre (placeholder "Décrivez votre projet, matériaux souhaités, contraintes...")
- **Sélecteur de filament** : inchangé (prix/perte auto depuis `bambu_materials`)
- **Couleurs** : sélecteur multicolore inchangé
- **Supprimé pour non-admin** : Imprimante, Buse, Profil d'impression

### Étape 2 — Poids & Temps
- **Poids de la pièce** : champ libre (g)
- **Durée d'impression** : heures + minutes
- **AMS auto** : si `colorCount > 1` → affiche badge info `(couleurs−1) × 35 g`
- **Options avancées** (masqué par défaut) : surcharge manuelle de la purge, taux horaire (admin uniquement)

### Étape 3 — Tarification
- `PricingSuggestions` inchangé

### Étape 4 — Vos coordonnées
- Nom complet · Email · Téléphone
- Adresse (optionnelle, accordéon)
- Conditions : mode de paiement souhaité (virement, CB, Stripe à venir)

### Étape 5 — Confirmation
- Récap visuel (matière, poids, prix estimé)
- Bouton "Envoyer ma demande" → sauvegarde DB + email Edge Function
- Message de confirmation propre (pas de détail de coût pour l'invité)

---

## 4. AMS purge automatique

```
if colorCount > 1:
  purgeWaste = (colorCount - 1) * 35  // grammes
  affiché en badge info, non-éditable par défaut
  Options avancées → champ éditable pour surcharger
```

---

## 5. Préparation Stripe (sans intégration SDK)

- Colonne `stripe_payment_link TEXT` dans `quotes` (SQL)
- AdminDashboard, vue devis : champ URL + bouton copier + bouton "Envoyer par email"
- Réutilise l'Edge Function `send-quote-email` existante avec un param `paymentLink`
- Aucune clé Stripe côté front — Stripe Payment Links générés manuellement depuis le dashboard Stripe

---

## Fichiers impactés

| Fichier | Changement |
|---|---|
| `AdminDashboard.vue` | LED Réapprovisionnement + champ Stripe Payment Link dans vue devis |
| `CalculatorStep.vue` | Nouvelle structure étapes, fix navigation, réorg steps |
| `FilamentSection.vue` | AMS auto, suppression champs techniques pour non-admin |
| `ProjectDetails.vue` | Champs conservés uniquement pour admin + nouveau textarea |
| `PrintingTime.vue` | AMS badge, masquage taux horaire pour non-admin |
| `stores/calculator.js` | `projectDescription` dans state |
| SQL | CHECK constraint stock_status + colonne stripe_payment_link |
