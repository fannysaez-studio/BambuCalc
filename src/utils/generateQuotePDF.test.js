import { describe, it, expect, vi } from 'vitest'

vi.mock('jspdf', () => ({ jsPDF: vi.fn() }))
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }))
vi.mock('@/config/company', () => ({
  company: { name: 'BambuCalc Test', email: 'test@bambucalc.fr' },
}))
// formatters are real (pure functions, no side effects)

import {
  fmtEur,
  fmtDate,
  validityDate,
  processingLabel,
  deliveryLabel,
  paymentLabel,
  statusInfo,
} from './generateQuotePDF'

// ── fmtEur ────────────────────────────────────────────────────────────────────

describe('fmtEur', () => {
  it('formate zéro', () => {
    expect(fmtEur(0)).toMatch(/0.*€/)
  })

  it('formate une valeur décimale', () => {
    expect(fmtEur(10.5)).toMatch(/10/)
  })

  it('traite null comme 0', () => {
    expect(fmtEur(null)).toMatch(/0.*€/)
  })

  it('traite undefined comme 0', () => {
    expect(fmtEur(undefined)).toMatch(/0.*€/)
  })

  it('inclut le symbole euro', () => {
    expect(fmtEur(42)).toContain('€')
  })
})

// ── fmtDate ───────────────────────────────────────────────────────────────────

describe('fmtDate', () => {
  it('retourne "—" pour null', () => {
    expect(fmtDate(null)).toBe('—')
  })

  it('retourne "—" pour undefined', () => {
    expect(fmtDate(undefined)).toBe('—')
  })

  it('retourne "—" pour chaîne vide', () => {
    expect(fmtDate('')).toBe('—')
  })

  it('formate une date ISO valide', () => {
    const result = fmtDate('2026-05-01')
    expect(result).toContain('2026')
    expect(result).not.toBe('—')
  })
})

// ── validityDate ──────────────────────────────────────────────────────────────

describe('validityDate', () => {
  it('retourne "—" si quoteDate est absent', () => {
    expect(validityDate(null, 30)).toBe('—')
  })

  it('retourne "—" si days est absent', () => {
    expect(validityDate('2026-05-01', null)).toBe('—')
  })

  it('retourne "—" si days est 0', () => {
    expect(validityDate('2026-05-01', 0)).toBe('—')
  })

  it('ajoute le bon nombre de jours', () => {
    const result = validityDate('2026-05-01', 30)
    expect(result).toContain('2026')
    expect(result).not.toBe('—')
  })

  it('accepte days en chaîne', () => {
    const result = validityDate('2026-05-01', '30')
    expect(result).not.toBe('—')
  })
})

// ── processingLabel ───────────────────────────────────────────────────────────

describe('processingLabel', () => {
  it.each([
    ['24h',  '24 heures'],
    ['2-3j', '2 à 3 jours ouvrés'],
    ['5-7j', '5 à 7 jours ouvrés'],
    ['1-2s', '1 à 2 semaines'],
    ['2-4s', '2 à 4 semaines'],
    ['custom', 'À convenir'],
  ])('traduit "%s"', (input, expected) => {
    expect(processingLabel(input)).toBe(expected)
  })

  it('retourne la valeur brute pour un code inconnu', () => {
    expect(processingLabel('autre')).toBe('autre')
  })

  it('retourne "" pour undefined', () => {
    expect(processingLabel(undefined)).toBe('')
  })

  it('retourne "" pour chaîne vide', () => {
    expect(processingLabel('')).toBe('')
  })
})

// ── deliveryLabel ─────────────────────────────────────────────────────────────

describe('deliveryLabel', () => {
  it.each([
    ['pickup',     'Retrait en main propre'],
    ['colissimo',  'Colissimo (2-3 j)'],
    ['chronopost', 'Chronopost (J+1)'],
    ['mondial',    'Mondial Relay (3-5 j)'],
    ['custom',     'À convenir'],
  ])('traduit "%s"', (input, expected) => {
    expect(deliveryLabel(input)).toBe(expected)
  })

  it('retourne la valeur brute pour un code inconnu', () => {
    expect(deliveryLabel('drone')).toBe('drone')
  })

  it('retourne "" pour undefined', () => {
    expect(deliveryLabel(undefined)).toBe('')
  })
})

// ── paymentLabel ──────────────────────────────────────────────────────────────

describe('paymentLabel', () => {
  it.each([
    ['virement', 'Virement bancaire'],
    ['cheque',   'Chèque'],
    ['cb',       'Carte bancaire'],
    ['especes',  'Espèces'],
    ['paypal',   'PayPal'],
  ])('traduit "%s"', (input, expected) => {
    expect(paymentLabel(input)).toBe(expected)
  })

  it('retourne "Virement bancaire" par défaut pour undefined', () => {
    expect(paymentLabel(undefined)).toBe('Virement bancaire')
  })

  it('retourne "Virement bancaire" par défaut pour chaîne vide', () => {
    expect(paymentLabel('')).toBe('Virement bancaire')
  })

  it('retourne la valeur brute pour un code inconnu', () => {
    expect(paymentLabel('crypto')).toBe('crypto')
  })
})

// ── statusInfo ────────────────────────────────────────────────────────────────

describe('statusInfo', () => {
  it.each([
    ['pending',  'En attente'],
    ['accepted', 'Accepté'],
    ['refused',  'Refusé'],
    ['sent',     'Envoyé'],
  ])('retourne le bon label pour "%s"', (status, label) => {
    expect(statusInfo(status).label).toBe(label)
  })

  it('chaque statut a une couleur et un fond', () => {
    for (const s of ['pending', 'accepted', 'refused', 'sent']) {
      const info = statusInfo(s)
      expect(info.color).toHaveLength(3)
      expect(info.bg).toHaveLength(3)
    }
  })

  it('retourne le statut "pending" pour un statut inconnu', () => {
    expect(statusInfo('inconnu').label).toBe('En attente')
  })

  it('retourne le statut "pending" pour undefined', () => {
    expect(statusInfo(undefined).label).toBe('En attente')
  })
})
