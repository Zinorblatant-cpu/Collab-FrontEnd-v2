import { createContext, useContext, useState } from 'react';
import { logger } from '../services/logger';

const AuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem('collab_user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn('AuthContext: failed to parse stored user', { error: err.message });
    localStorage.removeItem('collab_user');
    localStorage.removeItem('collab_token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const [token, setToken] = useState(() => {
    const parsedUser = readUser();
    if (parsedUser) {
      const stored = localStorage.getItem('collab_token');
      if (!stored) {
        logger.warn('AuthContext: user present but token missing — clearing session');
        localStorage.removeItem('collab_user');
        return null;
      }
      return stored;
    }
    return null;
  });

  function login({ token: newToken, user: newUser }) {
    localStorage.setItem('collab_token', newToken);
    localStorage.setItem('collab_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('collab_token');
    localStorage.removeItem('collab_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
