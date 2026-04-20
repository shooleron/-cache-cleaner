export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'atelier_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === storedHash;
}

export function getStoredPasswordHash(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('atelier_password_hash');
}

export function savePasswordHash(hash: string): void {
  localStorage.setItem('atelier_password_hash', hash);
}

export function removePasswordHash(): void {
  localStorage.removeItem('atelier_password_hash');
}

const SESSION_KEY = 'atelier_session_expires';
const SESSION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export function saveSession(): void {
  const expires = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(SESSION_KEY, String(expires));
}

export function isSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  const expires = Number(localStorage.getItem(SESSION_KEY) || 0);
  return Date.now() < expires;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
