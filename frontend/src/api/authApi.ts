import axiosClient from './axiosClient';

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    axiosClient.post<AuthResponse, AuthResponse, LoginCredentials>('/auth/login', credentials),

  signup: (userData: SignupData): Promise<AuthResponse> =>
    axiosClient.post<AuthResponse, AuthResponse, SignupData>('/auth/signup', userData),

  logout: (): Promise<null> => axiosClient.post<null, null>('/auth/logout'),
};
