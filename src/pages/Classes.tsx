import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { createClass, deleteClass, loadClasses, loadStudents, setStudentClass, updateClass } from '../lib/data';
import type { ClassGroup, Student } from '../types';
import { Feedback, Loading, ManagementModal } from '../components/Management';

const blankClass = (): ClassGroup => ({ modalidade: '', turma: 'iniciante', professor: '', dias: [], horario: '', limiteVagas: 20 });

export function Classes() {
  const { organization } = useOrganization();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editing, setEditing] = useState<ClassGroup | null>(null);
  const [managing, setManaging] = useState<ClassGroup | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => { if (!organization) return; const [nextClasses, nextStudents] = await Promise.all([loadClasses(organization.orgId), loadStudents(organization.orgId)]); setClasses(nextClasses); setStudents(nextStudents); };
  useEffect(() => { refresh().catch(() => setError('Não foi possível carregar as turmas.')).finally(() => setLoading(false)); }, [organization]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!organization || !editing) return; const form = new FormData(event.currentTarget);
    const payload: Omit<ClassGroup, 'id' | 'createdAt' | 'updatedAt'> = { modalidade: String(form.get('modalidade')), turma: String(form.get('turma')), professor: String(form.get('professor')).trim(), dias: String(form.get('dias')).split(',').map((item) => item.trim()).filter(Boolean), horario: String(form.get('horario')).trim(), limiteVagas: Number(form.get('limiteVagas') || 0) };
    setSaving(true); setError('');
    try { if (editing.id) await updateClass(organization.orgId, editing.id, payload); else await createClass(organization.orgId, payload); await refresh(); setEditing(null); }
    catch { setError('Não foi possível salvar a turma.'); } finally { setSaving(false); }
  };

  const remove = async (item: ClassGroup) => { if (!organization || !item.id || !window.confirm(`Excluir a turma ${item.modalidade} ${item.turma}?`)) return; try { await deleteClass(organization.orgId, item.id); await refresh(); } catch { setError('Não foi possível excluir a turma.'); } };
  const toggleStudent = async (student: Student, enrolled: boolean) => { if (!organization || !managing?.id) return; setSaving(true); try { await setStudentClass(organization.orgId, student, managing.id, enrolled); await refresh(); } catch { setError('Não foi possível alterar a matrícula.'); } finally { setSaving(false); } };

  const enrolled = useMemo(() => managing?.id ? students.filter((student) => student.turmas.includes(managing.id!)) : [], [students, managing]);
  const available = useMemo(() => managing?.id ? students.filter((student) => !student.turmas.includes(managing.id!)) : [], [students, managing]);
  const filterBySearch = (student: Student) => student.nome.toLowerCase().includes(search.toLowerCase());

  return <section className="content-panel table-panel">
    <div className="panel-heading management-heading"><div><span>GRADE DE AULAS</span><h2>{classes.length} turmas cadastradas</h2></div><button className="button button-primary" onClick={() => setEditing(blankClass())}>Nova turma</button></div>
    <Feedback message={error} />
    {loading ? <Loading label="Carregando turmas…" /> : <div className="responsive-table"><table><thead><tr><th>Modalidade</th><th>Turma</th><th>Professor</th><th>Dias</th><th>Horário</th><th>Ocupação</th><th>Ações</th></tr></thead><tbody>{classes.map((item) => { const count = students.filter((student) => item.id && student.turmas.includes(item.id)).length; return <tr key={item.id}><td><strong>{item.modalidade}</strong></td><td>{item.turma}</td><td>{item.professor}</td><td>{item.dias.join(', ')}</td><td>{item.horario}</td><td><span className="data-tag">{count} / {item.limiteVagas}</span></td><td><div className="row-actions"><button onClick={() => { setManaging(item); setSearch(''); }}>Alunos</button><button onClick={() => setEditing(item)}>Editar</button><button className="danger" onClick={() => remove(item)}>Excluir</button></div></td></tr>; })}</tbody></table>{!classes.length && <div className="empty-table">Nenhuma turma cadastrada.</div>}</div>}
    {editing && <ManagementModal title={editing.id ? 'Editar turma' : 'Nova turma'} onClose={() => setEditing(null)}><form className="management-form" onSubmit={submit}><label>Modalidade<select name="modalidade" required defaultValue={editing.modalidade}><option value="">Selecione</option>{organization?.modalities.map((item) => <option key={item} value={item.toLowerCase().replaceAll(' ', '-')}>{item}</option>)}</select></label><label>Turma<select name="turma" defaultValue={editing.turma}><option value="iniciante">Iniciante</option><option value="avancado">Avançado</option><option value="infantil">Infantil</option><option value="mista">Mista</option></select></label><label>Professor<input name="professor" required defaultValue={editing.professor} /></label><label>Dias da semana<input name="dias" required placeholder="segunda, quarta, sexta" defaultValue={editing.dias.join(', ')} /></label><label>Horário<input name="horario" required placeholder="19:00" defaultValue={editing.horario} /></label><label>Limite de vagas<input name="limiteVagas" type="number" min="1" required defaultValue={editing.limiteVagas} /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(null)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar turma'}</button></div></form></ManagementModal>}
    {managing && <ManagementModal title={`Gerenciar alunos — ${managing.modalidade} ${managing.turma}`} onClose={() => setManaging(null)} wide><div className="modal-search"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar aluno…" /></div><div className="dual-list"><section><h3>Na turma <span>{enrolled.length}</span></h3><div>{enrolled.filter(filterBySearch).map((student) => <article key={student.id}><div><strong>{student.nome}</strong><small>{student.modalidade}</small></div><button className="danger" disabled={saving} onClick={() => toggleStudent(student, false)}>Remover</button></article>)}{!enrolled.filter(filterBySearch).length && <p>Nenhum aluno nesta turma.</p>}</div></section><section><h3>Disponíveis <span>{available.length}</span></h3><div>{available.filter(filterBySearch).map((student) => <article key={student.id}><div><strong>{student.nome}</strong><small>{student.modalidade}</small></div><button className="success" disabled={saving} onClick={() => toggleStudent(student, true)}>Adicionar</button></article>)}{!available.filter(filterBySearch).length && <p>Nenhum aluno disponível.</p>}</div></section></div></ManagementModal>}
  </section>;
}
