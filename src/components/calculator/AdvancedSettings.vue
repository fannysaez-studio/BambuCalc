<template>
  <div :class="styles.section">
    <div :class="styles.toggleCard">
      <div :class="styles.toggleHeader">
        <div>
          <div :class="styles.toggleTitleRow">
            <span :class="styles.icon">⚙</span>
            <span :class="styles.toggleTitle">Paramètres avancés</span>
          </div>
          <p :class="styles.toggleText">
            Configurez les paramètres avancés comme l'électricité et l'amortissement.
          </p>
        </div>

        <label :class="styles.switch">
          <input v-model="advancedMode" type="checkbox" />
          <span :class="styles.slider"></span>
        </label>
      </div>

      <div v-if="advancedMode" :class="styles.advancedBody">
        <div :class="styles.inputsGrid">
          <div v-for="field in fields" :key="field.key" :class="styles.fieldCard">
            <label :class="styles.fieldLabel" :for="field.key">{{ field.label }}</label>
            <div :class="styles.inputWrap">
              <input
                :id="field.key"
                :type="field.type"
                v-model.number="settings[field.key]"
                :step="field.step"
                :min="field.min"
              />
              <span :class="styles.unit">{{ field.unit }}</span>
            </div>
          </div>
        </div>

        <div :class="styles.metricsTitle">Métriques calculées</div>

        <div :class="styles.metricsGrid">
          <div
            v-for="metric in metrics"
            :key="metric.label"
            :class="[styles.metricCard, metric.highlight && styles.metricHighlight]"
          >
            <div :class="styles.metricLabel">{{ metric.label }}</div>
            <div :class="styles.metricValue">{{ metric.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import styles from '@/styles/AdvancedSettings.module.css'

export default {
  name: 'AdvancedSettings',
  data() {
    return {
      styles,
      advancedMode: false,
      settings: {
        laborRate: 20,
        materialEfficiency: 1.1,
        initialInvestment: 749,
        initialFees: 0,
        annualMaintenance: 75,
        lifespanYears: 3,
        utilizationRate: 50,
        powerConsumption: 150,
        electricityCost: 0.2,
        safetyFactor: 1.3,
      },
      fields: [
        {
          key: 'laborRate',
          label: 'Taux de main-d’œuvre',
          type: 'number',
          step: '0.1',
          min: '0',
          unit: 'EUR/hr',
        },
        {
          key: 'materialEfficiency',
          label: 'Facteur d’efficacité matériau',
          type: 'number',
          step: '0.1',
          min: '0',
          unit: 'x',
        },
        {
          key: 'initialInvestment',
          label: 'Coût de l’imprimante',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'EUR',
        },
        {
          key: 'initialFees',
          label: 'Frais initiaux supplémentaires',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'EUR',
        },
        {
          key: 'annualMaintenance',
          label: 'Maintenance annuelle',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'EUR',
        },
        {
          key: 'lifespanYears',
          label: 'Durée de vie estimée',
          type: 'number',
          step: '1',
          min: '1',
          unit: 'Ans',
        },
        {
          key: 'utilizationRate',
          label: 'Taux d’utilisation (%)',
          type: 'number',
          step: '1',
          min: '0',
          unit: '%',
        },
        {
          key: 'powerConsumption',
          label: 'Consommation électrique',
          type: 'number',
          step: '1',
          min: '0',
          unit: 'W',
        },
        {
          key: 'electricityCost',
          label: 'Coût de l’électricité',
          type: 'number',
          step: '0.01',
          min: '0',
          unit: 'EUR/kWh',
        },
        {
          key: 'safetyFactor',
          label: 'Facteur de sécurité',
          type: 'number',
          step: '0.1',
          min: '0',
          unit: 'x',
        },
      ],
    }
  },
  computed: {
    investmentTotal() {
      return this.settings.initialInvestment + this.settings.initialFees
    },
    totalLifeCost() {
      return this.investmentTotal + this.settings.annualMaintenance * this.settings.lifespanYears
    },
    hoursPerYear() {
      return Math.round(8760 * (this.settings.utilizationRate / 100))
    },
    amortizationPerHour() {
      const denominator = this.settings.lifespanYears * this.hoursPerYear || 1
      return this.investmentTotal / denominator
    },
    maintenancePerHour() {
      return this.settings.annualMaintenance / (this.hoursPerYear || 1)
    },
    electricityPerHour() {
      return (this.settings.powerConsumption / 1000) * this.settings.electricityCost
    },
    machineCostPerHour() {
      return (
        (this.amortizationPerHour + this.maintenancePerHour + this.electricityPerHour) *
        this.settings.safetyFactor
      )
    },
    metrics() {
      return [
        {
          label: 'Investissement total',
          value: this.formatEuro(this.investmentTotal),
          highlight: false,
        },
        {
          label: 'Coût sur la durée de vie',
          value: this.formatEuro(this.totalLifeCost),
          highlight: false,
        },
        { label: 'Heures d’utilisation', value: `${this.hoursPerYear} hrs/year`, highlight: false },
        {
          label: 'Amortissement',
          value: `${this.formatRate(this.amortizationPerHour)} EUR/hr`,
          highlight: false,
        },
        {
          label: 'Maintenance',
          value: `${this.formatRate(this.maintenancePerHour)} EUR/hr`,
          highlight: false,
        },
        {
          label: 'Électricité',
          value: `${this.formatRate(this.electricityPerHour)} EUR/hr`,
          highlight: false,
        },
        {
          label: 'Coût total machine',
          value: `${this.formatRate(this.machineCostPerHour)} EUR/hr`,
          highlight: true,
        },
      ]
    },
  },
  methods: {
    formatEuro(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }).format(value)
    },
    formatRate(value) {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    },
  },
}
</script>
