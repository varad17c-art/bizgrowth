import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- Token helpers ----
  const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  // ---- Refresh access token using the refresh token ----
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const data = await api.post('/api/auth/refresh', { refreshToken });
      if (data.accessToken) {
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      console.error('Token refresh failed:', err.message);
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
    return false;
  }, []);

  // ---- Verify existing token on app load ----
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/api/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      // Access token may be expired — try refreshing
      if (err.status === 401) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.error('Token verification failed:', err.message);
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verifyToken();
  }, [verifyToken]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    const handleRefreshed = (e) => {
      if (e.detail) {
        setUser(e.detail);
        setIsAuthenticated(true);
      }
    };

    window.addEventListener('auth-expired', handleExpired);
    window.addEventListener('auth-refreshed', handleRefreshed);

    return () => {
      window.removeEventListener('auth-expired', handleExpired);
      window.removeEventListener('auth-refreshed', handleRefreshed);
    };
  }, []);

  // ---- Login ----
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (data.accessToken) {
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  // ---- Register ----
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await api.post('/api/auth/register', { name, email, password, role });
      if (data.accessToken) {
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  // ---- Logout ----
  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshAccessToken,
        verifyToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
