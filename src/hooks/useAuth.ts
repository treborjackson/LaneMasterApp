'use client';

import { useAppStore } from '@/store/appStore';
import { apiLogin, apiRegister } from '@/lib/api';

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAppStore();

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setAuth(data.token, data.user);
    return data;
  }

  async function signup(email: string, password: string, name?: string) {
    const data = await apiRegister(email, password, name);
    setAuth(data.token, data.user);
    return data;
  }

  function logout() {
    clearAuth();
  }

  return { token, user, login, signup, logout, isAuthenticated: !!token };
}
