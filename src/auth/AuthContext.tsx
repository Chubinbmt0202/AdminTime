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
  login: (params: { username: string; password: string; remember?: boolean; wifi_bssid?: string }) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialUser(): AuthUser | null {
  const raw = authStorage.getUserRaw();
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    const allowedRoles = ['admin', 'hr'];
    if (!user.ten_vai_tro || !allowedRoles.includes(user.ten_vai_tro.toLowerCase())) {
      authStorage.clearAll();
      return null;
    }
    return user;
  } catch {
    authStorage.clearAll();
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readInitialUser());

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.ten_vai_tro ?? null;
    const isAuthenticated = Boolean(user);

    return {
      isAuthenticated,
      user,
      role,
      async login({ username, password, remember = true, wifi_bssid }) {
        const res = await apiClient.post<LoginResponse>('/auth/login', {
          username,
          password,
          wifi_bssid,
        });

        if (!res.success) {
          throw new Error(res.message || 'Đăng nhập thất bại');
        }

        const allowedRoles = ['admin', 'hr'];
        if (!res.data.ten_vai_tro || !allowedRoles.includes(res.data.ten_vai_tro.toLowerCase())) {
          throw new Error('Tài khoản của bạn không có quyền truy cập vào trang web này.');
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

