import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { createPayment, deletePayment, loadPayments, loadStudents, updatePayment } from '../lib/data';
import { formatStudentName } from '../lib/student';
import type { Payment, Student } from '../types';
import { currentMonth, Feedback, formatDate, formatMoney, Loading, ManagementModal, todayInput } from '../components/Management';

export function Payments() {
  const { organization } = useOrganization();
  const { profile } = useAuth();
  const canManage = profile?.role === 'gerente';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [editing, setEditing] = useState<Payment | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (!organization) return;
    const [nextPayments, nextStudents] = await Promise.all([loadPayments(organization.orgId, profile || undefined), loadStudents(organization.orgId, profile || undefined)]);
    setPayments(nextPayments); setStudents(nextStudents);
  };
  useEffect(() => { refresh().catch(() => setError('Não foi possível carregar as mensalidades.')).finally(() => setLoading(false)); }, [organization, profile]);

  const visible = useMemo(() => payments.filter((item) => item.mesReferencia === month), [payments, month]);
  const history = historyStudent ? payments.filter((item) => item.alunoId === historyStudent.id) : [];
  const paymentStudentName = (payment: Payment) => {
    const student = students.find((item) => item.id === payment.alunoId);
    return student ? formatStudentName(student) : payment.alunoNome;
  };

  const newPayment = (): Payment => ({ alunoId: '', alunoNome: '', modalidade: '', valor: 0, vencimento: todayInput(), pago: false, dataPagamento: null, formaPagamento: null, observacao: '', mesReferencia: month });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!organization || !editing) return;
    const form = new FormData(event.currentTarget);
    const student = students.find((item) => item.id === String(form.get('alunoId')));
    const due = String(form.get('vencimento') || todayInput());
    const paid = form.get('pago') === 'on';
    const payload: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
      alunoId: student?.id || editing.alunoId, alunoNome: student?.nome || editing.alunoNome,
      modalidade: student?.modalidade || editing.modalidade, valor: Number(form.get('valor') || 0),
      vencimento: `${due}T12:00:00.000Z`, pago: paid,
      dataPagamento: paid ? (editing.dataPagamento || new Date().toISOString()) : null,
      formaPagamento: paid ? String(form.get('formaPagamento') || 'pix') as Payment['formaPagamento'] : null,
      observacao: String(form.get('observacao') || ''), mesReferencia: due.slice(0, 7),
    };
    setSaving(true); setError('');
    try { if (editing.id) await updatePayment(organization.orgId, editing.id, payload); else await createPayment(organization.orgId, payload); await refresh(); setEditing(null); }
    catch { setError('Não foi possível salvar a mensalidade.'); } finally { setSaving(false); }
  };

  const markPaid = async (item: Payment) => {
    if (!organization || !item.id) return;
    try { await updatePayment(organization.orgId, item.id, { pago: true, dataPagamento: new Date().toISOString(), formaPagamento: 'pix' }); await refresh(); }
    catch { setError('Não foi possível registrar o pagamento.'); }
  };

  const remove = async (item: Payment) => {
    if (!organization || !item.id || !window.confirm(`Excluir a mensalidade de ${paymentStudentName(item)}?`)) return;
    try { await deletePayment(organization.orgId, item.id); await refresh(); } catch { setError('Não foi possível excluir a mensalidade.'); }
  };

  return <section className="content-panel table-panel">
    <div className="panel-heading management-heading"><div><span>COBRANÇAS</span><h2>Mensalidades de {month.split('-').reverse().join('/')}</h2></div>{canManage && <button className="button button-primary" onClick={() => setEditing(newPayment())}>Nova mensalidade</button>}</div>
    <div className="filter-bar"><label>Mês de referência<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label><div className="filter-summary"><strong>{formatMoney(visible.filter((item) => item.pago).reduce((sum, item) => sum + item.valor, 0))}</strong><span>recebidos no mês</span></div><div className="filter-summary warning"><strong>{visible.filter((item) => !item.pago).length}</strong><span>pendências</span></div></div>
    <Feedback message={error} />
    {loading ? <Loading label="Carregando mensalidades…" /> : <div className="responsive-table"><table><thead><tr><th>Aluno</th><th>Modalidade</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Pagamento</th>{canManage && <th>Ações</th>}</tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><strong title={paymentStudentName(item)}>{paymentStudentName(item)}</strong></td><td>{item.modalidade}</td><td>{formatMoney(item.valor)}</td><td>{formatDate(item.vencimento)}</td><td><span className={`status-pill ${item.pago ? 'ativo' : 'suspenso'}`}>{item.pago ? 'Pago' : 'Em aberto'}</span></td><td>{item.dataPagamento ? `${formatDate(item.dataPagamento)} · ${item.formaPagamento || ''}` : '—'}</td>{canManage && <td><div className="row-actions"><button onClick={() => setHistoryStudent(students.find((student) => student.id === item.alunoId) || null)}>Histórico</button><button onClick={() => setEditing(item)}>Editar</button>{!item.pago && <button className="success" onClick={() => markPaid(item)}>Pagar</button>}<button className="danger" onClick={() => remove(item)}>Excluir</button></div></td>}</tr>)}</tbody></table>{!visible.length && <div className="empty-table">Nenhuma mensalidade neste mês.</div>}</div>}
    {editing && <ManagementModal title={editing.id ? 'Editar mensalidade' : 'Nova mensalidade'} onClose={() => setEditing(null)}><form className="management-form" onSubmit={submit}><label>Aluno<select name="alunoId" required defaultValue={editing.alunoId} disabled={Boolean(editing.id)}><option value="">Selecione</option>{students.map((student) => <option key={student.id} value={student.id}>{formatStudentName(student)}</option>)}</select></label><label>Valor<input name="valor" type="number" min="0" step="0.01" required defaultValue={editing.valor} /></label><label>Vencimento<input name="vencimento" type="date" required defaultValue={editing.vencimento.slice(0, 10)} /></label><label>Observação<textarea name="observacao" rows={3} defaultValue={editing.observacao} /></label><label className="check-field"><input name="pago" type="checkbox" defaultChecked={editing.pago} /> Mensalidade paga</label><label>Forma de pagamento<select name="formaPagamento" defaultValue={editing.formaPagamento || 'pix'}><option value="pix">Pix</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="boleto">Boleto</option></select></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar mensalidade'}</button></div></form></ManagementModal>}
    {historyStudent && <ManagementModal title={`Histórico — ${formatStudentName(historyStudent)}`} onClose={() => setHistoryStudent(null)} wide><div className="responsive-table compact"><table><thead><tr><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Forma</th></tr></thead><tbody>{history.map((item) => <tr key={item.id}><td>{item.mesReferencia}</td><td>{formatDate(item.vencimento)}</td><td>{formatMoney(item.valor)}</td><td>{item.pago ? 'Pago' : 'Em aberto'}</td><td>{item.formaPagamento || '—'}</td></tr>)}</tbody></table></div></ManagementModal>}
  </section>;
}
