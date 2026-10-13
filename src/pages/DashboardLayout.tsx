import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';

const navigation = [
  { path: 'dashboard', label: 'Visão geral', icon: 'grid' as const },
  { path: 'alunos', label: 'Alunos', icon: 'users' as const },
  { path: 'mensalidades', label: 'Mensalidades', icon: 'wallet' as const },
  { path: 'turmas', label: 'Turmas', icon: 'calendar' as const },
  { path: 'frequencia', label: 'Frequência', icon: 'check' as const },
  { path: 'financeiro', label: 'Financeiro', icon: 'chart' as const },
  { path: 'despesas', label: 'Despesas', icon: 'receipt' as const },
];

const titles: Record<string, string> = {
  dashboard: 'Visão geral', alunos: 'Alunos', mensalidades: 'Mensalidades', turmas: 'Turmas',
  frequencia: 'Frequência', financeiro: 'Financeiro', despesas: 'Despesas',
};

export function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { organization: org } = useOrganization();
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.split('/').at(-1) ?? 'dashboard';

  const leave = async () => { await logout(); navigate(`/${org?.slug}`); };

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <a className="sidebar-brand" href={`/${org?.slug}`}><span className="org-logo"><img src={org?.logoUrl} alt="" /></span><span><small>ARENAEVO</small>{org?.shortName}</span></a>
        <nav className="sidebar-nav">{navigation.map((item) => <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</nav>
        <div className="sidebar-user"><div className="avatar">{profile?.displayName?.charAt(0) || 'A'}</div><div><strong>{profile?.displayName || 'Administrador'}</strong><span>{profile?.role || 'admin'}</span></div><button onClick={leave} title="Sair"><Icon name="logout" /></button></div>
      </aside>
      <div className="dashboard-area">
        <header className="dashboard-header"><button className="menu-button" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button><div><span>GESTÃO</span><h1>{titles[current] ?? 'ArenaEvo'}</h1></div><div className="header-org"><span className="status-dot" />Operação online</div></header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  );
}

