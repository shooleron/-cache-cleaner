import { NextRequest, NextResponse } from 'next/server';
import { analyzeTrends } from '@/lib/analyzer';
import { Trend } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { trends }: { trends: Trend[] } = await req.json();
    if (!trends?.length) {
      return NextResponse.json({ error: 'No trends provided' }, { status: 400 });
    }
    const analysis = await analyzeTrends(trends);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json(
      { error: 'Failed to analyze trends. Check ANTHROPIC_API_KEY.' },
      { status: 500 }
    );
  }
}
