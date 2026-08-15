import Link from 'next/link';
import LoginForm from './LoginForm';

const errors: Record<string, string> = {
  invalid_link: 'קישור הכניסה אינו תקין או שכבר נעשה בו שימוש. יש לשלוח קישור חדש ולפתוח את המייל האחרון בלבד.',
  unauthorized: 'החשבון אומת, אך אין לו הרשאת מנהל פעילה.',
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5" dir="rtl">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <Link href="/" className="text-sm font-semibold text-teal-700">← חזרה למגזין</Link>
        <div className="mt-8 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">PULSETECH CMS</div>
        <h1 className="mt-4 text-3xl font-black text-slate-950">כניסה למערכת הניהול</h1>
        <p className="mt-3 text-sm">הכניסה זמינה לעורכים מורשים בלבד ומתבצעת באמצעות קישור חד־פעמי למייל.</p>
        {query.error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-800">{errors[query.error] ?? 'ההתחברות נכשלה. יש לבקש קישור חדש ולנסות שוב.'}</p>}
        <LoginForm />
      </section>
    </main>
  );
}
