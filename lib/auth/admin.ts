import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') redirect('/admin/login');

  const { data: profile } = await supabase
    .from('editor_profiles')
    .select('display_name, role, active')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile?.active || profile.role !== 'admin') redirect('/admin/login?error=unauthorized');
  return { supabase, user, profile };
}
