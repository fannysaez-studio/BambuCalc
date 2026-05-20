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

    <!-- Options impression (admin uniquement) -->
    <template v-if="isAdmin">
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

      <!-- Purge manuelle (si multicolore) -->
      <div v-if="colorCount > 1" :class="formStyles.formGroup">
        <label :class="formStyles.label" for="purgeWaste">Purge AMS (ajuster si besoin)</label>
        <div class="input-unit-wrap">
          <input id="purgeWaste" :class="formStyles.input" type="number"
            :value="purgeWaste" @input="$emit('update:purgeWaste', parseFloat($event.target.value) || 0)"
            step="5" min="0" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Valeur auto (AMS ×1.25) : {{ Math.round(weight * 0.25) }} g — modifiable selon le modèle</p>
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
    </template><!-- /isAdmin -->

  </div>
</template>

<script>
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'PrintingTime',
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
  emits: [
    'update:printHours', 'update:printMinutes', 'update:prepTime', 'update:postTime',
    'update:hourlyRate', 'update:weight', 'update:purgeWaste',
  ],
  data() {
    return {
      formStyles,
      showAdvanced: false,
    }
  },
}
</script>

<style scoped>
.toggle-link {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.2s ease;
}
.toggle-link:hover { color: #2e9cab; }
.advanced-hint { font-weight: 400; font-size: 0.74rem; }

.advanced-block {
  margin-top: 0.6rem;
  padding: 0.85rem 1rem;
  background: #f7f9fc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }

.block-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}
.hint { font-size: 0.68rem; font-weight: 400; color: #a0aec0; text-transform: none; letter-spacing: 0; }

.sep { height: 1px; background: #e2e8f0; margin: 0.65rem 0; }

.input-unit-wrap { display: flex; align-items: center; gap: 0.5rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.82rem; font-weight: 700; color: #4a5568; white-space: nowrap; }

.rate-row { margin-top: 0.75rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.rate-row label { margin-bottom: 0; white-space: nowrap; }

.ams-badge {
  display: flex; align-items: flex-start; gap: 0.65rem;
  background: #f0fbfc; border: 1.5px solid #b2e8ef; border-radius: 12px;
  padding: 0.7rem 1rem; margin-bottom: 0.75rem;
}
.ams-icon { font-size: 1.3rem; flex-shrink: 0; }
.ams-title { font-size: 0.82rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.1rem; }
.ams-sub { font-size: 0.78rem; color: #718096; margin: 0; }
</style>
