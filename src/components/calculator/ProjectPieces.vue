<template>
  <div :class="formStyles.section">

    <!-- ── Section Pièces ── -->
    <div class="section-label">Pièces & Impression</div>

    <div v-for="(piece, idx) in pieces" :key="piece.id" class="piece-card">

      <!-- Header -->
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
            <span class="filament-dot" :style="{ background: swatchColor(piece) }"></span>
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


  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'ProjectPieces',
  props: {
    pieces:             { type: Array,   required: true },
    defaultMaterialId:  { type: String,  default: null },
    defaultMaterial:    { type: String,  default: '' },
    defaultCostPerKg:   { type: Number,  default: 0 },
    defaultLossPercent: { type: Number,  default: 5 },
    defaultColorCount:  { type: Number,  default: 1 },
  },
  emits: ['update:pieces'],
  data() {
    return {
      formStyles,
      openIdx:      null,
      loading:      false,
      rawMaterials: [],
      imgRefs:      {},
      imgErrors:    {},
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
          cost_per_kg:              m.cost_per_kg,
          default_waste_percentage: m.default_waste_percentage || 5,
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
      this.$emit('update:pieces', this.pieces.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p))
    },
    updateWeight(idx, weight) {
      const piece = this.pieces[idx]
      const purgeWaste = piece.colorCount > 1
        ? Math.round(weight * 0.25 * (piece.colorCount - 1)) : 0
      this.$emit('update:pieces', this.pieces.map((p, i) =>
        i === idx ? { ...p, weight, purgeWaste } : p))
    },
    updateColorCount(idx, colorCount) {
      const piece = this.pieces[idx]
      const purgeWaste = colorCount > 1
        ? Math.round((piece.weight || 0) * 0.25 * (colorCount - 1)) : 0
      this.$emit('update:pieces', this.pieces.map((p, i) =>
        i === idx ? { ...p, colorCount, purgeWaste } : p))
    },
    addPiece() {
      this.$emit('update:pieces', [...this.pieces, {
        id:               `piece-${Date.now()}`,
        name:             '',
        quantity:         1,
        weight:           0,
        lossPercent:      this.defaultLossPercent || 5,
        colorCount:       1,
        purgeWaste:       0,
        materialId:       this.defaultMaterialId || null,
        material:         this.defaultMaterial || '',
        costPerKg:        this.defaultCostPerKg || 0,
        referenceImage:   null,
        referenceImageUrl:'',
      }])
    },
    removePiece(idx) {
      this.$emit('update:pieces', this.pieces.filter((_, i) => i !== idx))
    },
    toggleSelector(idx) {
      this.openIdx = this.openIdx === idx ? null : idx
    },
    selectMaterial(idx, mat) {
      this.$emit('update:pieces', this.pieces.map((p, i) => i === idx ? {
        ...p,
        materialId:  mat.id,
        material:    mat.name,
        costPerKg:   mat.cost_per_kg,
        lossPercent: mat.default_waste_percentage || 5,
      } : p))
      this.openIdx = null
    },
    triggerInput(idx) {
      this.imgRefs[idx]?.click()
    },
    handleUpload(e, idx) {
      const file = e.target.files[0]
      if (!file) return
      this.$emit('update:pieces', this.pieces.map((p, i) => i === idx ? {
        ...p, referenceImage: file,
        referenceImageUrl: URL.createObjectURL(file),
      } : p))
    },
    handleDrop(e, idx) {
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return
      this.$emit('update:pieces', this.pieces.map((p, i) => i === idx ? {
        ...p, referenceImage: file,
        referenceImageUrl: URL.createObjectURL(file),
      } : p))
    },
    clearImage(idx) {
      this.$emit('update:pieces', this.pieces.map((p, i) =>
        i === idx ? { ...p, referenceImage: null, referenceImageUrl: '' } : p))
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
  position: relative; border: 1.5px dashed #cbd5e0; border-radius: 8px;
  background: #f7f9fc; cursor: pointer; overflow: hidden; height: 50px;
  display: flex; align-items: center; justify-content: flex-start;
  transition: border-color 0.2s ease, background 0.2s ease;
  padding: 0 0.65rem;
}
.img-upload-area:hover { border-color: #2e9cab; background: #f0fbfc; }
/* Quand image chargée : zone compacte autour de la miniature */
.img-upload-area--has {
  border-style: solid; border-color: #2e9cab;
  width: fit-content; max-width: 160px; padding: 0.2rem 2rem 0.2rem 0.4rem;
}
.img-placeholder {
  display: flex; flex-direction: row; align-items: center;
  gap: 0.5rem; padding: 0; width: 100%;
}
.img-ph-icon { font-size: 1rem; flex-shrink: 0; }
.img-ph-text { font-size: 0.72rem; color: #a0aec0; font-weight: 500; }
.img-placeholder--saved .img-ph-text { color: #2e9cab; }
.img-preview {
  height: 40px; width: 40px; object-fit: contain;
  display: block; flex-shrink: 0; border-radius: 4px;
}
.img-remove {
  position: absolute; top: 50%; right: 0.4rem; transform: translateY(-50%);
  width: 1.2rem; height: 1.2rem; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.45); color: #fff; font-size: 0.85rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
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
