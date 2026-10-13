import { Icon } from '../components/Icon';
import { useOrganization } from '../contexts/OrganizationContext';

const content = {
  mensalidades: { title: 'Mensalidades', text: 'Acompanhe vencimentos, pagamentos e inadimplência por aluno.', icon: 'wallet' as const },
  turmas: { title: 'Turmas', text: 'Organize horários, modalidades, professores e capacidade.', icon: 'calendar' as const },
  frequencia: { title: 'Frequência', text: 'Registre presença por turma e acompanhe a constância dos alunos.', icon: 'check' as const },
  financeiro: { title: 'Financeiro', text: 'Visualize receitas, despesas e resultado mensal da organização.', icon: 'chart' as const },
  despesas: { title: 'Despesas', text: 'Centralize custos recorrentes e gastos operacionais.', icon: 'receipt' as const },
};

export function ModulePage({ type }: { type: keyof typeof content }) {
  const item = content[type];
  const { organization } = useOrganization();
  return <section className="content-panel module-intro"><div className="module-icon"><Icon name={item.icon} /></div><p className="eyebrow">{organization?.shortName}</p><h2>{item.title}</h2><p>{item.text}</p><div className="module-note"><Icon name="shield" /><div><strong>Estrutura multi-organização pronta</strong><span>Os registros deste módulo serão gravados em <code>organizations/{organization?.orgId}/{type}</code>.</span></div></div><button className="button button-primary">Criar primeiro registro</button></section>;
}
