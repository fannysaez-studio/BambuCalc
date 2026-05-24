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
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Adresse <span class="optional">optionnel</span></label>
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

    <div class="sep" />

    <!-- ── Section pièce & impression ── -->
    <div class="section-label">Pièce & impression</div>

    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Nom de la pièce</label>
        <input :class="formStyles.input" type="text" :value="projectName"
          @input="$emit('update:projectName', $event.target.value)"
          placeholder="Ex: Boîtier de commande" />
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label">Quantité</label>
        <div class="input-unit-wrap">
          <input :class="formStyles.input" type="number" :value="quantity"
            @input="$emit('update:quantity', parseInt($event.target.value))"
            min="1" step="1" />
          <span class="unit">unité(s)</span>
        </div>
      </div>
    </div>

    <!-- Image de référence -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">
        Image de référence
        <span class="optional">optionnel</span>
      </label>
      <div
        class="img-upload-area"
        :class="{ 'img-upload-area--has': referenceImageUrl }"
        @click="$refs.imgInput.click()"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <template v-if="referenceImageUrl">
          <img
            :src="referenceImageUrl"
            class="img-preview"
            alt=""
            v-show="!imgLoadError"
            @error="imgLoadError = true"
            @load="imgLoadError = false"
          />
          <div v-if="imgLoadError" class="img-placeholder img-placeholder--saved">
            <span class="img-ph-icon">🖼️</span>
            <span class="img-ph-text">Image enregistrée — cliquez pour en choisir une autre</span>
          </div>
        </template>
        <div v-else class="img-placeholder">
          <span class="img-ph-icon">📎</span>
          <span class="img-ph-text">Cliquez ou glissez une image (JPG, PNG, WEBP)</span>
        </div>
        <button v-if="referenceImageUrl" class="img-remove" type="button" @click.stop="removeImage">×</button>
      </div>
      <input ref="imgInput" type="file" accept="image/*" style="display:none" @change="handleImageUpload" />
    </div>

    <div class="sep" />

    <!-- ── Section conditions ── -->
    <div class="section-label">Conditions du devis</div>

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

    <!-- Délais -->
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
      <label :class="formStyles.label">Notes / Conditions particulières <span class="optional">optionnel</span></label>
      <textarea :class="formStyles.input" rows="2" :value="quoteNotes"
        @input="$emit('update:quoteNotes', $event.target.value)"
        placeholder="Ex: Pièce imprimée en PLA+ blanc, sans post-traitement inclus."
        style="resize: vertical; min-height: 52px;" />
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

    projectName:          { type: String,  default: '' },
    quantity:             { type: Number,  default: 1 },
    printProfile:         { type: String,  default: 'normal' },
    printerModel:         { type: String,  default: 'p2s-combo' },
    nozzleSize:           { type: String,  default: '0.4' },
    showTechnicalFields:  { type: Boolean, default: false },

    referenceImage:    { type: Object,  default: null },
    referenceImageUrl: { type: String,  default: '' },

    paymentMethod:     { type: String,  default: 'virement' },
    depositPercent:    { type: Number,  default: 0 },
    processingDelay:   { type: String,  default: '5-7j' },
    deliveryDelay:     { type: String,  default: 'pickup' },
    quoteNotes:        { type: String,  default: '' },
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
    'update:projectName', 'update:quantity',
    'update:printProfile', 'update:printerModel', 'update:nozzleSize',
    'update:referenceImage', 'update:referenceImageUrl',
    'update:paymentMethod', 'update:depositPercent',
    'update:processingDelay', 'update:deliveryDelay',
    'update:quoteNotes',
  ],
  data() { return { formStyles, imgLoadError: false } },
  watch: {
    referenceImageUrl(newVal) {
      // Réinitialise l'état d'erreur dès que l'URL change (ex : passage en mode édition)
      if (newVal) this.imgLoadError = false
    },
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0]
      if (!file) return
      this.$emit('update:referenceImage', file)
      this.$emit('update:referenceImageUrl', URL.createObjectURL(file))
    },
    handleDrop(e) {
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return
      this.$emit('update:referenceImage', file)
      this.$emit('update:referenceImageUrl', URL.createObjectURL(file))
    },
    removeImage() {
      this.$emit('update:referenceImage', null)
      this.$emit('update:referenceImageUrl', '')
      this.$refs.imgInput.value = ''
    },
  },
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
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
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

/* ── Image upload ── */
.img-upload-area {
  position: relative;
  border: 1.5px dashed #cbd5e0;
  border-radius: 12px;
  background: #f7f9fc;
  cursor: pointer;
  overflow: hidden;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.img-upload-area:hover { border-color: #2e9cab; background: #f0fbfc; }
.img-upload-area--has { border-style: solid; }

.img-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem;
}
.img-ph-icon { font-size: 1.4rem; }
.img-ph-text { font-size: 0.75rem; color: #a0aec0; font-weight: 500; text-align: center; }

.img-placeholder--saved { background: #f0fbfc; }
.img-placeholder--saved .img-ph-text { color: #2e9cab; }

.img-preview {
  width: 100%;
  max-height: 140px;
  object-fit: contain;
  display: block;
}

.img-remove {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.img-remove:hover { background: rgba(231,76,60,0.85); }
</style>
