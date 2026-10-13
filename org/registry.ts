import type { OrganizationBrand } from '../src/types';
import { bxct } from './ORG_0001';

export const organizationRegistry: Record<string, OrganizationBrand> = {
  [bxct.slug]: bxct,
};

export const getLocalOrganization = (slug: string) => organizationRegistry[slug];
