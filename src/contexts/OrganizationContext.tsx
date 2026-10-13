import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { getLocalOrganization } from '../../org/registry';
import { resolveOrganization } from '../lib/tenant';
import type { OrganizationBrand } from '../types';

type OrganizationState = {
  organization: OrganizationBrand | null;
  loading: boolean;
  error: string | null;
};

const OrganizationContext = createContext<OrganizationState | null>(null);

const genericBrand = (orgId: string, slug: string, name: string, shortName?: string): OrganizationBrand => ({
  orgId,
  slug,
  shortName: shortName || name,
  name,
  tagline: 'Seu centro de treinamento em evolução.',
  description: 'Gestão, comunidade e performance em um só lugar.',
  logoUrl: '',
  colors: { primary: '#7c5cff', secondary: '#42d3a3', surface: '#111318' },
  contact: { address: '', city: '', instagram: '' },
  modalities: [],
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { orgSlug = '' } = useParams();
  const [state, setState] = useState<OrganizationState>({ organization: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    const local = getLocalOrganization(orgSlug.toLowerCase());

    const load = async () => {
      setState({ organization: null, loading: true, error: null });
      try {
        const remote = await resolveOrganization(orgSlug);
        if (!active) return;
        if (!remote) {
          setState({ organization: null, loading: false, error: 'Organização não encontrada.' });
          return;
        }
        const organization = local
          ? {
              ...local,
              orgId: remote.orgId,
              slug: remote.slug,
              name: remote.name,
              shortName: remote.shortName || local.shortName,
            }
          : genericBrand(remote.orgId, remote.slug, remote.name, remote.shortName);
        setState({ organization, loading: false, error: null });
      } catch {
        if (!active) return;
        if (local && import.meta.env.DEV) {
          setState({ organization: local, loading: false, error: null });
        } else {
          setState({ organization: null, loading: false, error: 'Não foi possível consultar esta organização.' });
        }
      }
    };

    void load();
    return () => { active = false; };
  }, [orgSlug]);

  const cssVariables = useMemo(() => ({
    '--org-primary': state.organization?.colors.primary ?? '#7c5cff',
    '--org-secondary': state.organization?.colors.secondary ?? '#42d3a3',
  }) as CSSProperties, [state.organization]);

  return (
    <OrganizationContext.Provider value={state}>
      <div style={cssVariables}>{children}</div>
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganization precisa estar dentro de OrganizationProvider.');
  return context;
};

