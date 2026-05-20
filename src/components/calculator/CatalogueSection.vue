<template>
  <div class="cat-wrap">

    <!-- ══════════════════════════════════════════════════════════
         EN-TÊTE
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-header">
      <h2 class="cat-title">
        Catalogue de matières
        <span v-if="materialsLoading" class="cat-badge">Chargement…</span>
        <span v-if="matUploading"     class="cat-badge cat-badge--teal">Upload…</span>
      </h2>
      <div class="cat-actions">
        <button class="cat-btn-add" @click="$emit('add-row')">
          + Ajouter un filament
        </button>
        <button
          class="cat-btn-save"
          :disabled="materialsSaving"
          :title="materialsSaving ? 'Sauvegarde…' : 'Sauvegarder le catalogue'"
          @click="$emit('save')"
        >
          <span v-if="materialsSaving" class="cat-spinner" />
          <Save v-else :size="18" />
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         TABLEAU — Tablette & Desktop (≥ 641 px)
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-table-wrap">
      <table class="cat-table">
        <thead>
          <tr>
            <th class="cat-th c-color">Couleur</th>
            <th class="cat-th c-photo">Photo</th>
            <th class="cat-th c-name">Nom</th>
            <th class="cat-th c-brand">Marque</th>
            <th class="cat-th c-type">Type</th>
            <th class="cat-th c-num">€/kg</th>
            <th class="cat-th c-num">Perte%</th>
            <th class="cat-th c-dep">Départ</th>
            <th class="cat-th c-dep c-restant">Restant</th>
            <th class="cat-th c-stock">Statut</th>
            <th class="cat-th c-qty">Qté</th>
            <th class="cat-th c-act"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(mat, idx) in paginated"
            :key="mat.id || idx"
            class="cat-row"
          >
            <!-- Couleur -->
            <td class="cat-td c-color">
              <div class="cat-color-cell">
                <span class="cat-swatch" :style="swatchBg(mat)" />
                <input
                  type="color" class="cat-color-inp"
                  :value="isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab'"
                  @input="mat.color_or_image = $event.target.value"
                  title="Couleur"
                />
                <span class="cat-hex-lbl">{{ hexLabel(mat) }}</span>
              </div>
            </td>

            <!-- Photo bobine -->
            <td class="cat-td c-photo">
              <div class="cat-photo-cell">
                <img
                  v-if="mat.image_url"
                  class="cat-thumb"
                  :src="mat.image_url"
                  :alt="mat.name"
                  @error="$event.target.style.opacity = '0.3'"
                />
                <div v-else class="cat-thumb-empty">
                  <ImageIcon :size="12" />
                </div>
                <div class="cat-photo-btns">
                  <label
                    class="cat-icn-btn"
                    :class="matUploading && 'cat-icn-btn--off'"
                    :title="mat.image_url ? 'Modifier photo' : 'Ajouter photo'"
                  >
                    <Upload :size="11" />
                    <input
                      type="file" accept="image/*"
                      style="display:none"
                      :disabled="matUploading"
                      @change="$emit('upload', mat, $event)"
                    />
                  </label>
                  <button
                    v-if="mat.image_url"
                    class="cat-icn-btn cat-icn-btn--danger"
                    @click="$emit('clear-image', mat)"
                    title="Supprimer photo"
                  >
                    <Trash2 :size="11" />
                  </button>
                </div>
              </div>
            </td>

            <!-- Nom -->
            <td class="cat-td">
              <input class="cat-input" type="text" v-model="mat.name" placeholder="Nom…" />
            </td>

            <!-- Marque -->
            <td class="cat-td">
              <select
                class="cat-select"
                :value="brandVal(mat)"
                @change="onBrand(mat, $event.target.value)"
              >
                <option v-for="b in knownBrands" :key="b">{{ b }}</option>
                <option value="Autre">Autre</option>
              </select>
              <input
                v-if="isCustomBrand(mat)"
                class="cat-input cat-input--xs"
                type="text"
                v-model="mat.brand"
                placeholder="Marque…"
                @input="autoName(mat)"
              />
            </td>

            <!-- Type -->
            <td class="cat-td">
              <select class="cat-select" v-model="mat.type" @change="onType(mat)">
                <option v-for="t in typeOptions" :key="t">{{ t }}</option>
              </select>
            </td>

            <!-- €/kg -->
            <td class="cat-td cat-td--num">
              <input
                class="cat-input cat-input--num"
                type="number" min="0" step="0.01"
                v-model.number="mat.cost_per_kg"
              />
            </td>

            <!-- Perte % -->
            <td class="cat-td cat-td--num">
              <input
                class="cat-input cat-input--num"
                type="number" min="0" max="50" step="1"
                v-model.number="mat.default_waste_percentage"
              />
            </td>

            <!-- Poids départ -->
            <td class="cat-td cat-td--num">
              <div class="cat-unit-wrap">
                <input
                  class="cat-input cat-input--num"
                  type="number" min="0" step="10"
                  v-model.number="mat.poids_depart"
                  placeholder="1000"
                />
                <span class="cat-unit">g</span>
              </div>
            </td>

            <!-- Restant — sécurisé : max = poids départ -->
            <td class="cat-td cat-td--num">
              <div class="cat-unit-wrap">
                <input
                  class="cat-input cat-input--num cat-input--restant"
                  type="number" min="0" step="1"
                  v-model.number="mat.poids_restant"
                  :max="mat.poids_depart > 0 ? mat.poids_depart : null"
                  :placeholder="mat.poids_depart || 1000"
                />
                <span class="cat-unit">g</span>
              </div>
            </td>

            <!-- Statut stock -->
            <td class="cat-td">
              <div class="cat-stock-cell">
                <span class="cat-led" :class="ledClass(mat.stock_status)" />
                <select class="cat-select cat-select--stock" v-model="mat.stock_status">
                  <option value="En Stock">En Stock</option>
                  <option value="Stock Faible">Stock Faible</option>
                  <option value="Rupture">Rupture</option>
                  <option value="Réapprovisionnement">Réappro.</option>
                </select>
              </div>
            </td>

            <!-- Quantité de bobines -->
            <td class="cat-td cat-td--qty">
              <div class="cat-qty-ctrl">
                <button class="cat-qty-btn" @click="mat.quantite = Math.max(0, (mat.quantite || 0) - 1)">−</button>
                <input
                  class="cat-input cat-input--qty"
                  type="number" min="0" step="1"
                  v-model.number="mat.quantite"
                />
                <button class="cat-qty-btn" @click="mat.quantite = (mat.quantite || 0) + 1">+</button>
              </div>
            </td>

            <!-- Supprimer -->
            <td class="cat-td cat-td--act">
              <button
                class="cat-del-btn"
                :title="`Supprimer ${mat.name || 'ce filament'}`"
                @click="$emit('delete', mat, (currentPage - 1) * perPage + idx)"
              >
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>

          <tr v-if="!materialsLoading && materials.length === 0">
            <td colspan="12" class="cat-empty">
              Aucun matériau — cliquez sur "+ Ajouter un filament"
            </td>
          </tr>
          <tr v-if="materialsLoading">
            <td colspan="12" class="cat-empty">Chargement du catalogue…</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         GRILLE 2 COLONNES — Tablette uniquement (641 px – 1024 px)
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-tab-grid">
      <p v-if="materialsLoading" class="cat-empty">Chargement…</p>
      <p v-else-if="materials.length === 0" class="cat-empty">
        Aucun filament — cliquez sur "+ Ajouter un filament"
      </p>

      <div
        v-else
        v-for="(mat, idx) in paginated"
        :key="mat.id || idx"
        class="cat-tcard"
      >
        <!-- ── En-tête : couleur + hex + nom + photo + supprimer ── -->
        <div class="cat-tcard-head">
          <span class="cat-swatch" :style="swatchBg(mat)" />
          <input
            type="color" class="cat-color-inp"
            :value="isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab'"
            @input="mat.color_or_image = $event.target.value"
            title="Couleur"
          />
          <span class="cat-tcard-hex">{{ hexLabel(mat) }}</span>
          <input
            class="cat-input cat-tcard-name"
            type="text"
            v-model="mat.name"
            placeholder="Nom du filament…"
          />
          <div class="cat-tcard-photo">
            <img
              v-if="mat.image_url"
              class="cat-thumb"
              :src="mat.image_url"
              :alt="mat.name"
              @error="$event.target.style.opacity = '0.3'"
            />
            <div v-else class="cat-thumb-empty"><ImageIcon :size="12" /></div>
            <label class="cat-icn-btn" title="Photo bobine">
              <Upload :size="12" />
              <input type="file" accept="image/*" style="display:none" @change="$emit('upload', mat, $event)" />
            </label>
            <button
              v-if="mat.image_url"
              class="cat-icn-btn cat-icn-btn--danger"
              @click="$emit('clear-image', mat)"
              title="Supprimer photo"
            ><Trash2 :size="12" /></button>
          </div>
          <button
            class="cat-del-btn"
            :title="`Supprimer ${mat.name || 'ce filament'}`"
            @click="$emit('delete', mat, (currentPage - 1) * perPage + idx)"
          ><Trash2 :size="15" /></button>
        </div>

        <!-- ── Champs : grille interne 2 colonnes ── -->
        <div class="cat-tcard-fields">
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Marque</label>
            <select class="cat-select" :value="brandVal(mat)" @change="onBrand(mat, $event.target.value)">
              <option v-for="b in knownBrands" :key="b">{{ b }}</option>
              <option value="Autre">Autre</option>
            </select>
            <input
              v-if="isCustomBrand(mat)"
              class="cat-input cat-input--xs"
              type="text"
              v-model="mat.brand"
              placeholder="Marque…"
              @input="autoName(mat)"
            />
          </div>
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Type</label>
            <select class="cat-select" v-model="mat.type" @change="onType(mat)">
              <option v-for="t in typeOptions" :key="t">{{ t }}</option>
            </select>
          </div>
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">€ / kg</label>
            <input class="cat-input cat-input--num" type="number" min="0" step="0.01" v-model.number="mat.cost_per_kg" />
          </div>
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Perte %</label>
            <input class="cat-input cat-input--num" type="number" min="0" max="50" step="1" v-model.number="mat.default_waste_percentage" />
          </div>
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Départ g</label>
            <input class="cat-input cat-input--num" type="number" min="0" step="10" v-model.number="mat.poids_depart" placeholder="1000" />
          </div>
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Restant g</label>
            <input
              class="cat-input cat-input--num cat-input--restant"
              type="number" min="0" step="1"
              v-model.number="mat.poids_restant"
              :max="mat.poids_depart > 0 ? mat.poids_depart : null"
              :placeholder="mat.poids_depart || 1000"
            />
          </div>
          <!-- Statut stock — pleine largeur -->
          <div class="cat-tcard-field cat-tcard-field--full">
            <label class="cat-tcard-lbl">Statut stock</label>
            <div class="cat-stock-cell">
              <span class="cat-led" :class="ledClass(mat.stock_status)" />
              <select class="cat-select cat-select--stock" v-model="mat.stock_status">
                <option value="En Stock">En Stock</option>
                <option value="Stock Faible">Stock Faible</option>
                <option value="Rupture">Rupture</option>
                <option value="Réapprovisionnement">Réapprovisionnement</option>
              </select>
            </div>
          </div>
          <!-- Quantité bobines — pleine largeur -->
          <div class="cat-tcard-field cat-tcard-field--full">
            <label class="cat-tcard-lbl">Qté bobines</label>
            <div class="cat-qty-ctrl">
              <button class="cat-qty-btn" @click="mat.quantite = Math.max(0, (mat.quantite || 0) - 1)">−</button>
              <input class="cat-input cat-input--qty" type="number" min="0" step="1" v-model.number="mat.quantite" />
              <button class="cat-qty-btn" @click="mat.quantite = (mat.quantite || 0) + 1">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         CARTES — Mobile (≤ 640 px)
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-cards">
      <p v-if="materialsLoading" class="cat-empty">Chargement…</p>
      <p v-else-if="materials.length === 0" class="cat-empty">
        Aucun filament — appuie sur "+ Ajouter un filament"
      </p>

      <div
        v-else
        v-for="(mat, idx) in paginated"
        :key="mat.id || idx"
        class="cat-card"
      >
        <!-- Ligne 1 : Couleur + Nom + Supprimer -->
        <div class="card-top">
          <span class="card-swatch" :style="swatchBg(mat)" />
          <input
            type="color" class="cat-color-inp"
            :value="isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab'"
            @input="mat.color_or_image = $event.target.value"
            title="Couleur"
          />
          <span class="card-hex">{{ hexLabel(mat) }}</span>
          <input
            class="cat-input card-name-inp"
            type="text"
            v-model="mat.name"
            placeholder="Nom du filament…"
          />
          <button
            class="cat-del-btn"
            :title="`Supprimer ${mat.name || 'ce filament'}`"
            @click="$emit('delete', mat, (currentPage - 1) * perPage + idx)"
          >
            <Trash2 :size="15" />
          </button>
        </div>

        <!-- Ligne 2 : Marque / Type -->
        <div class="card-grid card-grid--2">
          <div class="card-field">
            <label class="card-lbl">Marque</label>
            <select class="cat-select" :value="brandVal(mat)" @change="onBrand(mat, $event.target.value)">
              <option v-for="b in knownBrands" :key="b">{{ b }}</option>
              <option value="Autre">Autre</option>
            </select>
            <input
              v-if="isCustomBrand(mat)"
              class="cat-input"
              type="text"
              v-model="mat.brand"
              placeholder="Marque…"
              @input="autoName(mat)"
            />
          </div>
          <div class="card-field">
            <label class="card-lbl">Type</label>
            <select class="cat-select" v-model="mat.type" @change="onType(mat)">
              <option v-for="t in typeOptions" :key="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- Ligne 3 : Valeurs numériques -->
        <div class="card-grid card-grid--4">
          <div class="card-field">
            <label class="card-lbl">€ / kg</label>
            <input class="cat-input cat-input--num" type="number" min="0" step="0.01" v-model.number="mat.cost_per_kg" />
          </div>
          <div class="card-field">
            <label class="card-lbl">Perte %</label>
            <input class="cat-input cat-input--num" type="number" min="0" max="50" step="1" v-model.number="mat.default_waste_percentage" />
          </div>
          <div class="card-field">
            <label class="card-lbl">Départ g</label>
            <input class="cat-input cat-input--num" type="number" min="0" step="10" v-model.number="mat.poids_depart" placeholder="1000" />
          </div>
          <div class="card-field">
            <label class="card-lbl">Restant g</label>
            <input
              class="cat-input cat-input--num cat-input--restant"
              type="number" min="0" step="1"
              v-model.number="mat.poids_restant"
              :max="mat.poids_depart > 0 ? mat.poids_depart : null"
              :placeholder="mat.poids_depart || 1000"
            />
          </div>
        </div>

        <!-- Ligne 4 : Quantité bobines -->
        <div class="card-qty-row">
          <label class="card-lbl">Qté bobines</label>
          <div class="cat-qty-ctrl">
            <button class="cat-qty-btn" @click="mat.quantite = Math.max(0, (mat.quantite || 0) - 1)">−</button>
            <input class="cat-input cat-input--qty" type="number" min="0" step="1" v-model.number="mat.quantite" />
            <button class="cat-qty-btn" @click="mat.quantite = (mat.quantite || 0) + 1">+</button>
          </div>
        </div>

        <!-- Ligne 5 : Statut + Photo bobine -->
        <div class="card-bottom">
          <span class="cat-led" :class="ledClass(mat.stock_status)" />
          <select class="cat-select card-stock-sel" v-model="mat.stock_status">
            <option value="En Stock">En Stock</option>
            <option value="Stock Faible">Stock Faible</option>
            <option value="Rupture">Rupture</option>
            <option value="Réapprovisionnement">Réappro.</option>
          </select>
          <label class="cat-icn-btn card-photo-lbl" title="Photo bobine">
            <img v-if="mat.image_url" class="card-mini-thumb" :src="mat.image_url" :alt="mat.name" />
            <Upload v-else :size="14" />
            <input type="file" accept="image/*" style="display:none" @change="$emit('upload', mat, $event)" />
          </label>
          <button
            v-if="mat.image_url"
            class="cat-icn-btn cat-icn-btn--danger"
            @click="$emit('clear-image', mat)"
            title="Supprimer photo"
          >
            <Trash2 :size="13" />
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         PAGINATION
    ══════════════════════════════════════════════════════════ -->
    <div v-if="totalPages > 1" class="cat-pgn">
      <button class="cat-pgn-btn" :disabled="currentPage === 1" @click="$emit('update:current-page', currentPage - 1)">← Préc.</button>
      <span class="cat-pgn-info">Page {{ currentPage }} / {{ totalPages }}</span>
      <button class="cat-pgn-btn" :disabled="currentPage === totalPages" @click="$emit('update:current-page', currentPage + 1)">Suiv. →</button>
    </div>

  </div>
</template>

<script>
import { Save, Upload, Trash2, ImageIcon } from 'lucide-vue-next'

const TYPE_DEFAULTS = {
  'PLA':        { cost_per_kg: 20, default_waste_percentage: 10 },
  'PLA+':       { cost_per_kg: 22, default_waste_percentage: 10 },
  'PLA+ 2.0':   { cost_per_kg: 22, default_waste_percentage: 10 },
  'PLA HS':     { cost_per_kg: 24, default_waste_percentage: 10 },
  'PLA HS 2.0': { cost_per_kg: 24, default_waste_percentage: 10 },
  'PLA Galaxy': { cost_per_kg: 25, default_waste_percentage: 10 },
  'PLA Silk':   { cost_per_kg: 25, default_waste_percentage: 10 },
  'Matt':       { cost_per_kg: 20, default_waste_percentage: 10 },
  'PETG':       { cost_per_kg: 22, default_waste_percentage: 12 },
}

export default {
  name: 'CatalogueSection',
  components: { Save, Upload, Trash2, ImageIcon },

  props: {
    materials:        { type: Array,   required: true },
    materialsLoading: { type: Boolean, default: false },
    materialsSaving:  { type: Boolean, default: false },
    matUploading:     { type: Boolean, default: false },
    currentPage:      { type: Number,  default: 1 },
    perPage:          { type: Number,  default: 4 },
    knownBrands:      { type: Array,   default: () => ['Bambu Lab', 'Eryone', 'Sunlu'] },
  },

  emits: ['add-row', 'save', 'delete', 'upload', 'clear-image', 'update:current-page'],

  data() {
    return {
      typeOptions: [
        'PLA', 'PLA+', 'PLA+ 2.0', 'PLA HS', 'PLA HS 2.0',
        'PLA Galaxy', 'PLA Silk', 'Matt', 'PETG',
      ],
    }
  },

  computed: {
    paginated() {
      const start = (this.currentPage - 1) * this.perPage
      return this.materials.slice(start, start + this.perPage)
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.materials.length / this.perPage))
    },
  },

  methods: {
    isHex(val) {
      return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
    },
    swatchBg(mat) {
      return { background: this.isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab' }
    },
    hexLabel(mat) {
      return (this.isHex(mat.color_or_image) ? mat.color_or_image : '#2E9CAB').toUpperCase()
    },

    ledClass(status) {
      if (status === 'Stock Faible')        return 'cat-led--low'
      if (status === 'Rupture')             return 'cat-led--out'
      if (status === 'Réapprovisionnement') return 'cat-led--reorder'
      return 'cat-led--ok'
    },

    brandVal(mat) {
      return this.knownBrands.includes(mat.brand) ? mat.brand : 'Autre'
    },
    isCustomBrand(mat) {
      return !this.knownBrands.includes(mat.brand)
    },
    onBrand(mat, value) {
      if (value !== 'Autre') {
        mat.brand = value
        this.autoName(mat)
      }
    },

    onType(mat) {
      const d = TYPE_DEFAULTS[mat.type]
      if (d) {
        mat.cost_per_kg              = d.cost_per_kg
        mat.default_waste_percentage = d.default_waste_percentage
      }
      this.autoName(mat)
    },

    autoName(mat) {
      const gen = [mat.brand, mat.type].filter(Boolean).join(' ')
      if (!mat.name) mat.name = gen
    },
  },
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   WRAPPER
══════════════════════════════════════════════════════════════ */
.cat-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ══════════════════════════════════════════════════════════════
   EN-TÊTE
══════════════════════════════════════════════════════════════ */
.cat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0.9rem 1.1rem 0;
}
.cat-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}
.cat-badge {
  display: inline-flex; align-items: center;
  padding: 0.12rem 0.5rem; border-radius: 999px;
  font-size: 0.62rem; font-weight: 700;
  background: #f0f4f8; color: #718096;
}
.cat-badge--teal { background: #e6f9fb; color: #2e9cab; }

.cat-actions { display: flex; align-items: center; gap: 0.45rem; flex-shrink: 0; }
.cat-btn-add {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.85rem; border-radius: 999px;
  border: 1.5px solid #c4b5fd; background: #f5f0ff; color: #7c3aed;
  font-size: 0.78rem; font-weight: 700; font-family: inherit;
  cursor: pointer; white-space: nowrap; transition: all 0.18s ease;
}
.cat-btn-add:hover { background: #ede9fe; border-color: #a78bfa; }

.cat-btn-save {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  background: #7c3aed; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: filter 0.18s ease;
}
.cat-btn-save:hover:not(:disabled) { filter: brightness(1.1); }
.cat-btn-save:disabled { opacity: 0.55; cursor: default; }

/* ══════════════════════════════════════════════════════════════
   ÉLÉMENTS COMMUNS
══════════════════════════════════════════════════════════════ */

/* ── Inputs ── */
.cat-input {
  width: 100%; padding: 0.26rem 0.38rem;
  border: 1px solid #e2e8f0; border-radius: 7px;
  font-size: 0.72rem; font-family: inherit; color: #2d3748;
  background: #fff; min-width: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cat-input:focus { outline: none; border-color: #a78bfa; box-shadow: 0 0 0 2px rgba(124,58,237,0.12); }
.cat-input--num     { text-align: right; }
.cat-input--restant { color: #2e9cab; font-weight: 700; }
.cat-input--xs      { margin-top: 0.18rem; font-size: 0.67rem; }
.cat-input--qty     { width: 36px; text-align: center; padding: 0.2rem 0.12rem; font-size: 0.78rem; font-weight: 700; }

/* ── Selects ── */
.cat-select {
  width: 100%; padding: 0.26rem 0.32rem;
  border: 1px solid #e2e8f0; border-radius: 7px;
  font-size: 0.72rem; font-family: inherit; color: #2d3748;
  background: #fff; cursor: pointer;
}
.cat-select:focus { outline: none; border-color: #a78bfa; }
.cat-select--stock { flex: 1; min-width: 0; }

/* ── Couleur ── */
.cat-color-cell { display: flex; align-items: center; gap: 0.22rem; }
.cat-swatch {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; display: inline-block;
}
.cat-color-inp {
  -webkit-appearance: none; appearance: none;
  width: 20px; height: 20px; border: none; border-radius: 5px;
  padding: 0; cursor: pointer; flex-shrink: 0;
  background: transparent; box-shadow: 0 0 0 1.5px #e2e8f0;
}
.cat-color-inp::-webkit-color-swatch-wrapper { padding: 0; border-radius: 4px; }
.cat-color-inp::-webkit-color-swatch         { border: none; border-radius: 3px; }
.cat-hex-lbl {
  font-size: 0.58rem; font-family: monospace; font-weight: 700;
  color: #4a5568; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; min-width: 0;
}

/* ── Photo ── */
.cat-photo-cell { display: flex; align-items: center; gap: 0.18rem; }
.cat-thumb {
  width: 30px; height: 30px; border-radius: 50%; object-fit: cover;
  border: 2px solid #e2e8f0; flex-shrink: 0;
}
.cat-thumb-empty {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px dashed #d1d5db; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: #cbd5e0;
}
.cat-photo-btns { display: flex; flex-direction: column; gap: 0.12rem; }

/* ── Boutons icône ── */
.cat-icn-btn {
  width: 19px; height: 19px; border-radius: 5px;
  border: 1.5px solid #e2e8f0; background: #fff; color: #718096;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  padding: 0; font-family: inherit; flex-shrink: 0; transition: all 0.15s;
}
.cat-icn-btn:hover         { border-color: #9f7aea; color: #7c3aed; background: #f5f0ff; }
.cat-icn-btn--danger:hover { border-color: #fc8181; color: #e53e3e; background: #fff5f5; }
.cat-icn-btn--off          { opacity: 0.45; pointer-events: none; }

/* ── Stock LED — voyants lumineux ── */
.cat-led {
  width: 9px; height: 9px;
  border-radius: 50%; flex-shrink: 0; display: inline-block;
}
.cat-led--ok {
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34,197,94,0.2), 0 0 7px 2px rgba(34,197,94,0.5);
}
.cat-led--low {
  background: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.2), 0 0 7px 2px rgba(245,158,11,0.5);
  animation: cat-led-blink 1.4s ease-in-out infinite;
}
.cat-led--out {
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239,68,68,0.2), 0 0 7px 2px rgba(239,68,68,0.5);
}
.cat-led--reorder {
  background: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.2), 0 0 7px 2px rgba(59,130,246,0.5);
}
@keyframes cat-led-blink {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 2px rgba(245,158,11,0.2), 0 0 7px 2px rgba(245,158,11,0.5); }
  50%       { opacity: 0.55; box-shadow: 0 0 0 2px rgba(245,158,11,0.1), 0 0 3px rgba(245,158,11,0.25); }
}

.cat-stock-cell { display: flex; align-items: center; gap: 0.28rem; }

/* ── Poids + unité ── */
.cat-unit-wrap { display: flex; align-items: center; gap: 0.18rem; }
.cat-unit { font-size: 0.6rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }

/* ── Compteur Quantité ── */
.cat-qty-ctrl {
  display: flex; align-items: center; gap: 0.1rem;
}
.cat-qty-btn {
  width: 22px; height: 24px; border-radius: 5px;
  border: 1px solid #e2e8f0; background: #f8f9fc; color: #4a5568;
  font-size: 0.9rem; font-weight: 700; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  padding: 0; flex-shrink: 0; font-family: inherit;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.cat-qty-btn:hover { background: #7c3aed; border-color: #7c3aed; color: #fff; }

/* ── Bouton supprimer ── */
.cat-del-btn {
  width: 26px; height: 26px; border-radius: 7px;
  border: 1.5px solid #fed7d7; background: #fff5f5; color: #e53e3e;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; flex-shrink: 0; transition: all 0.15s;
}
.cat-del-btn:hover { background: #feb2b2; border-color: #fc8181; }

/* ── États vides ── */
.cat-empty { padding: 1.5rem; text-align: center; font-size: 0.8rem; color: #a0aec0; font-style: italic; }

/* ── Spinner ── */
.cat-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff;
  border-radius: 50%; animation: cat-spin 0.7s linear infinite; display: inline-block;
}
@keyframes cat-spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════════
   TABLEAU — Desktop & Tablette (visible par défaut ≥ 641 px)
══════════════════════════════════════════════════════════════ */
.cat-table-wrap {
  display: block; flex: 1; min-height: 0;
  overflow-x: auto; overflow-y: auto;
  -webkit-overflow-scrolling: touch; margin-top: 0.85rem;
}
.cat-table {
  width: 100%; border-collapse: collapse;
  font-size: 0.9rem; table-layout: auto;
}
.cat-th {
  padding: 0.32rem 0.48rem; text-align: left;
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #a0aec0;
  background: #fff; border-bottom: 1px solid #e2e8f0;
  white-space: nowrap; position: sticky; top: 0; z-index: 1;
}
.cat-td { padding: 0.28rem 0.44rem; vertical-align: middle; }
.cat-td--num { text-align: right; }
.cat-td--act { text-align: center; }
.cat-td--qty { text-align: center; }

/* Largeurs colonnes — Nom réduit pour laisser place à Qté */
.c-color   { width: 88px; }
.c-photo   { width: 62px; }
.c-name    { width: 140px; }
.c-brand   { width: 105px; }
.c-type    { width: 88px; }
.c-num     { width: 58px; text-align: right; }
.c-dep     { width: 70px; text-align: right; }
.c-restant { color: #2e9cab; }
.c-stock   { width: 118px; }
.c-qty     { width: 82px; text-align: center; }
.c-act     { width: 36px; }

.cat-row { border-bottom: 1px solid #f0f4f8; }
.cat-row:hover { background: #f8f7ff; }

/* ══════════════════════════════════════════════════════════════
   GRILLE TABLETTE — masquée par défaut
══════════════════════════════════════════════════════════════ */
.cat-tab-grid { display: none; }

/* ══════════════════════════════════════════════════════════════
   CARTES MOBILE — masquées par défaut
══════════════════════════════════════════════════════════════ */
.cat-cards { display: none; }

/* ══════════════════════════════════════════════════════════════
   MOBILE ≤ 640 px
══════════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .cat-table-wrap { display: none; }
  .cat-cards {
    display: flex; flex-direction: column; gap: 1rem;
    margin-top: 1rem; overflow-y: auto; flex: 1; min-height: 0;
    padding: 0 0.1rem 0.75rem;
  }

  .cat-header { flex-direction: column; align-items: stretch; gap: 0.65rem; padding: 0.9rem 1rem 0; }
  .cat-actions { width: 100%; display: flex; flex-direction: row; align-items: center; gap: 0.75rem; }
  .cat-btn-add { flex: 1; justify-content: center; font-size: 0.85rem; padding: 0.55rem 0.75rem; }
  .cat-btn-save { flex-shrink: 0; }

  .cat-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.65rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }

  .card-top { display: flex; align-items: center; gap: 0.38rem; }
  .card-swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.1); flex-shrink: 0; }
  .card-hex { font-size: 0.58rem; font-family: monospace; font-weight: 700; color: #718096; white-space: nowrap; flex-shrink: 0; }
  .card-name-inp { flex: 1; font-size: 0.82rem; font-weight: 600; padding: 0.32rem 0.42rem; }

  .card-grid { display: grid; gap: 0.48rem; }
  .card-grid--2 { grid-template-columns: 1fr 1fr; }
  .card-grid--4 { grid-template-columns: 1fr 1fr; }

  .card-field { display: flex; flex-direction: column; gap: 0.16rem; }
  .card-lbl { font-size: 0.54rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #a0aec0; }
  .card-field .cat-input, .card-field .cat-select { font-size: 0.82rem; padding: 0.42rem 0.48rem; }

  /* Ligne Quantité mobile */
  .card-qty-row {
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
  }
  .card-qty-row .card-lbl { font-size: 0.54rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #a0aec0; flex-shrink: 0; }
  .card-qty-row .cat-qty-ctrl { flex-shrink: 0; }
  .card-qty-row .cat-qty-btn { width: 32px; height: 32px; font-size: 1rem; }
  .card-qty-row .cat-input--qty { width: 44px; font-size: 0.9rem; }

  .card-bottom { display: flex; align-items: center; gap: 0.38rem; }
  .card-stock-sel { flex: 1; font-size: 0.8rem; padding: 0.4rem 0.42rem; }
  .card-photo-lbl { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; overflow: hidden; padding: 0; }
  .card-mini-thumb { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }

  .cat-del-btn { width: 30px; height: 30px; }
}

/* ══════════════════════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════════════════════ */
.cat-pgn {
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0 0.75rem 0.75rem; margin-top: 1.5rem; flex-shrink: 0;
}
.cat-pgn-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 40px; padding: 0.4rem 1rem; border-radius: 10px;
  border: 1.5px solid #e2e8f0; background: #fff; color: #4a5568;
  font-size: 0.78rem; font-weight: 600; font-family: inherit;
  cursor: pointer; white-space: nowrap; transition: all 0.15s;
}
.cat-pgn-btn:disabled             { opacity: 0.38; cursor: default; }
.cat-pgn-btn:not(:disabled):hover { border-color: #7c3aed; color: #7c3aed; background: #f5f0ff; }
.cat-pgn-info { font-size: 0.8rem; color: #4a5568; font-weight: 600; white-space: nowrap; min-width: 80px; text-align: center; }

/* ══════════════════════════════════════════════════════════════
   TABLETTE (641 px – 1024 px) — GRILLE 2 COLONNES
══════════════════════════════════════════════════════════════ */
@media (min-width: 641px) and (max-width: 1024px) {
  .cat-table-wrap { display: none; }
  .cat-tab-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 1rem; margin-top: 1rem; overflow-y: auto;
    flex: 1; min-height: 0; padding-bottom: 0.5rem;
  }

  .cat-header { flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: nowrap; padding: 1rem 1.25rem 0; gap: 1rem; }
  .cat-title { font-size: 1.05rem; }
  .cat-actions { flex-shrink: 0; }

  .cat-tcard {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: box-shadow 0.18s ease;
  }
  .cat-tcard:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.09); }

  .cat-tcard-head { display: flex; align-items: center; gap: 0.4rem; }
  .cat-tcard-hex { font-size: 0.58rem; font-family: monospace; font-weight: 700; color: #718096; white-space: nowrap; flex-shrink: 0; }
  .cat-tcard-name { flex: 1; font-size: 0.9rem; font-weight: 600; padding: 0.3rem 0.42rem; min-width: 0; }
  .cat-tcard-photo { display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0; }

  .cat-tcard-fields {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.65rem 0.85rem;
  }
  .cat-tcard-field { display: flex; flex-direction: column; gap: 0.18rem; }
  .cat-tcard-field--full { grid-column: 1 / -1; }

  .cat-tcard-lbl { font-size: 0.52rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #a0aec0; }
  .cat-tcard-fields .cat-input, .cat-tcard-fields .cat-select { font-size: 0.85rem; padding: 0.38rem 0.45rem; }
  .cat-tcard-fields .cat-stock-cell { gap: 0.35rem; }

  /* Compteur Qté sur tablette */
  .cat-tcard-field--full .cat-qty-ctrl { gap: 0.2rem; }
  .cat-tcard-field--full .cat-qty-btn  { width: 28px; height: 30px; font-size: 0.95rem; }
  .cat-tcard-field--full .cat-input--qty { width: 44px; font-size: 0.85rem; }
}
</style>
