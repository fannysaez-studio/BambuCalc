<template>
  <div :class="formStyles.section">

    <!-- Meta : N° devis + date -->
    <div class="meta-bar">
      <span class="meta-item"><span class="meta-key">Devis</span> {{ quoteNumber }}</span>
      <span class="meta-sep">·</span>
      <span class="meta-item"><span class="meta-key">Date</span> {{ quoteDate }}</span>
      <span class="meta-sep">·</span>
      <span class="meta-item"><span class="meta-key">Validité</span>
        <input class="meta-input" type="number" :value="quoteValidityDays" min="1" max="365"
          @input="$emit('update:quoteValidityDays', parseInt($event.target.value) || 30)" />
        jours
      </span>
    </div>

    <div class="sep"></div>

    <!-- ── Section client ── -->
    <div class="section-label">Client</div>

    <!-- Ligne 1 : Type + Civilité/Raison sociale + Nom -->
    <div class="grid-3">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Type de client</label>
        <select :class="formStyles.select" :value="clientType"
          @change="$emit('update:clientType', $event.target.value)">
          <option value="particulier">Particulier</option>
          <option value="auto-entrepreneur">Auto-entrepreneur</option>
          <option value="entreprise">Entreprise</option>
          <option value="association">Association</option>
        </select>
      </div>

      <!-- Particulier : Civilité -->
      <div v-if="clientType === 'particulier'" :class="formStyles.formGroup">
        <label :class="formStyles.label">Civilité</label>
        <select :class="formStyles.select" :value="clientCivility"
          @change="$emit('update:clientCivility', $event.target.value)">
          <option value="M.">M.</option>
          <option value="Mme">Mme</option>
        </select>
      </div>

      <!-- Entreprise/Asso : Raison sociale -->
      <div v-if="clientType !== 'particulier'" :class="formStyles.formGroup">
        <label :class="formStyles.label">
          {{ clientType === 'association' ? 'Nom de l\'association' : 'Raison sociale' }}
        </label>
        <input :class="formStyles.input" type="text" :value="clientName"
          @input="$emit('update:clientName', $event.target.value)"
          :placeholder="clientType === 'association' ? 'Association Exemple' : 'SARL Dupont'" />
      </div>

      <!-- Particulier : Prénom -->
      <div v-if="clientType === 'particulier'" :class="formStyles.formGroup">
        <label :class="formStyles.label">Prénom</label>
        <input :class="formStyles.input" type="text" :value="clientFirstName"
          @input="$emit('update:clientFirstName', $event.target.value)"
          placeholder="Marie" />
      </div>
    </div>

    <!-- Ligne 2 : Nom / Prénom (particulier) ou Contact (pro) + Email + Téléphone -->
    <div class="grid-3">
      <!-- Particulier : Nom de famille -->
      <div v-if="clientType === 'particulier'" :class="formStyles.formGroup">
        <label :class="formStyles.label">Nom de famille</label>
        <input :class="formStyles.input" type="text" :value="clientLastName"
          @input="$emit('update:clientLastName', $event.target.value)"
          placeholder="Dupont" />
      </div>

      <!-- Pro : Nom du contact -->
      <div v-if="clientType !== 'particulier'" :class="formStyles.formGroup">
        <label :class="formStyles.label">Nom du contact <span class="optional">optionnel</span></label>
        <input :class="formStyles.input" type="text" :value="clientContactName"
          @input="$emit('update:clientContactName', $event.target.value)"
          placeholder="Jean Dupont" />
      </div>

      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Email</label>
        <input :class="formStyles.input" type="email" :value="clientEmail"
          @input="$emit('update:clientEmail', $event.target.value)"
          placeholder="client@email.com" />
      </div>

      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Téléphone <span class="optional">optionnel</span></label>
        <input :class="formStyles.input" type="tel" :value="clientPhone"
          @input="$emit('update:clientPhone', $event.target.value)"
          placeholder="+33 6 00 00 00 00" />
      </div>
    </div>

    <!-- Ligne 3 : Adresse -->
    <div class="sep"></div>
    <div class="section-label" style="margin-top:0">Adresse <span style="font-weight:400;text-transform:none;font-size:0.65rem;color:#cbd5e0;">optionnel</span></div>
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Adresse</label>
      <input :class="formStyles.input" type="text" :value="clientAddress"
        @input="$emit('update:clientAddress', $event.target.value)"
        placeholder="15 rue de la Paix" />
    </div>

    <!-- Ligne 4 : CP + Ville + Pays -->
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

    <!-- Ligne 5 : SIRET + TVA (pro uniquement) -->
    <div v-if="clientType !== 'particulier'" class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">SIRET <span class="optional">optionnel</span></label>
        <input :class="formStyles.input" type="text" :value="clientSiret"
          @input="$emit('update:clientSiret', $event.target.value)"
          placeholder="123 456 789 00012" />
      </div>
      <div v-if="clientType === 'entreprise'" :class="formStyles.formGroup">
        <label :class="formStyles.label">N° TVA <span class="optional">optionnel</span></label>
        <input :class="formStyles.input" type="text" :value="clientVatNumber"
          @input="$emit('update:clientVatNumber', $event.target.value)"
          placeholder="FR 12 345678901" />
      </div>
    </div>


  </div>
</template>

<script>
import formStyles from '@/styles/Form.module.css'

export default {
  name: 'ProjectDetails',
  props: {
    quoteNumber:       { type: String,  default: '' },
    quoteDate:         { type: String,  default: '' },
    quoteValidityDays: { type: Number,  default: 30 },

    clientType:        { type: String,  default: 'particulier' },
    clientCivility:    { type: String,  default: 'M.' },
    clientFirstName:   { type: String,  default: '' },
    clientLastName:    { type: String,  default: '' },
    clientName:        { type: String,  default: '' },
    clientContactName: { type: String,  default: '' },
    clientEmail:       { type: String,  default: '' },
    clientPhone:       { type: String,  default: '' },

    clientAddress:     { type: String,  default: '' },
    clientPostalCode:  { type: String,  default: '' },
    clientCity:        { type: String,  default: '' },
    clientCountry:     { type: String,  default: 'France' },
    clientSiret:       { type: String,  default: '' },
    clientVatNumber:   { type: String,  default: '' },

  },
  emits: [
    'update:quoteValidityDays',
    'update:clientType', 'update:clientCivility',
    'update:clientFirstName', 'update:clientLastName',
    'update:clientName', 'update:clientContactName',
    'update:clientEmail', 'update:clientPhone',
    'update:clientAddress', 'update:clientPostalCode',
    'update:clientCity', 'update:clientCountry',
    'update:clientSiret', 'update:clientVatNumber',
  ],
  data() { return { formStyles } },
}
</script>

<style scoped>
.meta-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  background: #f7f9fc;
  border-radius: 8px;
  margin-bottom: 0.65rem;
  font-size: 0.75rem;
  color: #718096;
  flex-wrap: wrap;
}
.meta-key { font-weight: 700; color: #a0aec0; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.06em; margin-right: 0.2rem; }
.meta-sep { color: #cbd5e0; }
.meta-input {
  width: 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  padding: 0.1rem 0.3rem;
  font-size: 0.75rem;
  color: #4a5568;
  background: #fff;
  text-align: center;
  font-family: inherit;
}

.section-label {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a0aec0;
  margin-bottom: 0.4rem;
  margin-top: 0.1rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.sep { height: 1px; background: #e2e8f0; margin: 0.5rem 0; }

.input-unit-wrap { display: flex; align-items: center; gap: 0.4rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.75rem; font-weight: 700; color: #4a5568; white-space: nowrap; }

.optional {
  font-size: 0.65rem;
  font-weight: 500;
  color: #a0aec0;
  background: #edf2f7;
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  margin-left: 0.25rem;
  vertical-align: middle;
}

</style>
