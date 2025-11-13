
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const data = useData();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem('ggsipuUser'));
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
      sessionStorage.removeItem('ggsipuUser');
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('ggsipuUser', JSON.stringify(userData));
    navigate(`/${userData.role}`);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ggsipuUser');
    navigate('/');
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
