import { NextResponse } from 'next/server';
import { db } from '@clerk/db';
import OpenAI from 'openai';

// Initialize the OpenAI client securely on the server
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { threadId } = await request.json();

    if (!threadId) {
      return NextResponse.json({ error: 'Missing threadId' }, { status: 400 });
    }

    // 1. Fetch the full conversation history from PostgreSQL
    const thread = await db.thread.findUnique({
      where: { id: threadId },
      include: {
        messages: { orderBy: { sentAt: 'asc' } },
        customer: true
      }
    });

    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    // 2. Format the messages so OpenAI understands who said what
    const conversationHistory = thread.messages.map((msg) => ({
      role: msg.senderType === 'customer' ? 'user' : 'assistant',
      content: msg.contentText,
    }));

    // 3. The System Prompt (Clerk's Instructions)
    const systemPrompt = {
      role: 'system',
      content: `You are an expert customer support agent for modern clothing brands like Consonant and Palette Garments. 
      Your goal is to read the conversation history and draft a helpful, friendly, and concise reply to the customer. 
      Do not include placeholders like [Your Name] or [Agent Name]. Just write the exact text the agent should send.`
    };

    // 4. Ask OpenAI for the draft using their fast, cost-effective model
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [systemPrompt, ...conversationHistory as any],
      temperature: 0.7, // Keeps it creative but grounded
    });

    const draftText = response.choices[0].message.content;

    return NextResponse.json({ draft: draftText });

  } catch (error) {
    console.error('[AI Draft] Failed to generate:', error);
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
  }
}