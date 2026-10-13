import { Icon } from '../components/Icon';

export function PlatformHome() {
  return (
    <main className="platform-page">
      <nav className="platform-nav container">
        <a className="brand" href="/"><span className="brand-mark">AE</span><span>ArenaEvo</span></a>
        <a className="button button-ghost" href="/bxct">Ver organização demo <Icon name="arrow" /></a>
      </nav>
      <section className="platform-hero container">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <p className="eyebrow"><Icon name="spark" /> Gestão feita para quem evolui</p>
        <h1>Sua academia.<br /><span>Sua comunidade.</span><br />Um só ritmo.</h1>
        <p className="hero-lead">A plataforma para centros de treinamento que querem organizar a operação, acompanhar resultados e crescer sem perder a essência.</p>
        <div className="hero-actions"><a className="button button-primary" href="/bxct">Conhecer experiência BX CT <Icon name="arrow" /></a><a className="text-link" href="mailto:contato@arenaevo.com.br">Quero levar para minha academia</a></div>
        <div className="platform-proof"><div><strong>Multi-organização</strong><span>Dados isolados por negócio</span></div><div><strong>Gestão completa</strong><span>Alunos, turmas e financeiro</span></div><div><strong>Acesso seguro</strong><span>Permissões por usuário</span></div></div>
      </section>
    </main>
  );
}

