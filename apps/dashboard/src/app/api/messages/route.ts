import { NextResponse } from 'next/server';
import { db } from '@clerk/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, text } = body;

    if (!threadId || !text) {
      return NextResponse.json({ error: 'Missing threadId or text' }, { status: 400 });
    }

    // 1. Save the agent's reply to your PostgreSQL database
    const newMessage = await db.message.create({
      data: {
        threadId: threadId,
        senderType: 'agent',
        contentText: text,
      }
    });

    // 2. Fetch the thread to find out WHO we are replying to
    const thread = await db.thread.findUnique({
      where: { id: threadId },
      include: { customer: true } // We need their unique Instagram ID
    });

    // 3. Dispatch to Meta's Graph API if it's an Instagram DM
    if (thread && thread.channelType === 'ig_dm') {
      const recipientId = thread.customer.platformId;
      const PAGE_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

      console.log(`[Dispatch] Preparing to send message to IG User: ${recipientId}`);

      if (PAGE_ACCESS_TOKEN) {
        console.log('[Dispatch] Token found. Firing request to Meta...');
        // Fire the message out to the internet!
        const metaResponse = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: text }
          })
        });

        // We capture Meta's response to prove the internet connection worked
        const metaResult = await metaResponse.json();
        console.log('[Dispatch] Meta API Response:', metaResult);
      } else {
         console.warn('[Dispatch] WARNING: No META_ACCESS_TOKEN found in .env!');
      }
    }

    // 4. Bump the thread so it stays at the top of the inbox
    await db.thread.update({
      where: { id: threadId },
      data: { status: 'open' } 
    });

    return NextResponse.json(newMessage);
    
  } catch (error) {
    console.error('[Next.js API] Failed to process outbound message:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}