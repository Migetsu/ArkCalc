import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '~/stores/userStore'
import type { UserAuthSession } from '~/types'

describe('User Authentication & Long-term Session Store', () => {
  const storageMap = new Map<string, string>()
  const mockLocalStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, value: string) => storageMap.set(key, String(value)),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
  }

  beforeAll(() => {
    // Provide browser-like localStorage & window for Node test environment
    globalThis.localStorage = mockLocalStorage as any
    globalThis.window = globalThis as any
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    storageMap.clear()
    vi.restoreAllMocks()
  })

  it('initializes with no active session by default', () => {
    const store = useUserStore()
    expect(store.authSession).toBeNull()
    expect(store.hasSavedSession).toBe(false)
    expect(store.savedSessionEmail).toBe('')
    expect(store.savedSessionServer).toBe('en')
  })

  it('saves session into state and writes to localStorage for maximum persistence', () => {
    const store = useUserStore()
    const mockSession: UserAuthSession = {
      uid: '12345678',
      token: 'yostar_secret_token_abc123',
      email: 'doctor@rhodesisland.com',
      server: 'en',
      savedAt: new Date().toISOString(),
    }

    store.setAuthSession(mockSession)

    expect(store.authSession).toEqual(mockSession)
    expect(store.hasSavedSession).toBe(true)
    expect(store.savedSessionEmail).toBe('doctor@rhodesisland.com')
    expect(store.savedSessionServer).toBe('en')

    // Verify localStorage item is written
    const stored = localStorage.getItem('arkcalc_yostar_session')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed.uid).toBe('12345678')
    expect(parsed.token).toBe('yostar_secret_token_abc123')
  })

  it('clears session from state and removes from localStorage when requested', () => {
    const store = useUserStore()
    store.setAuthSession({
      uid: '12345678',
      token: 'yostar_secret_token_abc123',
      email: 'doctor@rhodesisland.com',
      server: 'en',
      savedAt: new Date().toISOString(),
    })

    expect(store.hasSavedSession).toBe(true)
    expect(localStorage.getItem('arkcalc_yostar_session')).toBeTruthy()

    store.clearAuthSession()

    expect(store.authSession).toBeNull()
    expect(store.hasSavedSession).toBe(false)
    expect(localStorage.getItem('arkcalc_yostar_session')).toBeNull()
  })

  it('automatically captures and persists session from syncFromArkprtsData payload', async () => {
    const store = useUserStore()
    const syncPayload = {
      profile: {
        uid: '99887766',
        nickname: 'Doctor Amiya',
        level: 120,
        server: 'EN',
      },
      inventory: {
        '4001': 500000,
        'orundum': 6000,
      },
      roster: [
        {
          operator_id: 'char_4025_aprot',
          elite: 2,
          level: 90,
          potential: 6,
          skill_level: 7,
          masteries: { skill_3: 3 },
          modules: {},
        },
      ],
      session: {
        uid: '99887766',
        token: 'long_term_session_jwt_xyz',
        email: 'amiya@rhodesisland.com',
        server: 'en',
        savedAt: '2026-10-10T22:00:00.000Z',
      },
    }

    await store.syncFromArkprtsData(syncPayload)

    expect(store.profile.username).toBe('Doctor Amiya')
    expect(store.profile.doctor_id).toBe('99887766')
    expect(store.hasSavedSession).toBe(true)
    expect(store.authSession?.token).toBe('long_term_session_jwt_xyz')
    expect(store.savedSessionEmail).toBe('amiya@rhodesisland.com')

    const localSaved = JSON.parse(localStorage.getItem('arkcalc_yostar_session')!)
    expect(localSaved.token).toBe('long_term_session_jwt_xyz')
    expect(localSaved.email).toBe('amiya@rhodesisland.com')
  })
})
