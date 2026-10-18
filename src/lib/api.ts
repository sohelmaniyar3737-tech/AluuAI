const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');
export function getToken() { return localStorage.getItem('aluuai_token'); }
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = getToken(); if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}
export function apiError(error: unknown): Error { return error instanceof Error ? error : new Error('Unexpected error'); }
