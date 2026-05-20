<template>
  <div :class="styles.section">
    <div :class="styles.toggleCard">
      <div :class="styles.toggleHeader">
        <div>
          <div :class="styles.toggleTitleRow">
            <span :class="styles.icon">⟣</span>
            <span :class="styles.toggleTitle">Production en série</span>
          </div>
          <p :class="styles.toggleText">
            Calculer les coûts pour plusieurs unités avec une tarification optimisée
          </p>
        </div>

        <label :class="styles.switch">
          <input v-model="localMode" type="checkbox" />
          <span :class="styles.slider"></span>
        </label>
      </div>

      <div v-if="localMode" :class="styles.seriesBody">
        <div :class="styles.inputsGrid">
          <div v-for="field in seriesFields" :key="field.key" :class="styles.fieldCard">
            <label :class="styles.fieldLabel" :for="field.key">{{ field.label }}</label>
            <div :class="styles.inputWrap">
              <input
                :id="field.key"
                :type="field.type"
                v-model.number="localSettings[field.key]"
                :step="field.step"
                :min="field.min"
              />
              <span :class="styles.unit">{{ field.unit }}</span>
            </div>
            <div v-if="field.help" :class="styles.fieldHelp">{{ field.help }}</div>
          </div>
        </div>

        <div :class="styles.seriesSummary">
          <div :class="styles.seriesSummaryTitle">Ajustements utiles</div>
          <div :class="styles.seriesSummaryText">
            Intègre un taux de rebut, un temps de préparation, le changement de filament et les
            frais d'emballage pour mieux refléter une vraie production.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import styles from '@/styles/AdvancedSettings.module.css'

export default {
  name: 'ProductionSeries',
  props: {
    seriesSettings: {
      type: Object,
      default: () => ({
        quantity: 10,
        volumeDiscount: 5,
        scrapRate: 2,
        setupCost: 50,
        prepTimeMinutes: 15,
        changeMaterialMinutes: 10,
        packagingCostUnit: 0.2,
        productionDays: 7,
      }),
    },
    seriesMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:seriesSettings', 'update:seriesMode'],
  data() {
    return {
      styles,
      localMode: this.seriesMode,
      localSettings: Object.assign({}, this.seriesSettings),
      seriesFields: [
        {
          key: 'quantity',
          label: "Nombre d'unités",
          type: 'number',
          step: '1',
          min: '1',
          unit: 'unités',
        },
        {
          key: 'volumeDiscount',
          label: 'Rabais volume',
          type: 'number',
          step: '0.5',
          min: '0',
          unit: '%',
        },
        {
          key: 'scrapRate',
          label: 'Taux de rebut',
          type: 'number',
          step: '0.1',
          min: '0',
          unit: '%',
          help: 'Pièces ratées ou à refaire',
        },
        {
          key: 'setupCost',
          label: 'Coût de configuration',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'EUR',
        },
        {
          key: 'prepTimeMinutes',
          label: 'Préparation du lot',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'min',
          help: 'Calibration, lancement, vérifications',
        },
        {
          key: 'changeMaterialMinutes',
          label: 'Changement filament',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'min',
          help: 'Changement de bobine ou de couleur',
        },
        {
          key: 'packagingCostUnit',
          label: 'Emballage / unité',
          type: 'number',
          step: '0.05',
          min: '0',
          unit: 'EUR',
        },
        {
          key: 'productionDays',
          label: 'Délai de production',
          type: 'number',
          step: '1',
          min: '1',
          unit: 'jours',
        },
      ],
    }
  },
  watch: {
    localSettings: {
      handler(val) {
        this.$emit('update:seriesSettings', Object.assign({}, val))
      },
      deep: true,
    },
    localMode(val) {
      this.$emit('update:seriesMode', val)
    },
    seriesSettings: {
      handler(val) {
        this.localSettings = Object.assign({}, val)
      },
      deep: true,
      immediate: true,
    },
    seriesMode(val) {
      this.localMode = val
    },
  },
}
</script>
