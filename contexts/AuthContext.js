// contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isGuest: false,
    user: null,
  });


  const login = (userData) => {
    setAuthState({
      isLoggedIn: true,
      isGuest: false,
      user: userData,
    });
    
  };


  const loginAsGuest = () => {
    setAuthState({
      isLoggedIn: false, 
      isGuest: true,    
      user: null,
    });
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    setAuthState({
      isLoggedIn: false,
      isGuest: false,
      user: null,
    });
    
  };

  return (
    <AuthContext.Provider value={{ authState, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};