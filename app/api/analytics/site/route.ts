import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type SiteEventInput = {
  event?: 'site_visit' | 'session_duration';
  anonymousId?: string;
  sessionId?: string;
  durationSeconds?: number;
  path?: string;
  referrer?: string;
};

export async function POST(request: Request) {
  try {
    const input = await request.json() as SiteEventInput;
    if (input.event !== 'site_visit' && input.event !== 'session_duration') {
      return NextResponse.json({ error: 'Invalid analytics event' }, { status: 400 });
    }

    const anonymousId = String(input.anonymousId ?? '').trim().slice(0, 100);
    const sessionId = String(input.sessionId ?? '').trim().slice(0, 100);
    if (!anonymousId || !sessionId) {
      return NextResponse.json({ error: 'Missing analytics identifier' }, { status: 400 });
    }

    const durationSeconds = input.event === 'session_duration'
      ? Math.min(14_400, Math.max(1, Math.round(Number(input.durationSeconds) || 0)))
      : null;

    const supabase = createAdminClient();
    const { error } = await supabase.from('analytics_events').insert({
      event_name: input.event,
      anonymous_id: anonymousId,
      referrer: String(input.referrer ?? '').slice(0, 500) || null,
      metadata: {
        session_id: sessionId,
        path: String(input.path ?? '').slice(0, 500),
        ...(durationSeconds ? { duration_seconds: durationSeconds } : {}),
      },
    });
    if (error) throw error;

    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ error: 'Unable to track site analytics' }, { status: 500 });
  }
}
