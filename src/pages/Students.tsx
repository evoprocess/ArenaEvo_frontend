import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { createStudent, deleteStudent, loadClasses, loadStudents, updateStudent } from '../lib/data';
import { formatStudentName } from '../lib/student';
import type { ClassGroup, Student } from '../types';
import { Feedback, Loading, ManagementModal, formatMoney, todayInput } from '../components/Management';

const blankStudent = (): Student => ({
  nome: '', observacao: '', telefone: '', modalidade: '', turmas: [], horario: '', dataMatricula: todayInput(),
  plano: 'mensal', valor: 0, vencimento: 1, status: 'ativo',
});

export function Students() {
  const { organization } = useOrganization();
  const { profile } = useAuth();
  const canManage = profile?.role === 'gerente';
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [editing, setEditing] = useState<Student | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', modalidade: '', turma: '', status: '' });

  const refresh = async () => {
    if (!organization) return;
    const [nextStudents, nextClasses] = await Promise.all([loadStudents(organization.orgId, profile || undefined), loadClasses(organization.orgId, profile || undefined)]);
    setStudents(nextStudents); setClasses(nextClasses);
  };

  useEffect(() => {
    refresh().catch(() => setError('Não foi possível carregar os alunos.')).finally(() => setLoading(false));
  }, [organization, profile]);

  const filtered = useMemo(() => students.filter((student) =>
    (!filters.search || formatStudentName(student).toLowerCase().includes(filters.search.toLowerCase())) &&
    (!filters.modalidade || student.modalidade === filters.modalidade) &&
    (!filters.turma || student.turmas.includes(filters.turma)) &&
    (!filters.status || student.status === filters.status),
  ), [students, filters]);

  const openForm = (student?: Student) => { setEditing(student || blankStudent()); setFormOpen(true); setError(''); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization || !editing) return;
    const form = new FormData(event.currentTarget);
    const payload: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
      nome: String(form.get('nome') || '').trim(), observacao: String(form.get('observacao') || '').trim(), telefone: String(form.get('telefone') || '').trim(),
      modalidade: String(form.get('modalidade') || ''), turmas: form.getAll('turmas').map(String),
      horario: String(form.get('horario') || ''), dataMatricula: String(form.get('dataMatricula') || ''),
      plano: String(form.get('plano')) as Student['plano'], valor: Number(form.get('valor') || 0),
      vencimento: Number(form.get('vencimento') || 1), status: String(form.get('status')) as Student['status'],
    };
    setSaving(true); setError('');
    try {
      if (editing.id) await updateStudent(organization.orgId, editing.id, payload);
      else await createStudent(organization.orgId, payload);
      await refresh(); setFormOpen(false); setEditing(null);
    } catch { setError('Não foi possível salvar o aluno. Confira sua permissão.'); }
    finally { setSaving(false); }
  };

  const remove = async (student: Student) => {
    if (!organization || !student.id || !window.confirm(`Excluir ${formatStudentName(student)}?`)) return;
    try { await deleteStudent(organization.orgId, student.id); await refresh(); }
    catch { setError('Não foi possível excluir o aluno.'); }
  };

  const className = (id: string) => {
    const item = classes.find((value) => value.id === id);
    return item ? `${item.modalidade} ${item.turma}` : id;
  };

  return (
    <section className="content-panel table-panel">
      <div className="panel-heading management-heading"><div><span>{profile?.role === 'cliente' ? 'MEUS DADOS' : 'BASE DE ALUNOS'}</span><h2>{profile?.role === 'cliente' ? 'Cadastro do aluno' : `${students.length} cadastrados`}</h2></div>{canManage && <button className="button button-primary" onClick={() => openForm()}>Novo aluno</button>}</div>
      <div className="filter-bar">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Buscar por nome…" />
        <select value={filters.modalidade} onChange={(e) => setFilters({ ...filters, modalidade: e.target.value })}><option value="">Todas as modalidades</option>{organization?.modalities.map((item) => <option key={item} value={item.toLowerCase().replaceAll(' ', '-')}>{item}</option>)}</select>
        <select value={filters.turma} onChange={(e) => setFilters({ ...filters, turma: e.target.value })}><option value="">Todas as turmas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.modalidade} {item.turma}</option>)}</select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">Todos os status</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="suspenso">Suspenso</option></select>
      </div>
      <Feedback message={error} />
      {loading ? <Loading label="Carregando alunos…" /> : <div className="responsive-table"><table><thead><tr><th>Aluno</th><th>Modalidade</th><th>Turmas</th><th>Plano</th><th>Valor</th><th>Venc.</th><th>Status</th>{canManage && <th>Ações</th>}</tr></thead><tbody>{filtered.map((student) => <tr key={student.id}><td><strong title={formatStudentName(student)}>{formatStudentName(student)}</strong><small className="cell-note">{student.telefone || 'Sem telefone'}</small></td><td>{student.modalidade}</td><td><div className="tag-list">{student.turmas.length ? student.turmas.map((id) => <span className="data-tag" key={id}>{className(id)}</span>) : '—'}</div></td><td>{student.plano}</td><td>{formatMoney(student.valor)}</td><td>Dia {student.vencimento}</td><td><span className={`status-pill ${student.status}`}>{student.status}</span></td>{canManage && <td><div className="row-actions"><button onClick={() => openForm(student)}>Editar</button><button className="danger" onClick={() => remove(student)}>Excluir</button></div></td>}</tr>)}</tbody></table>{!filtered.length && <div className="empty-table">Nenhum aluno encontrado.</div>}</div>}
      {formOpen && editing && <ManagementModal title={editing.id ? 'Editar aluno' : 'Novo aluno'} onClose={() => setFormOpen(false)} wide><form className="management-form form-grid" onSubmit={submit}>
        <label className="span-2">Nome<input name="nome" required defaultValue={editing.nome} /></label><label>Observação<input name="observacao" placeholder="Ex.: responsável" defaultValue={editing.observacao} /></label><label>Telefone<input name="telefone" required defaultValue={editing.telefone} /></label><label>Modalidade<select name="modalidade" required defaultValue={editing.modalidade}><option value="">Selecione</option>{organization?.modalities.map((item) => <option key={item} value={item.toLowerCase().replaceAll(' ', '-')}>{item}</option>)}</select></label>
        <label className="span-2">Turmas<select name="turmas" multiple required defaultValue={editing.turmas}>{classes.map((item) => <option key={item.id} value={item.id}>{item.modalidade} {item.turma} — {item.professor}</option>)}</select><small>Use Ctrl/Cmd para selecionar mais de uma.</small></label><label>Horário<input name="horario" required placeholder="19:00" defaultValue={editing.horario} /></label><label>Data de matrícula<input name="dataMatricula" type="date" required defaultValue={editing.dataMatricula} /></label>
        <label>Plano<select name="plano" defaultValue={editing.plano}><option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="semestral">Semestral</option></select></label><label>Valor<input name="valor" type="number" min="0" step="0.01" required defaultValue={editing.valor} /></label><label>Dia de vencimento<input name="vencimento" type="number" min="1" max="31" required defaultValue={editing.vencimento} /></label><label>Status<select name="status" defaultValue={editing.status}><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="suspenso">Suspenso</option></select></label>
        <div className="form-actions span-all"><button type="button" className="button button-ghost" onClick={() => setFormOpen(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar aluno'}</button></div>
      </form></ManagementModal>}
    </section>
  );
}
