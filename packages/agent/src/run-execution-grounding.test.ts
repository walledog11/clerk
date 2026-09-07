import { describe, expect, it, vi } from "vitest";
import type { ActionEntry, AgentContext } from "./agent-context.js";
import type { CompletionFact } from "./completion-facts.js";
import { executeAgentToolCall } from "./run-execution.js";

function context() {
  const sendReply = vi.fn().mockResolvedValue({ status: "ok", message: "Sent." });
  const ctx: AgentContext = {
    orgId: "org_1",
    orgName: "Test Store",
    customer: { id: "customer_1", name: "Ada", platformId: "ada@example.com" },
    recentMessages: [],
    openThreadCount: 1,
    shopify: null,
    recentOrders: [{
      id: "123",
      name: "#1001",
      created_at: "2026-09-07T00:00:00.000Z",
      financial_status: "paid",
      fulfillment_status: null,
      total_price: "20.00",
      currency: "USD",
      items: [],
      shipping_address: null,
    }],
    linkedShopifyCustomerName: "Ada",
    kbArticles: [],
    merchantPreferences: [],
    thread: {
      id: "thread_1",
      status: "open",
      channelType: "email",
      tag: null,
      aiSummary: null,
      shopifyCustomerId: "456",
    },
    escalate: vi.fn().mockResolvedValue(undefined),
    io: {
      addInternalNote: vi.fn(),
      sendReply,
      sendEmail: vi.fn(),
      updateThreadStatus: vi.fn(),
      updateThreadTag: vi.fn(),
    },
  };
  return { ctx, sendReply };
}

async function sendWithEvidence(
  text: string,
  actionsPerformed: ActionEntry[],
  completionEvidence: readonly CompletionFact[] = [],
) {
  const { ctx, sendReply } = context();
  await executeAgentToolCall({
    id: "reply_1",
    name: "send_reply",
    input: { text },
  }, {
    ctx,
    readOnly: false,
    supportThread: ctx.thread,
    actionsPerformed,
    executedToolCalls: [],
    completionEvidence,
    recordAgentFailure: vi.fn(),
    setEscalationReason: vi.fn(),
  });
  return { actionsPerformed, sendReply };
}

describe("completion grounding at execution", () => {
  it("sends exact completion copy after the matching action succeeded", async () => {
    const result = await sendWithEvidence("We refunded USD 20.00 for order #1001.", [{
      tool: "create_refund",
      toolCallId: "refund_1",
      input: { order_id: "123", amount: "20.00", currency: "USD" },
      result: "Refund of $20.00 issued successfully for order 123.",
      status: "success",
    }]);

    expect(result.sendReply).toHaveBeenCalledOnce();
    expect(result.actionsPerformed.at(-1)).toMatchObject({ tool: "send_reply", status: "success" });
  });

  it("blocks wrong amount copy even though a refund tool succeeded", async () => {
    const result = await sendWithEvidence("We refunded $21.00 for the order.", [{
      tool: "create_refund",
      toolCallId: "refund_1",
      input: { order_id: "123", amount: "20.00", currency: "USD" },
      result: "Refund of $20.00 issued successfully for order 123.",
      status: "success",
    }]);

    expect(result.sendReply).not.toHaveBeenCalled();
    expect(result.actionsPerformed.at(-1)).toMatchObject({
      tool: "send_reply",
      status: "error",
      result: expect.stringContaining("not supported by a successful action result"),
    });
  });

  it("blocks a compound reply when only part of the work succeeded", async () => {
    const result = await sendWithEvidence("We refunded the order and opened a return.", [
      {
        tool: "create_refund",
        toolCallId: "refund_1",
        input: { order_id: "123", amount: "20.00", currency: "USD" },
        result: "Refund of $20.00 issued successfully for order 123.",
        status: "success",
      },
      {
        tool: "create_return",
        toolCallId: "return_1",
        input: { order_id: "123" },
        result: "Error: provider rejected return.",
        status: "error",
      },
    ]);

    expect(result.sendReply).not.toHaveBeenCalled();
    expect(result.actionsPerformed.at(-1)?.status).toBe("error");
  });

  it("accepts a historical fact with a live-read execution reference", async () => {
    const result = await sendWithEvidence("Your refund has been issued.", [], [{
      action: "refund",
      target: { kind: "order", id: "123", aliases: ["#1001"] },
      amount: "20.00",
      currency: "USD",
      outcome: "success",
      executionReference: "read:order_1",
      sourceTool: "get_order_by_name",
    }]);

    expect(result.sendReply).toHaveBeenCalledOnce();
  });
});
