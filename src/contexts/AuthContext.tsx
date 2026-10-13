import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  buildTenantEmail,
  loginDocumentPath,
  normalizeUsername,
  userProfilePath,
  usernameFromTenantEmail,
} from '../lib/tenant';
import type { UserProfile, UserRole } from '../types';
import { useOrganization } from './OrganizationContext';

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const rolesByProfile: Record<string, UserRole> = {
  owner: 'owner',
  proprietario: 'owner',
  admin: 'admin',
  administrador: 'admin',
  manager: 'manager',
  gerente: 'manager',
  instructor: 'instructor',
  instrutor: 'instructor',
  viewer: 'viewer',
  visualizador: 'viewer',
};

const loadOrganizationProfile = async (nextUser: User, orgId: string, usernameValue?: string) => {
  const username = normalizeUsername(usernameValue || usernameFromTenantEmail(orgId, nextUser.email));
  if (username) {
    const loginSnapshot = await getDoc(doc(db, loginDocumentPath(orgId)));
    const mappedProfile = loginSnapshot.data()?.[username];
    if (mappedProfile && typeof mappedProfile === 'object') {
      const profile = mappedProfile as Record<string, unknown>;
      if (profile.statusAtivo !== true || (profile.uid && profile.uid !== nextUser.uid)) return null;

      return {
        uid: nextUser.uid,
        orgId,
        username,
        displayName: String(profile.nome || nextUser.displayName || username),
        role: rolesByProfile[String(profile.perfil)] || 'viewer',
        active: true,
      } satisfies UserProfile;
    }
  }

  // Compatibilidade temporária com perfis criados antes do mapa logins/{orgId}.
  const legacySnapshot = await getDoc(doc(db, userProfilePath(orgId, nextUser.uid)));
  if (!legacySnapshot.exists() || legacySnapshot.data().active !== true) return null;
  return { uid: nextUser.uid, ...legacySnapshot.data() } as UserProfile;
};

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
      const nextProfile = await loadOrganizationProfile(nextUser, organization.orgId);
      if (!nextProfile) {
        await signOut(auth);
        throw new Error('Usuário sem acesso ativo.');
      }
      setUser(nextUser);
      setProfile(nextProfile);
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
    const normalizedUsername = normalizeUsername(username);
    const email = buildTenantEmail(organization.orgId, normalizedUsername);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdTokenResult(true);
    if (token.claims.tenantId !== organization.orgId) {
      await signOut(auth);
      throw new Error('Usuário não autorizado para esta organização.');
    }

    const nextProfile = await loadOrganizationProfile(
      credential.user,
      organization.orgId,
      normalizedUsername,
    );
    if (!nextProfile) {
      await signOut(auth);
      throw new Error('Usuário sem acesso ativo.');
    }
    setProfile(nextProfile);
  };

  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, profile, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
};

