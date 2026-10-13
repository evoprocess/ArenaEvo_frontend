import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { buildTenantEmail, userProfilePath } from '../lib/tenant';
import type { UserProfile } from '../types';
import { useOrganization } from './OrganizationContext';

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { organization } = useOrganization();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    if (!organization) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    if (!nextUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const token = await nextUser.getIdTokenResult();
      if (token.claims.tenantId !== organization.orgId) {
        await signOut(auth);
        throw new Error('Esta conta pertence a outra organização.');
      }
      const snapshot = await getDoc(doc(db, userProfilePath(organization.orgId, nextUser.uid)));
      if (!snapshot.exists() || snapshot.data().active !== true) {
        await signOut(auth);
        throw new Error('Usuário sem acesso ativo.');
      }
      setUser(nextUser);
      setProfile({ uid: nextUser.uid, ...snapshot.data() } as UserProfile);
    } catch (error) {
      console.error('Falha ao restaurar a sessão:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }), [organization]);

  const login = async (username: string, password: string) => {
    if (!organization) throw new Error('Organização inválida.');
    const email = buildTenantEmail(organization.orgId, username);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdTokenResult(true);
    if (token.claims.tenantId !== organization.orgId) {
      await signOut(auth);
      throw new Error('Usuário não autorizado para esta organização.');
    }
  };

  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, profile, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
};

