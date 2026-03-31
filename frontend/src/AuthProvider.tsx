import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/api/authApi';
import type { LoginCredentials, SignupData } from '@/api/authApi';
import { AuthContext } from './useAuth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state directly from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('auth_token'),
  );

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    const { token } = response;
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const signup = async (userData: SignupData) => {
    await authApi.signup(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
