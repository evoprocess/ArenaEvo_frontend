import type { ReactNode } from 'react';

export function ManagementModal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`management-modal ${wide ? 'is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">×</button></header>
        {children}
      </section>
    </div>
  );
}

export function Feedback({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) {
  return message ? <div className={`inline-alert ${type}`}>{message}</div> : null;
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return <div className="panel-loading"><span className="loader" /> {label}</div>;
}

export const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR').format(date);
};

export const todayInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export const currentMonth = () => todayInput().slice(0, 7);
