import { describe, it, expect } from 'vitest'
import {
  deriveFormat,
  ledPresence,
  getObjectRdv,
  fmtDate,
  fmtTime,
  duration,
} from './rdvUtils'

// ── deriveFormat ──────────────────────────────────────────────────────────────

describe('deriveFormat', () => {
  it('retourne online pour google_conference', () => {
    const a = { raw: { payload: { scheduled_event: { location: { type: 'google_conference' } } } } }
    expect(deriveFormat(a)).toBe('online')
  })

  it('retourne online pour zoom', () => {
    const a = { raw: { payload: { scheduled_event: { location: { type: 'zoom' } } } } }
    expect(deriveFormat(a)).toBe('online')
  })

  it('retourne inperson pour type inconnu', () => {
    const a = { raw: { payload: { scheduled_event: { location: { type: 'custom_location' } } } } }
    expect(deriveFormat(a)).toBe('inperson')
  })

  it('retourne inperson si raw est null', () => {
    expect(deriveFormat({ raw: null })).toBe('inperson')
  })

  it('retourne inperson si raw est absent', () => {
    expect(deriveFormat({})).toBe('inperson')
  })
})

// ── ledPresence ───────────────────────────────────────────────────────────────

describe('ledPresence', () => {
  it('retourne present', () => {
    expect(ledPresence({ presence: 'present' })).toBe('present')
  })

  it('retourne absent', () => {
    expect(ledPresence({ presence: 'absent' })).toBe('absent')
  })

  it('retourne unknown pour null', () => {
    expect(ledPresence({ presence: null })).toBe('unknown')
  })

  it("retourne unknown si presence est absent de l'objet", () => {
    expect(ledPresence({})).toBe('unknown')
  })
})

// ── getObjectRdv ──────────────────────────────────────────────────────────────

describe('getObjectRdv', () => {
  it('retourne la première réponse Calendly', () => {
    const a = { raw: { payload: { questions_and_answers: [{ answer: 'Mon projet figurine' }] } } }
    expect(getObjectRdv(a)).toBe('Mon projet figurine')
  })

  it('retourne — pour un tableau vide', () => {
    const a = { raw: { payload: { questions_and_answers: [] } } }
    expect(getObjectRdv(a)).toBe('—')
  })

  it('retourne — pour une réponse vide (espaces)', () => {
    const a = { raw: { payload: { questions_and_answers: [{ answer: '   ' }] } } }
    expect(getObjectRdv(a)).toBe('—')
  })

  it('retourne — si raw est null', () => {
    expect(getObjectRdv({ raw: null })).toBe('—')
  })

  it('retourne — si raw est absent', () => {
    expect(getObjectRdv({})).toBe('—')
  })
})

// ── fmtDate ───────────────────────────────────────────────────────────────────

describe('fmtDate', () => {
  it('formate une date ISO en dd/mm/yyyy', () => {
    expect(fmtDate('2026-06-04T12:00:00Z')).toMatch(/04\/06\/2026/)
  })

  it('retourne — pour null', () => {
    expect(fmtDate(null)).toBe('—')
  })

  it('retourne — pour undefined', () => {
    expect(fmtDate(undefined)).toBe('—')
  })
})

// ── fmtTime ───────────────────────────────────────────────────────────────────

describe('fmtTime', () => {
  it('retourne une chaîne hh:mm', () => {
    expect(fmtTime('2026-06-04T14:30:00Z')).toMatch(/\d{2}:\d{2}/)
  })

  it('retourne "" pour null', () => {
    expect(fmtTime(null)).toBe('')
  })

  it('retourne "" pour undefined', () => {
    expect(fmtTime(undefined)).toBe('')
  })
})

// ── duration ──────────────────────────────────────────────────────────────────

describe('duration', () => {
  it('retourne 30 min', () => {
    expect(duration('2026-06-04T14:00:00Z', '2026-06-04T14:30:00Z')).toBe('30 min')
  })

  it('retourne 60 min', () => {
    expect(duration('2026-06-04T09:00:00Z', '2026-06-04T10:00:00Z')).toBe('60 min')
  })

  it('retourne — si start est null', () => {
    expect(duration(null, '2026-06-04T14:30:00Z')).toBe('—')
  })

  it('retourne — si end est null', () => {
    expect(duration('2026-06-04T14:00:00Z', null)).toBe('—')
  })

  it('retourne — si les deux sont null', () => {
    expect(duration(null, null)).toBe('—')
  })
})
