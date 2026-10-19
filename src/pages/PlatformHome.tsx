import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLoginDialog } from '../components/AdminLoginDialog';
import { Icon } from '../components/Icon';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { getCommercialWhatsappUrl } from '../lib/public-config';

const navigation = [
  { id: 'biometria', label: 'Biometria' },
  { id: 'mensalidades', label: 'Mensalidades' },
  { id: 'alunos', label: 'Gestão de alunos' },
  { id: 'ambientes', label: 'Outros ambientes' },
];

export function PlatformHome() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(navigation[0].id);
  const { session, loading } = useAdminAuth();

  useEffect(() => {
    getCommercialWhatsappUrl()
      .then(setWhatsappUrl)
      .catch(() => setWhatsappUrl(null));
  }, []);

  useEffect(() => {
    const sections = navigation
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { threshold: [0.35, 0.55, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const accessButton = session ? (
    <Link className="platform-access-button" to="/admin">
      <span>Abrir administração</span><Icon name="arrow" />
    </Link>
  ) : (
    <button className="platform-access-button" disabled={loading} onClick={() => setLoginOpen(true)}>
      <span>Entrar</span><Icon name="shield" />
    </button>
  );

  return (
    <div className="platform-page platform-portfolio">
      <a className="platform-skip-link" href="#biometria">Ir para o conteúdo</a>

      <header className="platform-header">
        <div className="platform-shell platform-nav">
          <Link className="platform-brand" to="/" aria-label="ArenaEvo — início">
            <span className="platform-brand-mark">AE</span>
            <span className="platform-brand-name">Arena<span>Evo</span></span>
          </Link>

          <nav className="platform-tabs" aria-label="Soluções ArenaEvo">
            {navigation.map((item) => (
              <a
                key={item.id}
                className={activeSection === item.id ? 'active' : undefined}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="platform-nav-actions">
            {whatsappUrl && (
              <a className="platform-contact-link" href={whatsappUrl} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" /><span>Comercial</span>
              </a>
            )}
            {accessButton}
          </div>
        </div>
      </header>

      <main className="platform-panels">
        <section className="platform-panel platform-panel-biometric" id="biometria" aria-labelledby="biometria-title">
          <div className="platform-panel-media" aria-hidden="true" />
          <div className="platform-panel-shade" aria-hidden="true" />
          <div className="platform-shell platform-panel-inner">
            <div className="platform-panel-content">
              <span className="platform-panel-index">01 <small>/ 04</small></span>
              <span className="platform-eyebrow"><Icon name="shield" /> Acesso por biometria</span>
              <h1 id="biometria-title">A entrada certa, para o aluno certo.</h1>
              <p>Controle a passagem na catraca com identificação biométrica e mantenha o acesso ligado à situação de cada aluno. Mais agilidade na recepção e mais clareza para a gestão.</p>
              <div className="platform-panel-actions">
                <a className="platform-button platform-button-primary" href="#mensalidades">Conheça a solução <Icon name="arrow" /></a>
                {whatsappUrl && <a className="platform-button platform-button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> Falar com o comercial</a>}
              </div>
              <div className="platform-panel-tags"><span>Academias</span><span>Centros de luta</span><span>Controle de acesso</span></div>
            </div>
          </div>
          <a className="platform-scroll-next" href="#mensalidades"><span>Explore a plataforma</span><Icon name="arrow" /></a>
        </section>

        <section className="platform-panel platform-panel-payments is-content-right" id="mensalidades" aria-labelledby="mensalidades-title">
          <div className="platform-panel-media" aria-hidden="true" />
          <div className="platform-panel-shade" aria-hidden="true" />
          <div className="platform-shell platform-panel-inner">
            <div className="platform-panel-content">
              <span className="platform-panel-index">02 <small>/ 04</small></span>
              <span className="platform-eyebrow"><Icon name="wallet" /> Controle de mensalidades</span>
              <h2 id="mensalidades-title">O financeiro do seu centro de treinamento sob controle.</h2>
              <p>Acompanhe planos, vencimentos e a situação das mensalidades em um só lugar. A equipe identifica pendências com facilidade e organiza a rotina sem perder tempo.</p>
              <ul className="platform-panel-list">
                <li>Visão rápida de alunos ativos, inativos e suspensos</li>
                <li>Acompanhamento de pagamentos e vencimentos</li>
                <li>Organização financeira conectada ao cadastro do aluno</li>
              </ul>
            </div>
          </div>
          <a className="platform-scroll-next" href="#alunos"><span>Ver gestão de alunos</span><Icon name="arrow" /></a>
        </section>

        <section className="platform-panel platform-panel-students" id="alunos" aria-labelledby="alunos-title">
          <div className="platform-panel-media" aria-hidden="true" />
          <div className="platform-panel-shade" aria-hidden="true" />
          <div className="platform-shell platform-panel-inner">
            <div className="platform-panel-content">
              <span className="platform-panel-index">03 <small>/ 04</small></span>
              <span className="platform-eyebrow"><Icon name="users" /> Gestão de alunos</span>
              <h2 id="alunos-title">Cada aluno organizado. Toda a operação conectada.</h2>
              <p>Centralize cadastros, modalidades, planos e frequência. O ArenaEvo ajuda sua equipe a enxergar a jornada de cada pessoa e a manter a comunidade em movimento.</p>
              <div className="platform-panel-note"><Icon name="grid" /><span><strong>Uma visão integrada</strong> para recepção, professores e administração.</span></div>
              <div className="platform-panel-tags"><span>Cadastro centralizado</span><span>Turmas</span><span>Frequência</span><span>Planos</span></div>
            </div>
          </div>
          <a className="platform-scroll-next" href="#ambientes"><span>Conheça outras aplicações</span><Icon name="arrow" /></a>
        </section>

        <section className="platform-panel platform-panel-environments is-content-right" id="ambientes" aria-labelledby="ambientes-title">
          <div className="platform-panel-media" aria-hidden="true" />
          <div className="platform-panel-shade" aria-hidden="true" />
          <div className="platform-shell platform-panel-inner">
            <div className="platform-panel-content">
              <span className="platform-panel-index">04 <small>/ 04</small></span>
              <span className="platform-eyebrow"><Icon name="spark" /> Gestão que se adapta</span>
              <h2 id="ambientes-title">Também para creches, cursos e outros espaços.</h2>
              <p>O mesmo cuidado com acesso, mensalidades e cadastros pode atender diferentes operações que recebem alunos todos os dias e precisam de uma gestão simples e segura.</p>
              <ul className="platform-panel-list">
                <li>Controle de entrada com identificação biométrica</li>
                <li>Gestão de alunos, responsáveis e mensalidades</li>
                <li>Organização por unidade, turma ou atividade</li>
              </ul>
              <div className="platform-panel-actions">
                {whatsappUrl ? (
                  <a className="platform-button platform-button-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> Falar com o comercial</a>
                ) : (
                  <button className="platform-button platform-button-whatsapp" disabled><Icon name="whatsapp" /> Falar com o comercial</button>
                )}
                <button className="platform-button platform-button-secondary" onClick={() => setLoginOpen(true)}>Já sou cliente</button>
              </div>
            </div>
          </div>
          <footer className="platform-panel-footer"><span>ArenaEvo</span><span>Acesso, alunos e mensalidades em evolução.</span></footer>
        </section>
      </main>

      <AdminLoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
