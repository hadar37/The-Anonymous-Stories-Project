

import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (data) => {
    // חילוץ המשתמש והטוקן מתוך התשובה של השרת
    const userObj = data.user || data; 
    const jwtToken = data.token;

    // שמירה ב-State
    setUser(userObj);
    if (jwtToken) setToken(jwtToken);

    // שמירה ב-LocalStorage
    localStorage.setItem('user', JSON.stringify(userObj));
    if (jwtToken) localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};