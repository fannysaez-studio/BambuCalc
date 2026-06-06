import { defineStore } from 'pinia'

function genQuoteNumber() {
  const d = new Date()
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `DEV-${yy}${mm}${dd}-000` // remplacé par le séquentiel réel dans created()
}

export const useCalculatorStore = defineStore('calculator', {
  state: () => ({
    // Devis
    quoteNumber: genQuoteNumber(),
    quoteDate: new Date().toISOString().split('T')[0],
    quoteValidityDays: 30,

    // Client — identité
    clientType: 'particulier',
    clientCivility: 'M.',
    clientFirstName: '',
    clientLastName: '',
    clientName: '',
    clientContactName: '',
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
    projectType: 'standard',
    projectSeriesType: 'unique',
    projectDescription: '',
    projectWidth: null, // mm
    projectLength: null, // mm
    projectHeight: null, // mm
    projectFinish: 'brut', // brut | ponce | peint | vernis | assemble | autre
    projectFinishNote: '', // texte libre si "autre"

    // Conditions devis
    paymentMethod: 'virement',
    depositPercent: 0,
    quoteNotes: '',

    // Filament par défaut (sélectionné à l'étape 1, sert de modèle aux nouvelles pièces)
    defaultMaterialId: null,
    defaultMaterial: 'PLA+',
    defaultCostPerKg: 16.99,
    defaultLossPercent: 5,
    defaultColorCount: 1,

    // Tableau de pièces (remplace les anciens champs plats projectName/quantity/weight/etc.)
    pieces: [
      {
        id: 'piece-1',
        name: '',
        quantity: 1,
        weight: 0,
        lossPercent: 5,
        colorCount: 1,
        purgeWaste: 0,
        materialId: null,
        material: '',
        costPerKg: 0,
        referenceImage: null,
        referenceImageUrl: '',
      },
    ],

    // Temps
    printHours: 0,
    printMinutes: 0,
    prepTime: 15,
    postTime: 0,

    // Coûts équipement
    electricityRate: 0.23,
    printerCost: 1800,
    printerLifeHours: 4000,
    maintenanceRate: 0.1,
    hourlyRate: 20,

    // Délais
    processingDelay: '5-7j',
    deliveryDelay: 'pickup',

    // Autres
    packagingCost: 0,
    taxRate: 0,
    selectedPricing: 'standard',
    customMargin: 50,

    // Impression
    printProfile: 'normal',
    printerModel: 'p2s-combo',
    nozzleSize: '0.4',

    // Mode édition admin
    editingQuoteId: null,
  }),

  getters: {
    // Marge en % selon l'option choisie à l'étape 5
    marginPercent(state) {
      const presets = { ami: 15, standard: 40, pro: 65 }
      return presets[state.selectedPricing] ?? Number(state.customMargin) ?? 40
    },

    // Nom affiché selon le type de client
    displayClientName(state) {
      if (state.clientType === 'particulier') {
        const parts = [state.clientCivility, state.clientFirstName, state.clientLastName].filter(
          Boolean,
        )
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

    projectCoeff(state) {
      const types = [
        { id: 'standard', coeff: 1.0 },
        { id: 'figurine', coeff: 1.3 },
        { id: 'serie', coeff: 0.85 },
        { id: 'cartevisite', coeff: 1.05 },
        { id: 'standqr', coeff: 1.1 },
        { id: 'deco', coeff: 1.0 },
      ]
      return types.find((t) => t.id === state.projectType)?.coeff ?? 1
    },

    calculatedCosts(state) {
      const r = (v) => Math.round(v * 100) / 100

      // Coût matière — somme sur toutes les pièces
      let materialCost = 0
      let totalWeightAll = 0
      const piecesDetail = state.pieces.map((p) => {
        const qty = Math.max(1, Number(p.quantity) || 1)
        const w = Number(p.weight) || 0
        const loss = (Number(p.lossPercent) || 0) / 100
        const purge = Number(p.colorCount) > 1 ? Number(p.purgeWaste) || 0 : 0
        const pieceWeight = w * qty * (1 + loss) + purge * qty
        const pieceMaterial = (pieceWeight / 1000) * (Number(p.costPerKg) || 0)
        totalWeightAll += pieceWeight
        materialCost += pieceMaterial
        return {
          id: p.id,
          name: p.name,
          quantity: qty,
          weight: r(pieceWeight),
          materialCost: r(pieceMaterial),
        }
      })

      // Coût équipement — global (basé sur le temps d'impression total)
      const printH = (Number(state.printHours) || 0) + (Number(state.printMinutes) || 0) / 60
      const electricity = printH * 0.35 * (Number(state.electricityRate) || 0)
      const amortization =
        ((Number(state.printerCost) || 0) / (Number(state.printerLifeHours) || 4000)) * printH
      const maintenance = (Number(state.maintenanceRate) || 0) * printH
      const equipmentCost = electricity + amortization + maintenance

      // Coût main-d'œuvre — global
      const workMinutes = (Number(state.prepTime) || 0) + (Number(state.postTime) || 0)
      const workCost = (workMinutes / 60) * (Number(state.hourlyRate) || 0)

      const packagingCost = Number(state.packagingCost) || 0
      const coeff = this.projectCoeff
      const subtotal = (materialCost + equipmentCost + workCost + packagingCost) * coeff
      const tax = (subtotal * (Number(state.taxRate) || 0)) / 100
      const totalCost = subtotal + tax
      const totalQty = Math.max(
        1,
        state.pieces.reduce((s, p) => s + (Number(p.quantity) || 1), 0),
      )

      return {
        quantity: totalQty,
        totalWeight: r(totalWeightAll),
        materialCost: r(materialCost),
        electricity: r(electricity),
        amortization: r(amortization),
        maintenance: r(maintenance),
        equipmentCost: r(equipmentCost),
        workCost: r(workCost),
        packagingCost: r(packagingCost),
        subtotal: r(subtotal),
        tax: r(tax),
        totalCost: r(totalCost),
        costPerUnit: r(totalCost / totalQty),
        pieces: piecesDetail,
      }
    },

    sellingPrices(state) {
      const costs = this.calculatedCosts
      const margin = this.marginPercent
      const qty = costs.quantity
      const taxRate = state.taxRate != null ? Number(state.taxRate) : 0
      const r = (v) => Math.round(v * 100) / 100

      const sellingHT = costs.subtotal * (1 + margin / 100)
      const sellingTax = sellingHT * (taxRate / 100)
      const sellingTTC = sellingHT + sellingTax

      return {
        margin,
        subtotalHT: r(sellingHT),
        tax: r(sellingTax),
        totalTTC: r(sellingTTC),
        pricePerUnit: r(sellingTTC / qty),
      }
    },
  },

  actions: {
    resetForNewQuote() {
      this.$patch({
        editingQuoteId: null,
        quoteNumber: genQuoteNumber(),
        quoteDate: new Date().toISOString().split('T')[0],
        quoteValidityDays: 30,
        clientType: 'particulier',
        clientCivility: 'M.',
        clientFirstName: '',
        clientLastName: '',
        clientName: '',
        clientContactName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientPostalCode: '',
        clientCity: '',
        clientCountry: 'France',
        clientSiret: '',
        clientVatNumber: '',
        projectType: 'standard',
        projectSeriesType: 'unique',
        projectDescription: '',
        projectWidth: null,
        projectLength: null,
        projectHeight: null,
        projectFinish: 'brut',
        projectFinishNote: '',
        paymentMethod: 'virement',
        depositPercent: 0,
        quoteNotes: '',
        defaultMaterialId: null,
        defaultMaterial: 'PLA+',
        defaultCostPerKg: 16.99,
        defaultLossPercent: 5,
        defaultColorCount: 1,
        pieces: [
          {
            id: 'piece-1',
            name: '',
            quantity: 1,
            weight: 0,
            lossPercent: 5,
            colorCount: 1,
            purgeWaste: 0,
            materialId: null,
            material: '',
            costPerKg: 0,
            referenceImage: null,
            referenceImageUrl: '',
          },
        ],
        printHours: 0,
        printMinutes: 0,
        prepTime: 15,
        postTime: 0,
        processingDelay: '5-7j',
        deliveryDelay: 'pickup',
        packagingCost: 0,
        selectedPricing: 'standard',
        customMargin: 50,
      })
    },
  },

  persist: {
    key: 'bambucalc-calculator',
    storage: localStorage,
    pick: [
      'quoteNumber', 'quoteDate', 'quoteValidityDays',
      'paymentMethod', 'depositPercent', 'processingDelay', 'deliveryDelay', 'quoteNotes',
      'clientType', 'clientCivility', 'clientFirstName', 'clientLastName',
      'clientContactName', 'clientEmail', 'clientPhone',
      'clientAddress', 'clientPostalCode', 'clientCity', 'clientCountry',
      'clientSiret', 'clientVatNumber',
      'projectType', 'projectSeriesType', 'projectDescription',
      'projectLength', 'projectWidth', 'projectHeight', 'projectFinish', 'projectFinishNote',
      'defaultMaterial', 'defaultCostPerKg', 'defaultWastePercent', 'defaultColorCount',
      'pieces',
      'printHours', 'printMinutes', 'prepTime', 'postTime', 'hourlyRate',
      'packagingCost', 'taxRate', 'selectedPricing', 'customMargin',
      'printProfile', 'printerModel', 'nozzleSize',
      'editingQuoteId',
    ],
    serializer: {
      // Les objets File ne sont pas sérialisables — on les vide avant la persistance
      serialize: (state) => {
        const clean = { ...state }
        if (clean.pieces) {
          clean.pieces = clean.pieces.map(p => ({ ...p, referenceImage: null }))
        }
        return JSON.stringify(clean)
      },
      deserialize: JSON.parse,
    },
  },
})
