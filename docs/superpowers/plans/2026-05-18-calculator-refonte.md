# Calculator Refonte — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte du tunnel calculateur client (5 étapes produit-first), correction du bug de navigation, LED Réapprovisionnement admin, et préparation Stripe Payment Link.

**Architecture:** Dual flow dans CalculatorStep.vue — admin garde les 5 étapes actuelles, client obtient un nouveau tunnel avec 2 nouveaux composants (ProjectMatter.vue, ClientInfo.vue) et PrintingTime.vue étendu. La purge AMS est calculée automatiquement depuis colorCount. Le bug de navigation vient du guard router requiresAuth sur la route calculator.

**Tech Stack:** Vue 3 Options API, Pinia, Supabase, Vue Router

---

## Fichiers impactés

| Fichier | Action | Responsabilité |
|---|---|---|
| SQL | Fournir | CHECK stock_status + colonne stripe_payment_link + project_description |
| `src/stores/calculator.js` | Modifier | Ajouter projectDescription, projectSeriesType à l'état |
| `src/router/index.js` | Modifier | Retirer requiresAuth du calculator (bug navigation invité) |
| `src/views/CalculatorStep.vue` | Modifier | Dual flow admin/client, fix created(), validate() client, save payload |
| `src/views/AdminDashboard.vue` | Modifier | LED Réapprovisionnement + champ Stripe Payment Link |
| `src/components/ProjectMatter.vue` | Créer | Step 1 client : type projet + description + filament + couleur |
| `src/components/ClientInfo.vue` | Créer | Step 4 client : coordonnées simplifiées |
| `src/components/PrintingTime.vue` | Modifier | Ajouter weight prop + AMS auto badge + prop isAdmin |

---

## Task 1 — SQL : colonnes manquantes + CHECK constraint

**Files:**
- SQL à exécuter dans Supabase > SQL Editor

- [ ] **Step 1 : Exécuter ce script SQL dans Supabase**

```sql
-- 1. Mise à jour du CHECK constraint stock_status (ajoute Réapprovisionnement)
ALTER TABLE public.bambu_materials
  DROP CONSTRAINT IF EXISTS bambu_materials_stock_status_check;
ALTER TABLE public.bambu_materials
  ADD CONSTRAINT bambu_materials_stock_status_check
  CHECK (stock_status IN ('En Stock', 'Stock Faible', 'Rupture', 'Réapprovisionnement'));

-- 2. Colonne description projet dans quotes
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS project_description TEXT;

-- 3. Colonne type de série dans quotes
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS project_series_type TEXT;

-- 4. Colonne Stripe Payment Link dans quotes
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;
```

- [ ] **Step 2 : Vérifier dans Supabase Table Editor** que les 3 colonnes `project_description`, `project_series_type`, `stripe_payment_link` apparaissent dans la table `quotes` et que `bambu_materials` accepte la valeur `'Réapprovisionnement'`.

---

## Task 2 — Store : projectDescription + projectSeriesType

**Files:**
- Modify: `src/stores/calculator.js`

- [ ] **Step 1 : Ajouter les champs dans state()**

Dans `src/stores/calculator.js`, dans le bloc `// Projet`, après `projectType: 'standard',` :

```javascript
    projectSeriesType: 'unique',   // unique | deco | portesCles | figurine | carteVisite | standQR | autre
    projectDescription: '',
```

- [ ] **Step 2 : Ajouter dans resetForNewQuote()**

Dans la méthode `resetForNewQuote()`, après `projectType: 'standard',` :

```javascript
        projectSeriesType: 'unique',
        projectDescription: '',
```

- [ ] **Step 3 : Vérifier** que le store compile sans erreur en rechargeant l'app (`npm run dev` doit être déjà lancé).

---

## Task 3 — Router : correction du bug de navigation invité

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1 : Retirer requiresAuth du calculator**

Dans `src/router/index.js`, ligne 19, remplacer :

```javascript
  { path: '/calculator/:step', name: 'calculator-step', component: CalculatorStep, meta: { requiresAuth: true } },
```

par :

```javascript
  { path: '/calculator/:step', name: 'calculator-step', component: CalculatorStep },
```

**Pourquoi ce bug :** Le guard `router.beforeEach` redirige vers `/login` quand `requiresAuth: true` et que l'utilisateur n'est pas connecté. Un invité qui clique "Suivant" se retrouve redirigé silencieusement — c'est le "freeze" observé.

- [ ] **Step 2 : Tester** en mode invité (session expirée ou nouvel onglet privé) : naviguer de `/calculator/1` à `/calculator/2` doit fonctionner sans redirection.

---

## Task 4 — Admin : LED Réapprovisionnement

**Files:**
- Modify: `src/views/AdminDashboard.vue`

- [ ] **Step 1 : Ajouter l'option dans le select stock**

Trouver le select avec `v-model="mat.stock_status"` (dans la colonne Photo bobine/Stock). Ajouter l'option :

```html
<select class="mat-select mat-select--stock" v-model="mat.stock_status">
  <option value="En Stock">En Stock</option>
  <option value="Stock Faible">Stock Faible</option>
  <option value="Rupture">Rupture</option>
  <option value="Réapprovisionnement">Réappro.</option>
</select>
```

- [ ] **Step 2 : Mettre à jour stockLedClass()**

Dans la méthode `stockLedClass(status)` :

```javascript
stockLedClass(status) {
  if (status === 'Stock Faible')       return 'mat-stock-led--low'
  if (status === 'Rupture')            return 'mat-stock-led--out'
  if (status === 'Réapprovisionnement') return 'mat-stock-led--reorder'
  return 'mat-stock-led--ok'
},
```

- [ ] **Step 3 : Ajouter la classe CSS** (dans la section `/* Voyant stock LED */`) :

```css
.mat-stock-led--reorder { background: #3b82f6; color: #3b82f6; }
```

- [ ] **Step 4 : Tester** en admin → Catalogue : changer le statut d'un filament en "Réappro." → LED bleue visible → Sauvegarder → Recharger → valeur persistée.

---

## Task 5 — Créer ProjectMatter.vue (Step 1 client)

**Files:**
- Create: `src/components/ProjectMatter.vue`

- [ ] **Step 1 : Créer le composant**

```vue
<template>
  <div :class="formStyles.section">

    <!-- Type de projet / Série -->
    <div class="grid-2">
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
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Quantité souhaitée</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="quantity"
            @input="$emit('update:quantity', parseInt($event.target.value) || 1)"
            min="1" step="1" />
          <span class="unit">unité(s)</span>
        </div>
      </div>
    </div>

    <!-- Description libre -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Décrivez votre projet</label>
      <textarea :class="formStyles.input"
        rows="3"
        :value="projectDescription"
        @input="$emit('update:projectDescription', $event.target.value)"
        placeholder="Décrivez votre projet : dimensions souhaitées, usage, contraintes, finitions attendues, délai souhaité…"
        style="resize:vertical;min-height:72px;" />
      <p :class="formStyles.helpText">Plus vous êtes précis, plus le devis sera rapide et exact.</p>
    </div>

    <!-- Séparateur -->
    <div class="sep" />

    <!-- Filament (repris de FilamentSection) -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Filament</label>
      <div class="mat-select-row">
        <img v-if="selectedMaterialObj && (selectedMaterialObj.image_url || isImageUrl(selectedMaterialObj.color_or_image))"
             class="mat-indicator mat-indicator--img"
             :src="selectedMaterialObj.image_url || selectedMaterialObj.color_or_image"
             :alt="selectedMaterialObj.name"
             @error="$event.target.style.opacity='0.25'" />
        <span v-else-if="selectedMaterialObj"
              class="mat-indicator mat-indicator--swatch"
              :style="{ background: isHexColor(selectedMaterialObj.color_or_image) ? selectedMaterialObj.color_or_image : '#2e9cab' }">
        </span>
        <select :class="formStyles.select" v-model="localMaterialId" @change="onMaterialChange">
          <option :value="null">{{ materialsLoading ? 'Chargement…' : '— Choisir un filament —' }}</option>
          <option v-for="m in availableMaterials" :key="m.id" :value="m.id">
            {{ m.name }}{{ m.brand ? ' · ' + m.brand : '' }}
          </option>
          <option v-if="outOfStockMaterials.length" disabled>── Rupture de stock ──</option>
          <option v-for="m in outOfStockMaterials" :key="m.id" :value="m.id" disabled>
            {{ m.name }} (indisponible)
          </option>
          <option value="custom">Autre / personnalisé</option>
        </select>
      </div>
      <p v-if="selectedMaterialObj" :class="formStyles.helpText">
        {{ selectedMaterialObj.type }} · {{ selectedMaterialObj.cost_per_kg }}€/kg · Perte {{ selectedMaterialObj.default_waste_percentage }}%
        <span v-if="selectedMaterialObj.stock_status === 'Stock Faible'" class="stock-warn">⚠ Stock faible</span>
      </p>
      <p v-else-if="loadError" :class="formStyles.helpText" style="color:#e53e3e">
        Catalogue indisponible — <button class="retry-btn" @click="loadCatalog">Réessayer</button>
      </p>
    </div>

    <!-- Nombre de couleurs -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Nombre de couleurs</label>
      <div class="count-buttons">
        <button v-for="n in 4" :key="n" type="button"
          :class="['count-btn', colorCount === n && 'count-btn--active']"
          @click="onColorCountChange(n)">
          <span class="count-dot-row">
            <span v-for="i in n" :key="i" class="count-dot"></span>
          </span>
          <span class="count-label">{{ n === 1 ? 'Mono' : n + ' coul.' }}</span>
        </button>
      </div>
    </div>

    <!-- Palette (si > 1 couleur) -->
    <div v-if="colorCount > 1" class="palette-block">
      <p class="palette-title">
        Couleurs souhaitées
        <span class="palette-counter">{{ selectedColors.length }} / {{ colorCount }}</span>
      </p>
      <div class="palette-grid">
        <button v-for="c in colorPalette" :key="c.hex" type="button"
          :class="['swatch', selectedColors.includes(c.hex) && 'swatch--on']"
          :style="{ background: c.hex, border: c.hex === '#FFFFFF' ? '1.5px solid #e2e8f0' : 'none' }"
          :title="c.name"
          :disabled="!selectedColors.includes(c.hex) && selectedColors.length >= colorCount"
          @click="toggleColor(c.hex)">
          <span v-if="selectedColors.includes(c.hex)" class="swatch-check"
                :style="{ color: c.dark ? '#fff' : '#1b2f39' }">✓</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { supabase } from '../lib/supabase'
import formStyles from '../styles/Form.module.css'

export default {
  name: 'ProjectMatter',
  props: {
    projectSeriesType: { type: String, default: 'unique' },
    projectDescription:{ type: String, default: '' },
    quantity:          { type: Number, default: 1 },
    material:          { type: String, default: 'PLA+' },
    costPerKg:         { type: Number, default: 0 },
    lossPercent:       { type: Number, default: 10 },
    colorCount:        { type: Number, default: 1 },
    purgeWaste:        { type: Number, default: 0 },
    materialId:        { type: String, default: null },
  },
  emits: [
    'update:projectSeriesType', 'update:projectDescription', 'update:quantity',
    'update:material', 'update:costPerKg', 'update:lossPercent',
    'update:colorCount', 'update:purgeWaste', 'update:materialId',
  ],
  data() {
    return {
      formStyles,
      supabaseMaterials: [],
      materialsLoading:  false,
      loadError:         false,
      localMaterialId:   this.materialId,
      selectedColors:    [],
      colorPalette: [
        { hex: '#FFFFFF', name: 'Blanc',  dark: false },
        { hex: '#1A1A1A', name: 'Noir',   dark: true  },
        { hex: '#9E9E9E', name: 'Gris',   dark: true  },
        { hex: '#F44336', name: 'Rouge',  dark: true  },
        { hex: '#2196F3', name: 'Bleu',   dark: true  },
        { hex: '#4CAF50', name: 'Vert',   dark: true  },
        { hex: '#FFEB3B', name: 'Jaune',  dark: false },
        { hex: '#FF9800', name: 'Orange', dark: true  },
        { hex: '#9C27B0', name: 'Violet', dark: true  },
        { hex: '#E91E63', name: 'Rose',   dark: true  },
        { hex: '#D4A574', name: 'Beige',  dark: false },
        { hex: '#00BCD4', name: 'Cyan',   dark: true  },
      ],
    }
  },
  computed: {
    selectedMaterialObj() {
      if (!this.localMaterialId || this.localMaterialId === 'custom') return null
      return this.supabaseMaterials.find(m => m.id === this.localMaterialId) || null
    },
    availableMaterials() {
      return this.supabaseMaterials.filter(m => m.stock_status !== 'Rupture')
    },
    outOfStockMaterials() {
      return this.supabaseMaterials.filter(m => m.stock_status === 'Rupture')
    },
  },
  async mounted() {
    await this.loadCatalog()
  },
  methods: {
    async loadCatalog() {
      this.materialsLoading = true
      this.loadError = false
      try {
        const { data, error } = await supabase
          .from('bambu_materials')
          .select('id, name, brand, type, cost_per_kg, default_waste_percentage, color_or_image, image_url, stock_status')
          .order('created_at', { ascending: true })
        if (error) { this.loadError = true; return }
        if (data?.length) {
          this.supabaseMaterials = data
          if (this.materialId && data.find(m => m.id === this.materialId)) {
            this.localMaterialId = this.materialId
          }
        }
      } catch {
        this.loadError = true
      } finally {
        this.materialsLoading = false
      }
    },
    onMaterialChange() {
      const mat = this.selectedMaterialObj
      if (mat) {
        this.$emit('update:materialId',  mat.id)
        this.$emit('update:material',    mat.name)
        this.$emit('update:costPerKg',   mat.cost_per_kg)
        this.$emit('update:lossPercent', mat.default_waste_percentage)
      } else {
        this.$emit('update:materialId', null)
        this.$emit('update:costPerKg',  0)
      }
    },
    onColorCountChange(n) {
      this.$emit('update:colorCount', n)
      // AMS auto : (n-1) * 35g
      this.$emit('update:purgeWaste', n > 1 ? (n - 1) * 35 : 0)
      if (this.selectedColors.length > n) this.selectedColors = this.selectedColors.slice(0, n)
    },
    toggleColor(hex) {
      const idx = this.selectedColors.indexOf(hex)
      if (idx === -1) {
        if (this.selectedColors.length < this.colorCount) this.selectedColors.push(hex)
      } else {
        this.selectedColors.splice(idx, 1)
      }
    },
    isHexColor(val) {
      return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
    },
    isImageUrl(val) {
      if (typeof val !== 'string' || !val.trim()) return false
      return val.startsWith('http://') || val.startsWith('https://') ||
        val.startsWith('data:image/') ||
        /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(val)
    },
  },
  watch: {
    materialId(v) { this.localMaterialId = v },
  },
}
</script>

<style scoped>
.sep { height: 1px; background: #f0f4f8; margin: 0.75rem 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.5rem; }
.mat-select-row { display: flex; align-items: center; gap: 0.4rem; }
.mat-select-row select { flex: 1; }
.mat-indicator { flex-shrink: 0; }
.mat-indicator--swatch {
  display: inline-block; width: 18px; height: 18px; border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.12);
}
.mat-indicator--img {
  width: 22px; height: 22px; border-radius: 50%; object-fit: cover;
  border: 1px solid #e2e8f0;
}
.input-unit-wrap { display: flex; align-items: center; gap: 0.5rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.82rem; font-weight: 700; color: #4a5568; white-space: nowrap; }
.stock-warn {
  display: inline-block; padding: 0.06rem 0.45rem; border-radius: 999px;
  font-size: 0.67rem; font-weight: 700; margin-left: 0.35rem;
  background: #fef3c7; color: #92400e;
}
.retry-btn {
  background: none; border: none; font-family: inherit; font-size: inherit;
  color: #2e9cab; font-weight: 700; cursor: pointer; padding: 0; text-decoration: underline;
}
.count-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.count-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  padding: 0.6rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
  background: #fff; cursor: pointer; font-family: inherit; flex: 1; min-width: 60px;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.count-btn:hover { border-color: #2e9cab; background: #f0fbfc; }
.count-btn--active {
  border-color: #2e9cab;
  background: linear-gradient(135deg, #e8f7f9, #d0f0f5);
  box-shadow: 0 0 0 3px rgba(46,156,171,0.15);
}
.count-dot-row { display: flex; gap: 3px; }
.count-dot { width: 8px; height: 8px; border-radius: 50%; background: #2e9cab; }
.count-btn--active .count-dot { background: #1f7f97; }
.count-label { font-size: 0.7rem; font-weight: 700; color: #718096; }
.count-btn--active .count-label { color: #1f7f97; }
.palette-block {
  padding: 0.85rem 1rem; background: #f8fffe;
  border: 1.5px solid #b2e8ef; border-radius: 12px; margin-bottom: 0.5rem;
}
.palette-title {
  font-size: 0.75rem; font-weight: 700; color: #4a5568; margin: 0 0 0.6rem;
  display: flex; align-items: center; gap: 0.4rem;
}
.palette-counter {
  font-size: 0.68rem; background: #2e9cab; color: #fff;
  padding: 0.1rem 0.45rem; border-radius: 999px;
}
.palette-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.swatch {
  width: 2.2rem; height: 2.2rem; border-radius: 50%; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease; flex-shrink: 0;
}
.swatch:hover:not(:disabled) { transform: scale(1.12); }
.swatch--on { box-shadow: 0 0 0 3px #2e9cab; transform: scale(1.08); }
.swatch:disabled { opacity: 0.35; cursor: not-allowed; }
.swatch-check { font-size: 0.75rem; font-weight: 800; }
</style>
```

- [ ] **Step 2 : Vérifier** que le fichier est créé sans erreurs de syntaxe Vue.

---

## Task 6 — Créer ClientInfo.vue (Step 4 client)

**Files:**
- Create: `src/components/ClientInfo.vue`

- [ ] **Step 1 : Créer le composant**

```vue
<template>
  <div :class="formStyles.section">

    <div class="info-card">
      <span class="info-icon">📬</span>
      <div>
        <p class="info-title">Vos coordonnées</p>
        <p class="info-sub">Pour que nous puissions vous envoyer votre devis et vous recontacter.</p>
      </div>
    </div>

    <!-- Prénom + Nom -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Prénom</label>
        <input :class="formStyles.input" type="text" :value="clientFirstName"
          @input="$emit('update:clientFirstName', $event.target.value)"
          placeholder="Marie" />
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Nom</label>
        <input :class="formStyles.input" type="text" :value="clientLastName"
          @input="$emit('update:clientLastName', $event.target.value)"
          placeholder="Dupont" />
      </div>
    </div>

    <!-- Email + Téléphone -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Email <span class="req">*</span></label>
        <input :class="formStyles.input" type="email" :value="clientEmail"
          @input="$emit('update:clientEmail', $event.target.value)"
          placeholder="marie@exemple.com" />
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Téléphone <span class="optional">optionnel</span></label>
        <input :class="formStyles.input" type="tel" :value="clientPhone"
          @input="$emit('update:clientPhone', $event.target.value)"
          placeholder="+33 6 00 00 00 00" />
      </div>
    </div>

    <!-- Adresse (accordéon) -->
    <button class="toggle-link" @click="showAddress = !showAddress">
      {{ showAddress ? '− Adresse de livraison' : '+ Adresse de livraison' }}
      <span class="optional-hint">optionnel</span>
    </button>
    <div v-if="showAddress" class="address-block">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Adresse</label>
        <input :class="formStyles.input" type="text" :value="clientAddress"
          @input="$emit('update:clientAddress', $event.target.value)"
          placeholder="15 rue de la Paix" />
      </div>
      <div class="grid-3">
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Code postal</label>
          <input :class="formStyles.input" type="text" :value="clientPostalCode"
            @input="$emit('update:clientPostalCode', $event.target.value)"
            placeholder="75001" />
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Ville</label>
          <input :class="formStyles.input" type="text" :value="clientCity"
            @input="$emit('update:clientCity', $event.target.value)"
            placeholder="Paris" />
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Pays</label>
          <input :class="formStyles.input" type="text" :value="clientCountry"
            @input="$emit('update:clientCountry', $event.target.value)"
            placeholder="France" />
        </div>
      </div>
    </div>

    <!-- Mode de paiement souhaité -->
    <div :class="formStyles.formGroup" style="margin-top:0.5rem">
      <label :class="formStyles.label">Mode de paiement souhaité</label>
      <select :class="formStyles.select" :value="paymentMethod"
        @change="$emit('update:paymentMethod', $event.target.value)">
        <option value="virement">Virement bancaire</option>
        <option value="cb">Carte bancaire (Stripe)</option>
        <option value="paypal">PayPal</option>
        <option value="cheque">Chèque</option>
        <option value="especes">Espèces</option>
      </select>
    </div>

  </div>
</template>

<script>
import formStyles from '../styles/Form.module.css'

export default {
  name: 'ClientInfo',
  props: {
    clientFirstName: { type: String, default: '' },
    clientLastName:  { type: String, default: '' },
    clientEmail:     { type: String, default: '' },
    clientPhone:     { type: String, default: '' },
    clientAddress:   { type: String, default: '' },
    clientPostalCode:{ type: String, default: '' },
    clientCity:      { type: String, default: '' },
    clientCountry:   { type: String, default: 'France' },
    paymentMethod:   { type: String, default: 'virement' },
  },
  emits: [
    'update:clientFirstName', 'update:clientLastName',
    'update:clientEmail', 'update:clientPhone',
    'update:clientAddress', 'update:clientPostalCode',
    'update:clientCity', 'update:clientCountry',
    'update:paymentMethod',
  ],
  data() {
    return { formStyles, showAddress: false }
  },
}
</script>

<style scoped>
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.5rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; }
.info-card {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: #f8fffe; border: 1.5px solid #b2e8ef; border-radius: 12px;
  padding: 0.75rem 1rem; margin-bottom: 1rem;
}
.info-icon { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }
.info-title { font-size: 0.88rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.15rem; }
.info-sub { font-size: 0.78rem; color: #718096; margin: 0; }
.req { color: #e53e3e; margin-left: 2px; }
.optional { font-size: 0.72rem; color: #a0aec0; font-weight: 400; margin-left: 4px; }
.toggle-link {
  background: none; border: none; color: #a0aec0; font-size: 0.78rem; font-weight: 600;
  font-family: inherit; cursor: pointer; padding: 0.25rem 0; text-align: left;
  transition: color 0.2s ease; display: flex; align-items: center; gap: 0.35rem;
}
.toggle-link:hover { color: #2e9cab; }
.optional-hint { font-weight: 400; font-size: 0.74rem; }
.address-block {
  padding: 0.75rem 1rem; background: #f7f9fc;
  border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 0.5rem;
}
</style>
```

---

## Task 7 — Modifier PrintingTime.vue (poids + AMS badge)

**Files:**
- Modify: `src/components/PrintingTime.vue`

- [ ] **Step 1 : Ajouter props `weight`, `colorCount`, `purgeWaste`, `isAdmin`**

Dans la section `props:` :

```javascript
props: {
  printHours:   { type: Number, default: 0 },
  printMinutes: { type: Number, default: 0 },
  prepTime:     { type: Number, default: 15 },
  postTime:     { type: Number, default: 0 },
  hourlyRate:   { type: Number, default: 20 },
  weight:       { type: Number, default: 0 },
  colorCount:   { type: Number, default: 1 },
  purgeWaste:   { type: Number, default: 0 },
  isAdmin:      { type: Boolean, default: false },
},
```

Dans `emits:`, ajouter : `'update:weight', 'update:purgeWaste'`

- [ ] **Step 2 : Remplacer le template complet**

```html
<template>
  <div :class="formStyles.section">

    <!-- Poids de la pièce -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label" for="weight">Poids estimé de la pièce</label>
      <div class="input-unit-wrap">
        <input id="weight" :class="formStyles.input" type="number"
          :value="weight" @input="$emit('update:weight', parseFloat($event.target.value) || 0)"
          step="0.1" min="0" placeholder="Ex : 45" />
        <span class="unit">g</span>
      </div>
      <p :class="formStyles.helpText">Visible dans Bambu Studio après slicing. Laissez 0 si inconnu.</p>
    </div>

    <!-- Badge AMS auto (si multicolore) -->
    <div v-if="colorCount > 1" class="ams-badge">
      <span class="ams-icon">🎨</span>
      <div>
        <p class="ams-title">Impression multicolore — Purge AMS calculée automatiquement</p>
        <p class="ams-sub">{{ colorCount }} couleurs → <strong>+{{ purgeWaste }} g</strong> de purge ajoutés</p>
      </div>
    </div>

    <!-- Durée d'impression + Options avancées -->
    <button class="toggle-link" @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? '− Options impression' : '+ Options impression' }}
      <span class="advanced-hint">(durée, temps de travail)</span>
    </button>

    <div v-if="showAdvanced" class="advanced-block">

      <div class="block-label">Durée d'impression <span class="hint">— affiché dans Bambu Studio</span></div>
      <div class="grid-2" style="margin-bottom:0.75rem">
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label" for="printHours">Heures</label>
          <div class="input-unit-wrap">
            <input id="printHours" :class="formStyles.input" type="number"
              :value="printHours" @input="$emit('update:printHours', parseFloat($event.target.value) || 0)"
              min="0" />
            <span class="unit">h</span>
          </div>
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label" for="printMinutes">Minutes</label>
          <div class="input-unit-wrap">
            <input id="printMinutes" :class="formStyles.input" type="number"
              :value="printMinutes" @input="$emit('update:printMinutes', parseFloat($event.target.value) || 0)"
              min="0" max="59" />
            <span class="unit">min</span>
          </div>
        </div>
      </div>

      <!-- Purge manuelle (si multicolore, Options avancées) -->
      <div v-if="colorCount > 1" :class="formStyles.formGroup">
        <label :class="formStyles.label" for="purgeWaste">Purge AMS (ajuster si besoin)</label>
        <div class="input-unit-wrap">
          <input id="purgeWaste" :class="formStyles.input" type="number"
            :value="purgeWaste" @input="$emit('update:purgeWaste', parseFloat($event.target.value) || 0)"
            step="5" min="0" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Valeur auto : {{ (colorCount - 1) * 35 }} g — modifiable selon le modèle</p>
      </div>

      <div class="sep" />

      <div class="block-label">Temps de travail <span class="hint">— facturé au taux horaire</span></div>
      <div class="grid-2">
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label" for="prepTime">Préparation</label>
          <div class="input-unit-wrap">
            <input id="prepTime" :class="formStyles.input" type="number"
              :value="prepTime" @input="$emit('update:prepTime', parseFloat($event.target.value) || 0)"
              step="5" min="0" />
            <span class="unit">min</span>
          </div>
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label" for="postTime">Post-traitement</label>
          <div class="input-unit-wrap">
            <input id="postTime" :class="formStyles.input" type="number"
              :value="postTime" @input="$emit('update:postTime', parseFloat($event.target.value) || 0)"
              step="5" min="0" />
            <span class="unit">min</span>
          </div>
        </div>
      </div>

      <!-- Taux horaire : admin uniquement -->
      <div v-if="isAdmin" class="rate-row">
        <label :class="formStyles.label" for="hourlyRate">Taux horaire main-d'œuvre</label>
        <div class="input-unit-wrap" style="max-width:160px">
          <input id="hourlyRate" :class="formStyles.input" type="number"
            :value="hourlyRate" @input="$emit('update:hourlyRate', parseFloat($event.target.value) || 0)"
            step="1" min="0" />
          <span class="unit">€/h</span>
        </div>
      </div>

    </div>

  </div>
</template>
```

- [ ] **Step 3 : Ajouter les styles AMS** dans la section `<style scoped>` existante :

```css
.ams-badge {
  display: flex; align-items: flex-start; gap: 0.65rem;
  background: #f0fbfc; border: 1.5px solid #b2e8ef; border-radius: 12px;
  padding: 0.7rem 1rem; margin-bottom: 0.75rem;
}
.ams-icon { font-size: 1.3rem; flex-shrink: 0; }
.ams-title { font-size: 0.82rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.1rem; }
.ams-sub { font-size: 0.78rem; color: #718096; margin: 0; }
.sep { height: 1px; background: #f0f4f8; margin: 0.5rem 0; }
```

---

## Task 8 — Modifier CalculatorStep.vue (dual flow + fix created)

**Files:**
- Modify: `src/views/CalculatorStep.vue`

- [ ] **Step 1 : Ajouter les imports**

Dans la section `<script>`, remplacer le bloc imports par :

```javascript
import { useCalculatorStore } from '../stores/calculator'
import { saveQuote as saveQuoteToDb, updateQuote, checkIsAdmin } from '../utils/auth'
import { supabase } from '../lib/supabase'
import ProjectDetails from '../components/ProjectDetails.vue'
import ProjectMatter from '../components/ProjectMatter.vue'
import ClientInfo from '../components/ClientInfo.vue'
import FilamentSection from '../components/FilamentSection.vue'
import PrintingTime from '../components/PrintingTime.vue'
import PricingSuggestions from '../components/PricingSuggestions.vue'
import CostBreakdown from '../components/CostBreakdown.vue'
import ToastMessage from '../components/ToastMessage.vue'
import { Layers, Package, Clock, Tag, BarChart3, User, CheckCircle } from 'lucide-vue-next'
```

Dans `components:` :

```javascript
components: { ProjectDetails, ProjectMatter, ClientInfo, FilamentSection, PrintingTime, PricingSuggestions, CostBreakdown, ToastMessage, Layers, Package, Clock, Tag, BarChart3, User, CheckCircle },
```

- [ ] **Step 2 : Corriger created() — ajouter try/catch**

```javascript
async created() {
  try {
    this.isAdmin = await checkIsAdmin()
  } catch {
    this.isAdmin = false
  }
  if (!this.store.editingQuoteId && !this.$route.query.editId && this.store.quoteNumberIsStale) {
    const d  = new Date()
    const yy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    this.store.quoteNumber = `DEV n° ${yy}${mm}${dd}-01`
  }
},
```

- [ ] **Step 3 : Passer steps en computed (dual flow)**

Supprimer `steps` de `data()` et l'ajouter dans `computed:` :

```javascript
steps() {
  if (this.isAdmin) {
    return [
      { step: 1, label: 'Projet',  icon: 'Layers',    description: "Informations client, pièce et imprimante." },
      { step: 2, label: 'Matière', icon: 'Package',   description: 'Filament, coût au kilo et poids.' },
      { step: 3, label: 'Temps',   icon: 'Clock',     description: "Durée d'impression et temps de travail." },
      { step: 4, label: 'Tarifs',  icon: 'Tag',       description: 'Choisissez votre marge et la tarification.' },
      { step: 5, label: 'Coûts',   icon: 'BarChart3', description: 'Résumé complet des coûts et total TTC.' },
    ]
  }
  return [
    { step: 1, label: 'Projet & Matière', icon: 'Package',     description: 'Type de projet, filament et couleurs.' },
    { step: 2, label: 'Poids & Temps',    icon: 'Clock',       description: 'Poids de la pièce et durée d\'impression.' },
    { step: 3, label: 'Tarification',     icon: 'Tag',         description: 'Votre prestataire détermine le meilleur tarif.' },
    { step: 4, label: 'Coordonnées',      icon: 'User',        description: 'Vos informations pour recevoir le devis.' },
    { step: 5, label: 'Confirmation',     icon: 'CheckCircle', description: 'Récapitulatif et envoi de votre demande.' },
  ]
},
```

- [ ] **Step 4 : Remplacer le contenu de `step-card-body` dans le template**

```html
<div class="step-card-body">

  <!-- ── FLUX ADMIN ── -->
  <template v-if="isAdmin">
    <ProjectDetails
      v-if="currentStep === 1"
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
      v-model:quantity="store.quantity"
      v-model:projectName="store.projectName"
      v-model:printProfile="store.printProfile"
      v-model:printerModel="store.printerModel"
      v-model:nozzleSize="store.nozzleSize"
      :showTechnicalFields="true"
      v-model:referenceImage="store.referenceImage"
      v-model:referenceImageUrl="store.referenceImageUrl"
      v-model:paymentMethod="store.paymentMethod"
      v-model:depositPercent="store.depositPercent"
      v-model:quoteNotes="store.quoteNotes"
    />
    <FilamentSection
      v-if="currentStep === 2"
      v-model:material="store.material"
      v-model:costPerKg="store.costPerKg"
      v-model:weight="store.weight"
      v-model:lossPercent="store.lossPercent"
      v-model:colorCount="store.colorCount"
      v-model:purgeWaste="store.purgeWaste"
      v-model:projectType="store.projectType"
      v-model:materialId="store.materialId"
    />
    <PrintingTime
      v-if="currentStep === 3"
      v-model:printHours="store.printHours"
      v-model:printMinutes="store.printMinutes"
      v-model:prepTime="store.prepTime"
      v-model:postTime="store.postTime"
      v-model:hourlyRate="store.hourlyRate"
      v-model:weight="store.weight"
      v-model:purgeWaste="store.purgeWaste"
      :colorCount="store.colorCount"
      :isAdmin="true"
    />
    <PricingSuggestions
      v-if="currentStep === 4"
      :baseCost="store.calculatedCosts.totalCost"
      :baseCostPerUnit="store.calculatedCosts.costPerUnit"
      :seriesQuantity="store.quantity"
      :volumeDiscount="0"
      :taxRate="store.taxRate"
      v-model:selectedPricing="store.selectedPricing"
      v-model:customMargin="store.customMargin"
    />
    <CostBreakdown
      v-if="currentStep === 5"
      :costs="store.calculatedCosts"
      :isAdmin="true"
    />
  </template>

  <!-- ── FLUX CLIENT ── -->
  <template v-else>
    <ProjectMatter
      v-if="currentStep === 1"
      v-model:projectSeriesType="store.projectSeriesType"
      v-model:projectDescription="store.projectDescription"
      v-model:quantity="store.quantity"
      v-model:material="store.material"
      v-model:costPerKg="store.costPerKg"
      v-model:lossPercent="store.lossPercent"
      v-model:colorCount="store.colorCount"
      v-model:purgeWaste="store.purgeWaste"
      v-model:materialId="store.materialId"
    />
    <PrintingTime
      v-if="currentStep === 2"
      v-model:weight="store.weight"
      v-model:printHours="store.printHours"
      v-model:printMinutes="store.printMinutes"
      v-model:prepTime="store.prepTime"
      v-model:postTime="store.postTime"
      v-model:hourlyRate="store.hourlyRate"
      v-model:purgeWaste="store.purgeWaste"
      :colorCount="store.colorCount"
      :isAdmin="false"
    />
    <PricingSuggestions
      v-if="currentStep === 3"
      :baseCost="store.calculatedCosts.totalCost"
      :baseCostPerUnit="store.calculatedCosts.costPerUnit"
      :seriesQuantity="store.quantity"
      :volumeDiscount="0"
      :taxRate="store.taxRate"
      v-model:selectedPricing="store.selectedPricing"
      v-model:customMargin="store.customMargin"
    />
    <ClientInfo
      v-if="currentStep === 4"
      v-model:clientFirstName="store.clientFirstName"
      v-model:clientLastName="store.clientLastName"
      v-model:clientEmail="store.clientEmail"
      v-model:clientPhone="store.clientPhone"
      v-model:clientAddress="store.clientAddress"
      v-model:clientPostalCode="store.clientPostalCode"
      v-model:clientCity="store.clientCity"
      v-model:clientCountry="store.clientCountry"
      v-model:paymentMethod="store.paymentMethod"
    />
    <CostBreakdown
      v-if="currentStep === 5"
      :costs="store.calculatedCosts"
      :isAdmin="false"
    />
  </template>

</div>
```

- [ ] **Step 5 : Mettre à jour validate()**

```javascript
validate() {
  const s = this.store
  if (this.isAdmin) {
    switch (this.currentStep) {
      case 1:
        if (!s.projectName?.trim()) return 'Le nom de la pièce est obligatoire.'
        const hasName = s.clientType === 'particulier'
          ? (s.clientFirstName?.trim() || s.clientLastName?.trim())
          : s.clientName?.trim()
        if (!hasName) return 'Le nom du client est obligatoire.'
        return null
      case 2:
        if (!s.costPerKg || s.costPerKg <= 0) return 'Le coût du filament au kg est obligatoire.'
        return null
      default: return null
    }
  }
  // Flux client
  switch (this.currentStep) {
    case 1:
      if (!s.costPerKg || s.costPerKg <= 0) return 'Veuillez sélectionner un filament.'
      return null
    case 2:
      return null  // poids optionnel (ils peuvent ne pas le connaître)
    case 3:
      return null
    case 4:
      if (!s.clientEmail?.trim()) return 'Votre adresse email est obligatoire pour recevoir le devis.'
      return null
    default: return null
  }
},
```

- [ ] **Step 6 : Mettre à jour le payload saveQuote() — ajouter projectDescription et projectSeriesType**

Dans la méthode `saveQuote()`, dans l'objet `payload`, après `project_type: s.projectType,` :

```javascript
          project_series_type: s.projectSeriesType || null,
          project_description: s.projectDescription || null,
```

- [ ] **Step 7 : Tester le flux client** en mode invité (onglet privé) :
  - `/calculator/1` → filament sélectionnable, Suivant fonctionnel
  - `/calculator/2` → poids entrable, badge AMS visible si multicolore
  - `/calculator/3` → PricingSuggestions
  - `/calculator/4` → formulaire coordonnées
  - `/calculator/5` → confirmation

---

## Task 9 — Admin : champ Stripe Payment Link dans la vue devis

**Files:**
- Modify: `src/views/AdminDashboard.vue`

- [ ] **Step 1 : Localiser la vue détail d'un devis** dans AdminDashboard.vue

Chercher `stripe_payment_link` ou le panneau de détail de devis (probablement dans l'onglet "Clients & Devis" ou "Gestion Devis"). Chercher le pattern `selectedQuote` ou `quoteDetail`.

- [ ] **Step 2 : Ajouter le champ dans le template du détail devis**

À la fin du bloc de détail d'un devis sélectionné, avant le bouton de fermeture :

```html
<!-- Stripe Payment Link -->
<div class="stripe-link-row">
  <label class="stripe-link-label">🔗 Lien de paiement Stripe</label>
  <div class="stripe-link-wrap">
    <input type="url" class="stripe-link-input"
      v-model="selectedQuote.stripe_payment_link"
      placeholder="https://buy.stripe.com/…"
      @change="saveStripeLink(selectedQuote)" />
    <button v-if="selectedQuote.stripe_payment_link"
      class="stripe-copy-btn"
      @click="copyStripeLink(selectedQuote.stripe_payment_link)"
      title="Copier le lien">
      📋
    </button>
  </div>
  <p class="stripe-link-hint">Générez ce lien depuis ton <a href="https://dashboard.stripe.com/payment-links" target="_blank">Dashboard Stripe</a>, collez-le ici, puis envoyez-le au client par email.</p>
</div>
```

- [ ] **Step 3 : Ajouter les méthodes dans methods**

```javascript
async saveStripeLink(quote) {
  if (!quote?.id) return
  const { error } = await supabase
    .from('quotes')
    .update({ stripe_payment_link: quote.stripe_payment_link || null })
    .eq('id', quote.id)
  if (error) {
    this.$refs.toast?.show('Erreur sauvegarde lien Stripe : ' + error.message, 'error')
  } else {
    this.$refs.toast?.show('Lien Stripe sauvegardé.', 'success', 2000)
  }
},
copyStripeLink(url) {
  if (!url) return
  navigator.clipboard.writeText(url)
    .then(() => this.$refs.toast?.show('Lien copié !', 'success', 1500))
    .catch(() => this.$refs.toast?.show('Impossible de copier.', 'error'))
},
```

- [ ] **Step 4 : Ajouter le CSS** (avant `</style>`) :

```css
.stripe-link-row { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f0f4f8; }
.stripe-link-label { font-size: 0.75rem; font-weight: 700; color: #4a5568; display: block; margin-bottom: 0.35rem; }
.stripe-link-wrap { display: flex; gap: 0.4rem; align-items: center; }
.stripe-link-input {
  flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.3rem 0.6rem; font-size: 0.78rem; font-family: inherit;
  outline: none; transition: border-color 0.2s;
}
.stripe-link-input:focus { border-color: #7c3aed; }
.stripe-copy-btn {
  padding: 0.3rem 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: 0.9rem; transition: background 0.15s;
}
.stripe-copy-btn:hover { background: #f0e6ff; border-color: #9f7aea; }
.stripe-link-hint { font-size: 0.7rem; color: #a0aec0; margin: 0.3rem 0 0; }
.stripe-link-hint a { color: #7c3aed; }
```

- [ ] **Step 5 : Tester** en admin → ouvrir un devis → coller une URL Stripe → Tab/blur → toast "sauvegardé" → bouton copier fonctionne.

---

## Self-Review

**Spec coverage :**
- ✅ LED Réapprovisionnement (Task 1 SQL + Task 4)
- ✅ Bug navigation invité (Task 3 router)
- ✅ Fix created() try/catch (Task 8 Step 2)
- ✅ Étape 1 client : type projet + description + filament + couleur (Task 5 ProjectMatter)
- ✅ Étape 2 client : poids + AMS auto + champ expert masqué (Task 7 PrintingTime)
- ✅ Étapes 3-5 client : PricingSuggestions / ClientInfo / CostBreakdown (Task 8)
- ✅ Stripe Payment Link (Task 1 SQL + Task 9)
- ✅ Validation client adaptée (Task 8 Step 5)
- ✅ Payload saveQuote étendu (Task 8 Step 6)

**Placeholder scan :** Aucun TBD ou TODO dans le plan. Chaque step contient du code complet.

**Type consistency :** `projectSeriesType` et `projectDescription` définis en Task 2 (store), utilisés en Task 5 (ProjectMatter props), Task 8 Step 4 (template), Task 8 Step 6 (payload). ✅
