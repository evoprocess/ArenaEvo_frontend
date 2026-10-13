import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { Icon } from './Icon';

type Props = { open: boolean; onClose: () => void };

const friendlyError = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Usuário ou senha incorretos.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Não foi possível entrar. Tente novamente.';
};

export function LoginDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      onClose();
      navigate(`/${organization?.slug}/gestao/dashboard`);
    } catch (nextError) {
      setError(friendlyError(nextError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="login-dialog" onClose={onClose}>
      <button className="dialog-close" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button>
      <div className="dialog-badge"><Icon name="shield" /></div>
      <p className="eyebrow">Área segura</p>
      <h2>Acesse sua gestão</h2>
      <p className="dialog-copy">Entre com o usuário fornecido por {organization?.shortName}.</p>
      <form onSubmit={submit}>
        <label>Usuário<input autoFocus autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="ex: luisa.campos" required /></label>
        <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" required /></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-primary button-block" disabled={loading}>{loading ? 'Entrando…' : 'Entrar na Arena'}</button>
      </form>
      <small>Seu usuário é vinculado somente a esta organização.</small>
    </dialog>
  );
}

