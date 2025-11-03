// contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo Context
const AuthContext = createContext();

// Tạo Provider (component bao bọc ứng dụng)
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isGuest: false,
    user: null,
  });

  // Hàm xử lý đăng nhập thành công
  const login = (userData) => {
    setAuthState({
      isLoggedIn: true,
      isGuest: false,
      user: userData,
    });
    // Ở đây bạn có thể lưu token vào AsyncStorage
  };

  // Hàm xử lý đăng nhập với tư cách Khách (FR-1.1.2)
  const loginAsGuest = () => {
    setAuthState({
      isLoggedIn: false, // Vẫn là false
      isGuest: true,    // Nhưng isGuest là true
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
    // Ở đây bạn có thể xóa token khỏi AsyncStorage
  };

  return (
    <AuthContext.Provider value={{ authState, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Tạo một custom hook để dễ dàng sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};