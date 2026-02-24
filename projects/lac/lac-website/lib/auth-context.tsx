'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  token: string | null;
  login: (token: string, username: string, userId?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('lac_token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // 立即从localStorage恢复基本状态，避免页面闪烁
      const storedUsername = localStorage.getItem('lac_username');
      const storedUserId = localStorage.getItem('lac_user_id');
      if (storedUsername) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
        setUserId(storedUserId);
        setToken(storedToken);
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/user-profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const newUsername = data.data?.username || data.username || '用户';
          const newUserId = data.data?.id || data.id || null;
          setIsLoggedIn(true);
          setUsername(newUsername);
          setUserId(newUserId);
          setToken(storedToken);
          // 同步更新localStorage
          localStorage.setItem('lac_username', newUsername);
          if (newUserId) localStorage.setItem('lac_user_id', newUserId);
        } else {
          localStorage.removeItem('lac_token');
          localStorage.removeItem('lac_username');
          localStorage.removeItem('lac_user_id');
          setIsLoggedIn(false);
        }
      } catch (error) {
        // 如果API调用失败但有缓存的token，保持登录状态
        if (!storedUsername) {
          setIsLoggedIn(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (newToken: string, newUsername: string, newUserId?: string) => {
    localStorage.setItem('lac_token', newToken);
    localStorage.setItem('lac_username', newUsername);
    if (newUserId) localStorage.setItem('lac_user_id', newUserId);
    setToken(newToken);
    setUsername(newUsername);
    if (newUserId) setUserId(newUserId);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('lac_token');
    localStorage.removeItem('lac_username');
    localStorage.removeItem('lac_user_id');
    setToken(null);
    setUsername('');
    setUserId(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        username, 
        userId,
        token, 
        login, 
        logout, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};