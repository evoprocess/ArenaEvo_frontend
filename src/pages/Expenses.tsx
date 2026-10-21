import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { createExpense, deleteExpense, loadExpenses, updateExpense } from '../lib/data';
import type { Expense, ExpenseCategory } from '../types';
import { Feedback, formatDate, formatMoney, Loading, ManagementModal, todayInput } from '../components/Management';

const categories: Array<{ value: ExpenseCategory; label: string }> = [{ value: 'aluguel', label: 'Aluguel' }, { value: 'agua', label: 'Água' }, { value: 'luz', label: 'Luz' }, { value: 'internet', label: 'Internet' }, { value: 'material', label: 'Material' }, { value: 'professor', label: 'Professor' }, { value: 'outros', label: 'Outros' }];
const blankExpense = (): Expense => ({ data: todayInput(), descricao: '', categoria: 'outros', valor: 0 });

export function Expenses() {
  const { organization } = useOrganization();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({ categoria: '', start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const refresh = async () => { if (organization) setExpenses(await loadExpenses(organization.orgId)); };
  useEffect(() => { refresh().catch(() => setError('Não foi possível carregar as despesas.')).finally(() => setLoading(false)); }, [organization]);
  const visible = useMemo(() => expenses.filter((item) => (!filters.categoria || item.categoria === filters.categoria) && (!filters.start || item.data >= filters.start) && (!filters.end || item.data <= filters.end)), [expenses, filters]);

  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!organization || !editing) return; const form = new FormData(event.currentTarget); const payload = { data: String(form.get('data')), descricao: String(form.get('descricao')).trim(), categoria: String(form.get('categoria')) as ExpenseCategory, valor: Number(form.get('valor') || 0) }; setSaving(true); setError(''); try { if (editing.id) await updateExpense(organization.orgId, editing.id, payload); else await createExpense(organization.orgId, payload); await refresh(); setEditing(null); } catch { setError('Não foi possível salvar a despesa.'); } finally { setSaving(false); } };
  const remove = async (item: Expense) => { if (!organization || !item.id || !window.confirm(`Excluir a despesa “${item.descricao}”?`)) return; try { await deleteExpense(organization.orgId, item.id); await refresh(); } catch { setError('Não foi possível excluir a despesa.'); } };

  return <section className="content-panel table-panel">
    <div className="panel-heading management-heading"><div><span>CUSTOS OPERACIONAIS</span><h2>{formatMoney(visible.reduce((sum, item) => sum + item.valor, 0))} no período</h2></div><button className="button button-primary" onClick={() => setEditing(blankExpense())}>Nova despesa</button></div>
    <div className="filter-bar"><select value={filters.categoria} onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}><option value="">Todas as categorias</option>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><label>De<input type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} /></label><label>Até<input type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} /></label><button className="button button-ghost" onClick={() => setFilters({ categoria: '', start: '', end: '' })}>Limpar filtros</button></div>
    <Feedback message={error} />
    {loading ? <Loading label="Carregando despesas…" /> : <div className="responsive-table"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Ações</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td>{formatDate(item.data)}</td><td><strong>{item.descricao}</strong></td><td><span className="data-tag">{categories.find((category) => category.value === item.categoria)?.label || item.categoria}</span></td><td>{formatMoney(item.valor)}</td><td><div className="row-actions"><button onClick={() => setEditing(item)}>Editar</button><button className="danger" onClick={() => remove(item)}>Excluir</button></div></td></tr>)}</tbody></table>{!visible.length && <div className="empty-table">Nenhuma despesa encontrada.</div>}</div>}
    {editing && <ManagementModal title={editing.id ? 'Editar despesa' : 'Nova despesa'} onClose={() => setEditing(null)}><form className="management-form" onSubmit={submit}><label>Data<input name="data" type="date" required defaultValue={editing.data} /></label><label>Descrição<input name="descricao" required placeholder="Ex.: Compra de luvas" defaultValue={editing.descricao} /></label><label>Categoria<select name="categoria" defaultValue={editing.categoria}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Valor<input name="valor" type="number" min="0" step="0.01" required defaultValue={editing.valor} /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar despesa'}</button></div></form></ManagementModal>}
  </section>;
}
