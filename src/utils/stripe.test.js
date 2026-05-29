import { describe, it, expect, beforeEach } from 'vitest'
import { hasStripeConsent, loadStripeConditionally, unloadStripe } from './stripe'

beforeEach(() => {
  localStorage.clear()
  unloadStripe()
})

describe('hasStripeConsent', () => {
  it('retourne false si aucun choix stocké', () => {
    expect(hasStripeConsent()).toBe(false)
  })

  it('retourne true si cookie_consent = "all"', () => {
    localStorage.setItem('cookie_consent', 'all')
    expect(hasStripeConsent()).toBe(true)
  })

  it('retourne false si cookie_consent = "essential"', () => {
    localStorage.setItem('cookie_consent', 'essential')
    expect(hasStripeConsent()).toBe(false)
  })
})

describe('loadStripeConditionally', () => {
  it('retourne null sans consentement', async () => {
    const result = await loadStripeConditionally()
    expect(result).toBeNull()
  })

  it('retourne null si consentement = "essential"', async () => {
    localStorage.setItem('cookie_consent', 'essential')
    const result = await loadStripeConditionally()
    expect(result).toBeNull()
  })

  it('retourne null si consentement = "all" mais VITE_STRIPE_PUBLIC_KEY absente', async () => {
    // En environnement de test, VITE_STRIPE_PUBLIC_KEY n'est pas définie
    localStorage.setItem('cookie_consent', 'all')
    const result = await loadStripeConditionally()
    expect(result).toBeNull()
  })
})
