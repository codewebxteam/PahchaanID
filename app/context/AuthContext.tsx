import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const role = await SecureStore.getItemAsync('authRole') as UserRole | null;
        if (token && role) {
          setToken(token);
          setAuth({ token, role, isAuthenticated: true });
        }
      } catch (e) {
        console.error('Error loading auth from SecureStore', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = useCallback(async (token: string, role: UserRole) => {
    setToken(token);
    setAuth({ token, role, isAuthenticated: true });
    try {
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('authRole', role);
    } catch (e) {
      console.error('Error saving auth to SecureStore', e);
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setAuth({ token: null, role: null, isAuthenticated: false });
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('authRole');
    } catch (e) {
      console.error('Error deleting auth from SecureStore', e);
    }
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
