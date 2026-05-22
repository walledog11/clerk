import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/lib/api/errors";
import { withOrgRoute } from "@/lib/api/route";
import { getDashboardAgentSession } from "@/lib/agent/api/sessions";

export const GET = withOrgRoute<{ id: string }>(
  { context: "GET /api/agent/sessions/[id]", errorMessage: "Failed to fetch session" },
  async ({ org, params }) => {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError();
    const session = await getDashboardAgentSession(org.id, userId, params.id);
    return NextResponse.json(session);
  },
);
