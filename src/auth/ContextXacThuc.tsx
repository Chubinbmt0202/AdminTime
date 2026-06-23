import React, { createContext, useContext, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';
import type { AuthUser, LoginResponse, Role } from './kieuXacThuc';
import { boNhoXacThuc } from './luuTruXacThuc';

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  role: Role | null;
};

type AuthContextValue = AuthState & {
  login: (params: { username: string; password: string; remember?: boolean; wifi_bssid?: string }) => Promise<AuthUser>;
  logout: () => void;
};

const ContextXacThuc = createContext<AuthContextValue | null>(null);

function docNguoiDungBanDau(): AuthUser | null {
  const raw = boNhoXacThuc.layDuLieuNguoiDungTho();
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    const allowedRoles = ['admin', 'hr'];
    if (!user.ten_vai_tro || !allowedRoles.includes(user.ten_vai_tro.toLowerCase())) {
      boNhoXacThuc.xoaTatCa();
      return null;
    }
    return user;
  } catch {
    boNhoXacThuc.xoaTatCa();
    return null;
  }
}

export function NhaCungCapXacThuc({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => docNguoiDungBanDau());

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

        boNhoXacThuc.datDuLieuNguoiDungTho(JSON.stringify(res.data), remember);
        setUser(res.data);
        return res.data;
      },
      logout() {
        boNhoXacThuc.xoaTatCa();
        setUser(null);
      },
    };
  }, [user]);

  return <ContextXacThuc.Provider value={value}>{children}</ContextXacThuc.Provider>;
}

export function useXacThuc() {
  const ctx = useContext(ContextXacThuc);
  if (!ctx) throw new Error('useXacThuc must be used within NhaCungCapXacThuc');
  return ctx;
}

