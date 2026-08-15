import 'server-only';

export type GeneratedDraft = {
  title: string;
  summary: string;
  body: string;
  category: 'body' | 'mind' | 'technology' | 'nutrition' | 'sports' | 'health';
  seo_title: string;
  seo_description: string;
  evidence_level: 'high' | 'medium' | 'limited';
};

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    body: { type: 'string' },
    category: { type: 'string', enum: ['body', 'mind', 'technology', 'nutrition', 'sports', 'health'] },
    seo_title: { type: 'string' },
    seo_description: { type: 'string' },
    evidence_level: { type: 'string', enum: ['high', 'medium', 'limited'] },
  },
  required: ['title', 'summary', 'body', 'category', 'seo_title', 'seo_description', 'evidence_level'],
};

export async function generateArticleDraft(input: {
  sourceName: string;
  sourceUrl: string;
  originalTitle: string;
  originalContent: string;
  publishedAt: string | null;
  qualityScore: number | null;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_DRAFT_MODEL || 'gpt-5-mini',
      store: false,
      max_output_tokens: 3200,
      instructions: `אתה עורך ראשי במגזין ישראלי העוסק בחיבור בין גוף האדם, נפש האדם וטכנולוגיה.
כתוב כתבה מקורית בעברית טבעית, מקצועית ובהירה — לא תרגום מילולי.
הסתמך אך ורק על המידע שסופק. אין להמציא נתונים, ציטוטים, שמות מחקרים, מספרי משתתפים או מסקנות.
אם המידע חלקי, השתמש בניסוח מסויג והבהר מה עדיין אינו ידוע.
גוף הכתבה צריך להיות 450–650 מילים, לכלול פתיחה, 3–5 כותרות משנה המסומנות ב-##, ערך מעשי לקורא ופסקת סיכום.
ציין בתוך הכתבה את שם המקור וצרף בסופה שורת "מקור וקרדיט" עם הקישור שסופק.
אין לתת ייעוץ רפואי אישי. תיאור ה-SEO עד 155 תווים וכותרת ה-SEO עד 60 תווים.`,
      input: `שם המקור: ${input.sourceName}\nקישור: ${input.sourceUrl}\nתאריך פרסום: ${input.publishedAt ?? 'לא ידוע'}\nציון איכות פנימי: ${input.qualityScore ?? 'לא ידוע'}\nכותרת מקורית: ${input.originalTitle}\n\nתוכן שנאסף מהמקור:\n${input.originalContent.slice(0, 18000)}`,
      text: { format: { type: 'json_schema', name: 'pulsetech_article_draft', strict: true, schema } },
    }),
  });

  const payload = await response.json() as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
    status?: string;
    incomplete_details?: { reason?: string };
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(payload.error?.message || `OpenAI returned HTTP ${response.status}`);

  // `output_text` is an SDK convenience property and is not guaranteed to be
  // present in the raw REST response. Aggregate the actual output parts.
  const outputText = payload.output_text || payload.output
    ?.flatMap((item) => item.content ?? [])
    .filter((part) => part.type === 'output_text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim();

  if (!outputText) {
    const detail = payload.status === 'incomplete'
      ? `OpenAI response incomplete: ${payload.incomplete_details?.reason ?? 'unknown reason'}`
      : 'OpenAI returned an empty draft';
    throw new Error(detail);
  }

  const draft = JSON.parse(outputText) as GeneratedDraft;
  if (!draft.title || !draft.summary || !draft.body || draft.body.length < 800) throw new Error('Generated draft is incomplete');
  return draft;
}
