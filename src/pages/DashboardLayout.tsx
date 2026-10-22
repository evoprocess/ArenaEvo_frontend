import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import type { UserRole } from '../types';

const navigation: Array<{ path: string; label: string; icon: 'grid' | 'users' | 'wallet' | 'calendar' | 'check' | 'chart' | 'receipt'; roles: UserRole[] }> = [
  { path: 'dashboard', label: 'Visão geral', icon: 'grid', roles: ['gerente'] },
  { path: 'alunos', label: 'Alunos', icon: 'users', roles: ['gerente', 'supervisor', 'cliente'] },
  { path: 'mensalidades', label: 'Mensalidades', icon: 'wallet', roles: ['gerente', 'cliente'] },
  { path: 'turmas', label: 'Turmas', icon: 'calendar', roles: ['gerente', 'supervisor'] },
  { path: 'frequencia', label: 'Frequência', icon: 'check', roles: ['gerente', 'supervisor'] },
  { path: 'financeiro', label: 'Financeiro', icon: 'chart', roles: ['gerente'] },
  { path: 'despesas', label: 'Despesas', icon: 'receipt', roles: ['gerente'] },
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
        <Link className="sidebar-brand" to={`/${org?.slug}`}><span className="org-logo"><img src={org?.logoUrl} alt="" /></span><span><small>ARENAEVO</small>{org?.shortName}</span></Link>
        <nav className="sidebar-nav">{navigation.filter((item) => profile && item.roles.includes(profile.role)).map((item) => <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon name={item.icon} /><span>{profile?.role === 'cliente' && item.path === 'alunos' ? 'Meus dados' : item.label}</span></NavLink>)}</nav>
        <div className="sidebar-user"><div className="avatar">{profile?.displayName?.charAt(0) || 'A'}</div><div><strong>{profile?.displayName || 'Administrador'}</strong><span>{profile?.role || 'gerente'}</span></div><button onClick={leave} title="Sair"><Icon name="logout" /></button></div>
      </aside>
      <div className="dashboard-area">
        <header className="dashboard-header"><button className="menu-button" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button><div><span>GESTÃO</span><h1>{titles[current] ?? 'ArenaEvo'}</h1></div><div className="header-org"><span className="status-dot" />Operação online</div></header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  );
}

