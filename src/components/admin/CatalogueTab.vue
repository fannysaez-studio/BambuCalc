<template>
  <div class="panel-card">

    <CatalogueSection
      :materials="materials"
      :materials-loading="materialsLoading"
      :materials-saving="materialsSaving"
      :mat-uploading="matUploading"
      :current-page="matPage"
      :per-page="matPerPage"
      :known-brands="knownBrands"
      @add-row="addMaterialRow(); matPage = totalMatPages"
      @save="saveMaterials"
      @delete="(mat, idx) => deleteMaterial(mat, idx)"
      @upload="(mat, event) => onMatImageUpload(mat, event)"
      @clear-image="clearMatImage"
      @update:current-page="matPage = $event"
    />

    <ToastMessage ref="toast" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import CatalogueSection from '@/components/calculator/CatalogueSection.vue'
import ToastMessage     from '@/components/ui/ToastMessage.vue'

// ── Emit vers AdminDashboard : met à jour le badge de l'onglet dans la nav ──
const emit = defineEmits(['count-change'])

// ── Toast local ───────────────────────────────────────────────────────────────
const toast = ref(null)

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES (issues de data() dans AdminDashboard.vue)
// ══════════════════════════════════════════════════════════════════════════════

const materials        = ref([])
const materialsLoading = ref(false)
const materialsSaving  = ref(false)
const matUploading     = ref(false)
const matPage          = ref(1)

const matPerPage       = ref(4)

const knownBrands = ['Bambu Lab', 'Eryone', 'Sunlu']

const _TYPE_DEFAULTS = {
  'PLA':        { cost_per_kg: 20, default_waste_percentage: 10 },
  'Matt':       { cost_per_kg: 20, default_waste_percentage: 10 },
  'PLA+':       { cost_per_kg: 22, default_waste_percentage: 10 },
  'PLA+ 2.0':   { cost_per_kg: 22, default_waste_percentage: 10 },
  'PLA HS':     { cost_per_kg: 24, default_waste_percentage: 10 },
  'PLA HS 2.0': { cost_per_kg: 24, default_waste_percentage: 10 },
  'PLA Galaxy': { cost_per_kg: 25, default_waste_percentage: 10 },
  'PLA Silk':   { cost_per_kg: 25, default_waste_percentage: 10 },
  'PETG':       { cost_per_kg: 22, default_waste_percentage: 12 },
}

const fallbackMaterials = [
  { id: null, _local: true, name: 'Sunlu PLA',          brand: 'Sunlu',  type: 'PLA',        cost_per_kg: 20, default_waste_percentage: 10, color_or_image: '#3B82F6', image_url: null, stock_status: 'En Stock' },
  { id: null, _local: true, name: 'Eryone PLA+',        brand: 'Eryone', type: 'PLA+',       cost_per_kg: 22, default_waste_percentage: 10, color_or_image: '#EF4444', image_url: null, stock_status: 'En Stock' },
  { id: null, _local: true, name: 'Eryone PLA HS 2.0',  brand: 'Eryone', type: 'PLA HS 2.0', cost_per_kg: 24, default_waste_percentage: 10, color_or_image: '#22C55E', image_url: null, stock_status: 'En Stock' },
  { id: null, _local: true, name: 'Eryone PLA Silk',    brand: 'Eryone', type: 'PLA Silk',   cost_per_kg: 25, default_waste_percentage: 10, color_or_image: '#F59E0B', image_url: null, stock_status: 'En Stock' },
  { id: null, _local: true, name: 'Eryone PLA Galaxy',  brand: 'Eryone', type: 'PLA Galaxy', cost_per_kg: 25, default_waste_percentage: 10, color_or_image: '#8B5CF6', image_url: null, stock_status: 'En Stock' },
  { id: null, _local: true, name: 'Sunlu PETG',         brand: 'Sunlu',  type: 'PETG',       cost_per_kg: 22, default_waste_percentage: 12, color_or_image: '#6B7280', image_url: null, stock_status: 'En Stock' },
]

// ══════════════════════════════════════════════════════════════════════════════
// COMPUTED
// ══════════════════════════════════════════════════════════════════════════════

const totalMatPages = computed(() =>
  Math.max(1, Math.ceil(materials.value.length / matPerPage.value))
)

// ══════════════════════════════════════════════════════════════════════════════
// UTILITAIRES (copiés depuis AdminDashboard.vue)
// ══════════════════════════════════════════════════════════════════════════════

function isHexColor(val) {
  return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
}

// ══════════════════════════════════════════════════════════════════════════════
// MÉTHODES (déplacées depuis AdminDashboard.vue methods{})
// ══════════════════════════════════════════════════════════════════════════════

async function loadMaterials() {
  materialsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('bambu_materials')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[loadMaterials] Supabase error —', error.code, ':', error.message, error.hint || '')
      if (!materials.value.length) materials.value = fallbackMaterials.map(m => ({ ...m }))
      return
    }

    if (!data || data.length === 0) {
      const defaults = fallbackMaterials.map(({ id, _local, ...m }) => m)
      const { error: seedErr } = await supabase.from('bambu_materials').insert(defaults)
      if (seedErr) {
        console.error('[loadMaterials] seed failed —', seedErr.code, ':', seedErr.message)
        materials.value = fallbackMaterials.map(m => ({ ...m }))
        return
      }
      const { data: seeded, error: reloadErr } = await supabase
        .from('bambu_materials').select('*').order('created_at', { ascending: true })
      if (reloadErr || !seeded?.length) {
        materials.value = fallbackMaterials.map(m => ({ ...m }))
        return
      }
      materials.value = seeded
      return
    }

    materials.value = data
  } finally {
    materialsLoading.value = false
    emit('count-change', materials.value.length)
  }
}

async function saveMaterials() {
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session
  if (!session) {
    toast.value?.show('Session expirée. Rechargez la page et reconnectez-vous.', 'error', 5000)
    return
  }

  materialsSaving.value = true
  try {
    const now = new Date().toISOString()
    const matPayload = (m, withId) => ({
      ...(withId ? { id: m.id } : {}),
      name:                     m.name || '',
      brand:                    m.brand || '',
      type:                     m.type || 'PLA',
      cost_per_kg:              parseFloat(m.cost_per_kg) || 0,
      default_waste_percentage: parseFloat(m.default_waste_percentage) || 5,
      color_or_image:           isHexColor(m.color_or_image) ? m.color_or_image : '#2e9cab',
      image_url:                m.image_url || null,
      stock_status:             m.stock_status || 'En Stock',
      poids_depart:             parseInt(m.poids_depart) || 1000,
      poids_restant:            m.poids_restant !== null && m.poids_restant !== undefined
                                  ? parseInt(m.poids_restant)
                                  : parseInt(m.poids_depart) || 1000,
      quantite:                 parseInt(m.quantite) || 1,
      updated_at:               now,
    })

    const toUpsert = materials.value.filter(m => m.id && !m._new).map(m => matPayload(m, true))
    const toInsert = materials.value.filter(m => !m.id || m._new).map(m => matPayload(m, false))

    if (toUpsert.length) {
      const { error } = await supabase.from('bambu_materials').upsert(toUpsert, { onConflict: 'id' })
      if (error) throw error
    }
    if (toInsert.length) {
      const { data: inserted, error } = await supabase.from('bambu_materials').insert(toInsert).select()
      if (error) throw error
      if (inserted?.length) {
        let i = 0
        materials.value.forEach(m => {
          if ((!m.id || m._new) && inserted[i]) {
            m.id   = inserted[i].id
            m._new = false
            i++
          }
        })
      }
    }

    toast.value?.show('Catalogue matières sauvegardé.', 'success', 2500)
    emit('count-change', materials.value.length)
  } catch (err) {
    toast.value?.show(`Erreur : ${err.message}`, 'error')
  } finally {
    materialsSaving.value = false
  }
}

function addMaterialRow() {
  materials.value.push({
    id: null, _new: true,
    name: '', brand: 'Eryone', type: 'PLA',
    cost_per_kg: 20, default_waste_percentage: 10,
    color_or_image: '#2e9cab', image_url: null,
    stock_status: 'En Stock',
    poids_depart: 1000, poids_restant: null,
    quantite: 1,
  })
}

async function deleteMaterial(mat, idx) {
  materials.value.splice(idx, 1)
  if (matPage.value > totalMatPages.value) matPage.value = totalMatPages.value

  if (mat.id && !mat._new) {
    const { error } = await supabase.from('bambu_materials').delete().eq('id', mat.id)
    if (error) {
      materials.value.splice(idx, 0, mat)
      toast.value?.show(`Erreur suppression : ${error.message}`, 'error')
    }
  }
  emit('count-change', materials.value.length)
}

async function onMatImageUpload(mat, event) {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = ''

  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session
  if (!session) {
    toast.value?.show('Session expirée. Rechargez la page et reconnectez-vous.', 'error', 5000)
    return
  }

  matUploading.value = true
  try {
    if (!mat.id || mat._new) {
      const { data: inserted, error: insertErr } = await supabase
        .from('bambu_materials')
        .insert({
          name:                     mat.name  || 'Nouveau filament',
          brand:                    mat.brand || '',
          type:                     mat.type  || 'PLA',
          cost_per_kg:              parseFloat(mat.cost_per_kg)              || 20,
          default_waste_percentage: parseFloat(mat.default_waste_percentage) || 10,
          color_or_image:           isHexColor(mat.color_or_image) ? mat.color_or_image : '#2e9cab',
          image_url:                null,
          stock_status:             mat.stock_status || 'En Stock',
          updated_at:               new Date().toISOString(),
        })
        .select()
        .single()
      if (insertErr) {
        toast.value?.show(`Erreur auto-sauvegarde avant upload : ${insertErr.message}`, 'error', 5000)
        return
      }
      mat.id   = inserted.id
      mat._new = false
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60)
    const fileName = `${Date.now()}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('filaments')
      .upload(fileName, file, { upsert: true, contentType: file.type || 'image/webp' })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('filaments').getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    const { error: dbErr } = await supabase
      .from('bambu_materials')
      .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', mat.id)
    if (dbErr) {
      console.error('[onMatImageUpload] Erreur DB update :', dbErr.message)
      toast.value?.show(`Photo uploadée mais sauvegarde DB échouée : ${dbErr.message}`, 'error', 6000)
      mat.image_url = publicUrl
      return
    }

    mat.image_url = publicUrl
    toast.value?.show('Photo uploadée et sauvegardée.', 'success', 2500)
  } catch (err) {
    const status = err?.statusCode ?? err?.status ?? 0
    console.error('[onMatImageUpload] Erreur Storage :', status, err?.message, err)
    if (status === 403 || status === 401) {
      toast.value?.show(
        `Accès refusé (${status}). Relancez le script SQL des politiques Storage dans Supabase.`,
        'error', 7000
      )
    } else {
      toast.value?.show(`Erreur upload : ${err.message}`, 'error', 5000)
    }
  } finally {
    matUploading.value = false
  }
}

async function clearMatImage(mat) {
  mat.image_url = null
  if (mat.id && !mat._new) {
    const { error } = await supabase
      .from('bambu_materials')
      .update({ image_url: null, updated_at: new Date().toISOString() })
      .eq('id', mat.id)
    if (error) console.error('[clearMatImage]', error.message)
  }
  toast.value?.show('Photo supprimée.', 'success', 1800)
}

// ── Cycle de vie ──────────────────────────────────────────────────────────────
onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
/*
 * Ce composant n'a pas de CSS propre : tout le rendu visuel est délégué
 * à <CatalogueSection> qui possède son propre <style scoped>.
 * Le .panel-card est défini dans AdminDashboard.vue (classe partagée).
 */
</style>
