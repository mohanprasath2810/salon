// React Context lets us share data (like "who's logged in") across
// many components without manually passing it down through props at
// every level. Any component wrapped inside <AuthProvider> can call
// useAuth() to read or update the current user.

import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if a token is already saved (from a previous
  // session) and try to restore who the user is.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token')) // token expired/invalid
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(email, password) {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function handleRegister(payload) {
    const data = await api.register(payload);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, register: handleRegister, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components just call useAuth() instead of
// useContext(AuthContext) everywhere.
export function useAuth() {
  return useContext(AuthContext);
}
