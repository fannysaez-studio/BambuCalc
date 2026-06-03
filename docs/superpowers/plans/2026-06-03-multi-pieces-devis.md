# Devis Multi-Pièces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la pièce unique du calculateur par un tableau de pièces, chacune avec nom/quantité/poids/filament/image, et afficher le multi-lignes dans le devis — 6 étapes admin au lieu de 5.

**Architecture:** Le store Pinia passe de champs plats à `pieces[]`. Un nouveau composant `ProjectPieces.vue` constitue l'étape 3. `CalculatorStep.vue` passe à 6 étapes. Le coût matière somme toutes les pièces ; équipement/main d'œuvre restent globaux. Le coût par pièce dans le devis est distribué proportionnellement au coût matière.

**Tech Stack:** Vue 3 Options API, Pinia, Supabase (DB + Storage), Lucide icons, CSS modules (Form.module.css)

---

## Carte des fichiers

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/stores/calculator.js` | Modifier | Source de vérité — `pieces[]` remplace les champs plats |
| `src/stores/calculator.test.js` | Modifier | Tests store mis à jour pour `pieces[]` |
| `src/components/calculator/ProjectPieces.vue` | **Créer** | Étape 3 — liste de pièces + conditions devis |
| `src/components/calculator/ProjectMatter.vue` | Modifier | Retirer le champ Quantité |
| `src/components/calculator/ProjectDetails.vue` | Modifier | Retirer section Pièce & conditions |
| `src/components/calculator/PrintingTime.vue` | Modifier | Retirer weight/purgeWaste/colorCount |
| `src/views/calculator/CalculatorStep.vue` | Modifier | 6 étapes, nouveau câblage, sauvegarde multi-images |
| `src/components/calculator/CostBreakdown.vue` | Modifier | Ajouter détail par pièce |
| `src/components/ui/QuotePreviewModal.vue` | Modifier | Tableau multi-lignes avec miniatures |

---

### Task 1 : Store — `pieces[]` remplace les champs plats

**Files:**
- Modify: `src/stores/calculator.js`

- [ ] **Étape 1 : Remplacer l'état du store**

Remplacer dans `state()` les champs `projectName`, `quantity`, `weight`, `lossPercent`, `colorCount`, `purgeWaste`, `materialId`, `material`, `costPerKg`, `referenceImage`, `referenceImageUrl` par :

```js
// src/stores/calculator.js — state()
// Filament par défaut (sélectionné à l'étape 1)
defaultMaterialId: null,
defaultMaterial: 'PLA+',
defaultCostPerKg: 16.99,
defaultLossPercent: 5,
defaultColorCount: 1,

// Tableau de pièces
pieces: [
  {
    id: 'piece-1',
    name: '',
    quantity: 1,
    weight: 0,
    lossPercent: 5,
    colorCount: 1,
    purgeWaste: 0,
    materialId: null,
    material: '',
    costPerKg: 0,
    referenceImage: null,
    referenceImageUrl: '',
  },
],
```

- [ ] **Étape 2 : Réécrire le getter `calculatedCosts`**

```js
calculatedCosts(state) {
  const r = (v) => Math.round(v * 100) / 100

  // Coût matière — somme sur toutes les pièces
  let materialCost = 0
  let totalWeightAll = 0
  const piecesDetail = state.pieces.map(p => {
    const qty  = Math.max(1, Number(p.quantity) || 1)
    const w    = Number(p.weight) || 0
    const loss = (Number(p.lossPercent) || 0) / 100
    const purge = Number(p.colorCount) > 1 ? (Number(p.purgeWaste) || 0) : 0
    const pieceWeight   = w * qty * (1 + loss) + purge * qty
    const pieceMaterial = (pieceWeight / 1000) * (Number(p.costPerKg) || 0)
    totalWeightAll += pieceWeight
    materialCost   += pieceMaterial
    return { id: p.id, name: p.name, quantity: qty,
             weight: r(pieceWeight), materialCost: r(pieceMaterial) }
  })

  // Coût équipement — global (temps impression)
  const printH       = (Number(state.printHours) || 0) + (Number(state.printMinutes) || 0) / 60
  const electricity  = printH * 0.35 * (Number(state.electricityRate) || 0)
  const amortization = (Number(state.printerCost) || 0) / (Number(state.printerLifeHours) || 4000) * printH
  const maintenance  = (Number(state.maintenanceRate) || 0) * printH
  const equipmentCost = electricity + amortization + maintenance

  // Coût main-d'œuvre — global
  const workMinutes  = (Number(state.prepTime) || 0) + (Number(state.postTime) || 0)
  const workCost     = (workMinutes / 60) * (Number(state.hourlyRate) || 0)

  const packagingCost = Number(state.packagingCost) || 0
  const coeff         = this.projectCoeff
  const subtotal      = (materialCost + equipmentCost + workCost + packagingCost) * coeff
  const tax           = (subtotal * (Number(state.taxRate) || 0)) / 100
  const totalCost     = subtotal + tax
  const totalQty      = Math.max(1, state.pieces.reduce((s, p) => s + (Number(p.quantity) || 1), 0))

  return {
    quantity:      totalQty,
    totalWeight:   r(totalWeightAll),
    materialCost:  r(materialCost),
    electricity:   r(electricity),
    amortization:  r(amortization),
    maintenance:   r(maintenance),
    equipmentCost: r(equipmentCost),
    workCost:      r(workCost),
    packagingCost: r(packagingCost),
    subtotal:      r(subtotal),
    tax:           r(tax),
    totalCost:     r(totalCost),
    costPerUnit:   r(totalCost / totalQty),
    pieces:        piecesDetail,
  }
},
```

- [ ] **Étape 3 : Mettre à jour le getter `sellingPrices`**

Changer uniquement la ligne `qty` pour utiliser `calculatedCosts.quantity` :

```js
sellingPrices(state) {
  const costs = this.calculatedCosts
  const margin = this.marginPercent
  const qty = costs.quantity                        // ← était state.quantity
  const taxRate = Number(state.taxRate) || 20
  const r = (v) => Math.round(v * 100) / 100

  const sellingHT  = costs.subtotal * (1 + margin / 100)
  const sellingTax = sellingHT * (taxRate / 100)
  const sellingTTC = sellingHT + sellingTax

  return {
    margin,
    subtotalHT:   r(sellingHT),
    tax:          r(sellingTax),
    totalTTC:     r(sellingTTC),
    pricePerUnit: r(sellingTTC / qty),
  }
},
```

- [ ] **Étape 4 : Supprimer le getter `purgeWeightAuto`**

Retirer entièrement ce getter (il est maintenant calculé localement par pièce dans `ProjectPieces.vue`).

- [ ] **Étape 5 : Supprimer le getter `quoteNumberIsStale` — NON, le garder**

Laisser ce getter intact.

- [ ] **Étape 6 : Mettre à jour `resetForNewQuote`**

Remplacer tous les champs supprimés par le reset de `pieces` :

```js
resetForNewQuote() {
  this.$patch({
    editingQuoteId:      null,
    quoteNumber:         genQuoteNumber(),
    quoteDate:           new Date().toISOString().split('T')[0],
    quoteValidityDays:   30,
    clientType:          'particulier',
    clientCivility:      'M.',
    clientFirstName:     '',
    clientLastName:      '',
    clientName:          '',
    clientContactName:   '',
    clientEmail:         '',
    clientPhone:         '',
    clientAddress:       '',
    clientPostalCode:    '',
    clientCity:          '',
    clientCountry:       'France',
    clientSiret:         '',
    clientVatNumber:     '',
    projectType:         'standard',
    projectSeriesType:   'unique',
    projectDescription:  '',
    paymentMethod:       'virement',
    depositPercent:      0,
    quoteNotes:          '',
    defaultMaterialId:   null,
    defaultMaterial:     'PLA+',
    defaultCostPerKg:    16.99,
    defaultLossPercent:  5,
    defaultColorCount:   1,
    pieces: [
      {
        id: 'piece-1',
        name: '',
        quantity: 1,
        weight: 0,
        lossPercent: 5,
        colorCount: 1,
        purgeWaste: 0,
        materialId: null,
        material: '',
        costPerKg: 0,
        referenceImage: null,
        referenceImageUrl: '',
      },
    ],
    printHours:        0,
    printMinutes:      0,
    prepTime:          15,
    postTime:          0,
    processingDelay:   '5-7j',
    deliveryDelay:     'pickup',
    packagingCost:     0,
    selectedPricing:   'standard',
    customMargin:      50,
  })
},
```

- [ ] **Étape 7 : Commit**

```bash
git add src/stores/calculator.js
git commit -m "refactor(store): pieces[] remplace les champs plats, calculatedCosts multi-pièces"
```

---

### Task 2 : Mettre à jour les tests du store

**Files:**
- Modify: `src/stores/calculator.test.js`

- [ ] **Étape 1 : Supprimer le bloc `purgeWeightAuto`**

Supprimer les 2 tests du bloc `describe('purgeWeightAuto', ...)` (lignes 68–85), ce getter n'existe plus.

- [ ] **Étape 2 : Réécrire les tests `calculatedCosts`**

Remplacer tout le bloc `describe('calculatedCosts', ...)` par :

```js
describe('calculatedCosts', () => {
  function storeWithOnePiece(weight, costPerKg, lossPercent = 0, colorCount = 1, purgeWaste = 0) {
    const store = useCalculatorStore()
    store.pieces = [{
      id: 'p1', name: 'Test', quantity: 1,
      weight, costPerKg, lossPercent, colorCount, purgeWaste,
      materialId: null, material: '', referenceImage: null, referenceImageUrl: '',
    }]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 0;   store.postTime = 0
    store.packagingCost = 0
    return store
  }

  it('retourne tout à zéro si aucune valeur saisie', () => {
    const store = storeWithOnePiece(0, 0)
    const costs = store.calculatedCosts
    expect(costs.materialCost).toBe(0)
    expect(costs.equipmentCost).toBe(0)
    expect(costs.workCost).toBe(0)
    expect(costs.totalCost).toBe(0)
  })

  it('calcule le coût matière avec perte sur une pièce', () => {
    const store = storeWithOnePiece(100, 16.99, 5)
    // lossWeight = 5g, totalWeight = 105g, matCost = (105/1000)*16.99 = 1.78
    const costs = store.calculatedCosts
    expect(costs.totalWeight).toBe(105)
    expect(costs.materialCost).toBe(1.78)
  })

  it('somme le coût matière de deux pièces différentes', () => {
    const store = useCalculatorStore()
    store.pieces = [
      { id: 'p1', name: 'A', quantity: 1, weight: 100, costPerKg: 10,
        lossPercent: 0, colorCount: 1, purgeWaste: 0,
        materialId: null, material: '', referenceImage: null, referenceImageUrl: '' },
      { id: 'p2', name: 'B', quantity: 2, weight: 50,  costPerKg: 20,
        lossPercent: 0, colorCount: 1, purgeWaste: 0,
        materialId: null, material: '', referenceImage: null, referenceImageUrl: '' },
    ]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 0;   store.postTime = 0
    store.packagingCost = 0
    // pA = (100/1000)*10 = 1, pB = (100/1000)*20 = 2, total = 3
    expect(store.calculatedCosts.materialCost).toBe(3)
  })

  it('totalQty = somme des quantités', () => {
    const store = useCalculatorStore()
    store.pieces = [
      { id: 'p1', quantity: 3, weight: 0, costPerKg: 0, lossPercent: 0,
        colorCount: 1, purgeWaste: 0, name: '', materialId: null, material: '',
        referenceImage: null, referenceImageUrl: '' },
      { id: 'p2', quantity: 2, weight: 0, costPerKg: 0, lossPercent: 0,
        colorCount: 1, purgeWaste: 0, name: '', materialId: null, material: '',
        referenceImage: null, referenceImageUrl: '' },
    ]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 60;  store.postTime = 0
    store.hourlyRate = 60; store.packagingCost = 0
    // workCost = 60€, quantity = 5, costPerUnit = 12€
    expect(store.calculatedCosts.quantity).toBe(5)
    expect(store.calculatedCosts.costPerUnit).toBe(12)
  })

  it('calcule correctement le coût équipement (global)', () => {
    const store = storeWithOnePiece(0, 0)
    store.printHours = 2; store.printMinutes = 0
    store.electricityRate = 0.23
    store.printerCost = 1800; store.printerLifeHours = 4000
    store.maintenanceRate = 0.10
    // electricity = 0.16, amortization = 0.9, maintenance = 0.2, total = 1.26
    const costs = store.calculatedCosts
    expect(costs.electricity).toBe(0.16)
    expect(costs.amortization).toBe(0.9)
    expect(costs.equipmentCost).toBe(1.26)
  })

  it('applique le coeff projet figurine (1.30)', () => {
    const store = storeWithOnePiece(0, 0)
    store.packagingCost = 100
    store.projectType = 'figurine'
    store.taxRate = 0
    expect(store.calculatedCosts.subtotal).toBe(130)
  })
})
```

- [ ] **Étape 3 : Mettre à jour le test `resetForNewQuote`**

Remplacer les vérifications `store.projectName` et `store.quantity` :

```js
it('vide les champs client et projet', () => {
  const store = useCalculatorStore()
  store.clientFirstName = 'Alice'
  store.clientEmail = 'alice@test.com'
  store.pieces[0].name = 'Mon projet'
  store.pieces[0].quantity = 5

  store.resetForNewQuote()

  expect(store.clientFirstName).toBe('')
  expect(store.clientEmail).toBe('')
  expect(store.pieces.length).toBe(1)
  expect(store.pieces[0].name).toBe('')
  expect(store.pieces[0].quantity).toBe(1)
})
```

- [ ] **Étape 4 : Lancer les tests**

```bash
npm run test -- src/stores/calculator.test.js
```

Expected: tous les tests passent.

- [ ] **Étape 5 : Commit**

```bash
git add src/stores/calculator.test.js
git commit -m "test(store): tests calculatedCosts réécrits pour pieces[]"
```

---

### Task 3 : Mettre à jour `ProjectMatter.vue`

**Files:**
- Modify: `src/components/calculator/ProjectMatter.vue`

- [ ] **Étape 1 : Supprimer le champ Quantité**

Dans le `<template>`, supprimer la `<div>` du champ "Quantité" (la moitié droite de `.grid-2` en tête de fichier) et transformer le `.grid-2` en `.grid-1` (ou div simple) :

```html
<!-- Remplacer le grid-2 en tête par ceci : -->
<div :class="formStyles.formGroup">
  <label :class="formStyles.label">Type de projet</label>
  <select :class="formStyles.select" :value="projectSeriesType"
    @change="$emit('update:projectSeriesType', $event.target.value)">
    <option value="unique">Pièce unique</option>
    <option value="deco">Décoration</option>
    <option value="portesCles">Porte-clés / Goodies (série)</option>
    <option value="figurine">Figurine</option>
    <option value="carteVisite">Carte de visite 3D</option>
    <option value="standQR">Stand / QR Code</option>
    <option value="autre">Autre</option>
  </select>
</div>
```

- [ ] **Étape 2 : Mettre à jour les props et emits**

Dans `<script>`, retirer `quantity` des props et `'update:quantity'` des emits. Ajouter les nouvelles props pour le filament par défaut :

```js
props: {
  projectSeriesType:  { type: String, default: 'unique' },
  projectDescription: { type: String, default: '' },
  // Filament par défaut — transmis au store pour pré-remplir les nouvelles pièces
  defaultMaterialId:  { type: String, default: null },
  material:           { type: String, default: '' },
  costPerKg:          { type: Number, default: 0 },
  lossPercent:        { type: Number, default: 10 },
  colorCount:         { type: Number, default: 1 },
  purgeWaste:         { type: Number, default: 0 },
  materialId:         { type: String, default: null },
},
emits: [
  'update:projectSeriesType', 'update:projectDescription',
  'update:material', 'update:costPerKg', 'update:lossPercent',
  'update:colorCount', 'update:purgeWaste', 'update:materialId',
],
```

- [ ] **Étape 3 : Supprimer le style `.grid-2`**

Retirer la règle `.grid-2` du `<style scoped>` puisqu'il n'y a plus de grille.

- [ ] **Étape 4 : Commit**

```bash
git add src/components/calculator/ProjectMatter.vue
git commit -m "refactor(ProjectMatter): retirer champ Quantité, garder filament par défaut"
```

---

### Task 4 : Mettre à jour `ProjectDetails.vue`

**Files:**
- Modify: `src/components/calculator/ProjectDetails.vue`

- [ ] **Étape 1 : Supprimer la section "Pièce & impression"**

Dans le `<template>`, retirer le bloc entier (séparateur inclus) :

```html
<!-- À SUPPRIMER : de "<div class="sep" />" jusqu'à la fin de la section Pièce & impression -->
<div class="sep" />

<!-- ── Section pièce & impression ── -->
<div class="section-label">Pièce & impression</div>

<div class="grid-2">
  <!-- ... nom de la pièce + quantité ... -->
</div>

<!-- Image de référence -->
<div :class="formStyles.formGroup">
  <!-- ... zone upload image ... -->
</div>
```

- [ ] **Étape 2 : Supprimer la section "Conditions du devis"**

Retirer aussi le bloc suivant (autre séparateur + section conditions) :

```html
<!-- À SUPPRIMER : de "<div class="sep" />" jusqu'à la fin du fichier template -->
<div class="sep" />

<!-- ── Section conditions ── -->
<div class="section-label">Conditions du devis</div>

<div class="grid-3">
  <!-- ... mode paiement, acompte, validité ... -->
</div>

<!-- Délais -->
<div class="grid-2">
  <!-- ... délai fabrication, livraison ... -->
</div>

<div :class="formStyles.formGroup">
  <!-- ... notes ... -->
</div>
```

- [ ] **Étape 3 : Retirer les props et emits correspondants**

Dans `<script>`, retirer des `props` :
- `projectName`, `quantity`, `printProfile`, `printerModel`, `nozzleSize`, `showTechnicalFields`
- `referenceImage`, `referenceImageUrl`
- `paymentMethod`, `depositPercent`, `processingDelay`, `deliveryDelay`, `quoteNotes`

Et des `emits` :
- `'update:projectName'`, `'update:quantity'`
- `'update:printProfile'`, `'update:printerModel'`, `'update:nozzleSize'`
- `'update:referenceImage'`, `'update:referenceImageUrl'`
- `'update:paymentMethod'`, `'update:depositPercent'`
- `'update:processingDelay'`, `'update:deliveryDelay'`, `'update:quoteNotes'`

Retirer aussi les `methods` : `handleImageUpload`, `handleDrop`, `removeImage`.

Retirer le `watch` sur `referenceImageUrl`.

Retirer de `data()` : `imgLoadError`.

- [ ] **Étape 4 : Retirer les styles CSS inutilisés**

Dans `<style scoped>`, retirer les blocs `.img-upload-area`, `.img-placeholder`, `.img-preview`, `.img-remove`.

- [ ] **Étape 5 : Commit**

```bash
git add src/components/calculator/ProjectDetails.vue
git commit -m "refactor(ProjectDetails): retirer section Pièce, image et Conditions (déplacées en étape 3)"
```

---

### Task 5 : Mettre à jour `PrintingTime.vue`

**Files:**
- Modify: `src/components/calculator/PrintingTime.vue`

- [ ] **Étape 1 : Supprimer le champ Poids et le badge AMS**

Dans le `<template>`, retirer :
- Le `<div :class="formStyles.formGroup">` du "Poids estimé de la pièce"
- Le bloc `<div v-if="colorCount > 1" class="ams-badge">...</div>`
- Le champ "Purge AMS (ajuster si besoin)" dans `advanced-block` (le `v-if="colorCount > 1"`)

- [ ] **Étape 2 : Retirer les props correspondantes**

Dans `<script>`, retirer des `props` : `weight`, `colorCount`, `purgeWaste`.
Retirer des `emits` : `'update:weight'`, `'update:purgeWaste'`.

La liste des props devient :

```js
props: {
  printHours:   { type: Number, default: 0 },
  printMinutes: { type: Number, default: 0 },
  prepTime:     { type: Number, default: 15 },
  postTime:     { type: Number, default: 0 },
  hourlyRate:   { type: Number, default: 20 },
  isAdmin:      { type: Boolean, default: false },
},
emits: [
  'update:printHours', 'update:printMinutes', 'update:prepTime',
  'update:postTime', 'update:hourlyRate',
],
```

- [ ] **Étape 3 : Retirer les styles CSS inutilisés**

Dans `<style scoped>`, retirer les règles `.ams-badge`, `.ams-icon`, `.ams-title`, `.ams-sub`.

- [ ] **Étape 4 : Commit**

```bash
git add src/components/calculator/PrintingTime.vue
git commit -m "refactor(PrintingTime): retirer weight/purgeWaste/colorCount (déplacés par pièce)"
```

---

### Task 6 : Créer `ProjectPieces.vue`

**Files:**
- Create: `src/components/calculator/ProjectPieces.vue`

- [ ] **Étape 1 : Créer le fichier complet**

```vue
<template>
  <div :class="formStyles.section">

    <!-- ── Section Pièces ── -->
    <div class="section-label">Pièces & Impression</div>

    <div v-for="(piece, idx) in pieces" :key="piece.id" class="piece-card">

      <!-- Header de la carte -->
      <div class="piece-card-header">
        <span class="piece-num">Pièce {{ idx + 1 }}</span>
        <button v-if="pieces.length > 1" class="btn-remove" type="button" @click="removePiece(idx)">×</button>
      </div>

      <!-- Nom + Quantité -->
      <div class="grid-2">
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Nom de la pièce</label>
          <input :class="formStyles.input" type="text" :value="piece.name"
            @input="updateField(idx, 'name', $event.target.value)"
            placeholder="Ex: Boîtier de commande" />
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Quantité</label>
          <div class="input-unit-wrap">
            <input :class="formStyles.input" type="number" :value="piece.quantity"
              @input="updateField(idx, 'quantity', parseInt($event.target.value) || 1)"
              min="1" step="1" />
            <span class="unit">unité(s)</span>
          </div>
        </div>
      </div>

      <!-- Poids + Filament -->
      <div class="grid-2">
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Poids par pièce</label>
          <div class="input-unit-wrap">
            <input :class="formStyles.input" type="number" :value="piece.weight"
              @input="updateWeight(idx, parseFloat($event.target.value) || 0)"
              step="0.1" min="0" placeholder="Ex: 45" />
            <span class="unit">g</span>
          </div>
          <p :class="formStyles.helpText">Visible dans Bambu Studio après slicing.</p>
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Filament</label>
          <button class="btn-filament" type="button" @click="toggleSelector(idx)">
            <span class="filament-dot"
              :style="{ background: swatchColor(piece) }"></span>
            <span class="filament-name">{{ piece.material || 'Sélectionner…' }}</span>
            <span v-if="piece.costPerKg" class="filament-price">{{ piece.costPerKg }}€/kg</span>
            <span class="filament-chevron">▾</span>
          </button>
          <!-- Sélecteur inline -->
          <div v-if="openIdx === idx" class="filament-picker">
            <p v-if="loading" class="cat-hint">Chargement…</p>
            <div v-else class="catalog-grid">
              <button v-for="mat in catalog" :key="mat.id" type="button"
                :class="['mat-pastille', piece.materialId === mat.id && 'mat-pastille--on']"
                @click="selectMaterial(idx, mat)">
                <span v-if="mat.imageUrl" class="pastille-swatch pastille-swatch--img">
                  <img :src="mat.imageUrl" :alt="mat.name" @error="$event.target.style.opacity='0.3'" />
                </span>
                <span v-else class="pastille-swatch" :style="{ background: mat.color }"></span>
                <span class="pastille-label">{{ mat.label }}</span>
                <span v-if="piece.materialId === mat.id" class="pastille-check">✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Nb couleurs -->
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Nombre de couleurs</label>
        <div class="count-buttons">
          <button v-for="n in 4" :key="n" type="button"
            :class="['count-btn', piece.colorCount === n && 'count-btn--active']"
            @click="updateColorCount(idx, n)">
            <span class="count-dot-row">
              <span v-for="i in n" :key="i" class="count-dot"></span>
            </span>
            <span class="count-label">{{ n === 1 ? 'Mono' : n + ' coul.' }}</span>
          </button>
        </div>
      </div>

      <!-- Badge AMS -->
      <div v-if="piece.colorCount > 1" class="ams-badge">
        <span class="ams-icon">🎨</span>
        <div>
          <p class="ams-title">Impression multicolore — Purge AMS calculée automatiquement</p>
          <p class="ams-sub">{{ piece.colorCount }} couleurs → <strong>+{{ piece.purgeWaste }} g</strong> de purge ajoutés</p>
        </div>
      </div>

      <!-- Image de référence -->
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">
          Image de référence <span class="optional">optionnel</span>
        </label>
        <div class="img-upload-area"
          :class="{ 'img-upload-area--has': piece.referenceImageUrl }"
          @click="triggerInput(idx)"
          @dragover.prevent @drop.prevent="handleDrop($event, idx)">
          <template v-if="piece.referenceImageUrl">
            <img :src="piece.referenceImageUrl" class="img-preview" alt=""
              @error="imgErrors[idx] = true" @load="imgErrors[idx] = false" />
            <div v-if="imgErrors[idx]" class="img-placeholder img-placeholder--saved">
              <span class="img-ph-icon">🖼️</span>
              <span class="img-ph-text">Image enregistrée</span>
            </div>
          </template>
          <div v-else class="img-placeholder">
            <span class="img-ph-icon">📎</span>
            <span class="img-ph-text">Cliquez ou glissez (JPG, PNG, WEBP)</span>
          </div>
          <button v-if="piece.referenceImageUrl" class="img-remove" type="button"
            @click.stop="clearImage(idx)">×</button>
        </div>
        <input type="file" accept="image/*" style="display:none"
          :ref="el => { if(el) imgRefs[idx] = el }"
          @change="handleUpload($event, idx)" />
      </div>

    </div><!-- /piece-card -->

    <!-- Bouton ajouter une pièce -->
    <button class="btn-add-piece" type="button" @click="addPiece">
      + Ajouter une pièce
    </button>

    <div class="sep" />

    <!-- ── Section Conditions du devis ── -->
    <div class="section-label">Conditions du devis</div>

    <div class="grid-3">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Mode de paiement</label>
        <select :class="formStyles.select" :value="paymentMethod"
          @change="$emit('update:paymentMethod', $event.target.value)">
          <option value="virement">Virement bancaire</option>
          <option value="cheque">Chèque</option>
          <option value="cb">Carte bancaire</option>
          <option value="especes">Espèces</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Acompte demandé</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="depositPercent"
            @input="$emit('update:depositPercent', parseInt($event.target.value) || 0)"
            min="0" max="100" step="5" />
          <span class="unit">%</span>
        </div>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Validité du devis</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="quoteValidityDays"
            @input="$emit('update:quoteValidityDays', parseInt($event.target.value) || 30)"
            min="1" max="365" step="1" />
          <span class="unit">jours</span>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Délai de fabrication</label>
        <select :class="formStyles.select" :value="processingDelay"
          @change="$emit('update:processingDelay', $event.target.value)">
          <option value="24h">24 heures</option>
          <option value="2-3j">2 à 3 jours ouvrés</option>
          <option value="5-7j">5 à 7 jours ouvrés</option>
          <option value="1-2s">1 à 2 semaines</option>
          <option value="2-4s">2 à 4 semaines</option>
          <option value="custom">À convenir</option>
        </select>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Livraison / Retrait</label>
        <select :class="formStyles.select" :value="deliveryDelay"
          @change="$emit('update:deliveryDelay', $event.target.value)">
          <option value="pickup">Retrait en main propre</option>
          <option value="colissimo">Colissimo (2-3 j)</option>
          <option value="chronopost">Chronopost (J+1)</option>
          <option value="mondial">Mondial Relay (3-5 j)</option>
          <option value="custom">À convenir</option>
        </select>
      </div>
    </div>

    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Notes / Conditions particulières
        <span class="optional">optionnel</span></label>
      <textarea :class="formStyles.input" rows="2" :value="quoteNotes"
        @input="$emit('update:quoteNotes', $event.target.value)"
        placeholder="Ex: Pièce imprimée en PLA+ blanc, sans post-traitement inclus."
        style="resize: vertical; min-height: 52px;" />
    </div>

  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'ProjectPieces',
  props: {
    pieces:            { type: Array,   required: true },
    defaultMaterialId: { type: String,  default: null },
    defaultMaterial:   { type: String,  default: '' },
    defaultCostPerKg:  { type: Number,  default: 0 },
    defaultLossPercent:{ type: Number,  default: 5 },
    defaultColorCount: { type: Number,  default: 1 },
    paymentMethod:     { type: String,  default: 'virement' },
    depositPercent:    { type: Number,  default: 0 },
    quoteValidityDays: { type: Number,  default: 30 },
    processingDelay:   { type: String,  default: '5-7j' },
    deliveryDelay:     { type: String,  default: 'pickup' },
    quoteNotes:        { type: String,  default: '' },
  },
  emits: [
    'update:pieces',
    'update:paymentMethod', 'update:depositPercent', 'update:quoteValidityDays',
    'update:processingDelay', 'update:deliveryDelay', 'update:quoteNotes',
  ],
  data() {
    return {
      formStyles,
      openIdx:    null,
      loading:    false,
      rawMaterials: [],
      imgRefs:    {},
      imgErrors:  {},
    }
  },
  computed: {
    catalog() {
      return this.rawMaterials
        .filter(m => m.stock_status === 'En Stock' || m.stock_status === 'Stock Faible')
        .map(m => ({
          id:       m.id,
          name:     m.name,
          label:    m.type || m.name.substring(0, 8),
          color:    this.isHex(m.color_or_image) ? m.color_or_image : '#2e9cab',
          imageUrl: m.image_url || (this.isUrl(m.color_or_image) ? m.color_or_image : null),
          cost_per_kg: m.cost_per_kg,
          default_waste_percentage: m.default_waste_percentage || 5,
          stockLow: m.stock_status === 'Stock Faible',
        }))
    },
  },
  async mounted() {
    this.loading = true
    try {
      const { data } = await supabase
        .from('bambu_materials')
        .select('id,name,brand,type,cost_per_kg,default_waste_percentage,color_or_image,image_url,stock_status')
        .order('created_at', { ascending: true })
      this.rawMaterials = data || []
    } finally {
      this.loading = false
    }
  },
  methods: {
    updateField(idx, field, value) {
      const updated = this.pieces.map((p, i) => i === idx ? { ...p, [field]: value } : p)
      this.$emit('update:pieces', updated)
    },
    updateWeight(idx, weight) {
      const piece = this.pieces[idx]
      const purgeWaste = piece.colorCount > 1
        ? Math.round(weight * 0.25 * (piece.colorCount - 1)) : 0
      const updated = this.pieces.map((p, i) =>
        i === idx ? { ...p, weight, purgeWaste } : p)
      this.$emit('update:pieces', updated)
    },
    updateColorCount(idx, colorCount) {
      const piece = this.pieces[idx]
      const purgeWaste = colorCount > 1
        ? Math.round((piece.weight || 0) * 0.25 * (colorCount - 1)) : 0
      const updated = this.pieces.map((p, i) =>
        i === idx ? { ...p, colorCount, purgeWaste } : p)
      this.$emit('update:pieces', updated)
    },
    addPiece() {
      const newPiece = {
        id:              `piece-${Date.now()}`,
        name:            '',
        quantity:        1,
        weight:          0,
        lossPercent:     this.defaultLossPercent || 5,
        colorCount:      1,
        purgeWaste:      0,
        materialId:      this.defaultMaterialId || null,
        material:        this.defaultMaterial || '',
        costPerKg:       this.defaultCostPerKg || 0,
        referenceImage:  null,
        referenceImageUrl: '',
      }
      this.$emit('update:pieces', [...this.pieces, newPiece])
    },
    removePiece(idx) {
      this.$emit('update:pieces', this.pieces.filter((_, i) => i !== idx))
    },
    toggleSelector(idx) {
      this.openIdx = this.openIdx === idx ? null : idx
    },
    selectMaterial(idx, mat) {
      const updated = this.pieces.map((p, i) => i === idx ? {
        ...p,
        materialId:  mat.id,
        material:    mat.name,
        costPerKg:   mat.cost_per_kg,
        lossPercent: mat.default_waste_percentage || 5,
      } : p)
      this.$emit('update:pieces', updated)
      this.openIdx = null
    },
    triggerInput(idx) {
      this.imgRefs[idx]?.click()
    },
    handleUpload(e, idx) {
      const file = e.target.files[0]
      if (!file) return
      const updated = this.pieces.map((p, i) => i === idx ? {
        ...p, referenceImage: file,
        referenceImageUrl: URL.createObjectURL(file),
      } : p)
      this.$emit('update:pieces', updated)
    },
    handleDrop(e, idx) {
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return
      const updated = this.pieces.map((p, i) => i === idx ? {
        ...p, referenceImage: file,
        referenceImageUrl: URL.createObjectURL(file),
      } : p)
      this.$emit('update:pieces', updated)
    },
    clearImage(idx) {
      const updated = this.pieces.map((p, i) =>
        i === idx ? { ...p, referenceImage: null, referenceImageUrl: '' } : p)
      this.$emit('update:pieces', updated)
    },
    swatchColor(piece) {
      if (!piece.materialId) return '#e2e8f0'
      const mat = this.catalog.find(m => m.id === piece.materialId)
      return mat?.color || '#e2e8f0'
    },
    isHex(v) { return typeof v === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(v) },
    isUrl(v) {
      return typeof v === 'string' && (
        v.startsWith('http') || v.startsWith('data:image/') ||
        /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(v))
    },
  },
}
</script>

<style scoped>
.section-label {
  font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: #a0aec0; margin-bottom: 0.4rem; margin-top: 0.1rem;
}
.sep { height: 1px; background: #e2e8f0; margin: 0.75rem 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.5rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; margin-bottom: 0.5rem; }
.input-unit-wrap { display: flex; align-items: center; gap: 0.4rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.75rem; font-weight: 700; color: #4a5568; white-space: nowrap; }
.optional {
  font-size: 0.65rem; font-weight: 500; color: #a0aec0;
  background: #edf2f7; border-radius: 4px; padding: 0.1rem 0.35rem;
  margin-left: 0.25rem; vertical-align: middle;
}

/* ── Carte pièce ── */
.piece-card {
  border: 1.5px solid #e2e8f0; border-radius: 14px;
  padding: 0.85rem 1rem; margin-bottom: 0.75rem;
  background: #fafcff;
}
.piece-card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.65rem;
}
.piece-num {
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: #2e9cab;
}
.btn-remove {
  width: 1.4rem; height: 1.4rem; border-radius: 50%; border: 1px solid #e2e8f0;
  background: #fff; color: #718096; font-size: 1rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
}
.btn-remove:hover { background: #fee2e2; color: #e53e3e; border-color: #fca5a5; }

/* ── Sélecteur filament ── */
.btn-filament {
  width: 100%; display: flex; align-items: center; gap: 0.5rem;
  padding: 0.45rem 0.65rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; cursor: pointer; font-family: inherit; font-size: 0.82rem;
  transition: border-color 0.2s ease;
}
.btn-filament:hover { border-color: #2e9cab; }
.filament-dot {
  width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid rgba(0,0,0,0.12);
}
.filament-name { flex: 1; text-align: left; color: #1b2f39; font-weight: 600; }
.filament-price { font-size: 0.72rem; color: #718096; }
.filament-chevron { font-size: 0.65rem; color: #a0aec0; }

.filament-picker {
  margin-top: 0.4rem; padding: 0.65rem;
  border: 1.5px solid #b2e8ef; border-radius: 12px; background: #f0fbfc;
}
.catalog-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.mat-pastille {
  display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
  width: 58px; padding: 0.4rem 0.25rem; position: relative;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #fff; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s ease;
}
.mat-pastille:hover { border-color: #2e9cab; }
.mat-pastille--on { border-color: #2e9cab; background: linear-gradient(135deg, #e8f7f9, #d0f0f5); }
.pastille-swatch {
  width: 30px; height: 30px; border-radius: 50%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid rgba(0,0,0,0.1); flex-shrink: 0;
}
.pastille-swatch--img { background: #f0f4f8; }
.pastille-swatch img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.pastille-label { font-size: 0.58rem; font-weight: 700; color: #4a5568; text-align: center; }
.pastille-check { position: absolute; top: 1px; right: 3px; font-size: 0.68rem; font-weight: 900; color: #2e9cab; }
.cat-hint { font-size: 0.78rem; color: #a0aec0; margin: 0; }

/* ── Nb couleurs ── */
.count-buttons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.count-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
  padding: 0.5rem 0.7rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #fff; cursor: pointer; font-family: inherit; flex: 1; min-width: 52px;
  transition: border-color 0.2s ease;
}
.count-btn:hover { border-color: #2e9cab; background: #f0fbfc; }
.count-btn--active { border-color: #2e9cab; background: linear-gradient(135deg, #e8f7f9, #d0f0f5); }
.count-dot-row { display: flex; gap: 3px; }
.count-dot { width: 7px; height: 7px; border-radius: 50%; background: #2e9cab; }
.count-label { font-size: 0.65rem; font-weight: 700; color: #718096; }
.count-btn--active .count-label { color: #1f7f97; }

/* ── Badge AMS ── */
.ams-badge {
  display: flex; align-items: flex-start; gap: 0.6rem;
  background: #f0fbfc; border: 1.5px solid #b2e8ef; border-radius: 10px;
  padding: 0.6rem 0.8rem; margin-bottom: 0.5rem;
}
.ams-icon { font-size: 1.1rem; flex-shrink: 0; }
.ams-title { font-size: 0.78rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.08rem; }
.ams-sub { font-size: 0.73rem; color: #718096; margin: 0; }

/* ── Zone image ── */
.img-upload-area {
  position: relative; border: 1.5px dashed #cbd5e0; border-radius: 10px;
  background: #f7f9fc; cursor: pointer; overflow: hidden; min-height: 70px;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s ease;
}
.img-upload-area:hover { border-color: #2e9cab; background: #f0fbfc; }
.img-upload-area--has { border-style: solid; }
.img-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.75rem; }
.img-ph-icon { font-size: 1.2rem; }
.img-ph-text { font-size: 0.72rem; color: #a0aec0; font-weight: 500; text-align: center; }
.img-placeholder--saved .img-ph-text { color: #2e9cab; }
.img-preview { width: 100%; max-height: 100px; object-fit: contain; display: block; }
.img-remove {
  position: absolute; top: 0.3rem; right: 0.3rem; width: 1.3rem; height: 1.3rem;
  border-radius: 50%; border: none; background: rgba(0,0,0,0.5); color: #fff;
  font-size: 0.9rem; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.img-remove:hover { background: rgba(231,76,60,0.85); }

/* ── Bouton ajouter ── */
.btn-add-piece {
  width: 100%; padding: 0.6rem; border: 1.5px dashed #b2e8ef; border-radius: 10px;
  background: #f0fbfc; color: #2e9cab; font-size: 0.82rem; font-weight: 700;
  font-family: inherit; cursor: pointer; transition: all 0.2s ease;
}
.btn-add-piece:hover { background: #e8f7f9; border-color: #2e9cab; }

@media (max-width: 480px) {
  .grid-2 { grid-template-columns: 1fr; }
  .grid-3 { grid-template-columns: 1fr; }
}
</style>
```

- [ ] **Étape 2 : Commit**

```bash
git add src/components/calculator/ProjectPieces.vue
git commit -m "feat(ProjectPieces): nouveau composant étape 3 — liste multi-pièces + conditions devis"
```

---

### Task 7 : Mettre à jour `CalculatorStep.vue`

**Files:**
- Modify: `src/views/calculator/CalculatorStep.vue`

- [ ] **Étape 1 : Importer `ProjectPieces` et mettre à jour les 6 étapes**

Dans `<script>`, ajouter l'import :

```js
import ProjectPieces from '@/components/calculator/ProjectPieces.vue'
```

L'ajouter dans `components: { ..., ProjectPieces, ... }`.

Mettre à jour le computed `steps()` pour la branche admin :

```js
if (this.isAdmin) {
  return [
    { step: 1, label: 'Projet & Matière', icon: 'Package',    description: 'Type de projet, filament et couleurs.' },
    { step: 2, label: 'Client',           icon: 'User',       description: 'Informations client et adresse.' },
    { step: 3, label: 'Pièces',           icon: 'Layers',     description: 'Pièces à imprimer, filaments, images et conditions.' },
    { step: 4, label: 'Temps',            icon: 'Clock',      description: "Durée d'impression et temps de travail." },
    { step: 5, label: 'Tarifs',           icon: 'Tag',        description: 'Choisissez votre marge et la tarification.' },
    { step: 6, label: 'Coûts',            icon: 'BarChart3',  description: 'Résumé complet des coûts et total TTC.' },
  ]
}
```

- [ ] **Étape 2 : Mettre à jour le `<template>` — câblage des étapes admin**

Mettre à jour la section `<!-- ── ÉTAPES 2-5 ADMIN ── -->` :

```html
<!-- ── ÉTAPES 2-6 ADMIN ── -->
<template v-if="isAdmin && currentStep > 1">

  <!-- Étape 2 : Client uniquement -->
  <ProjectDetails
    v-if="currentStep === 2"
    :quoteNumber="store.quoteNumber"
    :quoteDate="store.quoteDate"
    v-model:quoteValidityDays="store.quoteValidityDays"
    v-model:clientType="store.clientType"
    v-model:clientCivility="store.clientCivility"
    v-model:clientFirstName="store.clientFirstName"
    v-model:clientLastName="store.clientLastName"
    v-model:clientName="store.clientName"
    v-model:clientContactName="store.clientContactName"
    v-model:clientEmail="store.clientEmail"
    v-model:clientPhone="store.clientPhone"
    v-model:clientAddress="store.clientAddress"
    v-model:clientPostalCode="store.clientPostalCode"
    v-model:clientCity="store.clientCity"
    v-model:clientCountry="store.clientCountry"
    v-model:clientSiret="store.clientSiret"
    v-model:clientVatNumber="store.clientVatNumber"
  />

  <!-- Étape 3 : Pièces + Conditions -->
  <ProjectPieces
    v-if="currentStep === 3"
    v-model:pieces="store.pieces"
    :defaultMaterialId="store.defaultMaterialId"
    :defaultMaterial="store.defaultMaterial"
    :defaultCostPerKg="store.defaultCostPerKg"
    :defaultLossPercent="store.defaultLossPercent"
    :defaultColorCount="store.defaultColorCount"
    v-model:paymentMethod="store.paymentMethod"
    v-model:depositPercent="store.depositPercent"
    v-model:quoteValidityDays="store.quoteValidityDays"
    v-model:processingDelay="store.processingDelay"
    v-model:deliveryDelay="store.deliveryDelay"
    v-model:quoteNotes="store.quoteNotes"
  />

  <!-- Étape 4 : Temps -->
  <PrintingTime
    v-if="currentStep === 4"
    v-model:printHours="store.printHours"
    v-model:printMinutes="store.printMinutes"
    v-model:prepTime="store.prepTime"
    v-model:postTime="store.postTime"
    v-model:hourlyRate="store.hourlyRate"
    :isAdmin="true"
  />

  <!-- Étape 5 : Tarifs -->
  <PricingSuggestions
    v-if="currentStep === 5"
    :baseCost="store.calculatedCosts.subtotal"
    :baseCostPerUnit="store.calculatedCosts.subtotal / Math.max(1, store.calculatedCosts.quantity)"
    :seriesQuantity="store.calculatedCosts.quantity"
    :volumeDiscount="0"
    :taxRate="store.taxRate"
    v-model:selectedPricing="store.selectedPricing"
    v-model:customMargin="store.customMargin"
  />

  <!-- Étape 6 : Coûts -->
  <CostBreakdown
    v-if="currentStep === 6"
    :costs="store.calculatedCosts"
    :sellingPrices="store.sellingPrices"
    :isAdmin="true"
  />

</template>
```

- [ ] **Étape 3 : Mettre à jour `ProjectMatter` (étape 1) pour câbler les defaults**

```html
<ProjectMatter
  v-if="currentStep === 1"
  v-model:projectSeriesType="store.projectSeriesType"
  v-model:projectDescription="store.projectDescription"
  v-model:material="store.defaultMaterial"
  v-model:costPerKg="store.defaultCostPerKg"
  v-model:lossPercent="store.defaultLossPercent"
  v-model:colorCount="store.defaultColorCount"
  v-model:purgeWaste="ignoredPurge"
  v-model:materialId="store.defaultMaterialId"
/>
```

Ajouter dans `data()` : `ignoredPurge: 0` (la purge globale n'est plus utilisée).

- [ ] **Étape 4 : Mettre à jour `validate()`**

```js
validate() {
  const s = this.store
  if (this.currentStep === 1) {
    if (!s.defaultCostPerKg || s.defaultCostPerKg <= 0) return 'Veuillez sélectionner un filament.'
    return null
  }
  if (this.isAdmin) {
    switch (this.currentStep) {
      case 2: {
        const hasName = s.clientType === 'particulier'
          ? (s.clientFirstName?.trim() || s.clientLastName?.trim())
          : s.clientName?.trim()
        if (!hasName) return 'Le nom du client est obligatoire.'
        return null
      }
      case 3: {
        const hasNamedPiece = s.pieces.some(p => p.name?.trim())
        if (!hasNamedPiece) return 'Au moins une pièce doit avoir un nom.'
        return null
      }
      default: return null
    }
  }
  // … reste inchangé pour client
}
```

- [ ] **Étape 5 : Synchroniser le filament par défaut vers les pièces dans `goNext()`**

Dans la méthode `goNext()`, après la validation, ajouter avant le toast :

```js
// Synchro step 1 → pièce sans filament
if (this.currentStep === 1) {
  this.store.pieces = this.store.pieces.map(p =>
    !p.materialId ? {
      ...p,
      materialId:   this.store.defaultMaterialId,
      material:     this.store.defaultMaterial,
      costPerKg:    this.store.defaultCostPerKg,
      lossPercent:  this.store.defaultLossPercent,
    } : p
  )
}
```

- [ ] **Étape 6 : Mettre à jour `goNext()` — messages de toast**

```js
const messages = [
  'Projet enregistré ✓',
  'Client enregistré ✓',
  'Pièces enregistrées ✓',
  'Temps enregistré ✓',
  'Tarif sélectionné ✓',
]
```

- [ ] **Étape 7 : Supprimer les watches `store.weight` et `store.colorCount`**

Retirer entièrement le bloc `watch: { 'store.weight'() {...}, 'store.colorCount'() {...} }`.

- [ ] **Étape 8 : Mettre à jour `saveQuote()` — upload multi-images + payload**

Remplacer la section upload d'image par une boucle :

```js
// Upload images pour toutes les pièces
for (let i = 0; i < s.pieces.length; i++) {
  const piece = s.pieces[i]
  // Skip les blob URLs périmées (ne pas les resauvegarder)
  if ((piece.referenceImageUrl || '').startsWith('blob:')) {
    s.pieces[i] = { ...piece, referenceImageUrl: '' }
  }
  if (piece.referenceImage) {
    const ext  = piece.referenceImage.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('quote-images').upload(path, piece.referenceImage, { upsert: true })
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('quote-images').getPublicUrl(path)
      s.pieces[i] = { ...s.pieces[i], referenceImageUrl: urlData.publicUrl, referenceImage: null }
    }
  }
}
```

Dans le payload, remplacer les champs pièce plats par :

```js
// Dans le payload de saveQuote :
project_name:    s.pieces.length === 1 ? (s.pieces[0].name || '') : `Multi-pièces (${s.pieces.length})`,
quantity:        s.pieces.reduce((sum, p) => sum + (p.quantity || 1), 0),
material:        s.pieces[0]?.material || '',
weight:          s.calculatedCosts.totalWeight,
reference_image_url: s.pieces[0]?.referenceImageUrl || null,
items: s.pieces.map(p => ({
  id: p.id, name: p.name, quantity: p.quantity || 1,
  weight: p.weight || 0, lossPercent: p.lossPercent || 5,
  colorCount: p.colorCount || 1, purgeWaste: p.purgeWaste || 0,
  materialId: p.materialId || null, material: p.material || '',
  costPerKg: p.costPerKg || 0,
  referenceImageUrl: p.referenceImageUrl || null,
})),
```

Retirer du payload les champs devenus obsolètes : `cost_per_kg`, `loss_percent`, `color_count`, `purge_waste`.

- [ ] **Étape 9 : Mettre à jour `previewQuote`**

```js
previewQuote() {
  const s   = this.store
  const c   = s.calculatedCosts
  const sp  = s.sellingPrices
  const margin   = sp.margin / 100
  const taxRate  = (Number(s.taxRate) || 20) / 100
  const coeff    = s.projectCoeff
  const overhead = c.equipmentCost + c.workCost + c.packagingCost
  const totalMat = c.materialCost || 0.001

  const displayName = s.clientType === 'particulier'
    ? [s.clientCivility, s.clientFirstName, s.clientLastName].filter(Boolean).join(' ')
    : s.clientName

  const items = s.pieces.map(p => {
    const qty  = Math.max(1, p.quantity || 1)
    const w    = p.weight || 0
    const loss = (p.lossPercent || 0) / 100
    const purge = p.colorCount > 1 ? (p.purgeWaste || 0) : 0
    const pieceWeight  = w * qty * (1 + loss) + purge * qty
    const pieceMat     = (pieceWeight / 1000) * (p.costPerKg || 0)
    const pieceOverhead = (pieceMat / totalMat) * overhead
    const pieceCost    = (pieceMat + pieceOverhead) * coeff
    const pieceHT      = pieceCost * (1 + margin)
    const pieceTTC     = pieceHT * (1 + taxRate)
    const r = v => Math.round(v * 100) / 100
    return {
      id:              p.id,
      name:            p.name || '—',
      quantity:        qty,
      weight:          Math.round(pieceWeight * 10) / 10,
      material:        p.material || '—',
      colorCount:      p.colorCount || 1,
      referenceImageUrl: p.referenceImageUrl || '',
      unitPriceHT:     r(pieceHT / qty),
      totalTTC:        r(pieceTTC),
      tvaPart:         r(pieceTTC - pieceHT),
    }
  })

  return {
    quote_number:        s.quoteNumber,
    quote_date:          s.quoteDate,
    quote_validity_days: s.quoteValidityDays,
    status:              'pending',
    client_name:         displayName,
    client_contact_name: s.clientContactName,
    client_first_name:   s.clientFirstName,
    client_last_name:    s.clientLastName,
    client_civility:     s.clientCivility,
    client_email:        s.clientEmail,
    client_phone:        s.clientPhone,
    client_address:      s.clientAddress,
    client_postal_code:  s.clientPostalCode,
    client_city:         s.clientCity,
    client_country:      s.clientCountry,
    client_siret:        s.clientSiret,
    client_vat_number:   s.clientVatNumber,
    project_name:        s.pieces.length === 1 ? (s.pieces[0].name || '') : `Multi-pièces (${s.pieces.length})`,
    quantity:            c.quantity,
    tax_rate:            s.taxRate,
    payment_method:      s.paymentMethod,
    deposit_percent:     s.depositPercent,
    processing_delay:    s.processingDelay,
    delivery_delay:      s.deliveryDelay,
    quote_notes:         s.quoteNotes,
    material_cost:       c.materialCost,
    equipment_cost:      c.equipmentCost,
    work_cost:           c.workCost,
    subtotal_ht:         c.subtotal,
    margin_percent:      sp.margin,
    total_cost:          sp.totalTTC,
    cost_per_unit:       sp.pricePerUnit,
    items,
  }
},
```

- [ ] **Étape 10 : Mettre à jour `steps.length` dans le bouton Aperçu et Save**

Les conditions `currentStep === steps.length` fonctionnent déjà via le computed. Vérifier que `btn-preview-devis` et `btn-save` s'affichent bien à l'étape 6 pour l'admin.

- [ ] **Étape 11 : Commit**

```bash
git add src/views/calculator/CalculatorStep.vue
git commit -m "feat(CalculatorStep): 6 étapes admin, ProjectPieces étape 3, saveQuote multi-images"
```

---

### Task 8 : Mettre à jour `CostBreakdown.vue`

**Files:**
- Modify: `src/components/calculator/CostBreakdown.vue`

- [ ] **Étape 1 : Ajouter le détail par pièce dans la colonne gauche**

Dans le `<template>`, après la section "Matière" et avant "Équipement", ajouter :

```html
<!-- Détail pièces (si plus d'une pièce ou si montant non nul) -->
<template v-if="costs.pieces && costs.pieces.length > 1">
  <div class="group-label mt">Détail matière par pièce</div>
  <div v-for="p in costs.pieces" :key="p.id" class="line line--sub">
    <span class="line-label">
      {{ p.name || `Pièce ${costs.pieces.indexOf(p) + 1}` }}
      <span class="line-sub"> × {{ p.quantity }}</span>
    </span>
    <span class="line-value">{{ fmt(p.materialCost) }}</span>
  </div>
</template>
```

- [ ] **Étape 2 : Ajouter le style `.line--sub`**

```css
.line--sub .line-label { font-size: 0.74rem; color: #718096; padding-left: 0.5rem; }
```

- [ ] **Étape 3 : Commit**

```bash
git add src/components/calculator/CostBreakdown.vue
git commit -m "feat(CostBreakdown): détail coût matière par pièce"
```

---

### Task 9 : Mettre à jour `QuotePreviewModal.vue`

**Files:**
- Modify: `src/components/ui/QuotePreviewModal.vue`

- [ ] **Étape 1 : Ajouter le computed `tableItems`**

Dans `<script setup>`, ajouter après les computeds existants :

```js
const tableItems = computed(() => {
  // Nouveau format multi-pièces
  if (q.value.items?.length) return q.value.items
  // Rétrocompat : ancien format pièce unique
  return [{
    id: 'legacy',
    name: `Impression 3D — ${q.value.project_name || '—'}`,
    quantity: q.value.quantity ?? 1,
    weight: q.value.weight || 0,
    material: q.value.material || '—',
    colorCount: 1,
    referenceImageUrl: q.value.reference_image_url || '',
    unitPriceHT: unitPriceHT.value,
    totalTTC: q.value.total_cost || 0,
    tvaPart: totalTVA.value,
  }]
})

const hasAnyImage = computed(() => tableItems.value.some(i => i.referenceImageUrl))
const zoomImg = ref('')
```

- [ ] **Étape 2 : Mettre à jour la section OBJET**

```html
<div class="d-objet">
  <span class="d-objet-lbl">OBJET :</span>
  <span>
    {{ q.items?.length > 1
      ? `Impression 3D multi-pièces — ${q.items.length} article(s)`
      : (q.project_name || '—') }}
  </span>
</div>
```

- [ ] **Étape 3 : Remplacer le tbody du tableau par une boucle multi-pièces**

```html
<thead>
  <tr>
    <th class="th-desc">Désignation / Spécifications</th>
    <th v-if="hasAnyImage" class="th-photo">Photo réf.</th>
    <th class="th-num">Qté</th>
    <th class="th-num th-hide-mobile">PU HT</th>
    <th class="th-num th-hide-mobile">TVA {{ taxRate }}%</th>
    <th class="th-num th-ttc">Total TTC</th>
  </tr>
</thead>
<tbody>
  <tr v-for="item in tableItems" :key="item.id">
    <td class="td-desc">
      <div class="td-title">{{ item.name }}</div>
      <ul class="td-specs">
        <li>Matière : {{ item.material }}</li>
        <li v-if="item.weight">Poids total : {{ item.weight }} g</li>
        <li v-if="item.colorCount > 1">{{ item.colorCount }} couleurs</li>
      </ul>
    </td>
    <td v-if="hasAnyImage" class="td-photo">
      <template v-if="item.referenceImageUrl">
        <img :src="item.referenceImageUrl" class="d-ref-img"
          alt="" loading="lazy" style="cursor:zoom-in"
          @click="zoomImg = item.referenceImageUrl" />
        <div class="d-ref-lbl">Réf. client</div>
      </template>
    </td>
    <td class="td-c">{{ item.quantity }}</td>
    <td class="td-r td-hide-mobile">{{ fmtEur(item.unitPriceHT) }}</td>
    <td class="td-r td-hide-mobile">{{ fmtEur(item.tvaPart) }}</td>
    <td class="td-r td-bold">{{ fmtEur(item.totalTTC) }}</td>
  </tr>
</tbody>
```

- [ ] **Étape 4 : Ajouter la modal de zoom image**

Juste avant la fermeture de `<div class="preview-modal">`, ajouter :

```html
<!-- Zoom image -->
<div v-if="zoomImg" class="zoom-overlay" @click="zoomImg = ''">
  <img :src="zoomImg" class="zoom-img" alt="" />
  <button class="zoom-close" @click.stop="zoomImg = ''">✕</button>
</div>
```

Et dans `<style scoped>` :

```css
.zoom-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  z-index: 10000; display: flex; align-items: center; justify-content: center;
  cursor: zoom-out; padding: 1rem;
}
.zoom-img {
  max-width: 90vw; max-height: 90vh; object-fit: contain;
  border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.zoom-close {
  position: fixed; top: 1rem; right: 1rem; width: 2.2rem; height: 2.2rem;
  border: none; border-radius: 50%; background: rgba(255,255,255,0.15);
  color: #fff; font-size: 1.1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
```

- [ ] **Étape 5 : Mettre à jour `totalsRows`**

Remplacer l'utilisation de `totalHT.value` et `totalTVA.value` (qui étaient basés sur une seule pièce) par le calcul sur tous les items :

```js
const allTotalTTC  = computed(() => tableItems.value.reduce((s, i) => s + (i.totalTTC || 0), 0))
const allTotalHT   = computed(() => tableItems.value.reduce((s, i) => s + (i.totalTTC || 0) / (1 + taxRate.value / 100), 0))
const allTotalTVA  = computed(() => allTotalTTC.value - allTotalHT.value)

const totalsRows = computed(() => {
  const rows = [
    ['Sous-total HT', fmtEur(allTotalHT.value)],
    [`TVA (${taxRate.value}%)`, fmtEur(allTotalTVA.value)],
  ]
  if ((q.value.deposit_percent || 0) > 0) {
    const acompte = allTotalTTC.value * (q.value.deposit_percent / 100)
    rows.push([`Acompte (${q.value.deposit_percent}%)`, fmtEur(acompte)])
  }
  return rows
})
```

Et dans `d-tot-ttc`, remplacer `q.total_cost` par `allTotalTTC` :

```html
<div class="d-tot-ttc">
  <span>Total TTC</span>
  <span>{{ fmtEur(allTotalTTC) }}</span>
</div>
```

- [ ] **Étape 6 : Commit**

```bash
git add src/components/ui/QuotePreviewModal.vue
git commit -m "feat(QuotePreviewModal): tableau multi-pièces, miniatures avec zoom, rétrocompat"
```

---

### Task 10 : Migration Supabase — colonne `items`

**Files:**
- Run SQL in Supabase dashboard

- [ ] **Étape 1 : Ajouter la colonne `items` à la table `quotes`**

Exécuter dans le **SQL Editor** de Supabase :

```sql
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT NULL;
```

- [ ] **Étape 2 : Vérifier la migration**

Dans le SQL Editor, exécuter :

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quotes' AND column_name = 'items';
```

Expected output : 1 ligne avec `items | jsonb`.

- [ ] **Étape 3 : Commit**

```bash
git commit --allow-empty -m "chore(db): migration quotes — colonne items JSONB ajoutée"
```

---

### Task 11 : Vérification manuelle

- [ ] **Vérifier le flow complet admin :**
  1. Lancer le dev server : `npm run dev`
  2. Se connecter comme admin, aller sur `/calculator/1`
  3. Sélectionner un filament en étape 1 → "Suivant"
  4. Remplir les infos client en étape 2 → "Suivant"
  5. Étape 3 : vérifier que Pièce 1 est pré-remplie avec le filament de l'étape 1
  6. Ajouter une Pièce 2 avec un filament différent, un poids, une image
  7. Cliquer "+" pour une troisième pièce, puis "×" pour la supprimer
  8. Remplir les conditions du devis → "Suivant"
  9. Étape 4 Temps → "Suivant"
  10. Étape 5 Tarifs → "Suivant"
  11. Étape 6 Coûts : vérifier le détail par pièce visible
  12. Cliquer "Aperçu" : vérifier le tableau multi-lignes, les images, le zoom au clic
  13. Cliquer "Sauvegarder le devis" : vérifier la sauvegarde et le retour au dashboard

- [ ] **Vérifier la rétrocompat :**
  - Ouvrir un devis existant (sans colonne `items`) depuis le tableau de bord
  - L'aperçu doit s'afficher sans erreur avec la pièce unique

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat: devis multi-pièces — 6 étapes admin, tableau pieces[], images par pièce, aperçu multi-lignes"
```
