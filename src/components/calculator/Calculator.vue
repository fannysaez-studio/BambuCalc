<template>
  <div :class="styles.shell">

    <!-- ── STEPPER HORIZONTAL ── -->
    <div :class="styles.stepper">
      <div :class="styles.stepperTop">
        <div :class="styles.stepperMeta">
          <span :class="styles.stepperCount">Étape {{ currentStepIndex }} / {{ steps.length }}</span>
          <span :class="styles.stepperCurrent">{{ currentStep.label }} — {{ currentStep.description }}</span>
        </div>
        <div :class="styles.stepperActions">
          <button :class="styles.btnNext" type="button" :disabled="isLastStep" @click="advanceStep">
            Étape suivante →
          </button>
          <button
            v-if="isLastStep"
            :class="[styles.btnSave, saveStatus === 'ok' && styles.btnSaveOk]"
            type="button"
            :disabled="saving"
            @click="saveQuote"
          >
            <span v-if="saving">Sauvegarde…</span>
            <span v-else-if="saveStatus === 'ok'">✓ Sauvegardé</span>
            <span v-else>Sauvegarder le devis</span>
          </button>
        </div>
      </div>

      <p v-if="saveStatus === 'error'" :class="styles.saveError">Erreur lors de la sauvegarde. Réessaie.</p>

      <div :class="styles.stepTrack">
        <div v-for="(step, i) in steps" :key="step.id" :class="styles.stepItem">
          <div v-if="i > 0" :class="[styles.stepLine, currentStepIndex > step.index - 1 && styles.stepLineDone]"></div>
          <button
            :class="[styles.stepDot, currentStepIndex === step.index && styles.stepDotActive, currentStepIndex > step.index && styles.stepDotDone]"
            type="button"
            :disabled="step.index > currentStepIndex"
            @click="goToStep(step.index)"
            :title="step.label"
          >
            <component v-if="currentStepIndex <= step.index" :is="step.icon" :class="styles.stepIcon" />
            <span v-else :class="styles.stepCheck">✓</span>
          </button>
          <span :class="[styles.stepLabel, currentStepIndex === step.index && styles.stepLabelActive, currentStepIndex > step.index && styles.stepLabelDone]">
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── ACCORDÉON PROGRESSIF ── -->
    <div :class="styles.accordion">

      <!-- ÉTAPE 1 — Projet -->
      <div :class="[styles.accordionCard, currentStepIndex === 1 && styles.accordionCardActive]">
        <!-- Résumé (étape complétée) -->
        <button v-if="currentStepIndex > 1" :class="styles.summary" @click="goToStep(1)">
          <Layers :class="styles.summaryIcon" />
          <div :class="styles.summaryBody">
            <span :class="styles.summaryLabel">Projet</span>
            <span :class="styles.summaryValue">{{ formData.projectName }} · {{ printerLabel }} · {{ profileLabel }}</span>
          </div>
          <Pencil :class="styles.summaryEdit" />
        </button>
        <!-- Formulaire actif -->
        <div v-if="currentStepIndex === 1" :class="styles.accordionBody">
          <ProjectDetails
            v-model:projectName="formData.projectName"
            v-model:printProfile="formData.printProfile"
            v-model:printerModel="formData.printerModel"
            v-model:nozzleSize="formData.nozzleSize"
          />
        </div>
      </div>

      <!-- ÉTAPE 2 — Matière -->
      <template v-if="currentStepIndex >= 2">
        <div :class="[styles.accordionCard, currentStepIndex === 2 && styles.accordionCardActive]">
          <button v-if="currentStepIndex > 2" :class="styles.summary" @click="goToStep(2)">
            <Package :class="styles.summaryIcon" />
            <div :class="styles.summaryBody">
              <span :class="styles.summaryLabel">Matière</span>
              <span :class="styles.summaryValue">{{ formData.material }} · {{ formData.costPerKg }}€/kg · {{ formData.weight }}g</span>
            </div>
            <Pencil :class="styles.summaryEdit" />
          </button>
          <div v-if="currentStepIndex === 2" :class="styles.accordionBody">
            <FilamentSection
              v-model:material="formData.material"
              v-model:costPerKg="formData.costPerKg"
              v-model:weight="formData.weight"
            />
          </div>
        </div>
      </template>

      <!-- ÉTAPE 3 — Temps -->
      <template v-if="currentStepIndex >= 3">
        <div :class="[styles.accordionCard, currentStepIndex === 3 && styles.accordionCardActive]">
          <button v-if="currentStepIndex > 3" :class="styles.summary" @click="goToStep(3)">
            <Clock :class="styles.summaryIcon" />
            <div :class="styles.summaryBody">
              <span :class="styles.summaryLabel">Temps</span>
              <span :class="styles.summaryValue">{{ formData.hours }}h {{ formData.minutes }}min · {{ formData.workTime }}min travail</span>
            </div>
            <Pencil :class="styles.summaryEdit" />
          </button>
          <div v-if="currentStepIndex === 3" :class="styles.accordionBody">
            <PrintingTime
              v-model:hours="formData.hours"
              v-model:minutes="formData.minutes"
              v-model:workTime="formData.workTime"
            />
          </div>
        </div>
      </template>

      <!-- ÉTAPE 4 — Tarifs -->
      <template v-if="currentStepIndex >= 4">
        <div :class="[styles.accordionCard, currentStepIndex === 4 && styles.accordionCardActive]">
          <button v-if="currentStepIndex > 4" :class="styles.summary" @click="goToStep(4)">
            <Tag :class="styles.summaryIcon" />
            <div :class="styles.summaryBody">
              <span :class="styles.summaryLabel">Tarifs</span>
              <span :class="styles.summaryValue">{{ pricingLabel }} · {{ customMargin }}% marge</span>
            </div>
            <Pencil :class="styles.summaryEdit" />
          </button>
          <div v-if="currentStepIndex === 4" :class="styles.accordionBody">
            <PricingSuggestions
              :baseCost="calculatedCosts.totalCost"
              :baseCostPerUnit="calculatedCosts.costPerUnit"
              :seriesQuantity="1"
              :volumeDiscount="0"
              :taxRate="formData.taxRate"
              v-model:selectedPricing="selectedPricing"
              v-model:customMargin="customMargin"
            />
          </div>
        </div>
      </template>

      <!-- ÉTAPE 5 — Coûts -->
      <template v-if="currentStepIndex >= 5">
        <div :class="[styles.accordionCard, styles.accordionCardActive]">
          <div :class="styles.accordionBody">
            <CostBreakdown :costs="calculatedCosts" />
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import ProjectDetails from './ProjectDetails.vue'
import FilamentSection from './FilamentSection.vue'
import PrintingTime from './PrintingTime.vue'
import CostBreakdown from './CostBreakdown.vue'
import PricingSuggestions from './PricingSuggestions.vue'
import styles from '@/styles/Calculator.module.css'
import { saveQuote as saveQuoteToDb } from '@/utils/quotes'
import { Layers, Package, Clock, Tag, BarChart3, Pencil } from 'lucide-vue-next'

export default {
  name: 'Calculator',
  components: { ProjectDetails, FilamentSection, PrintingTime, CostBreakdown, PricingSuggestions, Layers, Package, Clock, Tag, BarChart3, Pencil },
  data() {
    return {
      styles,
      formData: {
        projectName: 'Pièce test',
        printProfile: 'normal',
        printerModel: 'p2s-mono',
        nozzleSize: '0.4',
        material: 'PLA',
        costPerKg: 19.99,
        weight: 0,
        hours: 0,
        minutes: 0,
        workTime: 0,
        packagingCost: 0,
        taxRate: 20,
      },
      selectedPricing: 'standard',
      customMargin: 50,
      currentStepIndex: 1,
      saving: false,
      saveStatus: null,
      steps: [
        { id: 'step-project',   index: 1, label: 'Projet',  icon: 'Layers',    description: "Nom, imprimante et profil." },
        { id: 'step-filament',  index: 2, label: 'Matière', icon: 'Package',   description: 'Filament, coût et poids.' },
        { id: 'step-printing',  index: 3, label: 'Temps',   icon: 'Clock',     description: "Durée et temps de travail." },
        { id: 'step-pricing',   index: 4, label: 'Tarifs',  icon: 'Tag',       description: 'Marge et tarification.' },
        { id: 'step-breakdown', index: 5, label: 'Coûts',   icon: 'BarChart3', description: 'Total et répartition TTC.' },
      ],
    }
  },
  computed: {
    isLastStep() { return this.currentStepIndex >= this.steps.length },
    currentStep() { return this.steps[this.currentStepIndex - 1] || this.steps[0] },
    printerLabel() {
      const map = { 'p2s-mono': 'P2S Combo', 'x1c': 'X1C', 'a1-mini': 'A1 Mini', 'a1': 'A1' }
      return map[this.formData.printerModel] || this.formData.printerModel
    },
    profileLabel() {
      const map = { normal: 'Normal', quality: 'Qualité', speed: 'Vitesse', silent: 'Silencieux' }
      return map[this.formData.printProfile] || this.formData.printProfile
    },
    pricingLabel() {
      const map = { standard: 'Standard', competitive: 'Compétitif', premium: 'Premium', custom: 'Personnalisé' }
      return map[this.selectedPricing] || this.selectedPricing
    },
    calculatedCosts() {
      const materialCost = ((Number(this.formData.weight) || 0) / 1000) * (Number(this.formData.costPerKg) || 0)
      const printHours = (Number(this.formData.hours) || 0) + (Number(this.formData.minutes) || 0) / 60
      const equipmentCost = printHours * 5
      const workCost = ((Number(this.formData.workTime) || 0) / 60) * 15
      const packagingCost = Number(this.formData.packagingCost) || 0
      const subtotal = materialCost + equipmentCost + workCost + packagingCost
      const tax = (subtotal * (Number(this.formData.taxRate) || 0)) / 100
      const totalCost = subtotal + tax
      const r = (v) => Math.round(v * 100) / 100
      return { quantity: 1, materialCost: r(materialCost), equipmentCost: r(equipmentCost), workCost: r(workCost), packagingCost: r(packagingCost), subtotal: r(subtotal), tax: r(tax), totalCost: r(totalCost), costPerUnit: r(totalCost) }
    },
  },
  methods: {
    goToStep(index) {
      if (index > this.currentStepIndex) return
      this.currentStepIndex = index
      this.$nextTick(() => {
        const el = document.getElementById(this.steps[index - 1]?.id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    advanceStep() {
      if (this.currentStepIndex < this.steps.length) {
        this.currentStepIndex += 1
        this.$nextTick(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
      }
    },
    async saveQuote() {
      this.saving = true
      this.saveStatus = null
      try {
        const c = this.calculatedCosts
        await saveQuoteToDb({
          project_name: this.formData.projectName, print_profile: this.formData.printProfile,
          printer_model: this.formData.printerModel, nozzle_size: this.formData.nozzleSize,
          material: this.formData.material, cost_per_kg: this.formData.costPerKg,
          weight: this.formData.weight, hours: this.formData.hours, minutes: this.formData.minutes,
          work_time: this.formData.workTime, packaging_cost: this.formData.packagingCost,
          tax_rate: this.formData.taxRate, selected_pricing: this.selectedPricing,
          custom_margin: this.customMargin, material_cost: c.materialCost,
          equipment_cost: c.equipmentCost, work_cost: c.workCost,
          total_cost: c.totalCost, cost_per_unit: c.costPerUnit, quantity: 1,
        })
        this.saveStatus = 'ok'
        setTimeout(() => { this.saveStatus = null }, 3000)
      } catch { this.saveStatus = 'error' }
      finally { this.saving = false }
    },
  },
}
</script>

<style module="styles">
@import '../styles/Calculator.module.css';
</style>
