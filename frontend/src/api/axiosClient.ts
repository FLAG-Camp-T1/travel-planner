import axios from 'axios';
import { emitAuthSessionExpired } from './authSessionBus';
import { emitApiError } from './apiErrorBus';
import { API_BASE_URL } from './apiConfig';
import { getActiveMockFlags, MOCK_FLAGS_HEADER } from '@/mocks/mockScenario';
import { getStoredAuthToken } from '@/utils/authStorage';

const getApiErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed. Please try again.';
};

const getAuthorizationHeader = (error: {
  config?: { headers?: { Authorization?: unknown; authorization?: unknown } };
}) => {
  const headerValue = error.config?.headers?.Authorization ?? error.config?.headers?.authorization;
  return typeof headerValue === 'string' ? headerValue : null;
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeMockFlags = getActiveMockFlags();
    if (activeMockFlags.length > 0) {
      config.headers[MOCK_FLAGS_HEADER] = activeMockFlags.join(',');
    } else {
      delete config.headers[MOCK_FLAGS_HEADER];
    }

    return config;
  },
  (error) => {
    emitApiError(getApiErrorMessage(error));
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.success) {
      return res.data;
    } else {
      const message = res.message || 'Backend API Error';
      console.error('API Error:', message);
      emitApiError(message);
      return Promise.reject(new Error(message));
    }
  },
  (error) => {
    const authorizationHeader = getAuthorizationHeader(error);
    const hasBearerToken = authorizationHeader?.startsWith('Bearer ');

    if (error.response?.status === 401 && hasBearerToken) {
      emitAuthSessionExpired(
        error.response?.data?.message || 'Your session expired. Please log in again.',
      );
      return Promise.reject(new Error('Your session expired. Please log in again.'));
    }

    const errorMsg = error.response?.data?.message || error.message;
    console.error('HTTP level error:', errorMsg);
    emitApiError(errorMsg || 'HTTP request failed.');
    return Promise.reject(new Error(errorMsg));
  },
);

export default axiosClient;
