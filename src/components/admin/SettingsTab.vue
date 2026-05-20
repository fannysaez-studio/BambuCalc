<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">Paramètres de calcul</h2>
      <span v-if="settingsLoading" class="settings-loading-badge">Chargement…</span>
    </div>

    <div class="settings-single-col">
      <div class="settings-main-card">
        <div class="settings-card-body">
          <!-- Grille 2 colonnes : Machine | Marge -->
          <div class="settings-params-grid">
            <div class="settings-section">
              <p class="settings-section-title">Machine & Main d'œuvre</p>
              <div class="settings-row">
                <label class="settings-label">Tarif horaire</label>
                <div class="settings-input-wrap">
                  <input
                    class="settings-input"
                    type="number"
                    min="0"
                    step="0.5"
                    v-model.number="priceHourlyRate"
                  />
                  <span class="settings-unit">€/h</span>
                </div>
              </div>
              <div class="settings-row">
                <label class="settings-label">Électricité</label>
                <div class="settings-input-wrap">
                  <input
                    class="settings-input"
                    type="number"
                    min="0"
                    step="0.01"
                    v-model.number="priceElecPerHour"
                  />
                  <span class="settings-unit">€/h</span>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <p class="settings-section-title">Marge & Tarification</p>
              <div class="settings-row">
                <label class="settings-label">Marge standard</label>
                <div class="settings-input-wrap">
                  <input
                    class="settings-input"
                    type="number"
                    min="0"
                    max="300"
                    step="5"
                    v-model.number="priceMarginDefault"
                  />
                  <span class="settings-unit">%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Catalogue info -->
          <div class="settings-section settings-section--wide">
            <p class="settings-section-title">Informations catalogue</p>
            <div class="settings-row">
              <span class="settings-label">Filaments enregistrés</span>
              <span class="settings-catalogue-count">
                {{ materials.length }} filament{{ materials.length > 1 ? 's' : '' }}
              </span>
            </div>
            <p class="settings-intro-inline" style="padding: 0 0.75rem 0.4rem">
              Gérez vos matières depuis l'onglet
              <button class="settings-link-tab" @click="emit('go-to', 'catalogue')">
                Catalogue →
              </button>
            </p>
          </div>

          <!-- Simulateur de coût rapide -->
          <div class="settings-sim-section">
            <div class="settings-sim-hdr">
              <BarChart2 class="settings-sim-hdr-icon" />
              <span class="settings-sim-hdr-title">Simulateur de coût rapide</span>
            </div>

            <div class="settings-sim-inputs">
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Poids de la pièce</label>
                <div class="settings-sim-iw">
                  <input
                    class="settings-sim-input"
                    type="number"
                    min="0"
                    step="1"
                    v-model.number="simWeight"
                  />
                  <span class="settings-sim-unit">g</span>
                </div>
              </div>
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Durée d'impression</label>
                <div class="settings-sim-duration">
                  <div class="settings-sim-iw">
                    <input
                      class="settings-sim-input settings-sim-input--sm"
                      type="number"
                      min="0"
                      max="99"
                      step="1"
                      v-model.number="simPrintHours"
                    />
                    <span class="settings-sim-unit">h</span>
                  </div>
                  <div class="settings-sim-iw">
                    <input
                      class="settings-sim-input settings-sim-input--sm"
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      v-model.number="simPrintMinutes"
                    />
                    <span class="settings-sim-unit">min</span>
                  </div>
                </div>
              </div>
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Matière</label>
                <div class="sim-mat-select-wrap">
                  <img
                    v-if="simSelectedMaterial && isImageUrl(simSelectedMaterial.color_or_image)"
                    class="sim-mat-indicator sim-mat-indicator--img"
                    :src="simSelectedMaterial.color_or_image"
                    :alt="simSelectedMaterial.name"
                  />
                  <span
                    v-else-if="simSelectedMaterial"
                    class="sim-mat-indicator sim-mat-indicator--swatch"
                    :style="{
                      background: isHexColor(simSelectedMaterial.color_or_image)
                        ? simSelectedMaterial.color_or_image
                        : '#2e9cab',
                    }"
                  >
                  </span>
                  <select class="sim-select" v-model="simMaterialId">
                    <option :value="null">— Globaux —</option>
                    <option v-for="m in materials" :key="m.id || m.name" :value="m.id">
                      {{ m.name }}{{ m.brand ? ' · ' + m.brand : '' }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Type de projet</label>
                <select class="sim-select" v-model="simProjectType">
                  <option v-for="pt in projectTypes" :key="pt.id" :value="pt.id">
                    {{ pt.label }}
                  </option>
                </select>
                <div
                  v-if="simProjectCoeff !== 1"
                  class="sim-coeff-badge"
                  style="margin-top: 0.35rem"
                >
                  <span class="sim-coeff-text">Coeff :</span>
                  <strong class="sim-coeff-value">
                    {{ simProjectCoeff > 1 ? '+' : ''
                    }}{{ Math.round((simProjectCoeff - 1) * 100) }}%
                  </strong>
                </div>
              </div>
            </div>

            <div class="settings-sim-results">
              <div class="settings-sim-result">
                <span class="settings-sim-result-lbl"
                  >Matière{{ simSelectedMaterial ? ' · ' + simSelectedMaterial.name : '' }}</span
                >
                <strong class="settings-sim-result-val">{{ fmtEur(simMaterialCost) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result">
                <span class="settings-sim-result-lbl">Machine + élec.</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simMachineCost) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result settings-sim-result--neutral">
                <span class="settings-sim-result-lbl">Coût de revient</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simTotalCost) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result settings-sim-result--margin">
                <span class="settings-sim-result-lbl">Marge ({{ priceMarginDefault }}%)</span>
                <strong class="settings-sim-result-val">+ {{ fmtEur(simMarginAmount) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result settings-sim-result--total">
                <span class="settings-sim-result-lbl">Prix de vente estimé</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simSalePrice) }}</strong>
              </div>
            </div>
            <p class="sim-disclaimer">*Indicatif — hors emballage, post-traitement et remises.</p>
          </div>
        </div>
        <!-- /settings-card-body -->

        <div class="settings-single-footer">
          <button
            class="btn-save-settings"
            @click="saveSettings"
            :disabled="settingsSaving || settingsLoading"
            :title="settingsSaved ? 'Sauvegardé !' : 'Sauvegarder les paramètres'"
            aria-label="Sauvegarder les paramètres"
          >
            <Check v-if="settingsSaved" class="btn-icon" />
            <Loader2 v-else-if="settingsSaving" class="btn-icon btn-icon--spin" />
            <Save v-else class="btn-icon" />
          </button>
          <button
            class="btn-settings-next"
            @click="emit('go-to', 'catalogue')"
            title="Accéder au catalogue"
            aria-label="Accéder au catalogue"
          >
            <BookOpen class="btn-icon" />
            <ChevronRight class="btn-icon btn-icon--chevron" />
          </button>
        </div>
      </div>
    </div>

    <ToastMessage ref="toast" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import ToastMessage from '@/components/ToastMessage.vue'
import { BarChart2, Save, Check, Loader2, BookOpen, ChevronRight } from 'lucide-vue-next'

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits(['go-to'])

// ── Toast local ───────────────────────────────────────────────────────────────
const toast = ref(null)

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES (issues de data() dans AdminDashboard.vue)
// ══════════════════════════════════════════════════════════════════════════════

// ── Prix & paramètres de calcul ───────────────────────────────────────────────
const pricePlaPerKg = ref(16.99)
const priceHourlyRate = ref(20)
const priceElecPerHour = ref(0.5)
const priceLossPercent = ref(5)
const priceMarginDefault = ref(50)

// ── État sauvegarde ───────────────────────────────────────────────────────────
const settingsSaved = ref(false)
const settingsSaving = ref(false)
const settingsLoading = ref(false)

// ── Catalogue matières (chargé localement pour le simulateur) ────────────────
const materials = ref([])

const fallbackMaterials = [
  {
    id: null,
    name: 'Sunlu PLA',
    brand: 'Sunlu',
    type: 'PLA',
    cost_per_kg: 20,
    default_waste_percentage: 10,
    color_or_image: '#3B82F6',
  },
  {
    id: null,
    name: 'Eryone PLA+',
    brand: 'Eryone',
    type: 'PLA+',
    cost_per_kg: 22,
    default_waste_percentage: 10,
    color_or_image: '#EF4444',
  },
  {
    id: null,
    name: 'Eryone PLA HS 2.0',
    brand: 'Eryone',
    type: 'PLA HS 2.0',
    cost_per_kg: 24,
    default_waste_percentage: 10,
    color_or_image: '#22C55E',
  },
  {
    id: null,
    name: 'Eryone PLA Silk',
    brand: 'Eryone',
    type: 'PLA Silk',
    cost_per_kg: 25,
    default_waste_percentage: 10,
    color_or_image: '#F59E0B',
  },
  {
    id: null,
    name: 'Sunlu PETG',
    brand: 'Sunlu',
    type: 'PETG',
    cost_per_kg: 22,
    default_waste_percentage: 12,
    color_or_image: '#6B7280',
  },
]

// ── Simulateur ────────────────────────────────────────────────────────────────
const simWeight = ref(50)
const simPrintHours = ref(1)
const simPrintMinutes = ref(30)
const simMaterialId = ref(null)
const simProjectType = ref('standard')

// ══════════════════════════════════════════════════════════════════════════════
// COMPUTED (issus de computed{} dans AdminDashboard.vue)
// ══════════════════════════════════════════════════════════════════════════════

const projectTypes = [
  { id: 'standard', label: 'Standard (×1.0)', coeff: 1.0 },
  { id: 'figurine', label: 'Figurine (+30%)', coeff: 1.3 },
  { id: 'serie', label: 'Série porte-clés (−15%)', coeff: 0.85 },
  { id: 'technique', label: 'Pièce technique (+20%)', coeff: 1.2 },
  { id: 'standqr', label: 'Stand QR Code (+10%)', coeff: 1.1 },
  { id: 'deco', label: 'Décoration (×1.0)', coeff: 1.0 },
]

const simPrintDuration = computed(
  () => (simPrintHours.value || 0) + (simPrintMinutes.value || 0) / 60,
)

const simSelectedMaterial = computed(() => {
  if (!simMaterialId.value) return null
  return materials.value.find((m) => m.id === simMaterialId.value) || null
})

const simEffectivePricePerKg = computed(() =>
  simSelectedMaterial.value ? simSelectedMaterial.value.cost_per_kg || 0 : pricePlaPerKg.value || 0,
)

const simEffectiveLossPercent = computed(() =>
  simSelectedMaterial.value
    ? simSelectedMaterial.value.default_waste_percentage || 0
    : priceLossPercent.value || 0,
)

const simProjectCoeff = computed(() => {
  const pt = projectTypes.find((p) => p.id === simProjectType.value)
  return pt ? pt.coeff : 1
})

const simMaterialCost = computed(() => {
  const w = (simWeight.value || 0) / 1000
  return w * simEffectivePricePerKg.value * (1 + simEffectiveLossPercent.value / 100)
})

const simMachineCost = computed(
  () => simPrintDuration.value * ((priceHourlyRate.value || 0) + (priceElecPerHour.value || 0)),
)

const simTotalCost = computed(() => simMaterialCost.value + simMachineCost.value)

const simSalePrice = computed(
  () => simTotalCost.value * simProjectCoeff.value * (1 + (priceMarginDefault.value || 0) / 100),
)

const simMarginAmount = computed(() => simSalePrice.value - simTotalCost.value)

// ══════════════════════════════════════════════════════════════════════════════
// UTILITAIRES (copiés depuis AdminDashboard.vue — aussi présents dans CatalogueTab)
// ══════════════════════════════════════════════════════════════════════════════

function fmtEur(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

function isHexColor(val) {
  return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
}

function isImageUrl(val) {
  if (typeof val !== 'string' || !val.trim()) return false
  return (
    val.startsWith('http://') ||
    val.startsWith('https://') ||
    val.startsWith('data:image/') ||
    /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(val)
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MÉTHODES (déplacées depuis AdminDashboard.vue methods{})
// ══════════════════════════════════════════════════════════════════════════════

async function loadGlobalSettings() {
  settingsLoading.value = true
  try {
    const { data, error } = await supabase.from('bambu_settings').select('*').single()
    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('[loadGlobalSettings]', error.code, error.message)
      }
      return
    }
    if (!data) return
    pricePlaPerKg.value = parseFloat(data.price_pla_per_kg) || 16.99
    priceHourlyRate.value = parseFloat(data.price_hourly_rate) || 20
    priceElecPerHour.value = parseFloat(data.price_elec_per_hour) || 0.5
    priceLossPercent.value = parseFloat(data.price_loss_percent) || 5
    priceMarginDefault.value = parseFloat(data.price_margin_default) || 50
  } finally {
    settingsLoading.value = false
  }
}

async function saveSettings() {
  settingsSaving.value = true
  try {
    const { error } = await supabase.from('bambu_settings').upsert(
      {
        id: 1,
        price_pla_per_kg: pricePlaPerKg.value,
        price_hourly_rate: priceHourlyRate.value,
        price_elec_per_hour: priceElecPerHour.value,
        price_loss_percent: priceLossPercent.value,
        price_margin_default: priceMarginDefault.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    if (error) throw error
    settingsSaved.value = true
    setTimeout(() => {
      settingsSaved.value = false
    }, 2500)
    toast.value?.show('Paramètres de prix sauvegardés dans Supabase.', 'success', 2500)
  } catch (err) {
    console.error('[saveSettings]', err)
    toast.value?.show(`Erreur sauvegarde : ${err.message}`, 'error')
  } finally {
    settingsSaving.value = false
  }
}

async function loadMaterials() {
  try {
    const { data, error } = await supabase
      .from('bambu_materials')
      .select(
        'id, name, brand, type, cost_per_kg, default_waste_percentage, color_or_image, image_url',
      )
      .order('created_at', { ascending: true })
    if (error || !data?.length) {
      if (!materials.value.length) materials.value = fallbackMaterials.map((m) => ({ ...m }))
      return
    }
    materials.value = data
  } catch {
    if (!materials.value.length) materials.value = fallbackMaterials.map((m) => ({ ...m }))
  }
}

// ── Cycle de vie ──────────────────────────────────────────────────────────────
onMounted(() => {
  loadGlobalSettings()
  loadMaterials()
})
</script>

<style scoped>
/* ── Panel card (racine) ── */
.panel-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  gap: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Badge chargement ── */
.settings-loading-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
}

/* ── Container colonne unique ── */
.settings-single-col {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow-y: auto;
  flex: 1;
}

/* ── Éléments de formulaire (sections, rangées, inputs) ── */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.settings-section-title {
  font-size: 0.62rem;
  font-weight: 800;
  color: #7c3aed;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
}
.settings-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1b2f39;
  flex: 1;
  min-width: 0;
}
.settings-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}
.settings-input {
  width: 72px;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: inherit;
  color: #1b2f39;
  background: #fff;
  outline: none;
  text-align: right;
  transition: border-color 0.2s;
}
.settings-input:focus {
  border-color: #7c3aed;
}
.settings-unit {
  font-size: 0.7rem;
  font-weight: 700;
  color: #a0aec0;
  white-space: nowrap;
}

/* ── Widget info catalogue ── */
.settings-catalogue-count {
  font-size: 0.82rem;
  font-weight: 800;
  color: #7c3aed;
}
.settings-link-tab {
  border: none;
  background: none;
  color: #2e9cab;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}
.settings-link-tab:hover {
  color: #1f7f97;
}
.settings-intro-inline {
  font-size: 0.73rem;
  color: #a0aec0;
  margin: 0;
}

/* ── Simulateur intégré ── */
.settings-sim-section {
  flex-shrink: 0;
  border-top: 1px solid #f0f4f8;
  padding: 1.1rem 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  background: #fafbfd;
}
.settings-sim-hdr {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.settings-sim-hdr-icon {
  width: 1rem;
  height: 1rem;
  color: #7c3aed;
  flex-shrink: 0;
}
.settings-sim-hdr-title {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #7c3aed;
}
.settings-sim-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 1rem;
}
.settings-sim-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.settings-sim-lbl {
  font-size: 0.67rem;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.settings-sim-iw {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.3rem 0.6rem;
}
.settings-sim-input {
  width: 66px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2d3748;
  font-family: inherit;
}
.settings-sim-input--sm {
  width: 40px;
}
.settings-sim-unit {
  font-size: 0.7rem;
  color: #a0aec0;
  font-weight: 600;
}
.settings-sim-duration {
  display: flex;
  gap: 0.4rem;
}

/* ── Bande de résultats ── */
.settings-sim-results {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 12px;
  overflow: hidden;
}
.settings-sim-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.4rem;
  gap: 0.18rem;
  text-align: center;
  min-width: 0;
}
.settings-sim-result-lbl {
  font-size: 0.61rem;
  color: #a0aec0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.settings-sim-result-val {
  font-size: 0.82rem;
  font-weight: 800;
  color: #2d3748;
}
.settings-sim-result-sep {
  width: 1px;
  background: #f0f4f8;
  flex-shrink: 0;
  align-self: stretch;
}
.settings-sim-result--neutral .settings-sim-result-val {
  color: #4a5568;
}
.settings-sim-result--margin .settings-sim-result-val {
  color: #059669;
}
.settings-sim-result--total {
  background: #f7f0ff;
}
.settings-sim-result--total .settings-sim-result-val {
  color: #7c3aed;
  font-size: 0.92rem;
}
.settings-sim-result--total .settings-sim-result-lbl {
  color: #9f7aea;
  font-weight: 700;
}

/* ── Sélecteur matière avec indicateur couleur ── */
.sim-mat-select-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.sim-mat-indicator {
  flex-shrink: 0;
}
.sim-mat-indicator--swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.sim-mat-indicator--img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}
.sim-select {
  flex: 1;
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 7px;
  padding: 0.28rem 1.6rem 0.28rem 0.5rem;
  font-size: 0.74rem;
  font-family: inherit;
  color: #1b2f39;
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a0aec0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}
.sim-select:focus {
  border-color: #7c3aed;
}

/* ── Badge coefficient ── */
.sim-coeff-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  background: #f0e6ff;
  border: 1px solid #d6bcfa;
  font-size: 0.7rem;
  align-self: flex-start;
}
.sim-coeff-text {
  color: #718096;
}
.sim-coeff-value {
  color: #7c3aed;
  font-size: 0.76rem;
}

/* ── Disclaimer ── */
.sim-disclaimer {
  font-size: 0.62rem;
  color: #a0aec0;
  margin: 0;
  text-align: center;
  font-style: italic;
}

/* ── Footer avec boutons ── */
.settings-single-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  border-top: 1px solid #f0f4f8;
  padding-top: 0.85rem;
  margin-top: auto;
}
.btn-save-settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Carré compact : icon-only */
  padding: 0.55rem;
  min-width: 2.2rem;
  min-height: 2.2rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
  transition: filter 0.2s ease;
}
.btn-save-settings:hover:not(:disabled) {
  filter: brightness(1.07);
}
.btn-save-settings:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.btn-settings-next {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  /* Pill compact : icône + chevron */
  padding: 0.55rem 0.85rem;
  border: 1.5px solid #d6bcfa;
  border-radius: 999px;
  background: #f7f0ff;
  color: #7c3aed;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
  margin-left: auto;
}
.btn-settings-next:hover {
  background: #ede9fe;
  border-color: #9f7aea;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.18);
}

/* ── Icônes dans les boutons ── */
.btn-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}
.btn-icon--chevron {
  width: 0.85rem;
  height: 0.85rem;
  margin-left: -0.1rem;
  opacity: 0.7;
}
@keyframes btn-spin {
  to { transform: rotate(360deg); }
}
.btn-icon--spin {
  animation: btn-spin 0.9s linear infinite;
}

/* ══ Desktop ≥ 1025px : grande carte pleine hauteur ══ */
@media (min-width: 1025px) {
  .settings-single-col {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 0;
    overflow: hidden;
  }
  .settings-main-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid #e8edf3;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }
  .settings-card-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .settings-params-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 1.25rem 1.25rem 0;
    overflow: hidden;
  }
  .settings-params-grid .settings-section {
    background: #f7f9fc;
    border: 1px solid #f0f4f8;
    border-radius: 14px;
    padding: 1.25rem;
    gap: 0.65rem;
    overflow-y: auto;
  }
  .settings-params-grid .settings-section-title {
    font-size: 0.65rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid #f0e6ff;
    margin-bottom: 0.1rem;
  }
  .settings-params-grid .settings-row {
    background: #fff;
    border-color: #e8edf3;
    border-radius: 10px;
  }
  .settings-section--wide {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    padding: 0.85rem 1.25rem;
    border-top: 1px solid #f0f4f8;
    background: #fafbfd;
    border-radius: 0;
    flex-shrink: 0;
  }
  .settings-section--wide .settings-section-title {
    padding-bottom: 0;
    border-bottom: none;
    margin-bottom: 0;
  }
  .settings-section--wide .settings-row {
    flex: 1;
    min-width: 200px;
    background: transparent;
    border: none;
    padding: 0;
  }
  .settings-section--wide .settings-intro-inline {
    flex-shrink: 0;
    padding: 0 !important;
  }
  .settings-sim-section {
    padding: 1.1rem 1.5rem 1rem;
  }
  .settings-sim-inputs {
    grid-template-columns: repeat(4, 1fr);
  }
  .settings-single-footer {
    gap: 1.5rem;
    margin-top: 0;
    padding: 1.25rem 1.25rem 1rem;
    border-top: 1px solid #f0e6ff;
    flex-shrink: 0;
  }
  .btn-save-settings {
    /* Icon-only : padding carré légèrement plus grand sur desktop */
    padding: 0.65rem;
    min-width: 2.5rem;
    min-height: 2.5rem;
  }
  .btn-settings-next {
    margin-left: 0;
    padding: 0.65rem 1.1rem;
    gap: 0.25rem;
  }
  .btn-icon {
    width: 1.15rem;
    height: 1.15rem;
  }
  .btn-icon--chevron {
    width: 0.95rem;
    height: 0.95rem;
  }
}

/* ══ Tablette 641–1024px ══ */
@media (min-width: 641px) and (max-width: 1024px) {
  .settings-single-col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1.25rem;
  }
}

/* ══ Mobile ≤ 640px ══ */
@media (max-width: 640px) {
  .settings-single-col {
    padding: 0.85rem;
    gap: 1rem;
  }
  .settings-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .settings-input-wrap {
    align-self: flex-start;
  }
  .settings-input {
    width: 110px;
    text-align: right;
  }
  .settings-single-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
  }
  .btn-settings-next {
    margin-left: 0;
    justify-content: center;
  }
  .settings-sim-inputs {
    grid-template-columns: 1fr;
  }
  .settings-sim-results {
    flex-direction: column;
  }
  .settings-sim-result-sep {
    width: auto;
    height: 1px;
  }
}

/* ══ Tablette étroite ≤ 540px ══ */
@media (max-width: 540px) {
  .settings-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .settings-input-wrap {
    width: 100%;
  }
  .settings-input {
    width: 100%;
    text-align: left;
  }
}
</style>
