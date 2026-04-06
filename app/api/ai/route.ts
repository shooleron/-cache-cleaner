import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an intelligent AI assistant embedded in a CRM and project management platform called TaskFlow (similar to Monday.com). You have access to the user's data and can help them manage their work.

You can:
- Answer questions about projects, tasks, contacts, and deals
- Suggest next steps and prioritize work
- Analyze pipeline health and project progress
- Generate task lists from descriptions
- Provide business insights from CRM data
- Create tasks, contacts, or deals by returning structured actions

When suggesting to CREATE items, include a JSON action block at the END of your response in this format:
<actions>
[{"type":"create_task","label":"Create task: <title>","payload":{"title":"...","projectId":"...","priority":"medium","status":"todo"}}]
</actions>

Keep responses concise, professional, and actionable. Use markdown formatting. Always focus on what's most important and urgent.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    const contextMessage = context ? `
Here is the current state of the workspace:

**Projects:** ${JSON.stringify(context.projects?.map((p: {name: string; id: string}) => ({ name: p.name, id: p.id })))}

**Tasks Summary:**
- Total tasks: ${context.tasks?.length || 0}
- Done: ${context.tasks?.filter((t: {status: string}) => t.status === 'done').length || 0}
- In Progress: ${context.tasks?.filter((t: {status: string}) => t.status === 'in_progress').length || 0}
- Stuck: ${context.tasks?.filter((t: {status: string}) => t.status === 'stuck').length || 0}
- Overdue: ${context.tasks?.filter((t: {dueDate: string | null; status: string}) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length || 0}

**Deals Pipeline:**
${context.deals?.map((d: {title: string; stage: string; value: number; currency: string}) => `- ${d.title}: ${d.stage} ($${d.value?.toLocaleString()} ${d.currency})`).join('\n') || 'No deals'}

**Contacts:** ${context.contacts?.length || 0} total
- Active customers: ${context.contacts?.filter((c: {status: string}) => c.status === 'customer').length || 0}
- Prospects: ${context.contacts?.filter((c: {status: string}) => c.status === 'prospect').length || 0}

**Team Members:** ${context.users?.map((u: {name: string}) => u.name).join(', ')}
` : '';

    const systemWithContext = contextMessage
      ? `${SYSTEM_PROMPT}\n\n${contextMessage}`
      : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    // Parse actions from response
    const actionsMatch = content.text.match(/<actions>([\s\S]*?)<\/actions>/);
    let actions = null;
    let cleanText = content.text;

    if (actionsMatch) {
      try {
        actions = JSON.parse(actionsMatch[1].trim());
        cleanText = content.text.replace(/<actions>[\s\S]*?<\/actions>/, '').trim();
      } catch {
        // ignore parse error
      }
    }

    return NextResponse.json({ text: cleanText, actions });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response. Check your ANTHROPIC_API_KEY.' },
      { status: 500 }
    );
  }
}
