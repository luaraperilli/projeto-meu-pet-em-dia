import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@lib/api';

type AuthUser = {
  id: number;
  name: string;
  email: string;
  type: 'Tutor' | 'Veterinário';
  role: 'admin' | 'user';
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (fd: FormData) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(null)))
      .then((d) => setUser(d.user))
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      });
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Credenciais inválidas');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(fd: FormData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(data.message || 'Falha ao registrar');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({ user, token, login, logout, register }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
