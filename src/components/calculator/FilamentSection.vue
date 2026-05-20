<template>
  <div :class="formStyles.section">

    <!-- Ligne 1 : Filament (catalogue Supabase) + Type de projet -->
    <div class="grid-2">

      <!-- Filament dynamique -->
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Filament</label>
        <div class="mat-select-row">
          <!-- Priorité : image_url (bobine) → color_or_image si URL → swatch couleur -->
          <img v-if="selectedMaterialObj && (selectedMaterialObj.image_url || isImageUrl(selectedMaterialObj.color_or_image))"
               class="mat-indicator mat-indicator--img"
               :src="selectedMaterialObj.image_url || selectedMaterialObj.color_or_image"
               :alt="selectedMaterialObj.name"
               @error="$event.target.style.opacity='0.25'" />
          <span v-else-if="selectedMaterialObj"
                class="mat-indicator mat-indicator--swatch"
                :style="{ background: isHexColor(selectedMaterialObj.color_or_image) ? selectedMaterialObj.color_or_image : '#2e9cab' }">
          </span>
          <select :class="formStyles.select" v-model="localMaterialId" @change="onCatalogMaterialChange">
            <option :value="null">{{ materialsLoading ? 'Chargement…' : '— Choisir un filament —' }}</option>
            <option v-for="m in availableMaterials" :key="m.id" :value="m.id">
              {{ m.name }}{{ m.brand ? ' · ' + m.brand : '' }}
            </option>
            <option v-if="outOfStockMaterials.length" disabled>── Rupture de stock ──</option>
            <option v-for="m in outOfStockMaterials" :key="m.id" :value="m.id" disabled>
              {{ m.name }}{{ m.brand ? ' · ' + m.brand : '' }} (indisponible)
            </option>
            <option value="custom">Autre / personnalisé</option>
          </select>
        </div>
        <p v-if="selectedMaterialObj" :class="formStyles.helpText">
          {{ selectedMaterialObj.type }} · {{ selectedMaterialObj.cost_per_kg }}€/kg · Perte {{ selectedMaterialObj.default_waste_percentage }}%
          <span v-if="selectedMaterialObj.stock_status === 'Stock Faible'" class="stock-badge stock-badge--low">⚠ Stock faible</span>
        </p>
        <p v-else-if="loadError" :class="formStyles.helpText" class="load-error">
          Catalogue indisponible —
          <button class="retry-btn" @click="loadCatalog">Réessayer</button>
          ou saisissez le coût ci-dessous.
        </p>
        <p v-else-if="!materialsLoading && !supabaseMaterials.length" :class="formStyles.helpText">
          Catalogue vide — saisissez le coût manuellement
        </p>
      </div>

      <!-- Type de projet -->
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Type de projet</label>
        <select :class="formStyles.select" :value="projectType" @change="$emit('update:projectType', $event.target.value)">
          <option v-for="pt in projectTypes" :key="pt.id" :value="pt.id">{{ pt.label }}</option>
        </select>
        <p v-if="projectCoeff !== 1" :class="formStyles.helpText">
          Coefficient {{ projectCoeff > 1 ? '+' : '' }}{{ Math.round((projectCoeff - 1) * 100) }}% appliqué au prix final
        </p>
      </div>

    </div>

    <!-- Matière personnalisée (si Autre sélectionné) -->
    <div v-if="localMaterialId === 'custom'" class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Nom de la matière</label>
        <input :class="formStyles.input" :value="material"
          @input="$emit('update:material', $event.target.value)"
          type="text" placeholder="Ex: Nylon, ABS…" />
      </div>
    </div>

    <!-- Coût/kg + Poids pièce -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="costPerKg">Coût / kg</label>
        <div class="input-unit-wrap">
          <input id="costPerKg" :class="formStyles.input" type="number"
            :value="costPerKg" @input="$emit('update:costPerKg', parseFloat($event.target.value))"
            step="0.01" min="0" />
          <span class="unit">€/kg</span>
        </div>
        <p :class="formStyles.helpText">
          {{ selectedMaterialObj ? selectedMaterialObj.name + ' – ' + (selectedMaterialObj.brand || '') : 'Prix du filament au kilogramme' }}
        </p>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="weight">Poids de la pièce</label>
        <div class="input-unit-wrap">
          <input id="weight" :class="formStyles.input" type="number"
            :value="weight" @input="$emit('update:weight', parseFloat($event.target.value))"
            step="0.1" min="0" placeholder="Ex : 45" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Poids estimé de votre pièce en grammes</p>
      </div>
    </div>

    <!-- Nombre de couleurs — boutons visuels -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Nombre de couleurs</label>
      <div class="count-buttons">
        <button v-for="n in 4" :key="n" type="button"
          :class="['count-btn', colorCount === n && 'count-btn--active']"
          @click="$emit('update:colorCount', n)">
          <span class="count-dot-row">
            <span v-for="i in n" :key="i" class="count-dot"></span>
          </span>
          <span class="count-label">{{ n === 1 ? 'Mono' : n + ' coul.' }}</span>
        </button>
      </div>
    </div>

    <!-- Palette couleurs (si > 1 couleur) -->
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
      <p v-if="selectedColors.length > 0" class="palette-chosen">
        {{ selectedColors.map(h => colorPalette.find(c=>c.hex===h)?.name).filter(Boolean).join(', ') }}
      </p>
    </div>

    <!-- Options avancées (perte supports + purge AMS) -->
    <button class="toggle-link" @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? '− Options avancées' : '+ Options avancées' }}
      <span class="advanced-hint">(réservé au prestataire)</span>
    </button>
    <div v-if="showAdvanced" class="advanced-block">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="lossPercent">Perte supports / brim</label>
        <div class="input-unit-wrap">
          <input id="lossPercent" :class="formStyles.input" type="number"
            :value="lossPercent" @input="$emit('update:lossPercent', parseFloat($event.target.value))"
            step="1" min="0" max="50" />
          <span class="unit">%</span>
        </div>
        <p :class="formStyles.helpText">5 % par défaut — augmenter si beaucoup de supports</p>
      </div>
      <div v-if="colorCount > 1" :class="formStyles.formGroup">
        <label :class="formStyles.label" for="purgeWaste">Purge AMS estimée</label>
        <div class="input-unit-wrap">
          <input id="purgeWaste" :class="formStyles.input" type="number"
            :value="purgeWaste" @input="$emit('update:purgeWaste', parseFloat($event.target.value))"
            step="1" min="0" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Poids de la tour de purge (Bambu Studio)</p>
      </div>
    </div>

  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'FilamentSection',
  props: {
    material:    { type: String,  default: 'PLA+' },
    costPerKg:   { type: Number,  default: 0 },
    weight:      { type: Number,  default: 0 },
    lossPercent: { type: Number,  default: 5 },
    colorCount:  { type: Number,  default: 1 },
    purgeWaste:  { type: Number,  default: 0 },
    projectType: { type: String,  default: 'standard' },
    materialId:  { type: String,  default: null },
  },
  emits: [
    'update:material', 'update:costPerKg', 'update:weight',
    'update:lossPercent', 'update:colorCount', 'update:purgeWaste',
    'update:projectType', 'update:materialId',
  ],
  data() {
    return {
      formStyles,
      showAdvanced:      false,
      selectedColors:    [],
      supabaseMaterials: [],
      materialsLoading:  false,
      loadError:         false,
      localMaterialId:   this.materialId,
      projectTypes: [
        { id: 'standard',    label: 'Standard (×1.0)',           coeff: 1.00 },
        { id: 'figurine',    label: 'Figurine (+30%)',           coeff: 1.30 },
        { id: 'serie',       label: 'Série porte-clés (−15%)',   coeff: 0.85 },
        { id: 'cartevisite', label: 'Cartes de visite 3D (+5%)', coeff: 1.05 },
        { id: 'standqr',     label: 'Stand QR Code (+10%)',      coeff: 1.10 },
        { id: 'deco',        label: 'Décoration (×1.0)',         coeff: 1.00 },
      ],
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
    projectCoeff() {
      return this.projectTypes.find(p => p.id === this.projectType)?.coeff ?? 1
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
    onCatalogMaterialChange() {
      const mat = this.selectedMaterialObj
      if (mat) {
        this.$emit('update:materialId',  mat.id)
        this.$emit('update:material',    mat.name)
        this.$emit('update:costPerKg',   mat.cost_per_kg)
        this.$emit('update:lossPercent', mat.default_waste_percentage)
      } else {
        // Sélection effacée ou "Autre" → reset pour saisie manuelle
        this.$emit('update:materialId', null)
        this.$emit('update:costPerKg',  0)
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
    toggleColor(hex) {
      const idx = this.selectedColors.indexOf(hex)
      if (idx === -1) {
        if (this.selectedColors.length < this.colorCount) this.selectedColors.push(hex)
      } else {
        this.selectedColors.splice(idx, 1)
      }
    },
  },
  watch: {
    colorCount(n) {
      if (this.selectedColors.length > n) this.selectedColors = this.selectedColors.slice(0, n)
    },
    materialId(v) { this.localMaterialId = v },
  },
}
</script>

<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
}

/* Indicateur visuel filament (swatch ou image) */
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

/* ── Boutons nombre de couleurs ── */
.count-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.count-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  padding: 0.6rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
  background: #fff; cursor: pointer; font-family: inherit; flex: 1; min-width: 60px;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
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

/* ── Palette couleurs ── */
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
.palette-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 0.5rem; }
.swatch {
  width: 2.2rem; height: 2.2rem; border-radius: 50%; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease; flex-shrink: 0;
}
.swatch:hover:not(:disabled) { transform: scale(1.12); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.swatch--on { box-shadow: 0 0 0 3px #2e9cab, 0 2px 8px rgba(0,0,0,0.15); transform: scale(1.08); }
.swatch:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.swatch-check { font-size: 0.75rem; font-weight: 800; }
.palette-chosen { font-size: 0.75rem; color: #718096; margin: 0; font-style: italic; }

/* ── Badge stock ── */
.stock-badge {
  display: inline-block; padding: 0.06rem 0.45rem; border-radius: 999px;
  font-size: 0.67rem; font-weight: 700; margin-left: 0.35rem;
}
.stock-badge--low { background: #fef3c7; color: #92400e; }

/* ── Erreur catalogue + retry ── */
.load-error { color: #e53e3e !important; }
.retry-btn {
  background: none; border: none; font-family: inherit; font-size: inherit;
  color: #2e9cab; font-weight: 700; cursor: pointer; padding: 0; text-decoration: underline;
}
.retry-btn:hover { color: #1f7f97; }

/* ── Options avancées ── */
.toggle-link {
  background: none; border: none; color: #a0aec0; font-size: 0.78rem; font-weight: 600;
  font-family: inherit; cursor: pointer; padding: 0.25rem 0; text-align: left;
  transition: color 0.2s ease; display: flex; align-items: center; gap: 0.35rem;
}
.toggle-link:hover { color: #2e9cab; }
.advanced-hint { font-weight: 400; font-size: 0.74rem; }
.advanced-block {
  padding: 0.75rem 1rem; background: #f7f9fc;
  border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 0.5rem;
}
</style>
