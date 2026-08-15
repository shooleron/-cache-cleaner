'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('shooleron@yahoo.com');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const completeRedirectSignIn = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) window.location.replace('/admin');
    };
    completeRedirectSignIn();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        window.location.replace('/admin');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/admin`,
      },
    });

    if (error?.code === 'over_email_send_rate_limit' || error?.status === 429) {
      setMessage('נשלחו יותר מדי קישורי כניסה. יש להמתין עד שמגבלת המיילים של Supabase תשתחרר ולנסות שוב.');
    } else if (error) {
      setMessage('לא ניתן לשלוח קישור כניסה כרגע. נסו שוב מאוחר יותר.');
    } else {
      setMessage('קישור כניסה מאובטח נשלח למייל. יש לפתוח את הקישור האחרון שקיבלתם, מאותו דפדפן. מומלץ לבדוק גם בתיקיית הספאם.');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold text-slate-700">
        כתובת אימייל
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
          dir="ltr"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? 'שולח…' : 'שלחו לי קישור כניסה'}
      </button>
      {message && <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">{message}</p>}
    </form>
  );
}
