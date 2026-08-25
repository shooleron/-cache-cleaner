import { GLOSSARY, getGlossaryEntry, type GlossaryEntry } from '@/app/glossary/data';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type EntityRow = Database['public']['Tables']['entities']['Row'];

interface GlossaryEvidenceNote {
  related?: string[];
  sources?: Array<{ label: string; url: string }>;
  whyItMatters?: string;
}

function parseEvidenceNotes(raw: string | null): GlossaryEvidenceNote {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as GlossaryEvidenceNote;
    return {
      related: Array.isArray(parsed.related) ? parsed.related : [],
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      whyItMatters: typeof parsed.whyItMatters === 'string' ? parsed.whyItMatters : undefined,
    };
  } catch {
    return {};
  }
}

function splitBody(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function mapEntityToGlossaryEntry(entity: EntityRow): GlossaryEntry {
  const evidence = parseEvidenceNotes(entity.evidence_notes);

  return {
    slug: entity.slug,
    kind: entity.type,
    name: entity.name_he,
    englishName: entity.name_en ?? undefined,
    aliases: entity.aliases ?? [],
    shortDefinition: entity.short_definition,
    explanation: splitBody(entity.body),
    whyItMatters: evidence.whyItMatters ?? entity.short_definition,
    related: evidence.related ?? [],
    sources: evidence.sources ?? [],
  };
}

export async function getPublishedGlossaryEntries(): Promise<GlossaryEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('published', true)
      .order('type', { ascending: true })
      .order('name_he', { ascending: true });

    if (error) throw error;
    if (data?.length) return data.map(mapEntityToGlossaryEntry);
  } catch {
    // Fall back to the local seed if the database is unavailable at render time.
  }

  return GLOSSARY;
}

export async function getPublishedGlossaryEntry(slug: string): Promise<GlossaryEntry | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error) throw error;
    if (data) return mapEntityToGlossaryEntry(data);
  } catch {
    // Fall back to the local seed if the database is unavailable at render time.
  }

  return getGlossaryEntry(slug) ?? null;
}
