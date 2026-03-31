import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/api/authApi';
import type { LoginCredentials, SignupData, AuthResponse } from '@/api/authApi';
import { AuthContext } from './useAuth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state directly from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('auth_token'),
  );

  // Since we check localStorage synchronously above, we don't actually need
  // an effect to "load" the auth state. We can start with loading as false.
  const [loading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    // Cast to AuthResponse because axiosClient unwraps the data
    const response = (await authApi.login(credentials)) as unknown as AuthResponse;
    const { token } = response;
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const signup = async (userData: SignupData) => {
    await authApi.signup(userData);
  };

  const logout = () => {
    authApi.logout().catch(console.error);
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ loading, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
