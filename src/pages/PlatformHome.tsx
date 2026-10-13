import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function PlatformHome() {
  return (
    <main className="platform-page">
      <nav className="platform-nav container">
        <Link className="brand" to="/"><span className="brand-mark">AE</span><span>ArenaEvo</span></Link>
        <Link className="button button-ghost" to="/bxct">Ver organização demo <Icon name="arrow" /></Link>
      </nav>
      <section className="platform-hero container">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <p className="eyebrow"><Icon name="spark" /> Gestão feita para quem evolui</p>
        <h1>Sua academia.<br /><span>Sua comunidade.</span><br />Um só ritmo.</h1>
        <p className="hero-lead">A plataforma para centros de treinamento que querem organizar a operação, acompanhar resultados e crescer sem perder a essência.</p>
        <div className="hero-actions"><Link className="button button-primary" to="/bxct">Conhecer experiência BX CT <Icon name="arrow" /></Link><a className="text-link" href="mailto:contato@arenaevo.com.br">Quero levar para minha academia</a></div>
        <div className="platform-proof"><div><strong>Multi-organização</strong><span>Dados isolados por negócio</span></div><div><strong>Gestão completa</strong><span>Alunos, turmas e financeiro</span></div><div><strong>Acesso seguro</strong><span>Permissões por usuário</span></div></div>
      </section>
    </main>
  );
}

