import { apiRequest } from './api';
import type { AdminOrganization, AdminSession } from '../types';

export type OrganizationInput = Pick<AdminOrganization, 'orgId' | 'slug' | 'name' | 'shortName' | 'active'>;
export type OrganizationUpdate = Partial<Omit<OrganizationInput, 'orgId'>>;

export const getAdminSession = () =>
  apiRequest<AdminSession>('/api/v1/admin/session');

export const listOrganizations = async () => {
  const result = await apiRequest<{ organizations: AdminOrganization[] }>('/api/v1/admin/organizations');
  return result.organizations;
};

export const createOrganization = async (organization: OrganizationInput) => {
  const result = await apiRequest<{ organization: AdminOrganization }>('/api/v1/admin/organizations', {
    method: 'POST',
    body: JSON.stringify(organization),
  });
  return result.organization;
};

export const updateOrganization = async (orgId: string, updates: OrganizationUpdate) => {
  const result = await apiRequest<{ organization: AdminOrganization }>(
    `/api/v1/admin/organizations/${encodeURIComponent(orgId)}`,
    { method: 'PATCH', body: JSON.stringify(updates) },
  );
  return result.organization;
};
