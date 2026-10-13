import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAdminSession } from '../lib/admin';
import { normalizeUsername } from '../lib/tenant';
import type { AdminSession } from '../types';

type AdminAuthState = {
  user: User | null;
  session: AdminSession | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const buildAdminEmail = (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  if (normalized.includes('@')) return normalized;
  const username = normalizeUsername(normalized);
  if (!username) throw new Error('Informe um usuário válido.');
  return `org_0000-${username}@arenaevo.com.br`;
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    if (!nextUser) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const nextSession = await getAdminSession();
      setUser(nextUser);
      setSession(nextSession);
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }), []);

  const login = async (identifier: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, buildAdminEmail(identifier), password);
    try {
      const nextSession = await getAdminSession();
      setUser(credential.user);
      setSession(nextSession);
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  return (
    <AdminAuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth precisa estar dentro de AdminAuthProvider.');
  return context;
};
