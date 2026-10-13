import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
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

export function AdminLoginDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
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
      await login(identifier, password);
      onClose();
      navigate('/admin');
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
      <p className="eyebrow">Administração ArenaEvo</p>
      <h2>Acesso da plataforma</h2>
      <p className="dialog-copy">Entre com uma conta autorizada pela administração.</p>
      <form onSubmit={submit}>
        <label>Usuário ou e-mail<input autoFocus autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Seu Login" required /></label>
        <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" required /></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-primary button-block" disabled={loading}>{loading ? 'Validando…' : 'Entrar na administração'}</button>
      </form>
      <small>Acesso restrito aos administradores da plataforma.</small>
    </dialog>
  );
}
