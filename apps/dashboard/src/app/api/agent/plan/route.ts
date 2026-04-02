import { NextResponse } from "next/server";
import { getOrCreateOrg } from "@/lib/org";
import { handleApiError } from "@/lib/api-errors";
import { buildContext, planAgent } from "@/lib/agent/runner";
import { resolveAgentSettings } from "@/lib/agent/settings";
import type { OrgSettings } from "@/types";

export async function POST(request: Request) {
  try {
    const org = await getOrCreateOrg();
    const { threadId, instruction } = await request.json();

    if (!threadId || !instruction?.trim()) {
      return NextResponse.json(
        { error: "Missing threadId or instruction" },
        { status: 400 }
      );
    }

    const settings = resolveAgentSettings(org.settings as Partial<OrgSettings> | null);
    const ctx = await buildContext(threadId, org.id);
    const plan = await planAgent(ctx, instruction.trim(), settings);

    return NextResponse.json(plan);
  } catch (error) {
    return handleApiError(error, "Agent plan POST", "Failed to generate plan");
  }
}
