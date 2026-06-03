import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalculatorStore } from './calculator'

beforeEach(() => {
  setActivePinia(createPinia())
})

// ── marginPercent ─────────────────────────────────────────────────────────────

describe('marginPercent', () => {
  it('retourne 15 pour ami', () => {
    const store = useCalculatorStore()
    store.selectedPricing = 'ami'
    expect(store.marginPercent).toBe(15)
  })

  it('retourne 40 pour standard', () => {
    const store = useCalculatorStore()
    store.selectedPricing = 'standard'
    expect(store.marginPercent).toBe(40)
  })

  it('retourne 65 pour pro', () => {
    const store = useCalculatorStore()
    store.selectedPricing = 'pro'
    expect(store.marginPercent).toBe(65)
  })

  it('retourne la marge custom si selectedPricing est inconnu', () => {
    const store = useCalculatorStore()
    store.selectedPricing = 'custom'
    store.customMargin = 30
    expect(store.marginPercent).toBe(30)
  })
})

// ── projectCoeff ──────────────────────────────────────────────────────────────

describe('projectCoeff', () => {
  it('standard → 1.00', () => {
    const store = useCalculatorStore()
    store.projectType = 'standard'
    expect(store.projectCoeff).toBe(1.00)
  })

  it('figurine → 1.30', () => {
    const store = useCalculatorStore()
    store.projectType = 'figurine'
    expect(store.projectCoeff).toBe(1.30)
  })

  it('serie → 0.85', () => {
    const store = useCalculatorStore()
    store.projectType = 'serie'
    expect(store.projectCoeff).toBe(0.85)
  })

  it('type inconnu → 1 par défaut', () => {
    const store = useCalculatorStore()
    store.projectType = 'inconnu'
    expect(store.projectCoeff).toBe(1)
  })
})

// ── displayClientName ─────────────────────────────────────────────────────────

describe('displayClientName', () => {
  it('particulier : civilité + prénom + nom', () => {
    const store = useCalculatorStore()
    store.clientType = 'particulier'
    store.clientCivility = 'Mme'
    store.clientFirstName = 'Alice'
    store.clientLastName = 'Dupont'
    expect(store.displayClientName).toBe('Mme Alice Dupont')
  })

  it('entreprise : retourne la raison sociale', () => {
    const store = useCalculatorStore()
    store.clientType = 'entreprise'
    store.clientName = 'Acme SAS'
    expect(store.displayClientName).toBe('Acme SAS')
  })
})

// ── calculatedCosts ───────────────────────────────────────────────────────────

describe('calculatedCosts', () => {
  function storeWithOnePiece(weight, costPerKg, lossPercent = 0, colorCount = 1, purgeWaste = 0) {
    const store = useCalculatorStore()
    store.pieces = [{
      id: 'p1', name: 'Test', quantity: 1,
      weight, costPerKg, lossPercent, colorCount, purgeWaste,
      materialId: null, material: '', referenceImage: null, referenceImageUrl: '',
    }]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 0;   store.postTime = 0
    store.packagingCost = 0
    return store
  }

  it('retourne tout à zéro si aucune valeur saisie', () => {
    const store = storeWithOnePiece(0, 0)
    const costs = store.calculatedCosts
    expect(costs.materialCost).toBe(0)
    expect(costs.equipmentCost).toBe(0)
    expect(costs.workCost).toBe(0)
    expect(costs.totalCost).toBe(0)
  })

  it('calcule le coût matière avec perte sur une pièce', () => {
    const store = storeWithOnePiece(100, 16.99, 5)
    // lossWeight = 5g, totalWeight = 105g, matCost = (105/1000)*16.99 = 1.78395 → 1.78
    const costs = store.calculatedCosts
    expect(costs.totalWeight).toBe(105)
    expect(costs.materialCost).toBe(1.78)
  })

  it('somme le coût matière de deux pièces différentes', () => {
    const store = useCalculatorStore()
    store.pieces = [
      { id: 'p1', name: 'A', quantity: 1, weight: 100, costPerKg: 10,
        lossPercent: 0, colorCount: 1, purgeWaste: 0,
        materialId: null, material: '', referenceImage: null, referenceImageUrl: '' },
      { id: 'p2', name: 'B', quantity: 2, weight: 50,  costPerKg: 20,
        lossPercent: 0, colorCount: 1, purgeWaste: 0,
        materialId: null, material: '', referenceImage: null, referenceImageUrl: '' },
    ]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 0;   store.postTime = 0
    store.packagingCost = 0
    // pA = (100/1000)*10 = 1.00, pB = (2*50/1000)*20 = 2.00, total = 3.00
    expect(store.calculatedCosts.materialCost).toBe(3)
  })

  it('totalQty = somme des quantités de toutes les pièces', () => {
    const store = useCalculatorStore()
    store.pieces = [
      { id: 'p1', quantity: 3, weight: 0, costPerKg: 0, lossPercent: 0,
        colorCount: 1, purgeWaste: 0, name: '', materialId: null, material: '',
        referenceImage: null, referenceImageUrl: '' },
      { id: 'p2', quantity: 2, weight: 0, costPerKg: 0, lossPercent: 0,
        colorCount: 1, purgeWaste: 0, name: '', materialId: null, material: '',
        referenceImage: null, referenceImageUrl: '' },
    ]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 60;  store.postTime = 0
    store.hourlyRate = 60; store.packagingCost = 0; store.taxRate = 0
    // workCost = 60€, quantity = 5, costPerUnit = 12€
    expect(store.calculatedCosts.quantity).toBe(5)
    expect(store.calculatedCosts.costPerUnit).toBe(12)
  })

  it('calcule correctement le coût équipement (global)', () => {
    const store = storeWithOnePiece(0, 0)
    store.printHours = 2; store.printMinutes = 0
    store.electricityRate = 0.23
    store.printerCost = 1800; store.printerLifeHours = 4000
    store.maintenanceRate = 0.10
    // electricity = 2*0.35*0.23 = 0.161 → 0.16
    // amortization = (1800/4000)*2 = 0.9
    // maintenance = 0.10*2 = 0.2, total = 1.261 → 1.26
    const costs = store.calculatedCosts
    expect(costs.electricity).toBe(0.16)
    expect(costs.amortization).toBe(0.9)
    expect(costs.equipmentCost).toBe(1.26)
  })

  it('calcule correctement le coût de main-d\'œuvre', () => {
    const store = storeWithOnePiece(0, 0)
    store.prepTime = 30; store.postTime = 30; store.hourlyRate = 20
    // workCost = (60min/60) * 20 = 20
    expect(store.calculatedCosts.workCost).toBe(20)
  })

  it('applique le coeff projet figurine (1.30)', () => {
    const store = storeWithOnePiece(0, 0)
    store.packagingCost = 100
    store.projectType = 'figurine'
    store.taxRate = 0
    // subtotal = 100 * 1.30 = 130
    expect(store.calculatedCosts.subtotal).toBe(130)
  })

  it('expose le détail matière par pièce dans .pieces', () => {
    const store = useCalculatorStore()
    store.pieces = [
      { id: 'p1', name: 'Boîtier', quantity: 2, weight: 50, costPerKg: 20,
        lossPercent: 0, colorCount: 1, purgeWaste: 0,
        materialId: null, material: '', referenceImage: null, referenceImageUrl: '' },
    ]
    store.printHours = 0; store.printMinutes = 0; store.prepTime = 0
    store.postTime = 0; store.packagingCost = 0
    // pieceWeight = 50*2 = 100g, materialCost = (100/1000)*20 = 2.00
    const detail = store.calculatedCosts.pieces[0]
    expect(detail.name).toBe('Boîtier')
    expect(detail.weight).toBe(100)
    expect(detail.materialCost).toBe(2)
  })
})

// ── sellingPrices ─────────────────────────────────────────────────────────────

describe('sellingPrices', () => {
  function storeWithSubtotal100() {
    const store = useCalculatorStore()
    store.packagingCost = 100
    store.taxRate = 20
    store.projectType = 'standard'
    store.pieces = [{
      id: 'p1', name: '', quantity: 1, weight: 0, costPerKg: 0,
      lossPercent: 0, colorCount: 1, purgeWaste: 0,
      materialId: null, material: '', referenceImage: null, referenceImageUrl: '',
    }]
    store.printHours = 0; store.printMinutes = 0
    store.prepTime = 0;   store.postTime = 0
    return store
  }

  it('marge ami (15%) → TTC = 138', () => {
    const store = storeWithSubtotal100()
    store.selectedPricing = 'ami'
    // sellingHT = 100*1.15 = 115, tax = 23, TTC = 138
    expect(store.sellingPrices.subtotalHT).toBe(115)
    expect(store.sellingPrices.totalTTC).toBe(138)
  })

  it('marge standard (40%) → TTC = 168', () => {
    const store = storeWithSubtotal100()
    store.selectedPricing = 'standard'
    expect(store.sellingPrices.totalTTC).toBe(168)
  })

  it('marge pro (65%) → TTC = 198', () => {
    const store = storeWithSubtotal100()
    store.selectedPricing = 'pro'
    expect(store.sellingPrices.totalTTC).toBe(198)
  })
})

// ── resetForNewQuote ──────────────────────────────────────────────────────────

describe('resetForNewQuote', () => {
  it('vide les champs client et remet pieces à une pièce vide', () => {
    const store = useCalculatorStore()
    store.clientFirstName = 'Alice'
    store.clientEmail = 'alice@test.com'
    store.pieces[0].name = 'Mon projet'
    store.pieces[0].quantity = 5

    store.resetForNewQuote()

    expect(store.clientFirstName).toBe('')
    expect(store.clientEmail).toBe('')
    expect(store.pieces.length).toBe(1)
    expect(store.pieces[0].name).toBe('')
    expect(store.pieces[0].quantity).toBe(1)
  })

  it('conserve les paramètres équipement', () => {
    const store = useCalculatorStore()
    store.electricityRate = 0.30
    store.printerCost = 2500
    store.hourlyRate = 35

    store.resetForNewQuote()

    expect(store.electricityRate).toBe(0.30)
    expect(store.printerCost).toBe(2500)
    expect(store.hourlyRate).toBe(35)
  })

  it('génère un nouveau numéro de devis', () => {
    const store = useCalculatorStore()
    const before = store.quoteNumber
    store.resetForNewQuote()
    expect(store.quoteNumber).toMatch(/^DEV-\d{8}-\d{4}$/)
    expect(store.quoteNumber).not.toBe(before)
  })
})
