import type { RequestFacts } from '@shopkeeper/agent/classifier-signals';
import type { ConversationBrief } from './conversation.js';

export interface HandledRollup {
  approvedCount: number;
  autoCount: number;
  replyCount: number;
  refundCount: number;
  notableLines: string[];
}

export interface WaitingItem {
  conversation: ConversationBrief;
  dedupeKey: string;
  threadId: string;
  /** Links the briefing ordinal back to its entry in the operator plan queue. */
  planId?: string;
  /** What the briefing orders on. Null when the classifier read no facts. */
  requestFacts: RequestFacts | null;
  /** False keeps the plan parked but prevents a blind approval prompt. */
  needsThreadReview: boolean;
}

export interface BriefingTicketRow {
  aiTitle?: string | null;
  channelType?: string | null;
  customer: { name: string | null };
  /** Source customer text for the sections that quote rather than paraphrase it. */
  pendingMessage?: string | null;
  /** Orders this storefront shopper proved control of. Empty for every other channel. */
  verifiedOrders?: readonly string[];
  /** Raw `Thread.classifierSignals`. Carries `requestFacts` from version 5 on. */
  classifierSignals?: unknown;
}

/** One conversation in display order, also used to resolve operator replies. */
export interface BriefingItem {
  conversation: ConversationBrief;
  threadId: string;
  kind: 'approval' | 'decision' | 'flagged';
  planId?: string;
  /** Keep the underlying action identity while requiring the thread be opened. */
  needsThreadReview?: boolean;
}
