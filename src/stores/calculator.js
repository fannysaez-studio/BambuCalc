import { defineStore } from 'pinia'

function genQuoteNumber() {
  const d = new Date()
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `DEV-${yy}${mm}${dd}-${rand}`
}

export const useCalculatorStore = defineStore('calculator', {
  state: () => ({
    // Devis
    quoteNumber: genQuoteNumber(),
    quoteDate: new Date().toISOString().split('T')[0],
    quoteValidityDays: 30,

    // Client — identité
    clientType: 'particulier',   // particulier | auto-entrepreneur | entreprise | association
    clientCivility: 'M.',        // M. | Mme (affiché pour particulier)
    clientFirstName: '',
    clientLastName: '',
    clientName: '',              // raison sociale (entreprise/asso) ou nom complet
    clientContactName: '',       // nom du contact (entreprise/asso)
    clientEmail: '',
    clientPhone: '',

    // Client — adresse
    clientAddress: '',
    clientPostalCode: '',
    clientCity: '',
    clientCountry: 'France',

    // Client — facturation
    clientSiret: '',
    clientVatNumber: '',

    // Projet
    projectName: '',
    projectType: 'standard',
    projectSeriesType: 'unique',
    projectDescription: '',
    quantity: 1,
    printProfile: 'normal',
    printerModel: 'p2s-combo',
    nozzleSize: '0.4',

    // Conditions devis
    paymentMethod: 'virement',   // virement | chèque | cb | espèces
    depositPercent: 0,
    quoteNotes: '',

    // Matière
    materialId: null,
    material: 'PLA+',
    costPerKg: 16.99,
    weight: 0,
    lossPercent: 5,
    colorCount: 1,
    purgeWaste: 0,
    amsCoefficient: 1.25,

    // Temps
    printHours: 0,
    printMinutes: 0,
    prepTime: 15,
    postTime: 0,

    // Coûts équipement
    electricityRate: 0.23,
    printerCost: 1800,
    printerLifeHours: 4000,
    maintenanceRate: 0.10,
    hourlyRate: 20,

    // Délais
    processingDelay: '5-7j',
    deliveryDelay:   'pickup',

    // Autres
    packagingCost: 0,
    taxRate: 20,
    selectedPricing: 'standard',
    customMargin: 50,

    // Image de référence
    referenceImage: null,
    referenceImageUrl: '',

    // Mode édition admin (ID du devis à mettre à jour)
    editingQuoteId: null,
  }),

  getters: {
    // Marge en % selon l'option choisie à l'étape 4
    marginPercent(state) {
      const presets = { ami: 15, standard: 40, pro: 65 }
      return presets[state.selectedPricing] ?? Number(state.customMargin) ?? 40
    },

    // Prix de vente final (marge appliquée sur HT, TVA recalculée)
    sellingPrices(state) {
      const costs = this.calculatedCosts
      const margin = this.marginPercent
      const qty = Math.max(1, Number(state.quantity) || 1)
      const taxRate = Number(state.taxRate) || 20
      const r = (v) => Math.round(v * 100) / 100

      const sellingHT  = costs.subtotal * (1 + margin / 100)
      const sellingTax = sellingHT * (taxRate / 100)
      const sellingTTC = sellingHT + sellingTax

      return {
        margin,
        subtotalHT:   r(sellingHT),
        tax:          r(sellingTax),
        totalTTC:     r(sellingTTC),
        pricePerUnit: r(sellingTTC / qty),
      }
    },

    // Nom affiché selon le type de client
    displayClientName(state) {
      if (state.clientType === 'particulier') {
        const parts = [state.clientCivility, state.clientFirstName, state.clientLastName].filter(Boolean)
        return parts.join(' ') || state.clientName || ''
      }
      return state.clientName || ''
    },

    // Indique si le numéro de devis date d'un autre jour (SPA gardée ouverte la nuit)
    quoteNumberIsStale(state) {
      const today = new Date()
      const yy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      return !state.quoteNumber.includes(`${yy}${mm}${dd}`)
    },

    purgeWeightAuto(state) {
      if (Number(state.colorCount) <= 1) return 0
      return Math.round((Number(state.weight) || 0) * ((Number(state.amsCoefficient) || 1.25) - 1))
    },

    projectCoeff(state) {
      const types = [
        { id: 'standard',    coeff: 1.00 },
        { id: 'figurine',    coeff: 1.30 },
        { id: 'serie',       coeff: 0.85 },
        { id: 'cartevisite', coeff: 1.05 },
        { id: 'standqr',     coeff: 1.10 },
        { id: 'deco',        coeff: 1.00 },
      ]
      return types.find(t => t.id === state.projectType)?.coeff ?? 1
    },

    calculatedCosts(state) {
      const r = (v) => Math.round(v * 100) / 100

      const lossWeight   = (Number(state.weight) || 0) * (Number(state.lossPercent) || 0) / 100
      const purgeWeight  = Number(state.colorCount) > 1 ? (Number(state.purgeWaste) || 0) : 0
      const totalWeight  = (Number(state.weight) || 0) + lossWeight + purgeWeight
      const materialCost = (totalWeight / 1000) * (Number(state.costPerKg) || 0)

      const printH       = (Number(state.printHours) || 0) + (Number(state.printMinutes) || 0) / 60
      const electricity  = printH * 0.35 * (Number(state.electricityRate) || 0)
      const amortization = (Number(state.printerCost) || 0) / (Number(state.printerLifeHours) || 4000) * printH
      const maintenance  = (Number(state.maintenanceRate) || 0) * printH
      const equipmentCost = electricity + amortization + maintenance

      const workMinutes  = (Number(state.prepTime) || 0) + (Number(state.postTime) || 0)
      const workCost     = (workMinutes / 60) * (Number(state.hourlyRate) || 0)

      const packagingCost = Number(state.packagingCost) || 0
      const coeff         = this.projectCoeff
      const subtotal      = (materialCost + equipmentCost + workCost + packagingCost) * coeff
      const tax           = (subtotal * (Number(state.taxRate) || 0)) / 100
      const totalCost     = subtotal + tax
      const qty           = Math.max(1, Number(state.quantity) || 1)

      return {
        quantity:      qty,
        totalWeight:   r(totalWeight),
        materialCost:  r(materialCost),
        electricity:   r(electricity),
        amortization:  r(amortization),
        maintenance:   r(maintenance),
        equipmentCost: r(equipmentCost),
        workCost:      r(workCost),
        packagingCost: r(packagingCost),
        subtotal:      r(subtotal),
        tax:           r(tax),
        totalCost:     r(totalCost),
        costPerUnit:   r(totalCost / qty),
      }
    },
  },

  actions: {
    // Remet le store à zéro pour un nouveau devis (garde les paramètres équipement)
    resetForNewQuote() {
      this.$patch({
        editingQuoteId:    null,
        quoteNumber:       genQuoteNumber(),
        quoteDate:         new Date().toISOString().split('T')[0],
        quoteValidityDays: 30,
        clientType:        'particulier',
        clientCivility:    'M.',
        clientFirstName:   '',
        clientLastName:    '',
        clientName:        '',
        clientContactName: '',
        clientEmail:       '',
        clientPhone:       '',
        clientAddress:     '',
        clientPostalCode:  '',
        clientCity:        '',
        clientCountry:     'France',
        clientSiret:       '',
        clientVatNumber:   '',
        projectName:       '',
        projectType:       'standard',
        projectSeriesType: 'unique',
        projectDescription:'',
        quantity:          1,
        paymentMethod:     'virement',
        depositPercent:    0,
        quoteNotes:        '',
        materialId:        null,
        material:          'PLA+',
        costPerKg:         16.99,
        weight:            0,
        lossPercent:       5,
        colorCount:        1,
        purgeWaste:        0,
        amsCoefficient:    1.25,
        printHours:        0,
        printMinutes:      0,
        prepTime:          15,
        postTime:          0,
        processingDelay:   '5-7j',
        deliveryDelay:     'pickup',
        packagingCost:     0,
        selectedPricing:   'standard',
        customMargin:      50,
        referenceImage:    null,
        referenceImageUrl: '',
      })
    },
  },
})
