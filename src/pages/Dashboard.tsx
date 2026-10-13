import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { useOrganization } from '../contexts/OrganizationContext';
import { loadDashboardMetrics, loadRecentStudents } from '../lib/data';
import type { DashboardMetrics, Student } from '../types';

const initialMetrics: DashboardMetrics = { activeStudents: 0, monthlyRevenue: 0, overduePayments: 0, attendanceToday: 0 };
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function Dashboard() {
  const { organization } = useOrganization();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organization) return;
    Promise.all([loadDashboardMetrics(organization.orgId), loadRecentStudents(organization.orgId)])
      .then(([nextMetrics, nextStudents]) => { setMetrics(nextMetrics); setStudents(nextStudents); })
      .catch(() => setError('Não foi possível carregar os indicadores. Confira os índices e as regras do Firestore.'))
      .finally(() => setLoading(false));
  }, [organization]);

  if (loading) return <div className="panel-loading"><span className="loader" /> Carregando indicadores…</div>;

  const cards = [
    { label: 'Alunos ativos', value: String(metrics.activeStudents), icon: 'users' as const, note: 'Base atual' },
    { label: 'Receita no mês', value: money.format(metrics.monthlyRevenue), icon: 'wallet' as const, note: 'Mensalidades pagas' },
    { label: 'Pendências', value: String(metrics.overduePayments), icon: 'receipt' as const, note: 'Mensalidades em aberto' },
    { label: 'Presentes hoje', value: String(metrics.attendanceToday), icon: 'check' as const, note: 'Check-ins registrados' },
  ];

  return (
    <div className="dashboard-page">
      <div className="welcome-row"><div><p>Olá! Aqui está o pulso da sua operação.</p></div><span>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}</span></div>
      {error && <div className="inline-alert">{error}</div>}
      <section className="metrics-grid">{cards.map((card) => <article className="metric-card" key={card.label}><div className="metric-icon"><Icon name={card.icon} /></div><div><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div></article>)}</section>
      <section className="dashboard-grid">
        <article className="content-panel activity-panel"><div className="panel-heading"><div><span>ALUNOS</span><h2>Visão da base</h2></div><a href="alunos">Ver todos <Icon name="arrow" /></a></div>{students.length ? <div className="student-list">{students.slice(0, 5).map((student) => <div className="student-row" key={student.id}><span className="student-avatar">{student.nome.charAt(0)}</span><div><strong>{student.nome}</strong><span>{student.modalidade}</span></div><span className={`status-pill ${student.status}`}>{student.status}</span></div>)}</div> : <EmptyState text="Nenhum aluno cadastrado ainda." />}</article>
        <article className="content-panel evolution-panel"><div className="panel-heading"><div><span>EVOLUÇÃO</span><h2>Resumo do mês</h2></div></div><div className="progress-visual"><div className="progress-ring"><span>{metrics.activeStudents}</span><small>alunos</small></div><p>Cadastre mensalidades e presenças para acompanhar os resultados da organização em tempo real.</p></div></article>
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><Icon name="spark" /><strong>Comece por aqui</strong><span>{text}</span></div>;
}

