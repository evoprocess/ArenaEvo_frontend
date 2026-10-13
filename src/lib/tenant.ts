import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { OrganizationLookup } from '../types';

export const normalizeSlug = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

export const normalizeUsername = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

export const buildTenantEmail = (orgId: string, username: string) => {
  const safeUsername = normalizeUsername(username);
  if (!safeUsername) throw new Error('Informe um usuário válido.');
  return `${orgId.toLowerCase()}-${safeUsername}@arenaevo.com.br`;
};

export const resolveOrganization = async (slugValue: string): Promise<OrganizationLookup | null> => {
  const slug = normalizeSlug(slugValue);
  if (!slug) return null;

  const slugMapSnapshot = await getDoc(doc(db, 'public', 'slug_org'));
  const orgId = slugMapSnapshot.data()?.[slug];
  if (typeof orgId !== 'string' || !orgId) return null;

  const profileSnapshot = await getDoc(doc(db, 'organizations', orgId, 'public', 'profile'));
  if (!profileSnapshot.exists() || profileSnapshot.data().active !== true) return null;

  const profile = profileSnapshot.data();
  return {
    orgId,
    slug,
    name: String(profile.name || orgId),
    shortName: String(profile.shortName || profile.name || orgId),
    active: true,
  };
};

export const tenantCollectionPath = (orgId: string, name: string) =>
  `organizations/${orgId}/${name}`;

export const userProfilePath = (orgId: string, uid: string) =>
  `logins/${orgId}/usuarios/${uid}`;

export const loginDocumentPath = (orgId: string) => `logins/${orgId}`;

export const usernameFromTenantEmail = (orgId: string, email: string | null) => {
  if (!email) return '';
  const prefix = `${orgId.toLowerCase()}-`;
  const localPart = email.toLowerCase().split('@')[0] || '';
  return localPart.startsWith(prefix) ? normalizeUsername(localPart.slice(prefix.length)) : '';
};

