import React, { createContext, useContext, useMemo, useState } from 'react';
import { apiClient } from '../services/api.client';
import type { AuthUser, LoginResponse, Role } from './auth.types';
import { authStorage } from './auth.storage';

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: Role | null;
};

type AuthContextValue = AuthState & {
  login: (params: { username: string; password: string; remember?: boolean }) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialUser(): AuthUser | null {
  const raw = authStorage.getUserRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    authStorage.clearUserRaw();
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readInitialUser());

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    const isAuthenticated = Boolean(user);

    return {
      isAuthenticated,
      user,
      role,
      async login({ username, password, remember = true }) {
        const res = await apiClient.post<LoginResponse>('/auth/login', {
          username,
          password,
        });

        if (!res.success) {
          throw new Error(res.message || 'Đăng nhập thất bại');
        }

        authStorage.setUserRaw(JSON.stringify(res.data), remember);
        setUser(res.data);
        return res.data;
      },
      logout() {
        authStorage.clearAll();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

