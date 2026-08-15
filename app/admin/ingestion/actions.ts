'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { runIngestion } from '@/lib/ingestion/run';

export async function runNow() {
  await requireAdmin();
  let result;
  try {
    result = await runIngestion({ force: true });
  } catch (error) {
    redirect(`/admin/ingestion?error=${encodeURIComponent(error instanceof Error ? error.message : 'run_failed')}`);
  }
  revalidatePath('/admin');
  revalidatePath('/admin/ingestion');
  redirect(`/admin/ingestion?run=1&queued=${result.totals.queued}&errors=${result.totals.errors}`);
}
