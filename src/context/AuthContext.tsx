import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    if (token === 'dummy-jwt-token-admin') {
      const dummyUser = { id: 'admin-1', name: 'Admin', email: 'admin@gst.com', role: 'ADMIN', isActive: true };
      setUser(dummyUser);
      setLoading(false);
      return;
    }
    
    // Invalid token for mock auth
    setToken(null);
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const checkEmail = (email || '').trim().toLowerCase();
      // Hardcoded fallback for UI testing requested by user
      if ((checkEmail === 'admin' || checkEmail === 'user' || checkEmail === 'admin@gst.com') && (password === '1234' || password === '12345')) {
        const dummyUser = { id: 'admin-1', name: 'Admin', email: 'admin@gst.com', role: 'ADMIN', isActive: true };
        setToken('dummy-jwt-token-admin');
        setUser(dummyUser);
        return { success: true };
      }

      return { success: false, message: 'Invalid credentials. Use admin / 1234' };
    } catch (err) {
      return { success: false, message: 'Server unreachable' };
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
