-- First-class audit log for agent tool calls. Replaces parsing
-- __clerk_agent__ note rows on the Message table.

-- CreateTable
CREATE TABLE "agent_actions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "thread_id" UUID,
    "customer_id" UUID,
    "tool" VARCHAR(64) NOT NULL,
    "category" VARCHAR(32) NOT NULL,
    "input" JSONB NOT NULL,
    "output" TEXT,
    "status" VARCHAR(32) NOT NULL,
    "error_detail" TEXT,
    "mode" VARCHAR(32) NOT NULL,
    "approver_id" VARCHAR(255),
    "approved_at" TIMESTAMPTZ,
    "approved_plan_hash" VARCHAR(64),
    "instruction_hash" VARCHAR(64),
    "executed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_ms" INTEGER NOT NULL,

    CONSTRAINT "agent_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_actions_organization_id_executed_at_idx"
    ON "agent_actions"("organization_id", "executed_at" DESC);

-- CreateIndex
CREATE INDEX "agent_actions_organization_id_thread_id_idx"
    ON "agent_actions"("organization_id", "thread_id");

-- CreateIndex
CREATE INDEX "agent_actions_organization_id_tool_executed_at_idx"
    ON "agent_actions"("organization_id", "tool", "executed_at");

-- CreateIndex
CREATE INDEX "agent_actions_organization_id_status_idx"
    ON "agent_actions"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_thread_id_fkey"
    FOREIGN KEY ("thread_id") REFERENCES "threads"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
