'use client';

import { useEffect } from 'react';

const VISITOR_KEY = 'pulsetech_visitor_id';
const SESSION_KEY = 'pulsetech_session_id';
const SESSION_STARTED_KEY = 'pulsetech_session_started_at';

function getOrCreateId(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const next = crypto.randomUUID();
  storage.setItem(key, next);
  return next;
}

export default function SiteAnalytics() {
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/auth')) return;

    const anonymousId = getOrCreateId(window.localStorage, VISITOR_KEY);
    const existingSessionId = window.sessionStorage.getItem(SESSION_KEY);
    const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);
    const existingStartedAt = Number(window.sessionStorage.getItem(SESSION_STARTED_KEY));
    const startedAt = Number.isFinite(existingStartedAt) && existingStartedAt > 0 ? existingStartedAt : Date.now();
    window.sessionStorage.setItem(SESSION_STARTED_KEY, String(startedAt));

    if (!existingSessionId) {
      fetch('/api/analytics/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event: 'site_visit',
          anonymousId,
          sessionId,
          path: window.location.pathname,
          referrer: document.referrer,
        }),
      }).catch(() => undefined);
    }

    let durationSent = false;
    const sendDuration = () => {
      if (durationSent) return;
      const durationSeconds = Math.min(14_400, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      durationSent = true;
      const body = JSON.stringify({
        event: 'session_duration',
        anonymousId,
        sessionId,
        durationSeconds,
        path: window.location.pathname,
      });
      const blob = new Blob([body], { type: 'application/json' });
      if (!navigator.sendBeacon('/api/analytics/site', blob)) {
        fetch('/api/analytics/site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body,
        }).catch(() => undefined);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendDuration();
    };
    window.addEventListener('pagehide', sendDuration);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', sendDuration);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
