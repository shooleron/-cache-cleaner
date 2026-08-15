import { readFile, writeFile, chmod } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const root = new URL('../', import.meta.url);
const raw = await readFile(new URL('.env.local', root), 'utf8');
const env = Object.fromEntries(raw.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1).replace(/^["']|["']$/g, '')];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: 'shooleron@yahoo.com',
  options: { redirectTo: 'http://localhost:3001/auth/confirm?next=/admin' },
});
if (error || !data.properties?.action_link) throw error ?? new Error('Magic link was not generated');
const output = '/private/tmp/pulsetech-admin-link.txt';
await writeFile(output, data.properties.action_link, { encoding: 'utf8', mode: 0o600 });
await chmod(output, 0o600);
console.log('Admin link generated');
