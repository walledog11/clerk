import { NextResponse } from 'next/server';
import { db } from '@clerk/db';

// This forces Next.js to fetch fresh data every time, 
// rather than serving a cached, stale version of the database.
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // 1. Fetch all open threads from PostgreSQL
    const threads = await db.thread.findMany({
      where: { 
        status: 'open' 
      },
      include: {
        // 2. Automatically grab the customer details for each thread
        customer: true, 
        // 3. Grab the actual chat bubbles, sorted oldest to newest
        messages: {
          orderBy: { sentAt: 'asc' }
        }
      },
      // 4. Sort the threads so the most recently active ones jump to the top
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(threads);
    
  } catch (error) {
    console.error('[Next.js API] Failed to fetch threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads from database' }, 
      { status: 500 }
    );
  }
}