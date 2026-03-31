import axiosClient from './axiosClient';

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
}

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    axiosClient.post<AuthResponse, AuthResponse, LoginCredentials>('/login', credentials),

  signup: (userData: SignupData): Promise<AuthResponse> =>
    axiosClient.post<AuthResponse, AuthResponse, SignupData>('/signup', userData),

  logout: (): Promise<null> => axiosClient.post<null, null>('/logout'),
};
