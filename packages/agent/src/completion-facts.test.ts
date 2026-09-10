import { describe, expect, it } from "vitest";
import {
  executedCompletionFacts,
  historicalCompletionFacts,
  proposedCompletionFacts,
} from "./completion-facts.js";

describe("completion facts", () => {
  it("keeps a proposed refund distinct from a committed refund", () => {
    expect(proposedCompletionFacts([{
      id: "refund_1",
      name: "create_refund",
      input: { order_id: "123", amount: "20", currency: "usd" },
    }])).toEqual([expect.objectContaining({
      action: "refund",
      target: { kind: "order", id: "123" },
      amount: "20.00",
      currency: "USD",
      outcome: "proposed",
      executionReference: "refund_1",
      sourceTool: "create_refund",
    })]);

    expect(executedCompletionFacts([{
      tool: "create_refund",
      toolCallId: "refund_1",
      providerOperationKey: "execution_1:refund_1",
      input: { order_id: "123", amount: "20", currency: "usd" },
      result: "Unknown: provider response was interrupted.",
      status: "unknown",
    }])).toEqual([expect.objectContaining({
      action: "refund",
      outcome: "unknown",
      executionReference: "execution_1:refund_1",
    })]);
  });

  it("takes an order alias from this turn's read when context has no such order", () => {
    const calls = [
      { id: "read", name: "get_order_by_name", input: { order_name: "1031" } },
      { id: "refund", name: "create_refund", input: { order_id: "6163445514474", amount: "43.48" } },
    ];
    const readResults = {
      read: JSON.stringify({ id: "6163445514474", name: "#1031", currency: "USD" }),
    };

    expect(proposedCompletionFacts(calls, undefined, readResults)).toEqual([
      expect.objectContaining({
        action: "refund",
        target: { kind: "order", id: "6163445514474", aliases: ["#1031"] },
      }),
    ]);
    expect(proposedCompletionFacts(calls)).toEqual([
      expect.objectContaining({ target: { kind: "order", id: "6163445514474" } }),
    ]);
  });

  it("carries the order alias through execution as well as proposal", () => {
    // The approved plan is only half the round trip. If the executed refund
    // fact loses the alias the proposal had, the merchant approves a valid
    // plan and the completion sentence fails grading on the way out.
    const read = {
      tool: "get_order_by_name",
      toolCallId: "read",
      result: JSON.stringify({ id: "6163445514474", name: "#1031", currency: "USD" }),
      status: "success" as const,
    };
    const refund = {
      tool: "create_refund",
      toolCallId: "refund",
      input: { order_id: "6163445514474", amount: "43.48", currency: "USD" },
      result: "Refunded $43.48",
      status: "success" as const,
    };

    expect(executedCompletionFacts([read, refund])).toContainEqual(
      expect.objectContaining({
        action: "refund",
        outcome: "success",
        target: { kind: "order", id: "6163445514474", aliases: ["#1031"] },
      }),
    );
  });

  it("derives cancellation's refund side effect only from a confirmed result", () => {
    const action = {
      tool: "cancel_order",
      toolCallId: "cancel_1",
      input: { order_id: "123" },
      status: "success" as const,
    };
    expect(executedCompletionFacts([{
      ...action,
      result: 'Order #1001 cancelled successfully. Refund status: Shopify returned financial_status "paid".',
    }]).map((fact) => fact.action)).toEqual(["cancellation"]);
    expect(executedCompletionFacts([{
      ...action,
      result: 'Order #1001 cancelled successfully. Refund status: Shopify returned financial_status "refunded".',
    }]).map((fact) => fact.action)).toEqual(["cancellation", "refund"]);
  });

  it("turns only successful live order reads into historical facts", () => {
    const calls = [{ id: "read_1", name: "get_order_by_name", input: { order_name: "#1001" } }];
    expect(historicalCompletionFacts(calls, {
      read_1: JSON.stringify({
        id: "123",
        name: "#1001",
        financial_status: "refunded",
        fulfillment_status: "fulfilled",
        total_price: "20.00",
        currency: "USD",
      }),
    })).toEqual([
      expect.objectContaining({ action: "refund", outcome: "success", executionReference: "read:read_1" }),
      expect.objectContaining({ action: "fulfillment", outcome: "success", executionReference: "read:read_1" }),
    ]);
    expect(historicalCompletionFacts(calls, { read_1: "No order found." })).toEqual([]);
  });
});
