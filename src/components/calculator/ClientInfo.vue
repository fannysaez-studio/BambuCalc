<template>
  <div :class="formStyles.section">

    <div class="info-card">
      <span class="info-icon">📬</span>
      <div>
        <p class="info-title">Vos coordonnées</p>
        <p class="info-sub">Pour que nous puissions vous envoyer votre devis et vous recontacter.</p>
      </div>
    </div>

    <!-- Prénom + Nom -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Prénom</label>
        <input :class="formStyles.input" type="text" :value="clientFirstName"
          @input="$emit('update:clientFirstName', $event.target.value)"
          placeholder="Marie" />
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Nom</label>
        <input :class="formStyles.input" type="text" :value="clientLastName"
          @input="$emit('update:clientLastName', $event.target.value)"
          placeholder="Dupont" />
      </div>
    </div>

    <!-- Email + Téléphone -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Email <span class="req">*</span></label>
        <input :class="formStyles.input" type="email" :value="clientEmail"
          @input="$emit('update:clientEmail', $event.target.value)"
          placeholder="marie@exemple.com" />
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Téléphone <span class="optional">optionnel</span></label>
        <input :class="formStyles.input" type="tel" :value="clientPhone"
          @input="$emit('update:clientPhone', $event.target.value)"
          placeholder="+33 6 00 00 00 00" />
      </div>
    </div>

    <!-- Adresse (accordéon) -->
    <button class="toggle-link" @click="showAddress = !showAddress">
      {{ showAddress ? '− Adresse de livraison' : '+ Adresse de livraison' }}
      <span class="optional-hint">optionnel</span>
    </button>
    <div v-if="showAddress" class="address-block">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Adresse</label>
        <input :class="formStyles.input" type="text" :value="clientAddress"
          @input="$emit('update:clientAddress', $event.target.value)"
          placeholder="15 rue de la Paix" />
      </div>
      <div class="grid-3">
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Code postal</label>
          <input :class="formStyles.input" type="text" :value="clientPostalCode"
            @input="$emit('update:clientPostalCode', $event.target.value)"
            placeholder="75001" />
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Ville</label>
          <input :class="formStyles.input" type="text" :value="clientCity"
            @input="$emit('update:clientCity', $event.target.value)"
            placeholder="Paris" />
        </div>
        <div :class="formStyles.formGroup">
          <label :class="formStyles.label">Pays</label>
          <input :class="formStyles.input" type="text" :value="clientCountry"
            @input="$emit('update:clientCountry', $event.target.value)"
            placeholder="France" />
        </div>
      </div>
    </div>

    <!-- Mode de paiement souhaité -->
    <div :class="formStyles.formGroup" style="margin-top:0.5rem">
      <label :class="formStyles.label">Mode de paiement souhaité</label>
      <select :class="formStyles.select" :value="paymentMethod"
        @change="$emit('update:paymentMethod', $event.target.value)">
        <option value="virement">Virement bancaire</option>
        <option value="cb">Carte bancaire (Stripe)</option>
        <option value="paypal">PayPal</option>
        <option value="cheque">Chèque</option>
        <option value="especes">Espèces</option>
      </select>
    </div>

  </div>
</template>

<script>
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'ClientInfo',
  props: {
    clientFirstName:  { type: String, default: '' },
    clientLastName:   { type: String, default: '' },
    clientEmail:      { type: String, default: '' },
    clientPhone:      { type: String, default: '' },
    clientAddress:    { type: String, default: '' },
    clientPostalCode: { type: String, default: '' },
    clientCity:       { type: String, default: '' },
    clientCountry:    { type: String, default: 'France' },
    paymentMethod:    { type: String, default: 'virement' },
  },
  emits: [
    'update:clientFirstName', 'update:clientLastName',
    'update:clientEmail', 'update:clientPhone',
    'update:clientAddress', 'update:clientPostalCode',
    'update:clientCity', 'update:clientCountry',
    'update:paymentMethod',
  ],
  data() {
    return { formStyles, showAddress: false }
  },
}
</script>

<style scoped>
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.5rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; }
.info-card {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: #f8fffe; border: 1.5px solid #b2e8ef; border-radius: 12px;
  padding: 0.75rem 1rem; margin-bottom: 1rem;
}
.info-icon { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }
.info-title { font-size: 0.88rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.15rem; }
.info-sub { font-size: 0.78rem; color: #718096; margin: 0; }
.req { color: #e53e3e; margin-left: 2px; }
.optional { font-size: 0.72rem; color: #a0aec0; font-weight: 400; margin-left: 4px; }
.toggle-link {
  background: none; border: none; color: #a0aec0; font-size: 0.78rem; font-weight: 600;
  font-family: inherit; cursor: pointer; padding: 0.25rem 0; text-align: left;
  transition: color 0.2s ease; display: flex; align-items: center; gap: 0.35rem;
}
.toggle-link:hover { color: #2e9cab; }
.optional-hint { font-weight: 400; font-size: 0.74rem; }
.address-block {
  padding: 0.75rem 1rem; background: #f7f9fc;
  border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 0.5rem;
}
</style>
