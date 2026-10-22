import { useEffect, useMemo, useState } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { loadAttendance, loadClasses, loadStudents, saveAttendance } from '../lib/data';
import type { Attendance, ClassGroup, Student } from '../types';
import { Feedback, Loading, todayInput } from '../components/Management';

export function AttendancePage() {
  const { organization } = useOrganization();
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(todayInput());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!organization) return;
    Promise.all([loadClasses(organization.orgId, profile || undefined), loadStudents(organization.orgId, profile || undefined)]).then(([nextClasses, nextStudents]) => { setClasses(nextClasses); setStudents(nextStudents); setClassId((current) => current || nextClasses[0]?.id || ''); }).catch(() => setError('Não foi possível carregar as turmas.')).finally(() => setLoading(false));
  }, [organization, profile]);

  const refresh = async () => {
    if (!organization || !classId) { setRecords([]); return; }
    setLoading(true); setError(''); setSuccess('');
    try { setRecords(await loadAttendance(organization.orgId, date, classId, profile || undefined)); }
    catch { setError('Não foi possível carregar a frequência.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, [organization, classId, date]);

  const enrolled = useMemo(() => students.filter((student) => student.turmas.includes(classId)), [students, classId]);
  const recordFor = (studentId?: string) => records.find((item) => item.alunoId === studentId);
  const toggle = (student: Student, present: boolean) => {
    if (!student.id) return; const existing = recordFor(student.id);
    if (existing) setRecords(records.map((item) => item.alunoId === student.id ? { ...item, presenca: present } : item));
    else setRecords([...records, { data: date, alunoId: student.id, turmaId: classId, nome: student.nome, modalidade: student.modalidade, presenca: present }]);
  };

  const save = async () => {
    if (!organization) return; setSaving(true); setError(''); setSuccess('');
    const complete = enrolled.map((student) => recordFor(student.id) || ({ data: date, alunoId: student.id!, turmaId: classId, nome: student.nome, modalidade: student.modalidade, presenca: false } as Attendance));
    try { await saveAttendance(organization.orgId, complete); await refresh(); setSuccess('Frequência salva com sucesso.'); }
    catch { setError('Não foi possível salvar a frequência.'); } finally { setSaving(false); }
  };
  const present = enrolled.filter((student) => recordFor(student.id)?.presenca).length;
  const allRecorded = enrolled.length > 0 && enrolled.every((student) => recordFor(student.id));

  return <section className="content-panel table-panel">
    <div className="panel-heading"><div><span>CHAMADA</span><h2>Registro de frequência</h2></div><div className="attendance-stats"><span className={`status-pill ${allRecorded ? 'ativo' : 'suspenso'}`}>{allRecorded ? 'Todos registrados' : 'Pendente'}</span><strong>{present} / {enrolled.length} presentes</strong></div></div>
    <div className="filter-bar"><label>Turma<select value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">Selecione</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.modalidade} {item.turma} — {item.professor}</option>)}</select></label><label>Data<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><button className="button button-ghost" onClick={refresh}>Recarregar</button></div>
    <Feedback message={error} /><Feedback message={success} type="success" />
    {loading ? <Loading label="Carregando frequência…" /> : !classId ? <div className="empty-table">Cadastre ou selecione uma turma.</div> : <><div className="responsive-table"><table><thead><tr><th>#</th><th>Aluno</th><th>Modalidade</th><th>Status</th><th>Presença</th><th>Situação</th></tr></thead><tbody>{enrolled.map((student, index) => { const record = recordFor(student.id); return <tr key={student.id}><td>{index + 1}</td><td><strong>{student.nome}</strong></td><td>{student.modalidade}</td><td><span className={`status-pill ${student.status}`}>{student.status}</span></td><td><label className="attendance-check"><input type="checkbox" checked={Boolean(record?.presenca)} onChange={(e) => toggle(student, e.target.checked)} /><span /></label></td><td><span className={`status-pill ${record ? (record.presenca ? 'ativo' : 'inativo') : ''}`}>{record ? (record.presenca ? 'Presente' : 'Ausente') : 'Não registrado'}</span></td></tr>; })}</tbody></table>{!enrolled.length && <div className="empty-table">Nenhum aluno ativo matriculado nesta turma.</div>}</div>{enrolled.length > 0 && <div className="page-actions"><button className="button button-primary" disabled={saving} onClick={save}>{saving ? 'Salvando…' : 'Salvar frequência'}</button></div>}</>}
  </section>;
}
