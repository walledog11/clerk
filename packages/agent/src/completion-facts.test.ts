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
