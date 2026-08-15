import Link from 'next/link';
import { GLOSSARY } from '../glossary/data';

interface Props {
  text: string;
}

const matcher = new RegExp(
  `(${GLOSSARY.flatMap((entry) => [entry.name, entry.englishName, ...entry.aliases])
    .filter(Boolean)
    .sort((a, b) => b!.length - a!.length)
    .map((term) => term!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})`,
  'gi'
);

export default function GlossaryLinkedText({ text }: Props) {
  const linked = new Set<string>();

  return text.split('\n').map((paragraph, paragraphIndex) => (
    <p key={paragraphIndex}>
      {paragraph.split(matcher).map((part, index) => {
        const entry = GLOSSARY.find((candidate) =>
          [candidate.name, candidate.englishName, ...candidate.aliases]
            .filter(Boolean)
            .some((term) => term!.toLocaleLowerCase() === part.toLocaleLowerCase())
        );

        if (!entry || linked.has(entry.slug)) return <span key={index}>{part}</span>;
        linked.add(entry.slug);

        return (
          <Link
            key={index}
            href={`/glossary/${entry.slug}`}
            title={`הסבר על ${entry.name}`}
            className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-900"
          >
            {part}
          </Link>
        );
      })}
    </p>
  ));
}
