const TOPICS = {
  body: ['health', 'wellness', 'fitness', 'exercise', 'nutrition', 'sleep', 'recovery', 'metabolism', 'muscle', 'cardiovascular', 'longevity', 'physiology', 'תזונה', 'כושר', 'שינה', 'בריאות'],
  mind: ['mental health', 'cognition', 'brain', 'stress', 'anxiety', 'meditation', 'neuroscience', 'psychology', 'נפש', 'מוח', 'חרדה', 'מדיטציה'],
  technology: ['wearable', 'sensor', 'artificial intelligence', ' ai ', 'device', 'digital health', 'biotech', 'technology', 'startup', 'שעון חכם', 'טכנולוגיה'],
} as const;

const EVIDENCE = ['study', 'trial', 'meta-analysis', 'systematic review', 'randomized', 'peer-reviewed', 'journal', 'university', 'researchers', 'participants', 'מחקר', 'ניסוי', 'כתב עת', 'אוניברסיטה'];

export function scoreItem(input: { title: string; content: string; publishedAt: string | null; trustScore: number }) {
  const haystack = ` ${input.title} ${input.content} `.toLowerCase();
  const matchedTopics = Object.entries(TOPICS)
    .filter(([, words]) => words.some((word) => haystack.includes(word)))
    .map(([topic]) => topic);
  const evidenceSignals = EVIDENCE.filter((word) => haystack.includes(word));
  const ageDays = input.publishedAt ? Math.max(0, (Date.now() - Date.parse(input.publishedAt)) / 86_400_000) : 90;

  const trust = Math.min(1, Math.max(0, input.trustScore / 10));
  const relevance = Math.min(1, matchedTopics.length / 2);
  const evidence = Math.min(1, evidenceSignals.length / 3);
  const freshness = ageDays <= 7 ? 1 : ageDays <= 30 ? 0.75 : ageDays <= 90 ? 0.4 : 0;
  const score = Number((trust * 0.35 + relevance * 0.35 + evidence * 0.2 + freshness * 0.1).toFixed(3));

  return {
    score,
    status: score >= 0.72 ? 'reviewing' as const : score >= 0.45 ? 'collected' as const : 'rejected' as const,
    rejectionReason: score < 0.45 ? 'ציון רלוונטיות או איכות נמוך' : null,
    details: { matchedTopics, evidenceSignals, ageDays: Math.round(ageDays), trust, relevance, evidence, freshness },
  };
}
