import { NextResponse } from 'next/server';
import { db, Prisma, ThreadFilterStatus, ThreadFilterFeedback } from '@clerk/db';
import { getOrCreateOrg } from '@/lib/server/org';
import { handleApiError } from '@/lib/api/errors';
import { CHANNEL_TYPE, THREAD_STATUS } from '@/lib/messaging/thread-constants';
import { runPlaybooks } from '@/app/api/threads/_lib/playbook-runner';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getOrCreateOrg();
    const { id } = await params;

    const thread = await db.thread.findFirst({
      where: {
        id,
        organizationId: org.id,
        channelType: { notIn: [CHANNEL_TYPE.SMS_AGENT, CHANNEL_TYPE.DASHBOARD_AGENT] },
        archivedAt: null,
        deletedAt: null,
      },
      include: {
        customer: true,
        messages: {
          where: { deletedAt: null },
          orderBy: { sentAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({ thread });
  } catch (error) {
    return handleApiError(error, 'Threads GET by id', 'Failed to fetch thread');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const org = await getOrCreateOrg();
    const { id } = await params;
    const body = await request.json();
    const { status, tag, shopifyCustomerId, filterStatus, filterFeedback } = body;

    if (!status && tag === undefined && shopifyCustomerId === undefined && filterStatus === undefined && filterFeedback === undefined) {
      return NextResponse.json({ error: 'Missing status, tag, shopifyCustomerId, filterStatus, or filterFeedback' }, { status: 400 });
    }

    if (status && !Object.values(THREAD_STATUS).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (filterStatus !== undefined && !Object.values(ThreadFilterStatus).includes(filterStatus)) {
      return NextResponse.json({ error: 'Invalid filterStatus' }, { status: 400 });
    }

    if (filterFeedback !== undefined && !Object.values(ThreadFilterFeedback).includes(filterFeedback)) {
      return NextResponse.json({ error: 'Invalid filterFeedback' }, { status: 400 });
    }

    const thread = await db.thread.findUnique({
      where: { id },
      select: { organizationId: true, filterStatus: true },
    });

    if (!thread || thread.organizationId !== org.id) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Closing a questionable thread implies the merchant treated it as legit.
    const resolvedFeedback = filterFeedback
      ?? (status === THREAD_STATUS.CLOSED && thread.filterStatus === ThreadFilterStatus.questionable
            ? ThreadFilterFeedback.confirmed_genuine
            : undefined);

    const updated = await db.thread.update({
      where: { id },
      data: {
        ...(status && { status, cachedPlan: Prisma.DbNull, cachedPlanMessageId: null }),
        ...(tag !== undefined && { tag: tag || null }),
        ...(shopifyCustomerId !== undefined && { shopifyCustomerId: shopifyCustomerId || null }),
        ...(filterStatus !== undefined && { filterStatus }),
        ...(resolvedFeedback !== undefined && { filterFeedback: resolvedFeedback }),
      },
    });

    // Fire playbooks in background (never await — don't block the response)
    if (tag !== undefined && tag) {
      runPlaybooks(org.id, { type: 'tag_applied', tag }, id);
    } else if (status === THREAD_STATUS.CLOSED) {
      runPlaybooks(org.id, { type: 'ticket_closed' }, id);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, 'Threads PATCH', 'Failed to update thread');
  }
}
