<template>
  <div class="step-page">

    <!-- ── Stepper horizontal (desktop) ── -->
    <div class="stepper stepper--desktop">
      <div class="stepper-track">
        <div v-for="(s, i) in steps" :key="s.step" class="step-item">
          <div v-if="i > 0" :class="['step-line', currentStep > s.step - 1 && 'step-line-done']"></div>
          <button
            type="button"
            :class="['step-dot', currentStep === s.step && 'dot-active', currentStep > s.step && 'dot-done']"
            :disabled="s.step > currentStep"
            @click="navigateToStep(s.step)"
          >
            <component v-if="currentStep <= s.step" :is="s.icon" class="dot-icon" />
            <span v-else class="dot-check">✓</span>
          </button>
          <span :class="['step-label', currentStep === s.step && 'label-active', currentStep > s.step && 'label-done']">
            {{ s.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Stepper mobile : barre de progression ── -->
    <div class="stepper stepper--mobile">
      <div class="mobile-step-info">
        <span class="mobile-step-num">Étape {{ currentStep }} / {{ steps.length }}</span>
        <span class="mobile-step-label">{{ currentStepDef.label }}</span>
      </div>
      <div class="mobile-progress-track">
        <div class="mobile-progress-bar" :style="{ width: (currentStep / steps.length * 100) + '%' }"></div>
      </div>
    </div>

    <!-- ── Contenu de l'étape ── -->
    <div class="content-area">

      <!-- Carte de l'étape -->
      <div class="step-card">

        <div class="step-card-header">
          <div class="step-card-icon-wrap">
            <component :is="currentStepDef.icon" class="step-card-icon" />
          </div>
          <div>
            <p class="step-card-eyebrow">Étape {{ currentStep }} / {{ steps.length }}</p>
            <h2 class="step-card-title">{{ currentStepDef.label }}</h2>
            <p class="step-card-desc">{{ currentStepDef.description }}</p>
          </div>
        </div>

        <div class="step-card-body">

          <!-- ── ÉTAPE 1 : Projet (identique pour tous) ── -->
          <ProjectProjet
            v-if="currentStep === 1"
            v-model:projectSeriesType="store.projectSeriesType"
            v-model:projectDescription="store.projectDescription"
            v-model:projectLength="store.projectLength"
            v-model:projectWidth="store.projectWidth"
            v-model:projectHeight="store.projectHeight"
            v-model:projectFinish="store.projectFinish"
            v-model:projectFinishNote="store.projectFinishNote"
          />

          <!-- ── ÉTAPE 2 : Matière (identique pour tous) ── -->
          <ProjectMatter
            v-if="currentStep === 2"
            v-model:material="store.defaultMaterial"
            v-model:costPerKg="store.defaultCostPerKg"
            v-model:lossPercent="store.defaultLossPercent"
            v-model:colorCount="store.defaultColorCount"
            v-model:purgeWaste="ignoredPurge"
            v-model:materialId="store.defaultMaterialId"
          />

          <!-- ── ÉTAPES 3-8 ADMIN ── -->
          <template v-if="isAdmin && currentStep > 2">

            <!-- Étape 3 : Client -->
            <ProjectDetails
              v-if="currentStep === 3"
              :quoteNumber="store.quoteNumber"
              :quoteDate="store.quoteDate"
              v-model:quoteValidityDays="store.quoteValidityDays"
              v-model:clientType="store.clientType"
              v-model:clientCivility="store.clientCivility"
              v-model:clientFirstName="store.clientFirstName"
              v-model:clientLastName="store.clientLastName"
              v-model:clientName="store.clientName"
              v-model:clientContactName="store.clientContactName"
              v-model:clientEmail="store.clientEmail"
              v-model:clientPhone="store.clientPhone"
              v-model:clientAddress="store.clientAddress"
              v-model:clientPostalCode="store.clientPostalCode"
              v-model:clientCity="store.clientCity"
              v-model:clientCountry="store.clientCountry"
              v-model:clientSiret="store.clientSiret"
              v-model:clientVatNumber="store.clientVatNumber"
            />

            <!-- Étape 4 : Pièces -->
            <ProjectPieces
              v-if="currentStep === 4"
              v-model:pieces="store.pieces"
              :defaultMaterialId="store.defaultMaterialId"
              :defaultMaterial="store.defaultMaterial"
              :defaultCostPerKg="store.defaultCostPerKg"
              :defaultLossPercent="store.defaultLossPercent"
              :defaultColorCount="store.defaultColorCount"
            />

            <!-- Étape 5 : Conditions du devis -->
            <ProjectConditions
              v-if="currentStep === 5"
              v-model:paymentMethod="store.paymentMethod"
              v-model:depositPercent="store.depositPercent"
              v-model:quoteValidityDays="store.quoteValidityDays"
              v-model:processingDelay="store.processingDelay"
              v-model:deliveryDelay="store.deliveryDelay"
              v-model:quoteNotes="store.quoteNotes"
            />

            <!-- Étape 6 : Temps -->
            <PrintingTime
              v-if="currentStep === 6"
              v-model:printHours="store.printHours"
              v-model:printMinutes="store.printMinutes"
              v-model:prepTime="store.prepTime"
              v-model:postTime="store.postTime"
              v-model:hourlyRate="store.hourlyRate"
              :isAdmin="true"
            />

            <!-- Étape 7 : Tarifs -->
            <PricingSuggestions
              v-if="currentStep === 7"
              :baseCost="store.calculatedCosts.subtotal"
              :baseCostPerUnit="store.calculatedCosts.subtotal / Math.max(1, store.calculatedCosts.quantity)"
              :seriesQuantity="store.calculatedCosts.quantity"
              :volumeDiscount="0"
              :taxRate="store.taxRate"
              v-model:selectedPricing="store.selectedPricing"
              v-model:customMargin="store.customMargin"
            />

            <!-- Étape 8 : Coûts -->
            <CostBreakdown
              v-if="currentStep === 8"
              :costs="store.calculatedCosts"
              :sellingPrices="store.sellingPrices"
              :isAdmin="true"
            />

          </template>

          <!-- ── ÉTAPES 3-5 CLIENT ── -->
          <template v-if="!isAdmin && currentStep > 2">

            <!-- Étape 3 : Poids + Quantité -->
            <div v-if="currentStep === 3" class="client-step2">
              <div class="qty-block">
                <p class="qty-title">Quantité souhaitée</p>
                <div class="qty-buttons">
                  <button v-for="q in quantityPresets" :key="q.value" type="button"
                    :class="['qty-btn', store.pieces[0].quantity === q.value && 'qty-btn--active']"
                    @click="store.pieces[0].quantity = q.value">
                    {{ q.label }}
                  </button>
                </div>
                <p class="qty-hint">Le tarif sera ajusté en fonction du nombre de pièces.</p>
              </div>
              <PrintingTime
                v-model:printHours="store.printHours"
                v-model:printMinutes="store.printMinutes"
                v-model:prepTime="store.prepTime"
                v-model:postTime="store.postTime"
                v-model:hourlyRate="store.hourlyRate"
                :isAdmin="false"
              />
            </div>

            <!-- Étape 4 : Coordonnées -->
            <ClientInfo
              v-if="currentStep === 4"
              v-model:clientFirstName="store.clientFirstName"
              v-model:clientLastName="store.clientLastName"
              v-model:clientEmail="store.clientEmail"
              v-model:clientPhone="store.clientPhone"
              v-model:clientAddress="store.clientAddress"
              v-model:clientPostalCode="store.clientPostalCode"
              v-model:clientCity="store.clientCity"
              v-model:clientCountry="store.clientCountry"
              v-model:paymentMethod="store.paymentMethod"
            />

            <!-- Étape 5 : Confirmation -->
            <div v-if="currentStep === 5" class="client-confirm">
              <div class="confirm-hero">
                <span class="confirm-emoji">✅</span>
                <p class="confirm-title">Prêt à envoyer votre demande !</p>
                <p class="confirm-sub">
                  Votre devis personnalisé sera envoyé à
                  <strong>{{ store.clientEmail || '—' }}</strong> sous 24-48h.
                </p>
              </div>
              <div class="confirm-rows">
                <div class="confirm-row">
                  <span class="confirm-key">Type de projet</span>
                  <span class="confirm-val">{{ projectSeriesTypeLabel }}</span>
                </div>
                <div v-if="store.projectDescription" class="confirm-row">
                  <span class="confirm-key">Description</span>
                  <span class="confirm-val confirm-val--desc">{{ store.projectDescription }}</span>
                </div>
                <div v-if="store.defaultMaterial" class="confirm-row">
                  <span class="confirm-key">Matière</span>
                  <span class="confirm-val">{{ store.defaultMaterial }}</span>
                </div>
                <div class="confirm-row">
                  <span class="confirm-key">Quantité</span>
                  <span class="confirm-val">{{ store.pieces[0].quantity }} pièce(s)</span>
                </div>
                <div v-if="store.defaultColorCount > 1" class="confirm-row">
                  <span class="confirm-key">Couleurs</span>
                  <span class="confirm-val">{{ store.defaultColorCount }} couleurs</span>
                </div>
              </div>
              <p class="confirm-rgpd">
                En envoyant cette demande, vous acceptez que vos données soient utilisées pour établir votre devis.
              </p>
            </div>

          </template>

        </div>
      </div>

      <!-- ── Navigation bas ── -->
      <div class="step-nav">
        <button v-if="currentStep > 1" class="btn-back" @click="goBack">← Retour</button>
        <div class="step-nav-right">
          <button
            v-if="currentStep < steps.length"
            class="btn-next"
            @click="goNext"
          >
            Suivant →
          </button>
          <button
            v-if="currentStep === steps.length && isAdmin"
            class="btn-preview-devis"
            @click="showPreview = true"
            title="Aperçu du devis"
          >
            <Eye class="btn-preview-icon" />
            <span>Aperçu</span>
          </button>
          <button
            v-if="currentStep === steps.length"
            :class="['btn-save', saveStatus === 'ok' && 'btn-save-ok']"
            :disabled="saving"
            @click="saveQuote"
          >
            <span v-if="saving">Sauvegarde…</span>
            <span v-else-if="saveStatus === 'ok'">
              ✓ {{ isEditMode ? 'Devis mis à jour !' : (isAdmin ? 'Devis sauvegardé !' : 'Demande envoyée !') }}
            </span>
            <span v-else>
              {{ isEditMode ? 'Mettre à jour le devis' : (isAdmin ? 'Sauvegarder le devis' : 'Envoyer ma demande') }}
            </span>
          </button>
          <router-link
            v-if="currentStep === steps.length"
            to="/dashboard"
            class="btn-dash-icon"
            title="Mon tableau de bord"
          >
            <LayoutDashboard :size="18" />
          </router-link>
        </div>
      </div>

    </div>

    <ToastMessage ref="toast" />
    <QuotePreviewModal
      v-if="showPreview"
      :quote="previewQuote"
      @close="showPreview = false"
    />

  </div>
</template>

<script>
import { useCalculatorStore } from '@/stores/calculator'
import { saveQuote as saveQuoteToDb, updateQuote } from '@/utils/quotes'
import { checkIsAdmin } from '@/utils/auth'
import { supabase } from '@/lib/supabase'
import ProjectProjet     from '@/components/calculator/ProjectProjet.vue'
import ProjectDetails    from '@/components/calculator/ProjectDetails.vue'
import ProjectMatter     from '@/components/calculator/ProjectMatter.vue'
import ProjectPieces     from '@/components/calculator/ProjectPieces.vue'
import ProjectConditions from '@/components/calculator/ProjectConditions.vue'
import ClientInfo        from '@/components/calculator/ClientInfo.vue'
import FilamentSection   from '@/components/calculator/FilamentSection.vue'
import PrintingTime      from '@/components/calculator/PrintingTime.vue'
import PricingSuggestions from '@/components/calculator/PricingSuggestions.vue'
import CostBreakdown     from '@/components/calculator/CostBreakdown.vue'
import ToastMessage      from '@/components/ui/ToastMessage.vue'
import { Layers, Package, Clock, Tag, BarChart3, User, CheckCircle, Eye, LayoutDashboard, FileText, Palette } from 'lucide-vue-next'
import QuotePreviewModal from '@/components/ui/QuotePreviewModal.vue'

export default {
  name: 'CalculatorStep',
  components: {
    ProjectProjet, ProjectDetails, ProjectMatter, ProjectPieces, ProjectConditions,
    ClientInfo, FilamentSection, PrintingTime, PricingSuggestions, CostBreakdown,
    ToastMessage, QuotePreviewModal,
    Layers, Package, Clock, Tag, BarChart3, User, CheckCircle, Eye, LayoutDashboard,
    FileText, Palette,
  },
  setup() {
    return { store: useCalculatorStore() }
  },
  async created() {
    try {
      this.isAdmin = await checkIsAdmin()
    } catch {
      this.isAdmin = false
    }
    // Numéro séquentiel dès l'ouverture (pas de random — ni de stale)
    if (!this.store.editingQuoteId && !this.$route.query.editId) {
      if (this.store.quoteNumberIsStale || this.store.quoteNumber.endsWith('-000')) {
        this.store.quoteNumber = await this.generateSequentialQuoteNumber()
      }
    }
  },
  data() {
    return {
      isAdmin: false,
      saving: false,
      saveStatus: null,
      showPreview: false,
      ignoredPurge: 0,
      quantityPresets: [
        { value: 1,   label: '1 — Unique' },
        { value: 5,   label: '5' },
        { value: 10,  label: '10' },
        { value: 25,  label: '25' },
        { value: 50,  label: '50' },
        { value: 100, label: '100+' },
      ],
    }
  },
  computed: {
    currentStep()    { return Number(this.$route.params.step) || 1 },
    currentStepDef() { return this.steps[this.currentStep - 1] || this.steps[0] },
    isEditMode()     { return !!(this.store.editingQuoteId || this.$route.query.editId) },

    projectSeriesTypeLabel() {
      const labels = {
        unique: 'Pièce unique', deco: 'Décoration',
        portesCles: 'Porte-clés / Goodies', figurine: 'Figurine',
        carteVisite: 'Carte de visite 3D', standQR: 'Stand / QR Code', autre: 'Autre',
      }
      return labels[this.store.projectSeriesType] || 'Projet'
    },

    previewQuote() {
      const s   = this.store
      const c   = s.calculatedCosts
      const sp  = s.sellingPrices
      const margin   = sp.margin / 100
      const taxRate  = (Number(s.taxRate) || 20) / 100
      const coeff    = s.projectCoeff
      const overhead = c.equipmentCost + c.workCost + c.packagingCost
      const totalMat = c.materialCost || 0.001

      const displayName = s.clientType === 'particulier'
        ? [s.clientCivility, s.clientFirstName, s.clientLastName].filter(Boolean).join(' ')
        : s.clientName

      const items = s.pieces.map(p => {
        const qty   = Math.max(1, p.quantity || 1)
        const w     = p.weight || 0
        const loss  = (p.lossPercent || 0) / 100
        const purge = p.colorCount > 1 ? (p.purgeWaste || 0) : 0
        const pieceWeight  = w * qty * (1 + loss) + purge * qty
        const pieceMat     = (pieceWeight / 1000) * (p.costPerKg || 0)
        const pieceOverhead = (pieceMat / totalMat) * overhead
        const pieceCost    = (pieceMat + pieceOverhead) * coeff
        const pieceHT      = pieceCost * (1 + margin)
        const pieceTTC     = pieceHT * (1 + taxRate)
        const r = v => Math.round(v * 100) / 100
        return {
          id:               p.id,
          name:             p.name || '—',
          quantity:         qty,
          weight:           Math.round(pieceWeight * 10) / 10,
          material:         p.material || '—',
          colorCount:       p.colorCount || 1,
          referenceImageUrl: p.referenceImageUrl || '',
          unitPriceHT:      r(pieceHT / qty),
          totalTTC:         r(pieceTTC),
          tvaPart:          r(pieceTTC - pieceHT),
        }
      })

      return {
        quote_number:        s.quoteNumber,
        quote_date:          s.quoteDate,
        quote_validity_days: s.quoteValidityDays,
        status:              'pending',
        client_name:         displayName,
        client_contact_name: s.clientContactName,
        client_first_name:   s.clientFirstName,
        client_last_name:    s.clientLastName,
        client_civility:     s.clientCivility,
        client_email:        s.clientEmail,
        client_phone:        s.clientPhone,
        client_address:      s.clientAddress,
        client_postal_code:  s.clientPostalCode,
        client_city:         s.clientCity,
        client_country:      s.clientCountry,
        client_siret:        s.clientSiret,
        client_vat_number:   s.clientVatNumber,
        project_name:        s.pieces.length === 1
          ? (s.pieces[0].name || '')
          : `Multi-pièces (${s.pieces.length})`,
        quantity:            c.quantity,
        printer_model:       s.printerModel,
        nozzle_size:         s.nozzleSize,
        print_hours:         s.printHours,
        print_minutes:       s.printMinutes,
        tax_rate:            s.taxRate,
        payment_method:      s.paymentMethod,
        deposit_percent:     s.depositPercent,
        processing_delay:    s.processingDelay,
        delivery_delay:      s.deliveryDelay,
        quote_notes:         s.quoteNotes,
        material_cost:       c.materialCost,
        equipment_cost:      c.equipmentCost,
        work_cost:           c.workCost,
        subtotal_ht:         c.subtotal,
        margin_percent:      sp.margin,
        total_cost:          sp.totalTTC,
        cost_per_unit:       sp.pricePerUnit,
        items,
      }
    },

    steps() {
      if (this.isAdmin) {
        return [
          { step: 1, label: 'Projet',     icon: 'Package',    description: 'Type de projet, description, dimensions et finition.' },
          { step: 2, label: 'Matière',    icon: 'Palette',    description: 'Filament et nombre de couleurs.' },
          { step: 3, label: 'Client',     icon: 'User',       description: 'Informations client et adresse.' },
          { step: 4, label: 'Pièces',     icon: 'Layers',     description: 'Pièces à imprimer, filaments et images.' },
          { step: 5, label: 'Conditions', icon: 'FileText',   description: 'Paiement, délais et conditions du devis.' },
          { step: 6, label: 'Temps',      icon: 'Clock',      description: "Durée d'impression et temps de travail." },
          { step: 7, label: 'Tarifs',     icon: 'Tag',        description: 'Choisissez votre marge et la tarification.' },
          { step: 8, label: 'Coûts',      icon: 'BarChart3',  description: 'Résumé complet des coûts et total TTC.' },
        ]
      }
      return [
        { step: 1, label: 'Projet',          icon: 'Package',      description: 'Type de projet et description.' },
        { step: 2, label: 'Matière',         icon: 'Palette',      description: 'Filament et couleurs.' },
        { step: 3, label: 'Poids & Quantité',icon: 'Clock',        description: 'Poids estimé et nombre de pièces souhaitées.' },
        { step: 4, label: 'Vos coordonnées', icon: 'User',         description: 'Vos informations pour recevoir le devis.' },
        { step: 5, label: 'Confirmation',    icon: 'CheckCircle',  description: 'Récapitulatif et envoi de votre demande.' },
      ]
    },

  },

  methods: {
    navigateToStep(step) {
      if (step >= this.currentStep) return
      this.$router.push(`/calculator/${step}`)
    },

    validate() {
      const s = this.store
      if (this.currentStep === 2) {
        if (!s.defaultCostPerKg || s.defaultCostPerKg <= 0) return 'Veuillez sélectionner un filament.'
        return null
      }
      if (this.isAdmin) {
        switch (this.currentStep) {
          case 3: {
            const hasName = s.clientType === 'particulier'
              ? (s.clientFirstName?.trim() || s.clientLastName?.trim())
              : s.clientName?.trim()
            if (!hasName) return 'Le nom du client est obligatoire.'
            return null
          }
          case 4: {
            const hasNamedPiece = s.pieces.some(p => p.name?.trim())
            if (!hasNamedPiece) return 'Au moins une pièce doit avoir un nom.'
            return null
          }
          default: return null
        }
      }
      switch (this.currentStep) {
        case 3: return null
        case 4:
          if (!s.clientEmail?.trim()) return 'Votre adresse email est obligatoire pour recevoir le devis.'
          return null
        case 5: return null
        default: return null
      }
    },

    goNext() {
      const err = this.validate()
      if (err) { this.$refs.toast.show(err, 'error'); return }

      // Synchro étape 2 (Matière) → pièces sans filament affecté
      if (this.currentStep === 2) {
        this.store.pieces = this.store.pieces.map(p =>
          !p.materialId ? {
            ...p,
            materialId:  this.store.defaultMaterialId,
            material:    this.store.defaultMaterial,
            costPerKg:   this.store.defaultCostPerKg,
            lossPercent: this.store.defaultLossPercent,
          } : p
        )
      }

      const messages = [
        'Projet enregistré ✓',
        'Matière sélectionnée ✓',
        'Client enregistré ✓',
        'Pièces enregistrées ✓',
        'Conditions enregistrées ✓',
        'Temps enregistré ✓',
        'Tarif sélectionné ✓',
      ]
      this.$refs.toast.show(messages[this.currentStep - 1] || 'Étape validée ✓', 'success', 2000)
      this.$router.push(`/calculator/${this.currentStep + 1}`)
    },

    goBack() {
      this.$router.push(`/calculator/${this.currentStep - 1}`)
    },

    async generateSequentialQuoteNumber() {
      const d = new Date()
      const yy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateStr = `${yy}${mm}${dd}`
      const prefix  = `DEV-${dateStr}-`
      try {
        const { data } = await supabase
          .from('quotes').select('quote_number')
          .like('quote_number', `${prefix}%`)
          .order('quote_number', { ascending: false }).limit(1)
        let counter = 1
        if (data?.length) {
          const numPart = parseInt(data[0].quote_number.split('-').pop()) || 0
          counter = numPart + 1
        }
        return `${prefix}${String(counter).padStart(3, '0')}`
      } catch {
        return `${prefix}001`
      }
    },

    async saveQuote() {
      this.saving = true
      try {
        const c  = this.store.calculatedCosts
        const sp = this.store.sellingPrices
        const s  = this.store
        const displayName = s.clientType === 'particulier'
          ? [s.clientCivility, s.clientFirstName, s.clientLastName].filter(Boolean).join(' ')
          : s.clientName

        const editId = s.editingQuoteId || this.$route.query.editId || null
        const quoteNumber = editId ? s.quoteNumber : await this.generateSequentialQuoteNumber()
        if (!editId) s.quoteNumber = quoteNumber

        // Upload images pour toutes les pièces
        for (let i = 0; i < s.pieces.length; i++) {
          const piece = s.pieces[i]
          // Nettoyer les blob URLs périmées
          if ((piece.referenceImageUrl || '').startsWith('blob:')) {
            s.pieces[i] = { ...piece, referenceImageUrl: '' }
          }
          if (piece.referenceImage) {
            const ext  = piece.referenceImage.name.split('.').pop()
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            const { error: upErr } = await supabase.storage
              .from('quote-images').upload(path, piece.referenceImage, { upsert: true })
            if (!upErr) {
              const { data: urlData } = supabase.storage.from('quote-images').getPublicUrl(path)
              s.pieces[i] = { ...s.pieces[i], referenceImageUrl: urlData.publicUrl, referenceImage: null }
            }
          }
        }

        const payload = {
          quote_number: quoteNumber, quote_date: s.quoteDate,
          quote_validity_days: s.quoteValidityDays,
          payment_method: s.paymentMethod, deposit_percent: s.depositPercent,
          processing_delay: s.processingDelay, delivery_delay: s.deliveryDelay,
          quote_notes: s.quoteNotes,
          client_type: s.clientType, client_civility: s.clientCivility,
          client_first_name: s.clientFirstName, client_last_name: s.clientLastName,
          client_name: displayName, client_contact_name: s.clientContactName,
          client_email: s.clientEmail, client_phone: s.clientPhone,
          client_address: s.clientAddress, client_postal_code: s.clientPostalCode,
          client_city: s.clientCity, client_country: s.clientCountry,
          client_siret: s.clientSiret, client_vat_number: s.clientVatNumber,
          // Champs pièce (rétrocompat + first piece pour l'affichage dashboard)
          project_name: s.pieces.length === 1
            ? (s.pieces[0].name || '')
            : `Multi-pièces (${s.pieces.length})`,
          quantity:     c.quantity,
          project_type: s.projectType,
          project_series_type: s.projectSeriesType || null,
          project_description: s.projectDescription || null,
          print_profile: s.printProfile, printer_model: s.printerModel, nozzle_size: s.nozzleSize,
          material:      s.pieces[0]?.material || s.defaultMaterial || '',
          weight:        c.totalWeight,
          print_hours: s.printHours, print_minutes: s.printMinutes,
          prep_time: s.prepTime, post_time: s.postTime, hourly_rate: s.hourlyRate,
          packaging_cost: s.packagingCost, tax_rate: s.taxRate,
          selected_pricing: s.selectedPricing, custom_margin: s.customMargin,
          material_cost: c.materialCost, equipment_cost: c.equipmentCost,
          work_cost: c.workCost, subtotal_ht: c.subtotal,
          margin_percent: sp.margin,
          total_cost: sp.totalTTC, cost_per_unit: sp.pricePerUnit,
          // Image rétrocompat (première pièce avec image)
          reference_image_url: s.pieces.find(p => p.referenceImageUrl)?.referenceImageUrl || null,
          // Tableau complet des pièces
          items: s.pieces.map(p => ({
            id: p.id, name: p.name, quantity: p.quantity || 1,
            weight: p.weight || 0, lossPercent: p.lossPercent || 5,
            colorCount: p.colorCount || 1, purgeWaste: p.purgeWaste || 0,
            materialId: p.materialId || null, material: p.material || '',
            costPerKg: p.costPerKg || 0,
            referenceImageUrl: p.referenceImageUrl || null,
          })),
        }

        let savedQuote
        if (editId) {
          savedQuote = await updateQuote(editId, payload)
          this.$refs.toast.show('Devis mis à jour avec succès !', 'success')
          s.editingQuoteId = null
          this.$router.replace({ query: {} })
          setTimeout(() => this.$router.push('/dashboard'), 1500)
        } else {
          savedQuote = await saveQuoteToDb(payload)
          this.$refs.toast.show(this.isAdmin ? 'Devis sauvegardé !' : 'Demande envoyée !', 'success')
          supabase.functions.invoke('send-quote-email', { body: { quote: savedQuote } }).catch(() => {})
          setTimeout(() => { s.resetForNewQuote(); this.$router.push('/dashboard') }, 1500)
        }
        this.saveStatus = 'ok'
      } catch {
        this.saveStatus = null
        this.$refs.toast.show('Erreur lors de la sauvegarde. Réessaie.', 'error')
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   PAGE : layout principal
══════════════════════════════════════════════════ */
.step-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #f0f4f8;
  padding: 4.5rem 1.25rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ── Stepper ── */
.stepper {
  width: 100%;
  max-width: 640px;
  background: #fff;
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.07);
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}
/* Desktop : dots visibles, barre cachée */
.stepper--mobile { display: none; }
.stepper--desktop { display: block; }

.stepper-track {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  position: relative;
}

.step-line {
  position: absolute;
  top: 1rem;
  right: calc(50% + 1.1rem);
  left: calc(-50% + 1.1rem);
  height: 2px;
  background: #e2e8f0;
  transition: background 0.3s ease;
}

.step-line-done { background: #2e9cab; }

.step-dot {
  position: relative;
  z-index: 1;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #a0aec0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.step-dot:disabled { cursor: default; }

.dot-active {
  border-color: #2e9cab;
  background: #2e9cab;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(46,156,171,0.15);
  transform: scale(1.12);
}

.dot-done {
  border-color: #2e9cab;
  background: #e8f7f9;
  color: #2e9cab;
  cursor: pointer;
}

.dot-icon  { width: 0.9rem; height: 0.9rem; }
.dot-check { font-size: 0.78rem; font-weight: 700; }

.step-label { font-size: 0.68rem; font-weight: 600; color: #a0aec0; text-align: center; white-space: nowrap; }
.label-active { color: #2e9cab; font-weight: 700; }
.label-done   { color: #1f7f97; }

/* ── Zone de contenu ── */
.content-area {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex-shrink: 0;
}

/* ── Carte de l'étape ── */
.step-card {
  width: 100%;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.09);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 172px);
  flex-shrink: 1;
}

.step-card-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  background: linear-gradient(135deg, #f8fffe 0%, #fff 100%);
  flex-shrink: 0;
}

.step-card-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e8f7f9 0%, #d0f0f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-card-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #2e9cab;
}

.step-card-eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2e9cab;
  margin: 0 0 0.1rem;
}

.step-card-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.1rem;
  letter-spacing: -0.02em;
}

.step-card-desc {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

.step-card-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.step-card-body::-webkit-scrollbar { display: none; }

/* ── Navigation bas ── */
.step-nav {
  width: 100%;
  max-width: 580px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-shrink: 0;
}

.step-nav-right {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn-back {
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 999px;
  background: rgba(255,255,255,0.88);
  box-shadow: 0 2px 10px rgba(0,0,0,0.09);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #718096;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.btn-back:hover { color: #2e9cab; transform: translateY(-1px); border-color: #b2e8ef; }

.btn-next {
  padding: 0.55rem 1.35rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.35);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.btn-next:hover { filter: brightness(1.07); transform: translateY(-1px); }

.btn-dash-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 50%;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  color: #718096;
  text-decoration: none;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.btn-dash-icon:hover { border-color: #2e9cab; color: #2e9cab; background: #e8f7f9; }

.btn-preview-devis {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  border: 1.5px solid #2e9cab;
  border-radius: 999px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  color: #2e9cab;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}
.btn-preview-devis:hover { background: #e8f7f9; transform: translateY(-1px); }
.btn-preview-icon { width: 0.9rem; height: 0.9rem; }

.btn-save {
  padding: 0.55rem 1.35rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.35);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.btn-save:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save-ok {
  background: linear-gradient(180deg, #2ecc71 0%, #27ae60 100%);
  box-shadow: 0 4px 14px rgba(39,174,96,0.35);
}

/* ══════════════════════════════════════════════════
   CLIENT STEP 2 : Quantité + Poids
══════════════════════════════════════════════════ */
.client-step2 { display: flex; flex-direction: column; }
.qty-block { padding: 1rem 1.25rem 0.75rem; border-bottom: 1px solid #f0f4f8; }
.qty-title { font-size: 0.7rem; font-weight: 800; color: #4a5568; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 0.65rem; }
.qty-buttons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.qty-btn {
  padding: 0.45rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; font-size: 0.82rem; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all 0.18s ease; color: #4a5568;
}
.qty-btn:hover { border-color: #2e9cab; color: #2e9cab; }
.qty-btn--active { border-color: #2e9cab; background: #2e9cab; color: #fff; }
.qty-hint { font-size: 0.72rem; color: #a0aec0; margin: 0.45rem 0 0; }

/* ══════════════════════════════════════════════════
   CLIENT STEP 4 : Confirmation
══════════════════════════════════════════════════ */
.client-confirm { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.confirm-hero { text-align: center; padding: 1rem 0 0.5rem; }
.confirm-emoji { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
.confirm-title { font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0 0 0.3rem; }
.confirm-sub { font-size: 0.82rem; color: #718096; margin: 0; }
.confirm-rows { background: #f8fffe; border: 1.5px solid #b2e8ef; border-radius: 12px; overflow: hidden; }
.confirm-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.55rem 1rem; border-bottom: 1px solid #e8f7f9; }
.confirm-row:last-child { border-bottom: none; }
.confirm-key { font-size: 0.78rem; font-weight: 600; color: #718096; flex-shrink: 0; }
.confirm-val { font-size: 0.82rem; font-weight: 700; color: #1b2f39; text-align: right; }
.confirm-val--desc { font-weight: 400; white-space: pre-wrap; word-break: break-word; }
.confirm-rgpd { font-size: 0.68rem; color: #a0aec0; text-align: center; margin: 0; }

/* ══════════════════════════════════════════════════
   RESPONSIVE MOBILE (< 640px)
══════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .step-page {
    padding: 0.75rem 0.85rem 5rem;
    gap: 0.45rem;
    justify-content: flex-start;
  }

  /* ── Stepper mobile : barre de progression ── */
  .stepper--desktop { display: none; }
  .stepper--mobile  { display: block; padding: 0.6rem 1rem; }
  .mobile-step-info {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.4rem;
  }
  .mobile-step-num {
    font-size: 0.65rem; font-weight: 700; color: #a0aec0;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .mobile-step-label { font-size: 0.82rem; font-weight: 800; color: #2e9cab; }
  .mobile-progress-track {
    height: 4px; background: #e2e8f0; border-radius: 999px; overflow: hidden;
  }
  .mobile-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3fb2bf, #2e9cab);
    border-radius: 999px;
    transition: width 0.35s ease;
  }

  .content-area {
    flex: 1;
    min-height: 0;
    gap: 0.5rem;
  }

  .step-card {
    max-height: calc(100dvh - 214px);
    border-radius: 16px;
  }

  .step-card-header {
    padding: 0.7rem 1rem;
    gap: 0.6rem;
  }

  .step-card-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .step-card-icon {
    width: 1.1rem;
    height: 1.1rem;
  }

  .step-card-title { font-size: 0.9rem; }
  .step-card-desc  { font-size: 0.7rem; }

  .step-nav {
    padding: 0;
    gap: 0.5rem;
  }

  .step-nav-right {
    flex: 1;
  }

  .btn-back {
    padding: 0.62rem 1rem;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .btn-next,
  .btn-save {
    flex: 1;
    padding: 0.62rem 1rem;
    font-size: 0.88rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .btn-preview-devis {
    padding: 0.62rem 0.85rem;
    font-size: 0.82rem;
  }
}

@media (max-width: 380px) {
  .step-page  { padding: 0.6rem 0.7rem 5rem; }
  .stepper    { padding: 0.55rem 0.7rem; }
  .step-dot   { width: 1.6rem; height: 1.6rem; }
}
</style>
