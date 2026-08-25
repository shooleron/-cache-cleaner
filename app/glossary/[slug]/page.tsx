import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ExternalLink, Info, Link2 } from 'lucide-react';
import { getPublishedGlossaryEntries, getPublishedGlossaryEntry } from '@/lib/glossary';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getPublishedGlossaryEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.name}: מה זה ולמה זה חשוב? | פולס־טק`,
    description: entry.shortDefinition,
    alternates: { canonical: `/glossary/${entry.slug}` },
  };
}

export default async function GlossaryEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entry, glossary] = await Promise.all([
    getPublishedGlossaryEntry(slug),
    getPublishedGlossaryEntries(),
  ]);
  if (!entry) notFound();

  const glossaryBySlug = new Map(glossary.map((item) => [item.slug, item]));
  const related = entry.related.map((relatedSlug) => glossaryBySlug.get(relatedSlug)).filter(Boolean);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: entry.name,
    alternateName: [entry.englishName, ...entry.aliases].filter(Boolean),
    description: entry.shortDefinition,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'מילון הוולנס של פולס־טק', url: '/glossary' },
  };

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-950" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-slate-900 bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-5 md:px-10">
          <Link href="/glossary" className="inline-flex items-center gap-2 text-sm font-bold text-[#e8ff62] hover:text-white"><ArrowRight size={16} /> לכל המונחים</Link>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-20">
        <div className="border-b-2 border-slate-900 pb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-teal-700">מילון פולס־טק</span>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-7xl">{entry.name}</h1>
          {entry.englishName && <p className="mt-3 font-mono text-base text-slate-500 md:text-lg">{entry.englishName}</p>}
          <p className="mt-8 text-xl font-semibold leading-9 md:text-2xl">{entry.shortDefinition}</p>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-[1fr_240px]">
          <div className="space-y-6 text-lg leading-9">
            {entry.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <section className="border-r-4 border-[#ef4423] bg-[#fff1ed] p-6">
              <h2 className="flex items-center gap-2 text-lg font-black"><Info size={20} /> למה זה חשוב?</h2>
              <p className="mt-3 leading-8">{entry.whyItMatters}</p>
            </section>
          </div>
          <aside className="h-fit border border-slate-300 bg-white p-5">
            <h2 className="text-sm font-black">שמות נוספים</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.aliases.map((alias) => <span key={alias} className="bg-slate-100 px-2 py-1 text-xs">{alias}</span>)}
            </div>
          </aside>
        </div>

        {!!related.length && (
          <section className="border-t border-slate-300 py-10">
            <h2 className="flex items-center gap-2 text-2xl font-black"><Link2 size={22} /> מושגים קשורים</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((item) => item && <Link key={item.slug} href={`/glossary/${item.slug}`} className="flex items-center justify-between border border-slate-300 bg-white p-4 font-bold hover:border-slate-900">{item.name}<ArrowLeft size={16} /></Link>)}
            </div>
          </section>
        )}

        <section className="border-t border-slate-300 py-10">
          <h2 className="text-2xl font-black">מקורות להמשך קריאה</h2>
          <ul className="mt-5 space-y-3">
            {entry.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-teal-700 hover:underline">{source.label}<ExternalLink size={15} /></a></li>)}
          </ul>
        </section>
      </article>
    </main>
  );
}
