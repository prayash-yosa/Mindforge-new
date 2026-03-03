import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setToken, clearToken, hasToken, ApiClientError } from '../api/client';
import type { LoginResponse } from '../api/types';

interface AuthState {
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (mobileNumber: string, mpin: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: hasToken(),
  });

  const login = useCallback(async (mobileNumber: string, mpin: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/v1/parent/auth/login', { mobileNumber, mpin });
    setToken(res.accessToken);
    setState({ isAuthenticated: true });
    return res;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiClientError };
