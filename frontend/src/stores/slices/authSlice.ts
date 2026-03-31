import { authApi } from '@/api/authApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
import { clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken } from '@/utils/authStorage';
import type { AppStoreCreator, AuthSlice } from '../types';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Authentication request failed.';
};

const toError = (error: unknown) => {
  return error instanceof Error ? error : new Error(getErrorMessage(error));
};

export const createAuthSlice: AppStoreCreator<AuthSlice> = (set) => ({
  token: null,
  authStatus: 'hydrating',
  authError: null,
  isAuthenticated: false,

  hydrateAuth: () => {
    const token = getStoredAuthToken();

    set(
      {
        token,
        authStatus: token ? 'authenticated' : 'unauthenticated',
        authError: null,
        isAuthenticated: Boolean(token),
      },
      false,
      'auth/hydrate',
    );
  },

  clearAuthError: () => {
    set(
      {
        authError: null,
      },
      false,
      'auth/error:clear',
    );
  },

  login: async (credentials: LoginCredentials) => {
    set(
      {
        authError: null,
      },
      false,
      'auth/login:start',
    );

    try {
      const response = await authApi.login(credentials);
      const { token } = response;

      setStoredAuthToken(token);

      set(
        {
          token,
          authStatus: 'authenticated',
          authError: null,
          isAuthenticated: true,
        },
        false,
        'auth/login:success',
      );
    } catch (error) {
      clearStoredAuthToken();

      set(
        {
          token: null,
          authStatus: 'unauthenticated',
          authError: getErrorMessage(error),
          isAuthenticated: false,
        },
        false,
        'auth/login:error',
      );

      throw toError(error);
    }
  },

  signup: async (userData: SignupData, options) => {
    const shouldAutoLogin = options?.autoLogin ?? false;

    set(
      {
        authError: null,
      },
      false,
      'auth/signup:start',
    );

    try {
      const response = await authApi.signup(userData);

      if (shouldAutoLogin) {
        const { token } = response;

        setStoredAuthToken(token);

        set(
          {
            token,
            authStatus: 'authenticated',
            authError: null,
            isAuthenticated: true,
          },
          false,
          'auth/signup:success:auto-login',
        );

        return { redirectedToLogin: false };
      }

      set(
        {
          token: null,
          authStatus: 'unauthenticated',
          authError: null,
          isAuthenticated: false,
        },
        false,
        'auth/signup:success',
      );

      return { redirectedToLogin: true };
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
      },
      false,
      'auth/logout:start',
    );

    let serverSynced = true;

    try {
      await authApi.logout();
    } catch (error) {
      serverSynced = false;

      set(
        {
          authError: getErrorMessage(error),
        },
        false,
        'auth/logout:error',
      );
    } finally {
      clearStoredAuthToken();

      set(
        {
          token: null,
          authStatus: 'unauthenticated',
          isAuthenticated: false,
        },
        false,
        serverSynced ? 'auth/logout:success' : 'auth/logout:local-clear',
      );
    }

    return { serverSynced };
  },
});
