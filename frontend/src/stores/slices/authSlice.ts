import { authApi } from '@/api/authApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
import type { AuthNoticeState } from '@/types/authNotice';
import { clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken } from '@/utils/authStorage';
import { isAuthTokenExpired } from '@/utils/authTokenPresentation';
import type { AppStoreCreator, AuthSlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Authentication request failed.';
};

const toError = (error: unknown) => {
  return error instanceof Error ? error : new Error(getErrorMessage(error));
};

const unauthenticatedState = (
  overrides: Partial<Pick<AuthSlice, 'authError' | 'authNotice'>> = {},
) => ({
  token: null,
  authStatus: 'unauthenticated' as const,
  authError: null,
  authNotice: null,
  isAuthenticated: false,
  ...overrides,
});

const authenticatedState = (token: string) => ({
  token,
  authStatus: 'authenticated' as const,
  authError: null,
  authNotice: null,
  isAuthenticated: true,
});

export const createAuthSlice: AppStoreCreator<AuthSlice> = (set) => ({
  token: null,
  authStatus: 'hydrating',
  authError: null,
  authNotice: null,
  isAuthenticated: false,

  hydrateAuth: () => {
    const token = getStoredAuthToken();
    if (!token) {
      set(unauthenticatedState(), false, 'auth/hydrate');
      return;
    }

    if (isAuthTokenExpired(token)) {
      clearStoredAuthToken();
      set(unauthenticatedState(), false, 'auth/hydrate');
      return;
    }

    set(authenticatedState(token), false, 'auth/hydrate');
  },

  handleSessionExpired: (message = 'Your session expired. Please log in again.') => {
    clearStoredAuthToken();
    set(
      unauthenticatedState({
        authNotice: {
          message,
          messageTone: 'warning',
        },
      }),
      false,
      'auth/session-expired',
    );
  },

  setAuthNotice: (notice: AuthNoticeState | null) => {
    set(
      {
        authNotice: notice,
      },
      false,
      notice ? 'auth/notice:set' : 'auth/notice:clear',
    );
  },

  clearAuthNotice: () => {
    set({ authNotice: null }, false, 'auth/notice:clear');
  },

  clearAuthError: () => {
    set({ authError: null }, false, 'auth/error:clear');
  },

  login: async (credentials: LoginCredentials) => {
    set(
      {
        authError: null,
        authNotice: null,
      },
      false,
      'auth/login:start',
    );

    try {
      const response = await authApi.login(credentials);
      const { token } = response;

      setStoredAuthToken(token);

      set(authenticatedState(token), false, 'auth/login:success');
    } catch (error) {
      clearStoredAuthToken();

      set(
        unauthenticatedState({
          authError: getErrorMessage(error),
        }),
        false,
        'auth/login:error',
      );

      throw toError(error);
    }
  },

  signup: async (userData: SignupData) => {
    set(
      {
        authError: null,
        authNotice: null,
      },
      false,
      'auth/signup:start',
    );

    try {
      await authApi.signup(userData);

      set(unauthenticatedState(), false, 'auth/signup:success');
    } catch (error) {
      set(
        {
          authError: getErrorMessage(error),
        },
        false,
        'auth/signup:error',
      );

      throw toError(error);
    }
  },

  logout: async () => {
    set(
      {
        authError: null,
        authNotice: null,
      },
      false,
      'auth/logout:start',
    );

    try {
      await authApi.logout();
    } catch {
      // Stateless logout only depends on clearing the local token.
    } finally {
      clearStoredAuthToken();
      set(unauthenticatedState(), false, 'auth/logout');
    }
  },
});
