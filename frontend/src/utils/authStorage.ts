export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export const getStoredAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const setStoredAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
};

export const clearStoredAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};
