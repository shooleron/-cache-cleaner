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
