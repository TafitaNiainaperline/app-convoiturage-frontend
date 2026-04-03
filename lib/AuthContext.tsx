'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { login as apiLogin, register as apiRegister } from './api';

interface AuthContextType {
  user: User | null;
  chargement: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  inscrire: (donnees: Record<string, string>) => Promise<void>;
  deconnecter: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setChargement(false);
  }, []);

  const connecter = async (email: string, motDePasse: string) => {
    const res = await apiLogin({ email, motDePasse });
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('token', res.token);
    setUser(res.user);
  };

  const inscrire = async (donnees: Record<string, string>) => {
    const res = await apiRegister(donnees);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('token', res.token);
    setUser(res.user);
  };

  const deconnecter = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, chargement, connecter, inscrire, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
