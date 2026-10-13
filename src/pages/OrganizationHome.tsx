import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LoginDialog } from '../components/LoginDialog';
import { useOrganization } from '../contexts/OrganizationContext';

const schedule = [
  { day: 'SEG', time: '18:00', name: 'Jiu-jitsu', level: 'Fundamentos' },
  { day: 'TER', time: '19:30', name: 'MMA', level: 'Todos os níveis' },
  { day: 'QUA', time: '17:00', name: 'Jiu-jitsu Kids', level: '6 a 12 anos' },
];

export function OrganizationHome() {
  const { organization: org } = useOrganization();
  const [loginOpen, setLoginOpen] = useState(false);
  if (!org) return null;

  return (
    <main className="org-page">
      <nav className="org-nav container">
        <Link className="org-brand" to={`/${org.slug}`}><span className="org-logo"><img src={org.logoUrl} alt={org.name} /></span><span><small>ARENAEVO /</small>{org.shortName}</span></Link>
        <div className="nav-actions"><a href="#treinos" className="nav-link">Treinos</a><a href="#sobre" className="nav-link">Sobre</a><button className="button button-outline" onClick={() => setLoginOpen(true)}>Área de gestão</button></div>
      </nav>
      <section className="org-hero container">
        <div className="org-hero-copy">
          <p className="eyebrow">Centro de treinamento • Salvador</p>
          <h1>Mais que treino.<br /><span>Uma evolução diária.</span></h1>
          <p>{org.description}</p>
          <div className="hero-actions"><a className="button button-primary" href="#treinos">Conheça os treinos <Icon name="arrow" /></a><button className="text-link" onClick={() => setLoginOpen(true)}>Já sou aluno</button></div>
          <div className="modality-list">{org.modalities.map((item) => <span key={item}><Icon name="check" />{item}</span>)}</div>
        </div>
        <div className="org-hero-visual">
          <div className="visual-ring ring-large" /><div className="visual-ring ring-small" />
          <img src={org.logoUrl} alt="" />
          <div className="visual-card"><span>PRÓXIMO TREINO</span><strong>Jiu-jitsu • 18:00</strong><small>Turma Fundamentos</small></div>
        </div>
      </section>
      <section className="schedule-section" id="treinos"><div className="container"><div className="section-heading"><div><p className="eyebrow">Agenda da semana</p><h2>Encontre o seu ritmo</h2></div><p>Treinos para iniciantes, atletas e toda a família.</p></div><div className="schedule-grid">{schedule.map((item) => <article className="schedule-card" key={`${item.day}-${item.time}`}><div className="schedule-date"><strong>{item.day}</strong><span>{item.time}</span></div><div><h3>{item.name}</h3><p>{item.level}</p></div><Icon name="arrow" /></article>)}</div></div></section>
      <section className="about-section container" id="sobre"><div><p className="eyebrow">Nossa essência</p><h2>Consistência dentro e fora do tatame.</h2></div><p>{org.tagline} Estrutura, professores comprometidos e uma comunidade que puxa você para frente.</p></section>
      <footer className="org-footer"><div className="container"><span>{org.name}</span><span>{org.contact.address} • {org.contact.city}</span><span>Movido por <strong>ArenaEvo</strong></span></div></footer>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}
