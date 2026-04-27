-- Add denormalized last_message_at to threads so the inbox sorts by actual
-- conversation activity instead of the noisy updated_at column.
ALTER TABLE "threads"
  ADD COLUMN "last_message_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill from each thread's most recent non-deleted conversation message
-- (customer/agent/ai). Internal notes are metadata, not activity, so they
-- don't count for inbox sorting. Fall back to created_at when a thread has
-- no conversation messages yet.
UPDATE "threads" t
SET "last_message_at" = COALESCE(
  (SELECT MAX(m."sent_at") FROM "messages" m
     WHERE m."thread_id" = t."id"
       AND m."deleted_at" IS NULL
       AND m."sender_type" <> 'note'),
  t."created_at"
);

-- Inbox query: filter by org + status, sort by last activity desc.
CREATE INDEX "threads_organization_id_status_last_message_at_idx"
  ON "threads"("organization_id", "status", "last_message_at" DESC);
