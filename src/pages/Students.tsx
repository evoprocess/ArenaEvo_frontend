import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Icon } from '../components/Icon';
import { useOrganization } from '../contexts/OrganizationContext';
import { createStudent, loadStudents } from '../lib/data';
import type { Student } from '../types';

export function Students() {
  const { organization } = useOrganization();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = () => {
    if (!organization) return Promise.resolve();
    return loadStudents(organization.orgId).then(setStudents);
  };

  useEffect(() => {
    if (!organization) return;
    loadStudents(organization.orgId)
      .then(setStudents)
      .catch(() => setError('Não foi possível carregar os alunos.'))
      .finally(() => setLoading(false));
  }, [organization]);

  const filtered = useMemo(
    () => students.filter((student) => student.nome.toLowerCase().includes(search.toLowerCase())),
    [students, search],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError('');
    try {
      await createStudent(organization.orgId, {
        nome: String(form.get('nome') || '').trim(),
        telefone: String(form.get('telefone') || '').trim(),
        modalidade: String(form.get('modalidade') || ''),
        plano: String(form.get('plano') || ''),
        valor: Number(form.get('valor') || 0),
        status: 'ativo',
      });
      await refresh();
      setFormOpen(false);
    } catch {
      setError('Não foi possível cadastrar. Verifique sua permissão de administrador.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="content-panel table-panel">
      <div className="panel-heading">
        <div><span>BASE DE ALUNOS</span><h2>{students.length} cadastrados</h2></div>
        <div className="table-actions"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno…" /><button className="button button-primary" onClick={() => setFormOpen((value) => !value)}>{formOpen ? 'Cancelar' : 'Novo aluno'}</button></div>
      </div>
      {formOpen && (
        <form className="student-form" onSubmit={submit}>
          <label>Nome<input name="nome" required placeholder="Nome completo" /></label>
          <label>Telefone<input name="telefone" placeholder="(71) 99999-9999" /></label>
          <label>Modalidade<select name="modalidade" required><option value="">Selecione</option>{organization?.modalities.map((item) => <option key={item} value={item.toLowerCase()}>{item}</option>)}</select></label>
          <label>Plano<select name="plano"><option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="semestral">Semestral</option></select></label>
          <label>Valor<input name="valor" type="number" min="0" step="0.01" placeholder="0,00" /></label>
          <button className="button button-primary" disabled={saving}>{saving ? 'Salvando…' : 'Cadastrar aluno'}</button>
        </form>
      )}
      {error && <div className="inline-alert">{error}</div>}
      {loading ? <div className="panel-loading"><span className="loader" /> Carregando alunos…</div> : filtered.length ? <div className="responsive-table"><table><thead><tr><th>Aluno</th><th>Modalidade</th><th>Plano</th><th>Telefone</th><th>Status</th></tr></thead><tbody>{filtered.map((student) => <tr key={student.id}><td><strong>{student.nome}</strong></td><td>{student.modalidade}</td><td>{student.plano || '—'}</td><td>{student.telefone || '—'}</td><td><span className={`status-pill ${student.status}`}>{student.status}</span></td></tr>)}</tbody></table></div> : <div className="empty-state large"><Icon name="users" /><strong>Nenhum aluno encontrado</strong><span>Os alunos de {organization?.shortName} aparecerão somente nesta organização.</span></div>}
    </section>
  );
}
