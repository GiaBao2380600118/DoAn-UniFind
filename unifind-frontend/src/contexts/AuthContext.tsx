import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdminOrStaff: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('unifind_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('unifind_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('unifind_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = (authData: AuthResponse) => {
    localStorage.setItem('unifind_token', authData.token);
    setToken(authData.token);
    setUser({
      userID: authData.userID,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      studentStaffId: authData.studentStaffId,
      avatarUrl: authData.avatarUrl,
    });
  };

  const logout = () => {
    localStorage.removeItem('unifind_token');
    setToken(null);
    setUser(null);
  };

  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isAdminOrStaff,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

