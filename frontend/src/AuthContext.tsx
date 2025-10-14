import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface SmileRank {
  name: string;
  image_url: string | null;
}

interface User {
  nickname: string;
  total_score: number;
  smile_rank: SmileRank | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // アプリ起動時に認証状態を確認するフック
  useEffect(() => {
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        const authHeaders = await AsyncStorage.getItem('@auth_headers');
        if (authHeaders) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error('Failed to load auth headers.', e);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // signIn関数の責務を「ログインAPIを叩いて状態を変更する」だけに限定
  const signIn = useCallback(async (email: string, password: string) => {
    await api.post('/auth/sign_in', { email, password });
    setIsLoggedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem('@auth_headers');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

