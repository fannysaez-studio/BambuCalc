<template>
  <div :class="formStyles.section">

    <div class="grid-3">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Mode de paiement</label>
        <select :class="formStyles.select" :value="paymentMethod"
          @change="$emit('update:paymentMethod', $event.target.value)">
          <option value="virement">Virement bancaire</option>
          <option value="cheque">Chèque</option>
          <option value="cb">Carte bancaire</option>
          <option value="especes">Espèces</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Acompte demandé</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="depositPercent"
            @input="$emit('update:depositPercent', parseInt($event.target.value) || 0)"
            min="0" max="100" step="5" />
          <span class="unit">%</span>
        </div>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Validité du devis</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="quoteValidityDays"
            @input="$emit('update:quoteValidityDays', parseInt($event.target.value) || 30)"
            min="1" max="365" step="1" />
          <span class="unit">jours</span>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Délai de fabrication</label>
        <select :class="formStyles.select" :value="processingDelay"
          @change="$emit('update:processingDelay', $event.target.value)">
          <option value="24h">24 heures</option>
          <option value="2-3j">2 à 3 jours ouvrés</option>
          <option value="5-7j">5 à 7 jours ouvrés</option>
          <option value="1-2s">1 à 2 semaines</option>
          <option value="2-4s">2 à 4 semaines</option>
          <option value="custom">À convenir</option>
        </select>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Livraison / Retrait</label>
        <select :class="formStyles.select" :value="deliveryDelay"
          @change="$emit('update:deliveryDelay', $event.target.value)">
          <option value="pickup">Retrait en main propre</option>
          <option value="colissimo">Colissimo (2-3 j)</option>
          <option value="chronopost">Chronopost (J+1)</option>
          <option value="mondial">Mondial Relay (3-5 j)</option>
          <option value="custom">À convenir</option>
        </select>
      </div>
    </div>

    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Notes / Conditions particulières
        <span class="optional">optionnel</span></label>
      <textarea :class="formStyles.input" rows="3" :value="quoteNotes"
        @input="$emit('update:quoteNotes', $event.target.value)"
        placeholder="Ex: Pièce imprimée en PLA+ blanc, sans post-traitement inclus."
        style="resize: vertical; min-height: 60px;" />
    </div>

  </div>
</template>

<script>
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'ProjectConditions',
  props: {
    paymentMethod:    { type: String, default: 'virement' },
    depositPercent:   { type: Number, default: 0 },
    quoteValidityDays:{ type: Number, default: 30 },
    processingDelay:  { type: String, default: '5-7j' },
    deliveryDelay:    { type: String, default: 'pickup' },
    quoteNotes:       { type: String, default: '' },
  },
  emits: [
    'update:paymentMethod', 'update:depositPercent', 'update:quoteValidityDays',
    'update:processingDelay', 'update:deliveryDelay', 'update:quoteNotes',
  ],
  data() { return { formStyles } },
}
</script>

<style scoped>
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; margin-bottom: 0.5rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.5rem; }
.input-unit-wrap { display: flex; align-items: center; gap: 0.4rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.75rem; font-weight: 700; color: #4a5568; white-space: nowrap; }
.optional {
  font-size: 0.65rem; font-weight: 500; color: #a0aec0;
  background: #edf2f7; border-radius: 4px; padding: 0.1rem 0.35rem;
  margin-left: 0.25rem; vertical-align: middle;
}
@media (max-width: 480px) {
  .grid-3 { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
