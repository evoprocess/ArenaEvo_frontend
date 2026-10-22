import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlatformHome } from './pages/PlatformHome';
import { OrganizationHome } from './pages/OrganizationHome';
import { DashboardLayout } from './pages/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Payments } from './pages/Payments';
import { Classes } from './pages/Classes';
import { AttendancePage } from './pages/AttendancePage';
import { Finance } from './pages/Finance';
import { Expenses } from './pages/Expenses';
import { AdminOrganizations } from './pages/AdminOrganizations';
import type { UserRole } from './types';

function PlatformLayout() {
  return <AdminAuthProvider><Outlet /></AdminAuthProvider>;
}

function ProtectedAdminArea() {
  const { session, loading } = useAdminAuth();
  if (loading) return <div className="full-state"><span className="loader" /><p>Validando acesso administrativo…</p></div>;
  if (!session) return <Navigate to="/" replace />;
  return <AdminOrganizations />;
}

function ProtectedArea() {
  const { user, loading } = useAuth();
  const { organization } = useOrganization();

  if (loading) return <div className="full-state"><span className="loader" /><p>Validando seu acesso…</p></div>;
  if (!user) return <Navigate to={`/${organization?.slug ?? ''}`} replace />;
  return <DashboardLayout />;
}

function DefaultManagementRoute() {
  const { profile } = useAuth();
  const { organization } = useOrganization();
  const destination = profile?.role === 'gerente' ? 'dashboard' : profile?.role === 'supervisor' ? 'turmas' : 'alunos';
  return <Navigate to={`/${organization?.slug ?? ''}/gestao/${destination}`} replace />;
}

function RequireRole({ allowed, children }: { allowed: UserRole[]; children: ReactNode }) {
  const { profile } = useAuth();
  if (!profile || !allowed.includes(profile.role)) return <DefaultManagementRoute />;
  return children;
}

function OrganizationRoutes() {
  const { organization, loading, error } = useOrganization();

  if (loading) return <div className="full-state"><span className="loader" /><p>Preparando sua arena…</p></div>;
  if (error || !organization) {
    return <div className="full-state"><div className="state-code">404</div><h1>Organização não encontrada</h1><p>{error}</p><Link className="button button-primary" to="/">Voltar para ArenaEvo</Link></div>;
  }

  return (
    <AuthProvider>
      <Routes>
        <Route index element={<OrganizationHome />} />
        <Route path="gestao" element={<ProtectedArea />}>
          <Route index element={<DefaultManagementRoute />} />
          <Route path="dashboard" element={<RequireRole allowed={['gerente']}><Dashboard /></RequireRole>} />
          <Route path="alunos" element={<RequireRole allowed={['gerente', 'supervisor', 'cliente']}><Students /></RequireRole>} />
          <Route path="mensalidades" element={<RequireRole allowed={['gerente', 'cliente']}><Payments /></RequireRole>} />
          <Route path="turmas" element={<RequireRole allowed={['gerente', 'supervisor']}><Classes /></RequireRole>} />
          <Route path="frequencia" element={<RequireRole allowed={['gerente', 'supervisor']}><AttendancePage /></RequireRole>} />
          <Route path="financeiro" element={<RequireRole allowed={['gerente']}><Finance /></RequireRole>} />
          <Route path="despesas" element={<RequireRole allowed={['gerente']}><Expenses /></RequireRole>} />
        </Route>
        <Route path="*" element={<Navigate to={`/${organization.slug}`} replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PlatformLayout />}>
        <Route path="/" element={<PlatformHome />} />
        <Route path="/admin" element={<ProtectedAdminArea />} />
      </Route>
      <Route path="/:orgSlug/*" element={<OrganizationProvider><OrganizationRoutes /></OrganizationProvider>} />
    </Routes>
  );
}

