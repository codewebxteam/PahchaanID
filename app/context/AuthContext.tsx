import React, { createContext, useContext, useState, useCallback } from 'react';
import { setToken, getToken } from '../services/api';

export type UserRole = 'owner' | 'manager';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  role: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    role: null,
    isAuthenticated: false,
  });

  const login = useCallback((token: string, role: UserRole) => {
    setToken(token);
    setAuth({ token, role, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAuth({ token: null, role: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
