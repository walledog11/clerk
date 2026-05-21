import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentPlan, OrgSettings } from "@/types";

const {
  mockBuildContext,
  mockCreateMessage,
  mockHashInstructionForLog,
  mockPlanAgent,
  mockThreadUpdate,
} = vi.hoisted(() => ({
  mockBuildContext: vi.fn().mockResolvedValue({ messages: [] }),
  mockCreateMessage: vi.fn().mockResolvedValue({ id: "msg_1" }),
  mockHashInstructionForLog: vi.fn().mockReturnValue("hash_test"),
  mockPlanAgent: vi.fn(),
  mockThreadUpdate: vi.fn().mockResolvedValue({ id: "thread_1" }),
}));

vi.mock("@clerk/db", () => ({
  createMessage: mockCreateMessage,
  db: {
    thread: {
      findUnique: vi.fn(),
      update: mockThreadUpdate,
    },
  },
  Prisma: {
    DbNull: "DbNull",
  },
}));

vi.mock("@/lib/agent/runner", () => ({
  buildContext: mockBuildContext,
  hashInstructionForLog: mockHashInstructionForLog,
  planAgent: mockPlanAgent,
}));

vi.mock("@/lib/server/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  DASHBOARD_APPROVAL_DISMISS_SUMMARY,
  buildDashboardApprovalSummary,
  buildRevisedDashboardInstruction,
  dismissDashboardPendingApproval,
  getDashboardActionCalls,
  getDashboardApprovalReplyKind,
  planDashboardApproval,
  readDashboardPendingApproval,
  shouldPlanBeforeExecuting,
  type DashboardPendingApproval,
} from "@/lib/agent/api/dashboard-approval";

const settings = {
  requireApprovalForActions: true,
} as OrgSettings;

const createOrderPlan: AgentPlan = {
  instruction: "Create an order",
  steps: [
    {
      id: "create_1",
      tool: "create_shopify_order",
      label: "Create order",
      description: "Create Shopify order",
      category: "action",
      enabled: true,
    },
    {
      id: "send_1",
      tool: "send_reply",
      label: "Send reply",
      description: "Notify customer",
      category: "communication",
      enabled: true,
    },
  ],
  rawToolCalls: [
    {
      id: "search_1",
      name: "search_shopify_products",
      input: { query: "Pencil Half Zip" },
    },
    {
      id: "create_1",
      name: "create_shopify_order",
      input: {
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        line_items: [{ variant_id: "var_1", quantity: 2 }],
        address1: "1 Infinite Loop",
        city: "Cupertino",
        province: "CA",
        zip: "95014",
      },
    },
    {
      id: "send_1",
      name: "send_reply",
      input: { text: "Done" },
    },
  ],
  readResults: {
    search_1: JSON.stringify([
      {
        title: "Pencil Half Zip",
        variants: [{ variant_id: "var_1", title: "Large", price: "42.50" }],
      },
    ]),
  },
};

function pendingApproval(overrides: Partial<DashboardPendingApproval> = {}): DashboardPendingApproval {
  return {
    kind: "dashboard_pending_approval",
    version: 1,
    instruction: "Create an order",
    instructionHash: "hash_original",
    summary: "Approval summary",
    plan: createOrderPlan,
    createdAt: "2026-05-21T12:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockBuildContext.mockResolvedValue({ messages: [] });
  mockCreateMessage.mockResolvedValue({ id: "msg_1" });
  mockHashInstructionForLog.mockReturnValue("hash_test");
  mockPlanAgent.mockResolvedValue(createOrderPlan);
  mockThreadUpdate.mockResolvedValue({ id: "thread_1" });
});

describe("dashboard approval helpers", () => {
  it("classifies approval, dismissal, and revision replies", () => {
    expect(getDashboardApprovalReplyKind(" Yes please! ")).toBe("approve");
    expect(getDashboardApprovalReplyKind("never mind")).toBe("dismiss");
    expect(getDashboardApprovalReplyKind("yes, but make it a medium")).toBe("revise");
    expect(getDashboardApprovalReplyKind("change the address first")).toBe("revise");
  });

  it("only plans before execution when approval is enabled and the instruction asks for an action", () => {
    expect(shouldPlanBeforeExecuting("Create the order", settings)).toBe(true);
    expect(shouldPlanBeforeExecuting("What is the order status?", settings)).toBe(false);
    expect(shouldPlanBeforeExecuting("Create the order", {
      ...settings,
      requireApprovalForActions: false,
    })).toBe(false);
  });

  it("filters dashboard approval actions to action-category planned tool calls", () => {
    expect(getDashboardActionCalls(createOrderPlan)).toEqual([
      createOrderPlan.rawToolCalls[1],
    ]);
  });

  it("builds a product-friendly summary for create-order approvals", () => {
    const summary = buildDashboardApprovalSummary(createOrderPlan);

    expect(summary).toContain("- Customer: Ada Lovelace");
    expect(summary).toContain("ada@example.com");
    expect(summary).toContain("- Item: 2× Pencil Half Zip (Large)");
    expect(summary).toContain("- Ship to: 1 Infinite Loop, Cupertino, CA 95014");
    expect(summary).toContain("- Total: $85.00");
    expect(summary).toContain("Reply yes to create it");
  });

  it("reads only current-version pending approvals", () => {
    const approval = pendingApproval();

    expect(readDashboardPendingApproval(approval)).toEqual(approval);
    expect(readDashboardPendingApproval({ ...approval, version: 2 })).toBeNull();
    expect(readDashboardPendingApproval({ ...approval, plan: null })).toBeNull();
    expect(readDashboardPendingApproval(null)).toBeNull();
  });

  it("builds revision instructions from the pending approval and operator changes", () => {
    expect(buildRevisedDashboardInstruction(
      pendingApproval({ instruction: "Create an order for Ada" }),
      "Use size medium instead",
    )).toBe("Original request: Create an order for Ada\nRequested changes before approval: Use size medium instead");
  });

  it("clears and records dashboard dismissals", async () => {
    await expect(dismissDashboardPendingApproval("thread_1", "cancel")).resolves.toBe(DASHBOARD_APPROVAL_DISMISS_SUMMARY);

    expect(mockThreadUpdate).toHaveBeenCalledWith({
      where: { id: "thread_1" },
      data: {
        cachedPlanMessageId: null,
        cachedPlan: "DbNull",
      },
    });
    expect(mockCreateMessage).toHaveBeenNthCalledWith(1, {
      threadId: "thread_1",
      senderType: "customer",
      contentText: "cancel",
    });
    expect(mockCreateMessage).toHaveBeenNthCalledWith(2, {
      threadId: "thread_1",
      senderType: "agent",
      contentText: DASHBOARD_APPROVAL_DISMISS_SUMMARY,
    });
  });

  it("plans, stores, and records pending approvals", async () => {
    mockHashInstructionForLog.mockReturnValue("hash_planned");

    const planned = await planDashboardApproval({
      orgId: "org_1",
      threadId: "thread_1",
      instruction: "Create an order",
      settings,
    });

    expect(planned?.approval.instructionHash).toBe("hash_planned");
    expect(planned?.approval.summary).toContain("Reply yes to create it");
    expect(mockBuildContext).toHaveBeenCalledWith("thread_1", "org_1");
    expect(mockPlanAgent).toHaveBeenCalledWith({ messages: [] }, "Create an order", settings);
    expect(mockThreadUpdate).toHaveBeenCalledWith({
      where: { id: "thread_1" },
      data: {
        cachedPlanMessageId: null,
        cachedPlan: expect.objectContaining({
          kind: "dashboard_pending_approval",
          instruction: "Create an order",
          instructionHash: "hash_planned",
        }),
      },
    });
    expect(mockCreateMessage).toHaveBeenCalledWith({
      threadId: "thread_1",
      senderType: "customer",
      contentText: "Create an order",
    });
    expect(mockCreateMessage).toHaveBeenCalledWith({
      threadId: "thread_1",
      senderType: "agent",
      contentText: expect.stringContaining("Reply yes to create it"),
    });
  });
});
