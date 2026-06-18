import Anthropic from '@anthropic-ai/sdk';
import { Trend, AIAnalysis } from './types';
import fs from 'fs';
import path from 'path';

function resolveApiKey(): string {
  // Prefer a properly formatted key from process.env
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey?.startsWith('sk-ant')) return envKey;

  // Fallback: read directly from .env.local (handles cases where shell env
  // has an empty ANTHROPIC_API_KEY that shadows the .env.local value)
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
    const match = raw.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  return envKey ?? '';
}

function resolveBaseUrl(): string {
  const envUrl = process.env.ANTHROPIC_BASE_URL;
  // Only use env var if it looks like a complete URL
  if (envUrl?.startsWith('https://api.anthropic')) return envUrl;
  return 'https://api.anthropic.com';
}

const anthropic = new Anthropic({
  apiKey: resolveApiKey(),
  baseURL: resolveBaseUrl(),
});

export async function analyzeTrends(trends: Trend[]): Promise<AIAnalysis> {
  const top = trends.slice(0, 15);

  const trendList = top
    .map(
      (t, i) =>
        `${i + 1}. [${t.source.toUpperCase()}] "${t.title}" — heat score: ${t.score}/100, ${t.commentCount} comments, category: ${t.category}`
    )
    .join('\n');

  const prompt = `You are TrendPulse AI — an expert trend analyst for marketing professionals and brands.

Here are the top trending topics right now across Hacker News, Reddit, YouTube, and news feeds:

${trendList}

Respond with a JSON object ONLY (no markdown, no explanation) with this exact structure:
{
  "summary": "2-3 sentence executive summary of what's trending and why it matters for marketers",
  "topTrends": [
    {
      "trendId": "<the exact id from the list number, e.g. trend-1>",
      "title": "<short trend title>",
      "whyItRising": "<1-2 sentences explaining why this is gaining traction>",
      "longevityScore": <1-10>,
      "longevityLabel": "<flash|short|medium|long>",
      "audienceMatch": "<which brand/marketer audience would care most>",
      "contentIdeas": ["<idea 1>", "<idea 2>", "<idea 3>"]
    }
  ],
  "marketingOpportunities": [
    {
      "title": "<opportunity title>",
      "description": "<actionable description for a marketer>",
      "urgency": "<now|this-week|this-month>",
      "channels": ["<channel1>", "<channel2>"]
    }
  ],
  "weeklyPrediction": "<1-2 sentences predicting which trend will be biggest next week and why>"
}

Rules:
- longevityLabel: flash = <24h, short = 1-7 days, medium = 1-4 weeks, long = 1+ months
- Include top 5 trends in topTrends array
- Include top 3 marketing opportunities
- Be specific, data-driven, and actionable for marketing teams`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';

  try {
    const parsed = JSON.parse(text);
    return { ...parsed, generatedAt: new Date().toISOString() };
  } catch {
    // Fallback if JSON parse fails
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { ...JSON.parse(jsonMatch[0]), generatedAt: new Date().toISOString() };
    }
    throw new Error('Failed to parse AI analysis');
  }
}
