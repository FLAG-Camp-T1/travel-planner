import axiosClient from './axiosClient';

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface SignupData {
  username: string;
  password?: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) => axiosClient.post<AuthResponse>('/login', credentials),

  signup: (userData: SignupData) => axiosClient.post<AuthResponse>('/signup', userData),

  logout: () => axiosClient.post('/logout'),
};
