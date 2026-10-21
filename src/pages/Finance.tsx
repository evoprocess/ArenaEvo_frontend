import { useEffect, useState } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { loadFinancialData } from '../lib/data';
import type { FinancialSummary, Payment } from '../types';
import { currentMonth, Feedback, formatMoney, Loading } from '../components/Management';

type FinanceData = { summary: FinancialSummary; history: FinancialSummary[]; byModality: Array<{ name: string; value: number }>; overdue: Payment[] };
const emptyData = (mes: string): FinanceData => ({ summary: { mes, receitas: 0, despesas: 0, lucro: 0 }, history: [], byModality: [], overdue: [] });

export function Finance() {
  const { organization } = useOrganization();
  const [month, setMonth] = useState(currentMonth());
  const [modality, setModality] = useState('');
  const [status, setStatus] = useState<'' | 'pagos' | 'nao-pagos'>('');
  const [data, setData] = useState<FinanceData>(emptyData(month));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = async () => { if (!organization) return; setLoading(true); setError(''); try { setData(await loadFinancialData(organization.orgId, month, modality || undefined, status || undefined)); } catch { setError('Não foi possível consolidar os dados financeiros.'); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, [organization, month, modality, status]);

  return <div className="finance-page">
    <section className="content-panel"><div className="panel-heading"><div><span>CONSOLIDAÇÃO</span><h2>Financeiro</h2></div></div><div className="filter-bar"><label>Mês<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label><select value={modality} onChange={(e) => setModality(e.target.value)}><option value="">Todas as modalidades</option>{organization?.modalities.map((item) => <option key={item} value={item.toLowerCase().replaceAll(' ', '-')}>{item}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="">Todos os pagamentos</option><option value="pagos">Pagos</option><option value="nao-pagos">Não pagos</option></select><button className="button button-ghost" onClick={refresh}>Recarregar</button></div><Feedback message={error} /></section>
    {loading ? <section className="content-panel"><Loading label="Consolidando financeiro…" /></section> : <>
      <section className="metrics-grid finance-metrics"><article className="metric-card"><div><span>Receitas</span><strong>{formatMoney(data.summary.receitas)}</strong><small>Mensalidades pagas</small></div></article><article className="metric-card"><div><span>Despesas</span><strong>{formatMoney(data.summary.despesas)}</strong><small>Custos do mês</small></div></article><article className="metric-card"><div><span>Resultado</span><strong className={data.summary.lucro < 0 ? 'negative' : 'positive'}>{formatMoney(data.summary.lucro)}</strong><small>Receitas menos despesas</small></div></article><article className="metric-card"><div><span>Inadimplentes</span><strong>{data.overdue.length}</strong><small>Mensalidades em aberto</small></div></article></section>
      <section className="finance-grid"><article className="content-panel"><div className="panel-heading"><div><span>RECEITAS</span><h2>Por modalidade</h2></div></div><div className="responsive-table compact"><table><thead><tr><th>Modalidade</th><th>Valor</th></tr></thead><tbody>{data.byModality.map((item) => <tr key={item.name}><td><strong>{item.name}</strong></td><td>{formatMoney(item.value)}</td></tr>)}</tbody></table>{!data.byModality.length && <div className="empty-table">Nenhuma receita registrada.</div>}</div></article><article className="content-panel"><div className="panel-heading"><div><span>PENDÊNCIAS</span><h2>Inadimplentes</h2></div></div><div className="responsive-table compact"><table><thead><tr><th>Aluno</th><th>Valor</th></tr></thead><tbody>{data.overdue.map((item) => <tr key={item.id}><td><strong>{item.alunoNome}</strong></td><td>{formatMoney(item.valor)}</td></tr>)}</tbody></table>{!data.overdue.length && <div className="empty-table">Nenhum inadimplente no mês.</div>}</div></article></section>
      <section className="content-panel finance-history"><div className="panel-heading"><div><span>ÚLTIMOS 12 MESES</span><h2>Histórico mensal</h2></div></div><div className="responsive-table"><table><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Resultado</th></tr></thead><tbody>{data.history.map((item) => <tr key={item.mes}><td><strong>{item.mes.split('-').reverse().join('/')}</strong></td><td>{formatMoney(item.receitas)}</td><td>{formatMoney(item.despesas)}</td><td className={item.lucro < 0 ? 'negative' : 'positive'}>{formatMoney(item.lucro)}</td></tr>)}</tbody></table></div></section>
    </>}
  </div>;
}
