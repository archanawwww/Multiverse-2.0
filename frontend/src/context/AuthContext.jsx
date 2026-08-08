import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);

  // On mount, restore token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('spotify_access_token');
    const expiresAt = parseInt(localStorage.getItem('spotify_expires_at') || '0', 10);

    if (savedToken && expiresAt > Date.now()) {
      setToken(savedToken);
      // Schedule a refresh 2 minutes before expiration
      scheduleRefresh(expiresAt - Date.now() - 120000);
    } else if (savedToken) {
      // Token exists but is expired — try refreshing immediately
      refreshToken();
    }
  }, []);

  const scheduleRefresh = useCallback((delayMs) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (delayMs <= 0) delayMs = 1000; // Refresh immediately if overdue
    
    refreshTimerRef.current = setTimeout(() => {
      refreshToken();
    }, delayMs);
  }, []);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
    if (!storedRefreshToken) {
      console.warn('[Auth] No refresh token available');
      return;
    }

    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'X-Refresh-Token': storedRefreshToken },
      });
      
      if (!res.ok) throw new Error('Refresh failed');
      
      const data = await res.json();
      const expiresAt = Date.now() + (data.expires_in * 1000) - 120000;

      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_expires_at', expiresAt.toString());
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
      }

      setToken(data.access_token);
      // Schedule next refresh
      scheduleRefresh(data.expires_in * 1000 - 120000);
    } catch (err) {
      console.error('[Auth] Token refresh failed:', err);
      // Don't logout immediately — the user might come back online
    } finally {
      setIsRefreshing(false);
    }
  }, [scheduleRefresh]);

  const login = useCallback((accessToken, refreshTokenValue, expiresIn) => {
    const expiresAt = Date.now() + ((expiresIn || 3600) * 1000) - 120000;
    
    localStorage.setItem('spotify_access_token', accessToken);
    localStorage.setItem('spotify_expires_at', expiresAt.toString());
    if (refreshTokenValue) {
      localStorage.setItem('spotify_refresh_token', refreshTokenValue);
    }
    
    setToken(accessToken);
    scheduleRefresh((expiresIn || 3600) * 1000 - 120000);
  }, [scheduleRefresh]);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_at');
    setToken(null);
    setUser(null);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const value = useMemo(() => ({
    token, user, setUser, login, logout, isRefreshing, refreshToken
  }), [token, user, setUser, login, logout, isRefreshing, refreshToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
