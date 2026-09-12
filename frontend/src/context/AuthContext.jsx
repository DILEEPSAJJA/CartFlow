import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cartflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load user from localStorage", e);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('cartflow_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('cartflow_user');
      }
    } catch (e) {
      console.error("Failed to sync user to localStorage", e);
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const userData = res.data;
    setUser(userData);
    return userData;
  };

  const register = async (registerData) => {
    const res = await authService.register(registerData);
    const userData = res.data;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cartflow_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAdmin,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
