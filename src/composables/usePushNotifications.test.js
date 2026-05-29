import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks Supabase ────────────────────────────────────────────────────────────

const { mockGetUser, mockFrom } = vi.hoisted(() => {
  const mockFrom = {
    upsert: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn(),
    eq:     vi.fn(),
  }
  mockFrom.delete.mockReturnValue(mockFrom)
  mockFrom.eq.mockReturnValue(mockFrom)

  return { mockGetUser: vi.fn(), mockFrom }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from:  vi.fn(() => mockFrom),
  },
}))

// ── Stubs navigateur ──────────────────────────────────────────────────────────

function makePushSubscription(endpoint = 'https://push.example.com/sub1') {
  return {
    endpoint,
    toJSON: () => ({ endpoint, keys: { p256dh: 'p256dh-value', auth: 'auth-value' } }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  }
}

function makeServiceWorkerReg(sub = null) {
  return {
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(sub),
      subscribe:       vi.fn().mockResolvedValue(makePushSubscription()),
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  vi.stubGlobal('Notification', {
    permission:        'default',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  })

  const reg = makeServiceWorkerReg()
  vi.stubGlobal('navigator', {
    serviceWorker: {
      register: vi.fn().mockResolvedValue(reg),
      ready:    Promise.resolve(reg),
    },
  })

  vi.stubGlobal('PushManager', {})
})

afterEach(() => {
  vi.unstubAllGlobals()
})

import { usePushNotifications } from './usePushNotifications'

// ── isSupported ───────────────────────────────────────────────────────────────

describe('isSupported', () => {
  it('est true quand serviceWorker et PushManager sont disponibles', () => {
    const { isSupported } = usePushNotifications()
    expect(isSupported).toBe(true)
  })
})

// ── init ──────────────────────────────────────────────────────────────────────

describe('init', () => {
  it('met isSubscribed à false quand aucune souscription existante', async () => {
    const { init, isSubscribed } = usePushNotifications()
    await init()
    expect(isSubscribed.value).toBe(false)
  })

  it('met isSubscribed à true si une souscription existe déjà', async () => {
    const sub = makePushSubscription()
    const reg = makeServiceWorkerReg(sub)
    navigator.serviceWorker.register.mockResolvedValue(reg)

    const { init, isSubscribed } = usePushNotifications()
    await init()
    expect(isSubscribed.value).toBe(true)
  })

  it('ne plante pas si serviceWorker.register échoue', async () => {
    navigator.serviceWorker.register.mockRejectedValue(new Error('SW error'))
    const { init } = usePushNotifications()
    await expect(init()).resolves.toBeUndefined()
  })
})

// ── subscribe ─────────────────────────────────────────────────────────────────

describe('subscribe', () => {
  it('ne souscrit pas si la permission est refusée', async () => {
    Notification.requestPermission.mockResolvedValue('denied')
    const { subscribe, isSubscribed, permission } = usePushNotifications()
    await subscribe()
    expect(isSubscribed.value).toBe(false)
    expect(permission.value).toBe('denied')
  })

  it('souscrit et sauvegarde en base si permission accordée', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const { subscribe, isSubscribed } = usePushNotifications()
    await subscribe()

    expect(isSubscribed.value).toBe(true)
    const { supabase } = await import('@/lib/supabase')
    expect(supabase.from).toHaveBeenCalledWith('push_subscriptions')
    expect(mockFrom.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', endpoint: 'https://push.example.com/sub1' }),
      expect.any(Object),
    )
  })

  it('ne sauvegarde pas si l\'utilisateur est absent', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { subscribe, isSubscribed } = usePushNotifications()
    await subscribe()
    expect(isSubscribed.value).toBe(false)
  })

  it('loading repasse à false après exécution', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { subscribe, loading } = usePushNotifications()
    await subscribe()
    expect(loading.value).toBe(false)
  })
})

// ── unsubscribe ───────────────────────────────────────────────────────────────

describe('unsubscribe', () => {
  it('met isSubscribed à false', async () => {
    const { unsubscribe, isSubscribed } = usePushNotifications()
    await unsubscribe()
    expect(isSubscribed.value).toBe(false)
  })

  it('loading repasse à false après exécution', async () => {
    const { unsubscribe, loading } = usePushNotifications()
    await unsubscribe()
    expect(loading.value).toBe(false)
  })

  it('appelle sub.unsubscribe() si une souscription existe', async () => {
    const sub = makePushSubscription()
    const reg = makeServiceWorkerReg(sub)
    navigator.serviceWorker.ready = Promise.resolve(reg)

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const { unsubscribe } = usePushNotifications()
    await unsubscribe()

    expect(sub.unsubscribe).toHaveBeenCalledOnce()
  })

  it('ne plante pas si aucune souscription active', async () => {
    const reg = makeServiceWorkerReg(null)
    navigator.serviceWorker.ready = Promise.resolve(reg)

    const { unsubscribe } = usePushNotifications()
    await expect(unsubscribe()).resolves.toBeUndefined()
  })
})

// ── valeurs initiales ─────────────────────────────────────────────────────────

describe('valeurs initiales', () => {
  it('isSubscribed démarre à false', () => {
    const { isSubscribed } = usePushNotifications()
    expect(isSubscribed.value).toBe(false)
  })

  it('loading démarre à false', () => {
    const { loading } = usePushNotifications()
    expect(loading.value).toBe(false)
  })

  it('expose les méthodes attendues', () => {
    const result = usePushNotifications()
    expect(typeof result.init).toBe('function')
    expect(typeof result.subscribe).toBe('function')
    expect(typeof result.unsubscribe).toBe('function')
  })
})
