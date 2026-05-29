import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted garantit que ces variables sont déclarées avant le hissage de vi.mock
const { mockSignIn, mockSignOut, mockGetSession, mockGetUser, mockRpc } = vi.hoisted(() => ({
  mockSignIn:      vi.fn(),
  mockSignOut:     vi.fn(),
  mockGetSession:  vi.fn(),
  mockGetUser:     vi.fn(),
  mockRpc:         vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      signOut:            mockSignOut,
      getSession:         mockGetSession,
      getUser:            mockGetUser,
    },
    rpc: mockRpc,
  },
}))

import { login, logout, isAuthenticated, getCurrentUser, checkIsAdmin } from './auth'

beforeEach(() => {
  vi.clearAllMocks()
})

// ── login ─────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('retourne les données de session en cas de succès', async () => {
    const fakeData = { session: { user: { id: 'u1' } } }
    mockSignIn.mockResolvedValue({ data: fakeData, error: null })

    const result = await login({ email: 'a@b.com', password: 'secret' })
    expect(result).toEqual(fakeData)
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' })
  })

  it('lève une erreur si les identifiants sont incorrects', async () => {
    mockSignIn.mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } })
    await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toMatchObject({
      message: 'Invalid credentials',
    })
  })
})

// ── logout ────────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('appelle signOut sans erreur', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    await expect(logout()).resolves.toBeUndefined()
    expect(mockSignOut).toHaveBeenCalledOnce()
  })

  it('lève une erreur si signOut échoue', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'Sign out error' } })
    await expect(logout()).rejects.toMatchObject({ message: 'Sign out error' })
  })
})

// ── isAuthenticated ───────────────────────────────────────────────────────────

describe('isAuthenticated', () => {
  it('retourne true si une session est active', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: {} } } })
    expect(await isAuthenticated()).toBe(true)
  })

  it('retourne false si aucune session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    expect(await isAuthenticated()).toBe(false)
  })
})

// ── getCurrentUser ────────────────────────────────────────────────────────────

describe('getCurrentUser', () => {
  it('retourne l\'utilisateur courant', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com' }
    mockGetUser.mockResolvedValue({ data: { user: fakeUser } })
    expect(await getCurrentUser()).toEqual(fakeUser)
  })

  it('retourne null si aucun utilisateur', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    expect(await getCurrentUser()).toBeNull()
  })
})

// ── checkIsAdmin ──────────────────────────────────────────────────────────────

describe('checkIsAdmin', () => {
  it('retourne true si rpc is_admin renvoie true', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    expect(await checkIsAdmin()).toBe(true)
  })

  it('retourne false si rpc is_admin renvoie false', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null })
    expect(await checkIsAdmin()).toBe(false)
  })

  it('retourne false si rpc échoue', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } })
    expect(await checkIsAdmin()).toBe(false)
  })
})
