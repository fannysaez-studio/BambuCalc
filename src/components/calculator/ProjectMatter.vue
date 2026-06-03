<template>
  <div :class="formStyles.section">

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

    <!-- Sélecteur filament / couleur depuis le catalogue -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">
        Choisissez {{ colorCount > 1 ? 'vos filaments' : 'votre filament' }}
        <span v-if="colorCount > 1" class="count-badge">{{ selectedIds.length }} / {{ colorCount }}</span>
      </label>

      <!-- Chargement -->
      <p v-if="materialsLoading" class="cat-hint">Chargement du catalogue…</p>

      <!-- Erreur -->
      <p v-else-if="loadError && !catalogPalette.length" class="cat-error">
        Catalogue indisponible —
        <button class="retry-btn" @click="loadCatalog">Réessayer</button>
      </p>

      <!-- Grille de pastilles -->
      <div v-else class="catalog-grid">
        <button
          v-for="mat in catalogPalette" :key="mat.id"
          type="button"
          :class="['mat-pastille', isSelected(mat.id) && 'mat-pastille--on', isFirst(mat.id) && 'mat-pastille--primary']"
          :disabled="!isSelected(mat.id) && selectedIds.length >= colorCount"
          :title="mat.name + (mat.stockLow ? ' ⚠ Stock faible' : '')"
          @click="toggleMaterial(mat)">
          <!-- Visuel couleur -->
          <span v-if="mat.imageUrl" class="pastille-swatch pastille-swatch--img">
            <img :src="mat.imageUrl" :alt="mat.name" @error="$event.target.style.opacity='0.3'" />
          </span>
          <span v-else class="pastille-swatch" :style="{ background: mat.color }"></span>
          <!-- Nom court -->
          <span class="pastille-label">{{ mat.label }}</span>
          <!-- Coche -->
          <span v-if="isSelected(mat.id)" class="pastille-check" :style="{ color: mat.darkText ? '#fff' : '#1b2f39' }">✓</span>
          <!-- Badge stock faible -->
          <span v-if="mat.stockLow" class="pastille-low">!</span>
        </button>
      </div>

      <!-- Infos matière principale -->
      <p v-if="primaryMaterial" :class="formStyles.helpText">
        <strong>{{ primaryMaterial.name }}</strong>
        · {{ primaryMaterial.cost_per_kg }}€/kg
        · Perte {{ primaryMaterial.default_waste_percentage }}%
        <span v-if="primaryMaterial.stock_status === 'Stock Faible'" class="stock-warn">⚠ Stock faible</span>
      </p>
      <p v-else-if="!materialsLoading && catalogPalette.length" :class="formStyles.helpText">
        Sélectionnez un filament pour continuer.
      </p>
    </div>

  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'ProjectMatter',
  props: {
    material:    { type: String, default: '' },
    costPerKg:   { type: Number, default: 0 },
    lossPercent: { type: Number, default: 10 },
    colorCount:  { type: Number, default: 1 },
    purgeWaste:  { type: Number, default: 0 },
    materialId:  { type: String, default: null },
  },
  emits: [
    'update:material', 'update:costPerKg', 'update:lossPercent',
    'update:colorCount', 'update:purgeWaste', 'update:materialId',
  ],
  data() {
    return {
      formStyles,
      supabaseMaterials: [],
      materialsLoading:  false,
      loadError:         false,
      selectedIds:       [],   // [primaryId, secondaryId, ...]
    }
  },
  computed: {
    availableMaterials() {
      return this.supabaseMaterials.filter(m =>
        m.stock_status === 'En Stock' || m.stock_status === 'Stock Faible'
      )
    },
    catalogPalette() {
      return this.availableMaterials.map(m => ({
        id:        m.id,
        name:      m.name,
        label:     this.shortLabel(m),
        color:     this.isHexColor(m.color_or_image) ? m.color_or_image : '#2e9cab',
        imageUrl:  m.image_url || (this.isImageUrl(m.color_or_image) ? m.color_or_image : null),
        stockLow:  m.stock_status === 'Stock Faible',
        darkText:  this.isHexColor(m.color_or_image) ? this.isDark(m.color_or_image) : true,
      }))
    },
    primaryMaterial() {
      const id = this.selectedIds[0]
      return id ? (this.supabaseMaterials.find(m => m.id === id) || null) : null
    },
  },
  async mounted() {
    await this.loadCatalog()
    // Restore selection from parent if materialId is set
    if (this.materialId) this.selectedIds = [this.materialId]
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
        this.supabaseMaterials = data || []
      } catch {
        this.loadError = true
      } finally {
        this.materialsLoading = false
      }
    },
    isSelected(id) { return this.selectedIds.includes(id) },
    isFirst(id)    { return this.selectedIds[0] === id },
    toggleMaterial(mat) {
      const idx = this.selectedIds.indexOf(mat.id)
      if (idx !== -1) {
        this.selectedIds.splice(idx, 1)
      } else if (this.selectedIds.length < this.colorCount) {
        this.selectedIds.push(mat.id)
      }
      this.emitPrimary()
    },
    emitPrimary() {
      const mat = this.primaryMaterial
      if (mat) {
        this.$emit('update:materialId',  mat.id)
        this.$emit('update:material',    mat.name)
        this.$emit('update:costPerKg',   mat.cost_per_kg)
        this.$emit('update:lossPercent', mat.default_waste_percentage)
      } else {
        this.$emit('update:materialId', null)
        this.$emit('update:material',   '')
        this.$emit('update:costPerKg',  0)
      }
    },
    onColorCountChange(n) {
      this.$emit('update:colorCount', n)
      if (this.selectedIds.length > n) this.selectedIds = this.selectedIds.slice(0, n)
    },
    shortLabel(m) {
      // Ex: "Eryone PLA+" → "PLA+" puis brand tronqué
      return m.type ? m.type : m.name.substring(0, 8)
    },
    isHexColor(v) { return typeof v === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(v) },
    isImageUrl(v) {
      return typeof v === 'string' && (
        v.startsWith('http') || v.startsWith('data:image/') ||
        /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(v)
      )
    },
    isDark(hex) {
      if (!hex || hex.length < 4) return true
      const h = hex.replace('#', '')
      const r = parseInt(h.slice(0,2), 16)
      const g = parseInt(h.slice(2,4), 16)
      const b = parseInt(h.slice(4,6), 16)
      return (r * 299 + g * 587 + b * 114) / 1000 < 128
    },
  },
  watch: {
    materialId(v) {
      if (v && !this.selectedIds.includes(v)) this.selectedIds = [v]
      else if (!v) this.selectedIds = []
    },
  },
}
</script>

<style scoped>
.sep { height: 1px; background: #f0f4f8; margin: 0.75rem 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.5rem; }


/* Nombre de couleurs */
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

/* Badge couleur count */
.count-badge {
  display: inline-block; background: #2e9cab; color: #fff;
  font-size: 0.68rem; padding: 0.1rem 0.45rem; border-radius: 999px; margin-left: 0.4rem;
}

/* Grille catalogue */
.catalog-grid {
  display: flex; flex-wrap: wrap; gap: 0.55rem; margin-bottom: 0.5rem;
}
.mat-pastille {
  display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
  width: 64px; padding: 0.5rem 0.3rem; position: relative;
  border: 1.5px solid #e2e8f0; border-radius: 12px;
  background: #fff; cursor: pointer; font-family: inherit;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}
.mat-pastille:hover:not(:disabled) { border-color: #2e9cab; background: #f0fbfc; }
.mat-pastille:disabled { opacity: 0.35; cursor: not-allowed; }
.mat-pastille--on {
  border-color: #2e9cab;
  background: linear-gradient(135deg, #e8f7f9, #d0f0f5);
  box-shadow: 0 0 0 3px rgba(46,156,171,0.18);
}
.mat-pastille--primary { border-color: #1f7f97; }

.pastille-swatch {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(0,0,0,0.10); flex-shrink: 0; overflow: hidden;
}
.pastille-swatch--img { background: #f0f4f8; }
.pastille-swatch img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.pastille-label {
  font-size: 0.62rem; font-weight: 700; color: #4a5568;
  text-align: center; line-height: 1.2; word-break: break-word; max-width: 56px;
}
.pastille-check {
  position: absolute; top: 2px; right: 4px;
  font-size: 0.72rem; font-weight: 900;
}
.pastille-low {
  position: absolute; top: 2px; left: 4px;
  font-size: 0.6rem; font-weight: 900; color: #f59e0b;
  background: #fef3c7; border-radius: 50%; width: 14px; height: 14px;
  display: flex; align-items: center; justify-content: center;
}

.stock-warn {
  display: inline-block; padding: 0.06rem 0.45rem; border-radius: 999px;
  font-size: 0.67rem; font-weight: 700; margin-left: 0.35rem;
  background: #fef3c7; color: #92400e;
}
.cat-hint { font-size: 0.78rem; color: #a0aec0; margin: 0; }
.cat-error { font-size: 0.78rem; color: #e53e3e; margin: 0; }
.retry-btn {
  background: none; border: none; font-family: inherit; font-size: inherit;
  color: #2e9cab; font-weight: 700; cursor: pointer; padding: 0; text-decoration: underline;
}
</style>
