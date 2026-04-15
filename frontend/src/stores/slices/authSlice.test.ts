import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/useAppStore';
import { AUTH_TOKEN_STORAGE_KEY } from '@/utils/authStorage';

vi.mock('@/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

import { authApi } from '@/api/authApi';

const initialState = useAppStore.getState();

const createJwtToken = (expSecondsFromNow: number) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${header}.${payload}.signature`;
};

describe('authSlice', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('clears expired tokens during hydrateAuth', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, createJwtToken(-60));

    useAppStore.getState().hydrateAuth();

    expect(useAppStore.getState().authStatus).toBe('unauthenticated');
    expect(useAppStore.getState().token).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('stores the token after a successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ token: 'mock-token-traveler@example.com' });

    await useAppStore.getState().login({
      email: 'traveler@example.com',
      password: 'Travel123!',
    });

    expect(useAppStore.getState().authStatus).toBe('authenticated');
    expect(useAppStore.getState().token).toBe('mock-token-traveler@example.com');
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('mock-token-traveler@example.com');
  });

  it('clears auth state when handleSessionExpired runs', () => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'mock-token-traveler@example.com');
    useAppStore.setState({
      token: 'mock-token-traveler@example.com',
      authStatus: 'authenticated',
      isAuthenticated: true,
      authError: null,
    });

    useAppStore.getState().handleSessionExpired();

    expect(useAppStore.getState().authStatus).toBe('unauthenticated');
    expect(useAppStore.getState().token).toBeNull();
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});
