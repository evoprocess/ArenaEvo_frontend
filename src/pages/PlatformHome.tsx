import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLoginDialog } from '../components/AdminLoginDialog';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Icon } from '../components/Icon';
import { getCommercialWhatsappUrl } from '../lib/public-config';

export function PlatformHome() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const { session, loading } = useAdminAuth();

  useEffect(() => {
    getCommercialWhatsappUrl()
      .then(setWhatsappUrl)
      .catch(() => setWhatsappUrl(null));
  }, []);

  return (
    <main className="platform-page">
      <nav className="platform-nav container">
        <Link className="brand" to="/"><span className="brand-mark">AE</span><span>ArenaEvo</span></Link>
        {session ? <Link className="button button-ghost" to="/admin">Abrir administração <Icon name="arrow" /></Link> : <button className="button button-ghost" disabled={loading} onClick={() => setLoginOpen(true)}>Acesso administrativo <Icon name="shield" /></button>}
      </nav>
      <section className="platform-hero container">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <p className="eyebrow"><Icon name="spark" /> Gestão feita para quem evolui</p>
        <h1>Sua academia.<br /><span>Sua comunidade.</span><br />Um só ritmo.</h1>
        <p className="hero-lead">A plataforma para centros de treinamento que querem organizar a operação, acompanhar resultados e crescer sem perder a essência.</p>
        <div className="hero-actions">{whatsappUrl ? <a className="button whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> Contato WhatsApp</a> : <button className="button whatsapp-button" disabled><Icon name="whatsapp" /> Contato WhatsApp</button>}</div>
        <div className="platform-proof"><div><strong>Multi-organização</strong><span>Dados isolados por negócio</span></div><div><strong>Gestão completa</strong><span>Alunos, turmas e financeiro</span></div><div><strong>Acesso seguro</strong><span>Permissões por usuário</span></div></div>
      </section>
      <AdminLoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}

