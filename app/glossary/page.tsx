import Link from 'next/link';
import { Activity, ArrowLeft, BookOpen, Building2, Sparkles, Users } from 'lucide-react';
import { type GlossaryKind } from './data';
import { getPublishedGlossaryEntries } from '@/lib/glossary';

export const metadata = {
  title: 'מילון הוולנס והכושר | פולס־טק',
  description: 'מדריכים ברורים ומבוססי מקורות למונחי וולנס, כושר, בריאות דיגיטלית, מותגים ואנשי מפתח.',
};

export const revalidate = 300;

const sections: { kind: GlossaryKind; title: string; description: string; icon: typeof Activity }[] = [
  { kind: 'term', title: 'מונחים ומדדים', description: 'המדדים שמופיעים בשעונים, במחקרים ובאימונים — בשפה ברורה.', icon: Activity },
  { kind: 'brand', title: 'מותגים וטכנולוגיות', description: 'מי עומד מאחורי המוצרים, מה הם מודדים ומה חשוב לבדוק.', icon: Building2 },
  { kind: 'person', title: 'חוקרים ואנשי מפתח', description: 'האנשים שמעצבים את השיח והמחקר בעולם הוולנס.', icon: Users },
  { kind: 'institution', title: 'מוסדות ומקורות', description: 'כתבי עת, אוניברסיטאות וגופים שמסייעים להעריך אמינות.', icon: BookOpen },
];

export default async function GlossaryPage() {
  const glossary = await getPublishedGlossaryEntries();

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950" dir="rtl">
      <section className="border-b border-slate-900 bg-[#e8ff62]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold hover:opacity-60">
            חזרה למגזין <ArrowLeft size={16} />
          </Link>
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 border border-slate-900 bg-white px-3 py-1 text-xs font-bold">
              <Sparkles size={14} /> לומדים את הגוף, הנפש והטכנולוגיה
            </span>
            <h1 className="text-4xl font-black leading-tight md:text-7xl">מילון הוולנס של פולס־טק</h1>
            <p className="mt-6 max-w-2xl text-lg font-medium text-slate-800 md:text-xl">
              כל מושג שמופיע בכתבות מקבל כאן הסבר עצמאי, הקשר מעשי, מגבלות ומקורות להמשך קריאה.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-14 md:px-10 md:py-20">
        {sections.map((section) => {
          const entries = glossary.filter((entry) => entry.kind === section.kind);
          if (!entries.length) return null;
          const Icon = section.icon;
          return (
            <section key={section.kind}>
              <div className="mb-6 flex items-end justify-between gap-6 border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-black md:text-3xl"><Icon size={26} />{section.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{section.description}</p>
                </div>
                <span className="font-mono text-xs">{entries.length} ערכים</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <Link key={entry.slug} href={`/glossary/${entry.slug}`} className="group border border-slate-300 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-900 hover:shadow-[6px_6px_0_#14171c]">
                    <span className="text-xs font-bold text-teal-700">{entry.englishName}</span>
                    <h3 className="mt-2 text-xl font-black group-hover:text-[#ef4423]">{entry.name}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{entry.shortDefinition}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">לערך המלא <ArrowLeft size={14} /></span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
