<template>
  <div :class="formStyles.section">

    <!-- Type de projet -->
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

    <!-- Description -->
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

    <div class="sep" />

    <!-- Dimensions -->
    <div class="section-label">Dimensions souhaitées <span class="optional">optionnel</span></div>
    <div class="grid-3">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Longueur</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="projectLength"
            @input="$emit('update:projectLength', parseFloat($event.target.value) || null)"
            min="0" step="1" placeholder="—" />
          <span class="unit">mm</span>
        </div>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Largeur</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="projectWidth"
            @input="$emit('update:projectWidth', parseFloat($event.target.value) || null)"
            min="0" step="1" placeholder="—" />
          <span class="unit">mm</span>
        </div>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Hauteur</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="projectHeight"
            @input="$emit('update:projectHeight', parseFloat($event.target.value) || null)"
            min="0" step="1" placeholder="—" />
          <span class="unit">mm</span>
        </div>
      </div>
    </div>

    <!-- Finition -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Finition souhaitée</label>
      <div class="finish-buttons">
        <button v-for="f in finishes" :key="f.value" type="button"
          :class="['finish-btn', projectFinish === f.value && 'finish-btn--active']"
          @click="$emit('update:projectFinish', f.value)">
          <component :is="f.icon" class="finish-icon" />
          <span class="finish-label">{{ f.label }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import formStyles from '@/styles/Form.module.css'
import { Printer, Gem, Paintbrush, Sparkles } from 'lucide-vue-next'

export default {
  name: 'ProjectProjet',
  components: { Printer, Gem, Paintbrush, Sparkles },
  props: {
    projectSeriesType:  { type: String, default: 'unique' },
    projectDescription: { type: String, default: '' },
    projectLength:      { type: Number, default: null },
    projectWidth:       { type: Number, default: null },
    projectHeight:      { type: Number, default: null },
    projectFinish:      { type: String, default: 'brut' },
  },
  emits: [
    'update:projectSeriesType', 'update:projectDescription',
    'update:projectLength', 'update:projectWidth', 'update:projectHeight',
    'update:projectFinish',
  ],
  data() {
    return {
      formStyles,
      finishes: [
        { value: 'brut',  icon: 'Printer',    label: 'Brut' },
        { value: 'ponce', icon: 'Gem',         label: 'Poncé' },
        { value: 'peint', icon: 'Paintbrush',  label: 'Peint' },
        { value: 'autre', icon: 'Sparkles',    label: 'Autre' },
      ],
    }
  },
}
</script>

<style scoped>
.sep { height: 1px; background: #e2e8f0; margin: 0.65rem 0; }
.section-label {
  font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: #a0aec0; margin-bottom: 0.4rem;
}
.optional {
  font-size: 0.65rem; font-weight: 500; color: #a0aec0;
  background: #edf2f7; border-radius: 4px; padding: 0.1rem 0.35rem;
  margin-left: 0.25rem; text-transform: none; letter-spacing: 0; vertical-align: middle;
}
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; margin-bottom: 0.5rem; }
.input-unit-wrap { display: flex; align-items: center; gap: 0.4rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.75rem; font-weight: 700; color: #4a5568; white-space: nowrap; }

.finish-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.finish-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
  padding: 0.55rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 12px;
  background: #fff; cursor: pointer; font-family: inherit; flex: 1; min-width: 64px;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.finish-btn:hover { border-color: #2e9cab; background: #f0fbfc; }
.finish-btn--active {
  border-color: #2e9cab;
  background: linear-gradient(135deg, #e8f7f9, #d0f0f5);
  box-shadow: 0 0 0 3px rgba(46,156,171,0.15);
}
.finish-icon { width: 1.15rem; height: 1.15rem; color: #718096; }
.finish-btn--active .finish-icon { color: #1f7f97; }
.finish-label { font-size: 0.7rem; font-weight: 700; color: #4a5568; }
.finish-btn--active .finish-label { color: #1f7f97; }

@media (max-width: 480px) {
  .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
}
</style>
