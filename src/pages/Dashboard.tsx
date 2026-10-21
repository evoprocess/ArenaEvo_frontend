import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { useOrganization } from '../contexts/OrganizationContext';
import { loadDashboardMetrics } from '../lib/data';
import type { DashboardMetrics } from '../types';

const initialMetrics: DashboardMetrics = { activeStudents: 0, monthlyRevenue: 0, overduePayments: 0, attendanceToday: 0, attendanceRateToday: 0, modalityCounts: [], recentActivities: [] };
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function Dashboard() {
  const { organization } = useOrganization();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organization) return;
    loadDashboardMetrics(organization.orgId)
      .then(setMetrics)
      .catch(() => setError('Não foi possível carregar os indicadores. Confira os índices e as regras do Firestore.'))
      .finally(() => setLoading(false));
  }, [organization]);

  if (loading) return <div className="panel-loading"><span className="loader" /> Carregando indicadores…</div>;

  const cards = [
    { label: 'Alunos ativos', value: String(metrics.activeStudents), icon: 'users' as const, note: 'Base atual' },
    { label: 'Receita no mês', value: money.format(metrics.monthlyRevenue), icon: 'wallet' as const, note: 'Mensalidades pagas' },
    { label: 'Pendências', value: String(metrics.overduePayments), icon: 'receipt' as const, note: 'Mensalidades em aberto' },
    { label: 'Frequência hoje', value: `${metrics.attendanceRateToday}%`, icon: 'check' as const, note: `${metrics.attendanceToday} presentes` },
  ];

  return (
    <div className="dashboard-page">
      <div className="welcome-row"><div><p>Olá! Aqui está o pulso da sua operação.</p></div><span>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}</span></div>
      {error && <div className="inline-alert">{error}</div>}
      <section className="metrics-grid">{cards.map((card) => <article className="metric-card" key={card.label}><div className="metric-icon"><Icon name={card.icon} /></div><div><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div></article>)}</section>
      <section className="dashboard-grid">
        <article className="content-panel"><div className="panel-heading"><div><span>ALUNOS ATIVOS</span><h2>Distribuição por modalidade</h2></div></div><div className="distribution-list">{metrics.modalityCounts.map((item) => <div key={item.name}><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></article>
        <article className="content-panel"><div className="panel-heading"><div><span>MOVIMENTAÇÃO</span><h2>Últimas atividades</h2></div></div>{metrics.recentActivities.length ? <div className="activity-list">{metrics.recentActivities.map((item, index) => <div key={`${item}-${index}`}><span className="status-dot" />{item}</div>)}</div> : <EmptyState text="Nenhuma atividade recente." />}</article>
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><Icon name="spark" /><strong>Comece por aqui</strong><span>{text}</span></div>;
}

