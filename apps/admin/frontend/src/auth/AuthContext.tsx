import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthState {
  token: string | null;
  adminName: string | null;
  adminId: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, adminName: string, adminId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('admin_token'),
    adminName: localStorage.getItem('admin_name'),
    adminId: localStorage.getItem('admin_id'),
  });

  const login = useCallback((token: string, adminName: string, adminId: string) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_name', adminName);
    localStorage.setItem('admin_id', adminId);
    setState({ token, adminName, adminId });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_id');
    setState({ token: null, adminName: null, adminId: null });
  }, []);

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: !!state.token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
