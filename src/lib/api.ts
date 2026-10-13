import { auth } from './firebase';

const apiUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://arenaevo-backend.onrender.com' : 'http://localhost:3000');

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Falha ao comunicar com a API.');
  return body as T;
}

