import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
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
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alunos" element={<Students />} />
          <Route path="mensalidades" element={<Payments />} />
          <Route path="turmas" element={<Classes />} />
          <Route path="frequencia" element={<AttendancePage />} />
          <Route path="financeiro" element={<Finance />} />
          <Route path="despesas" element={<Expenses />} />
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

