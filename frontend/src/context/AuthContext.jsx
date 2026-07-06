import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token  = localStorage.getItem('accessToken');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: profile } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ } finally {
      localStorage.clear();
      setUser(null);
    }
  }, []);

  const value = { user, loading, login, logout, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
