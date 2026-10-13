import { useEffect, useMemo, useState } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { loadRecentStudents } from '../lib/data';
import type { Student } from '../types';
import { Icon } from '../components/Icon';

export function Students() {
  const { organization } = useOrganization();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;
    loadRecentStudents(organization.orgId).then(setStudents).finally(() => setLoading(false));
  }, [organization]);

  const filtered = useMemo(() => students.filter((student) => student.nome.toLowerCase().includes(search.toLowerCase())), [students, search]);

  return (
    <section className="content-panel table-panel">
      <div className="panel-heading"><div><span>BASE DE ALUNOS</span><h2>{students.length} cadastrados</h2></div><div className="table-actions"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno…" /><button className="button button-primary">Novo aluno</button></div></div>
      {loading ? <div className="panel-loading"><span className="loader" /> Carregando alunos…</div> : filtered.length ? <div className="responsive-table"><table><thead><tr><th>Aluno</th><th>Modalidade</th><th>Plano</th><th>Telefone</th><th>Status</th></tr></thead><tbody>{filtered.map((student) => <tr key={student.id}><td><strong>{student.nome}</strong></td><td>{student.modalidade}</td><td>{student.plano || '—'}</td><td>{student.telefone || '—'}</td><td><span className={`status-pill ${student.status}`}>{student.status}</span></td></tr>)}</tbody></table></div> : <div className="empty-state large"><Icon name="users" /><strong>Nenhum aluno encontrado</strong><span>Os alunos de {organization?.shortName} aparecerão somente nesta organização.</span></div>}
    </section>
  );
}

