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

// ── purgeWeightAuto ───────────────────────────────────────────────────────────

describe('purgeWeightAuto', () => {
  it('retourne 0 avec une seule couleur', () => {
    const store = useCalculatorStore()
    store.colorCount = 1
    store.weight = 200
    store.amsCoefficient = 1.25
    expect(store.purgeWeightAuto).toBe(0)
  })

  it('calcule la purge AMS avec plusieurs couleurs', () => {
    const store = useCalculatorStore()
    store.colorCount = 2
    store.weight = 200
    store.amsCoefficient = 1.25
    // purge = round(200 * (1.25 - 1)) = round(50) = 50
    expect(store.purgeWeightAuto).toBe(50)
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
  it('retourne tout à zéro si aucune valeur saisie', () => {
    const store = useCalculatorStore()
    store.weight = 0
    store.costPerKg = 0
    store.printHours = 0
    store.printMinutes = 0
    store.prepTime = 0
    store.postTime = 0
    store.packagingCost = 0

    const costs = store.calculatedCosts
    expect(costs.materialCost).toBe(0)
    expect(costs.equipmentCost).toBe(0)
    expect(costs.workCost).toBe(0)
    expect(costs.totalCost).toBe(0)
  })

  it('calcule correctement le coût matière avec perte', () => {
    const store = useCalculatorStore()
    // 100g PLA+ à 16.99€/kg, 5% perte, 1 couleur
    store.weight = 100
    store.costPerKg = 16.99
    store.lossPercent = 5
    store.colorCount = 1
    store.purgeWaste = 0
    store.printHours = 0
    store.printMinutes = 0
    store.prepTime = 0
    store.postTime = 0
    store.packagingCost = 0

    // lossWeight = 5g, totalWeight = 105g
    // materialCost = (105/1000) * 16.99 = 1.78395 → 1.78
    const costs = store.calculatedCosts
    expect(costs.totalWeight).toBe(105)
    expect(costs.materialCost).toBe(1.78)
  })

  it('calcule correctement le coût équipement', () => {
    const store = useCalculatorStore()
    store.weight = 0
    store.costPerKg = 0
    store.lossPercent = 0
    store.printHours = 2
    store.printMinutes = 0
    store.electricityRate = 0.23
    store.printerCost = 1800
    store.printerLifeHours = 4000
    store.maintenanceRate = 0.10
    store.prepTime = 0
    store.postTime = 0
    store.packagingCost = 0

    // electricity = 2 * 0.35 * 0.23 = 0.161 → 0.16
    // amortization = (1800/4000) * 2 = 0.9
    // maintenance = 0.10 * 2 = 0.2
    // equipmentCost = 1.261 → 1.26
    const costs = store.calculatedCosts
    expect(costs.electricity).toBe(0.16)
    expect(costs.amortization).toBe(0.9)
    expect(costs.equipmentCost).toBe(1.26)
  })

  it('calcule correctement le coût de main-d\'œuvre', () => {
    const store = useCalculatorStore()
    store.weight = 0
    store.costPerKg = 0
    store.printHours = 0
    store.printMinutes = 0
    store.prepTime = 30
    store.postTime = 30
    store.hourlyRate = 20
    store.packagingCost = 0

    // workCost = (60 min / 60) * 20 = 20
    const costs = store.calculatedCosts
    expect(costs.workCost).toBe(20)
  })

  it('applique le coeff projet figurine (1.30)', () => {
    const store = useCalculatorStore()
    store.packagingCost = 100
    store.projectType = 'figurine'
    store.taxRate = 0
    store.weight = 0
    store.costPerKg = 0
    store.printHours = 0
    store.printMinutes = 0
    store.prepTime = 0
    store.postTime = 0

    // subtotal = 100 * 1.30 = 130
    const costs = store.calculatedCosts
    expect(costs.subtotal).toBe(130)
  })

  it('gère une quantité > 1 pour costPerUnit', () => {
    const store = useCalculatorStore()
    store.packagingCost = 0
    store.taxRate = 0
    store.weight = 0
    store.costPerKg = 0
    store.printHours = 0
    store.printMinutes = 0
    store.prepTime = 60
    store.postTime = 0
    store.hourlyRate = 60
    store.quantity = 3
    // workCost = 60€, totalCost = 60€, costPerUnit = 20€
    const costs = store.calculatedCosts
    expect(costs.costPerUnit).toBe(20)
  })
})

// ── sellingPrices ─────────────────────────────────────────────────────────────

describe('sellingPrices', () => {
  // Setup : packagingCost = 100 pour avoir subtotal = 100 (tout le reste à 0)
  function storeWithSubtotal100() {
    const store = useCalculatorStore()
    store.packagingCost = 100
    store.taxRate = 20
    store.projectType = 'standard'
    store.weight = 0
    store.costPerKg = 0
    store.printHours = 0
    store.printMinutes = 0
    store.prepTime = 0
    store.postTime = 0
    store.quantity = 1
    return store
  }

  it('marge ami (15%) → TTC = 138', () => {
    const store = storeWithSubtotal100()
    store.selectedPricing = 'ami'
    // sellingHT = 100 * 1.15 = 115, tax = 23, TTC = 138
    expect(store.sellingPrices.subtotalHT).toBe(115)
    expect(store.sellingPrices.totalTTC).toBe(138)
  })

  it('marge standard (40%) → TTC = 168', () => {
    const store = storeWithSubtotal100()
    store.selectedPricing = 'standard'
    // sellingHT = 140, tax = 28, TTC = 168
    expect(store.sellingPrices.totalTTC).toBe(168)
  })

  it('marge pro (65%) → TTC = 198', () => {
    const store = storeWithSubtotal100()
    store.selectedPricing = 'pro'
    // sellingHT = 165, tax = 33, TTC = 198
    expect(store.sellingPrices.totalTTC).toBe(198)
  })
})

// ── resetForNewQuote ──────────────────────────────────────────────────────────

describe('resetForNewQuote', () => {
  it('vide les champs client et projet', () => {
    const store = useCalculatorStore()
    store.clientFirstName = 'Alice'
    store.clientEmail = 'alice@test.com'
    store.projectName = 'Mon projet'
    store.quantity = 5

    store.resetForNewQuote()

    expect(store.clientFirstName).toBe('')
    expect(store.clientEmail).toBe('')
    expect(store.projectName).toBe('')
    expect(store.quantity).toBe(1)
  })

  it('conserve les paramètres équipement', () => {
    const store = useCalculatorStore()
    store.electricityRate = 0.30
    store.printerCost = 2500
    store.hourlyRate = 35

    store.resetForNewQuote()

    // Ces champs ne font pas partie du reset
    expect(store.electricityRate).toBe(0.30)
    expect(store.printerCost).toBe(2500)
    expect(store.hourlyRate).toBe(35)
  })

  it('génère un nouveau numéro de devis', () => {
    const store = useCalculatorStore()
    const before = store.quoteNumber
    store.resetForNewQuote()
    // Le numéro doit changer (nouveau random à 4 chiffres)
    expect(store.quoteNumber).toMatch(/^DEV-\d{8}-\d{4}$/)
    // Statistiquement très peu probable qu'ils soient identiques
    expect(store.quoteNumber).not.toBe(before)
  })
})
