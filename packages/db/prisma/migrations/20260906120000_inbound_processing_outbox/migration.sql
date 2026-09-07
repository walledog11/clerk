ALTER TABLE "messages"
  ADD COLUMN "inbound_processing_pending" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "inbound_processing_data" JSONB,
  ADD COLUMN "inbound_processing_attempted_at" TIMESTAMPTZ;
CREATE INDEX "messages_pending_inbound_processing_idx"
  ON "messages" ("inbound_processing_attempted_at", "id")
  WHERE "inbound_processing_pending" = true;
