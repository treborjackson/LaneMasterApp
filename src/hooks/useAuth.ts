'use client';

import { useAppStore } from '@/store/appStore';
import { apiLogin, apiRegister } from '@/lib/api';

const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;

export function useAuth() {
  const { token, loginAt, user, setAuth, clearAuth } = useAppStore();

  const sessionExpired = !!loginAt && Date.now() - loginAt > SEVENTY_TWO_HOURS;
  const isAuthenticated = !!token && !sessionExpired;

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setAuth(data.token, data.user);
    return data;
  }

  async function signup(email: string, password: string, name?: string, inviteToken?: string) {
    const data = await apiRegister(email, password, name, inviteToken);
    setAuth(data.token, data.user);
    return data;
  }

  function logout() {
    clearAuth();
  }

  return { token, user, login, signup, logout, isAuthenticated };
}
