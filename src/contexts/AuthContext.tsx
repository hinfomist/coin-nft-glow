import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CryptoJS from 'crypto-js';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  plan: 'free' | 'pro';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getPortfolioCount: () => number;
  getAlertsCount: () => number;
  canAddHolding: () => boolean;
  canAddAlert: () => boolean;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SALT = 'cryptoflash-salt-2024'; // In production, use environment variable

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('cryptoflash-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('cryptoflash-user');
      }
    }
  }, []);

  const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password + SALT).toString();
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const hashedPassword = hashPassword(password);

    // Get stored users
    const users = JSON.parse(localStorage.getItem('cryptoflash-users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === hashedPassword);

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        createdAt: new Date(foundUser.createdAt),
        plan: foundUser.plan || 'free'
      };

      setUser(userData);
      localStorage.setItem('cryptoflash-user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('cryptoflash-users') || '[]');

    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }

    const hashedPassword = hashPassword(password);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('cryptoflash-users', JSON.stringify(users));

    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: new Date(newUser.createdAt),
      plan: 'free'
    };

    setUser(userData);
    localStorage.setItem('cryptoflash-user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cryptoflash-user');
  };

  const getPortfolioCount = (): number => {
    if (!user) return 0;
    const portfolio = localStorage.getItem(`cryptoflash-portfolio-${user.id}`);
    if (!portfolio) return 0;
    try {
      const holdings = JSON.parse(portfolio);
      return holdings.length;
    } catch {
      return 0;
    }
  };

  const getAlertsCount = (): number => {
    if (!user) return 0;
    const alerts = localStorage.getItem(`cryptoflash-alerts-${user.id}`);
    if (!alerts) return 0;
    try {
      const alertList = JSON.parse(alerts);
      return alertList.filter((alert: any) => alert.isActive).length;
    } catch {
      return 0;
    }
  };

  const canAddHolding = (): boolean => {
    if (!user) return false;
    if (user.plan === 'pro') return true;
    return getPortfolioCount() < 5; // Free plan limit
  };

  const canAddAlert = (): boolean => {
    if (!user) return false;
    if (user.plan === 'pro') return true;
    return getAlertsCount() < 2; // Free plan limit
  };

  const upgradeToPro = () => {
    if (!user) return;
    const updatedUser = { ...user, plan: 'pro' as const };
    setUser(updatedUser);
    localStorage.setItem('cryptoflash-user', JSON.stringify(updatedUser));

    // Update user in the users array
    const users = JSON.parse(localStorage.getItem('cryptoflash-users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].plan = 'pro';
      localStorage.setItem('cryptoflash-users', JSON.stringify(users));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    getPortfolioCount,
    getAlertsCount,
    canAddHolding,
    canAddAlert,
    upgradeToPro
  };

  return (
    <AuthContext.Provider value={value}>
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
