import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { createOrganization, listOrganizations, updateOrganization } from '../lib/admin';
import type { OrganizationInput, OrganizationUpdate } from '../lib/admin';
import type { AdminOrganization } from '../types';
import { Icon } from '../components/Icon';

const emptyOrganization: OrganizationInput = {
  orgId: '',
  slug: '',
  name: '',
  shortName: '',
  active: true,
};

const messageFrom = (error: unknown) =>
  error instanceof Error ? error.message : 'Não foi possível concluir a operação.';

const sortOrganizations = (items: AdminOrganization[]) =>
  [...items].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));

export function AdminOrganizations() {
  const { session, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [draft, setDraft] = useState<OrganizationInput>(emptyOrganization);
  const [editing, setEditing] = useState<AdminOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    listOrganizations()
      .then(setOrganizations)
      .catch((nextError) => setError(messageFrom(nextError)))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((organization) => organization.active).length,
    inactive: organizations.filter((organization) => !organization.active).length,
  }), [organizations]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy('create');
    try {
      const organization = await createOrganization(draft);
      setOrganizations((current) => sortOrganizations([...current, organization]));
      setDraft(emptyOrganization);
    } catch (nextError) {
      setError(messageFrom(nextError));
    } finally {
      setBusy('');
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setError('');
    setBusy(editing.orgId);
    try {
      const updates: OrganizationUpdate = {
        slug: editing.slug,
        name: editing.name,
        shortName: editing.shortName,
        active: editing.active,
      };
      const organization = await updateOrganization(editing.orgId, updates);
      setOrganizations((current) => sortOrganizations(
        current.map((item) => item.orgId === organization.orgId ? organization : item),
      ));
      setEditing(null);
    } catch (nextError) {
      setError(messageFrom(nextError));
    } finally {
      setBusy('');
    }
  };

  const toggleStatus = async (organization: AdminOrganization) => {
    setError('');
    setBusy(organization.orgId);
    try {
      const updated = await updateOrganization(organization.orgId, { active: !organization.active });
      setOrganizations((current) => current.map((item) => item.orgId === updated.orgId ? updated : item));
      if (editing?.orgId === updated.orgId) setEditing(updated);
    } catch (nextError) {
      setError(messageFrom(nextError));
    } finally {
      setBusy('');
    }
  };

  const leave = async () => {
    await logout();
    navigate('/');
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="brand" to="/"><span className="brand-mark">AE</span><span>ArenaEvo</span></Link>
        <div className="admin-account"><span>{session?.email}</span><button className="button button-ghost" onClick={leave}><Icon name="logout" /> Sair</button></div>
      </header>

      <div className="admin-container">
        <section className="admin-title">
          <div><p className="eyebrow"><Icon name="shield" /> Administração da plataforma</p><h1>Organizações</h1><p>Cadastre e controle os ambientes conectados à ArenaEvo.</p></div>
          <div className="admin-metrics"><div><strong>{metrics.total}</strong><span>Total</span></div><div><strong>{metrics.active}</strong><span>Ativas</span></div><div><strong>{metrics.inactive}</strong><span>Inativas</span></div></div>
        </section>

        {error && <div className="inline-alert admin-alert" role="alert">{error}</div>}

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span>NOVA ORGANIZAÇÃO</span><h2>Cadastrar ambiente</h2></div></div>
          <form className="organization-form" onSubmit={create}>
            <label>Identificador<input value={draft.orgId} onChange={(event) => setDraft({ ...draft, orgId: event.target.value.toUpperCase() })} placeholder="ORG_0002" pattern="ORG_[0-9]{4,}" required /></label>
            <label>Link<input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase() })} placeholder="academia-centro" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
            <label>Nome completo<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Academia Centro" required /></label>
            <label>Nome curto<input value={draft.shortName} onChange={(event) => setDraft({ ...draft, shortName: event.target.value })} placeholder="AC Centro" required /></label>
            <button className="button button-primary" disabled={busy === 'create'}>{busy === 'create' ? 'Cadastrando…' : 'Cadastrar organização'}</button>
          </form>
        </section>

        <section className="admin-panel organization-panel">
          <div className="admin-panel-heading"><div><span>AMBIENTES</span><h2>Organizações cadastradas</h2></div></div>
          {loading ? <div className="panel-loading"><span className="loader" />Carregando organizações…</div> : organizations.length === 0 ? <div className="empty-state"><Icon name="grid" /><strong>Nenhuma organização cadastrada</strong></div> : (
            <div className="responsive-table">
              <table>
                <thead><tr><th>Organização</th><th>Identificador</th><th>Link</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>{organizations.map((organization) => (
                  <tr key={organization.orgId}>
                    <td><strong>{organization.name}</strong><small>{organization.shortName}</small></td>
                    <td><code>{organization.orgId}</code></td>
                    <td><Link className="organization-link" to={`/${organization.slug}`} target="_blank">/{organization.slug} <Icon name="arrow" /></Link></td>
                    <td><span className={`admin-status ${organization.active ? 'active' : 'inactive'}`}>{organization.active ? 'Ativa' : 'Inativa'}</span></td>
                    <td><div className="admin-row-actions"><button onClick={() => setEditing(organization)}>Editar</button><button disabled={busy === organization.orgId} onClick={() => void toggleStatus(organization)}>{organization.active ? 'Desativar' : 'Ativar'}</button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        {editing && (
          <section className="admin-panel edit-panel">
            <div className="admin-panel-heading"><div><span>{editing.orgId}</span><h2>Editar organização</h2></div><button className="dialog-close static" onClick={() => setEditing(null)} aria-label="Fechar"><Icon name="close" /></button></div>
            <form className="organization-form edit" onSubmit={saveEdit}>
              <label>Link<input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value.toLowerCase() })} required /></label>
              <label>Nome completo<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required /></label>
              <label>Nome curto<input value={editing.shortName} onChange={(event) => setEditing({ ...editing, shortName: event.target.value })} required /></label>
              <label>Status<select value={editing.active ? 'active' : 'inactive'} onChange={(event) => setEditing({ ...editing, active: event.target.value === 'active' })}><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label>
              <button className="button button-primary" disabled={busy === editing.orgId}>{busy === editing.orgId ? 'Salvando…' : 'Salvar alterações'}</button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
