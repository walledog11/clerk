import { NextResponse } from "next/server";
import { Prisma, db } from "@clerk/db";
import { BadRequestError } from "@/lib/api/errors";
import { withOrgRoute } from "@/lib/api/route";
import { requireOrgThread } from "@/lib/agent/api/auth";
import { executeAgentTurn } from "@/lib/agent/api/execution";
import { isAgentPlanCacheHit, readAgentPlanCache } from "@/lib/agent/api/plan-cache";
import { parseAgentQuickApproveBody } from "@/lib/agent/api/validation";
import { hashInstructionForLog } from "@/lib/agent/runner";
import { resolveAgentSettings } from "@/lib/agent/settings";
import { classifyHomePlan } from "@/lib/agent/plan-preview";
import {
  recordAgentFailure,
  recordAgentRouteFailure,
} from "@/lib/server/agent-failure-alerts";
import { getRedis } from "@/lib/server/redis";
import type { OrgSettings } from "@/types";
import logger from "@/lib/server/logger";

export const POST = withOrgRoute(
  {
    context: "Agent quick approve POST",
    errorMessage: "Failed to approve reply",
    requireBillingWriteAllowed: true,
    rateLimit: { key: "agent:quick-approve", limit: 20, windowSecs: 60 },
    onError: async (error, orgId) => {
      logger.error({ err: error }, "[agent:quick-approve] error");
      await recordAgentRouteFailure({
        route: "/api/agent/quick-approve",
        orgId,
        error,
      }, {
        getCounterClient: getRedis,
        onError: (alertError) => {
          logger.error({ err: alertError }, "[agent:quick-approve] failure alert error");
        },
      });
    },
  },
  async ({ org, request }) => {
    const startedAt = Date.now();
    const { threadId } = parseAgentQuickApproveBody(await request.json());
    const thread = await requireOrgThread(threadId, org.id);
    const settings = resolveAgentSettings(org.settings as Partial<OrgSettings> | null);
    const cachedPlan = readAgentPlanCache(thread.cachedPlan);
    const lastCustomerMessage = thread.messages[0] ?? null;
    const instruction = cachedPlan?.instruction ?? "";
    const instructionHash = instruction ? hashInstructionForLog(instruction) : null;

    const currentPlan = cachedPlan && thread.cachedPlanMessageId === lastCustomerMessage?.id && isAgentPlanCacheHit({
      cache: cachedPlan,
      instruction,
      lastCustomerMessageId: lastCustomerMessage?.id ?? null,
      settings,
    }) ? cachedPlan.plan : null;
    const classification = classifyHomePlan(currentPlan);

    if (!currentPlan || classification.kind !== "quick_reply" || !classification.sendReplyToolCall) {
      throw new BadRequestError("Only current quick-reply plans can be approved from the dashboard");
    }

    logger.info({
      orgId: org.id,
      threadId,
      instructionLength: instruction.length,
      instructionHash,
    }, "[agent:quick-approve] POST");

    const result = await executeAgentTurn({
      orgId: org.id,
      threadId,
      instruction,
      failureRoute: "/api/agent/quick-approve",
      orgSettings: settings,
      approvedToolCalls: [classification.sendReplyToolCall],
      persistAuditNote: true,
    });

    const sendReplyResult = result.actionsPerformed.find(action => action.tool === "send_reply")?.result ?? "";
    if (!sendReplyResult || sendReplyResult.toLowerCase().startsWith("error:")) {
      logger.warn({
        orgId: org.id,
        threadId,
        durationMs: Date.now() - startedAt,
        instructionHash,
      }, "[agent:quick-approve] send failed");

      try {
        await recordAgentFailure({
          kind: "route_failure",
          route: "/api/agent/quick-approve",
          orgId: org.id,
          tool: "send_reply",
          statusCode: 502,
          detail: sendReplyResult || "Reply was not sent.",
        }, {
          counterClient: getRedis(),
        });
      } catch (alertError) {
        logger.error({ err: alertError }, "[agent:quick-approve] failure alert error");
      }

      return NextResponse.json({ ...result, error: sendReplyResult || "Reply was not sent." }, { status: 502 });
    }

    await db.thread.update({
      where: { id: threadId },
      data: {
        cachedPlan: Prisma.DbNull,
        cachedPlanMessageId: null,
      },
    });

    logger.info({
      orgId: org.id,
      threadId,
      durationMs: Date.now() - startedAt,
      instructionHash,
    }, "[agent:quick-approve] result");

    return NextResponse.json(result);
  },
);
