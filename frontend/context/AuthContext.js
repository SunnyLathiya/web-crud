'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const profile = await authService.me();
        if (!cancelled) setUser(profile);
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authService.login({ email, password });
    localStorage.setItem('token', result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const result = await authService.signup(payload);
    localStorage.setItem('token', result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
