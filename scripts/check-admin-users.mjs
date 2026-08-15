import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const root = new URL('../', import.meta.url);
const raw = await readFile(new URL('.env.local', root), 'utf8');
const env = Object.fromEntries(raw.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1).replace(/^["']|["']$/g, '')];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
if (error) throw error;
const { data: profiles, error: profileError } = await supabase.from('editor_profiles').select('user_id,display_name,role,active');
if (profileError) throw profileError;
const byUser = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
console.log(JSON.stringify(data.users.map((user) => ({ email: user.email, confirmed: Boolean(user.email_confirmed_at), appRole: user.app_metadata?.role ?? null, profile: byUser.get(user.id) ?? null, lastSignIn: user.last_sign_in_at ?? null })), null, 2));
