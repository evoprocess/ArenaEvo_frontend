import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
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
  // O formato principal é slug_org/ORG_0001 com o campo slug = "bxct".
  const byField = query(
    collection(db, 'slug_org'),
    where('slug', '==', slug),
    where('active', '==', true),
    limit(1),
  );
  const result = await getDocs(byField);
  if (!result.empty) return result.docs[0].data() as OrganizationLookup;

  // Também aceita slug_org/bxct para instalações que preferem lookup direto.
  const directSnapshot = await getDoc(doc(db, 'slug_org', slug));
  return directSnapshot.exists() ? directSnapshot.data() as OrganizationLookup : null;
};

export const tenantCollectionPath = (orgId: string, name: string) =>
  `organizations/${orgId}/${name}`;

export const userProfilePath = (orgId: string, uid: string) =>
  `logins/${orgId}/usuarios/${uid}`;

