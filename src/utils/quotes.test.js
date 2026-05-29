import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted garantit que mockChain et mockGetUser sont déclarés avant le hissage de vi.mock
const { mockChain, mockGetUser } = vi.hoisted(() => {
  const mockChain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq:     vi.fn(),
    or:     vi.fn(),
    order:  vi.fn(),
    single: vi.fn(),
    range:  vi.fn(),
  }
  return { mockChain, mockGetUser: vi.fn() }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    auth: { getUser: mockGetUser },
  },
}))

import { getQuotes, archiveQuote, saveQuote, getArchivedQuotes } from './quotes'

beforeEach(() => {
  vi.clearAllMocks()
  // Méthodes chaînables — retournent toujours mockChain
  mockChain.select.mockReturnValue(mockChain)
  mockChain.insert.mockReturnValue(mockChain)
  mockChain.update.mockReturnValue(mockChain)
  mockChain.delete.mockReturnValue(mockChain)
  mockChain.or.mockReturnValue(mockChain)
  // Méthodes terminales par défaut
  mockChain.order.mockResolvedValue({ data: [], error: null })
  mockChain.single.mockResolvedValue({ data: null, error: null })
  // eq : pas de défaut global — chaque describe configure selon son usage
})

// ── getQuotes ─────────────────────────────────────────────────────────────────

describe('getQuotes', () => {
  it('retourne le tableau de devis', async () => {
    const fakeQuotes = [{ id: '1', project_name: 'Test' }]
    mockChain.order.mockResolvedValue({ data: fakeQuotes, error: null })

    const result = await getQuotes()
    expect(result).toEqual(fakeQuotes)
  })

  it('lève une erreur si Supabase renvoie une erreur', async () => {
    mockChain.order.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    await expect(getQuotes()).rejects.toMatchObject({ message: 'DB error' })
  })
})

// ── getArchivedQuotes ─────────────────────────────────────────────────────────
// getArchivedQuotes : .select().eq().order() → eq est mi-chaîne, doit retourner mockChain

describe('getArchivedQuotes', () => {
  beforeEach(() => {
    mockChain.eq.mockReturnValue(mockChain) // chainable ici
  })

  it('retourne un tableau vide si data est null', async () => {
    mockChain.order.mockResolvedValue({ data: null, error: null })
    const result = await getArchivedQuotes()
    expect(result).toEqual([])
  })

  it('retourne les devis archivés', async () => {
    const archived = [{ id: '2', archived: true }]
    mockChain.order.mockResolvedValue({ data: archived, error: null })
    const result = await getArchivedQuotes()
    expect(result).toEqual(archived)
  })
})

// ── archiveQuote ──────────────────────────────────────────────────────────────
// archiveQuote : .update().eq() → eq est terminal (awaitable)

describe('archiveQuote', () => {
  beforeEach(() => {
    mockChain.eq.mockResolvedValue({ error: null }) // terminal ici
  })

  it('appelle update avec archived: true et le bon id', async () => {
    await archiveQuote('abc-123')

    const { supabase } = await import('@/lib/supabase')
    expect(supabase.from).toHaveBeenCalledWith('quotes')
    expect(mockChain.update).toHaveBeenCalledWith({ archived: true })
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'abc-123')
  })

  it('lève une erreur si Supabase renvoie une erreur', async () => {
    mockChain.eq.mockResolvedValue({ error: { message: 'Archive failed' } })
    await expect(archiveQuote('abc-123')).rejects.toMatchObject({ message: 'Archive failed' })
  })
})

// ── saveQuote ─────────────────────────────────────────────────────────────────

describe('saveQuote', () => {
  it('insère le devis avec le user_id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const fakeQuote = { id: 'q-1', project_name: 'Figurine' }
    mockChain.single.mockResolvedValue({ data: fakeQuote, error: null })

    const result = await saveQuote({ project_name: 'Figurine' })

    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', project_name: 'Figurine' })
    )
    expect(result).toEqual(fakeQuote)
  })

  it('lève une erreur si l\'insertion échoue', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockChain.single.mockResolvedValue({ data: null, error: { message: 'Insert error' } })
    await expect(saveQuote({ project_name: 'Test' })).rejects.toMatchObject({ message: 'Insert error' })
  })
})
