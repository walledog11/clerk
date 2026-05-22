/**
 * GET /api/agent/actions
 *
 * Returns a paginated action log of all agent turns across all threads for this org.
 * Reads structured __clerk_agent__ note messages and filters to entries with at least one action.
 *
 * Query params:
 *   cursor — encoded cursor for pagination
 *   format=csv — export the full action log as CSV
 *
 * Response: { entries: ActionLogEntry[], nextCursor: string | null }
 */
import { NextResponse } from "next/server";
import { withOrgRoute } from "@/lib/api/route";
import {
  listAgentActionLogEntries,
  listAllAgentActionLogEntries,
  serializeAgentActionLogCsv,
} from "@/lib/agent/api/action-log";
import { parseActionLogCursorQuery } from "@/lib/agent/api/validation";
import { rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

export const GET = withOrgRoute(
  { context: "GET /api/agent/actions", errorMessage: "Failed to fetch action log" },
  async ({ org, request }) => {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    // Two different rate-limit keys (export vs read) — keep inline.
    const rl = await rateLimit(
      format === "csv" ? `agent-actions:export:${org.id}` : `agent-actions:${org.id}`,
      format === "csv" ? 5 : 60,
      60,
    );
    if (!rl.success) {
      return tooManyRequests(rl.reset);
    }

    const { cursor, filters } = parseActionLogCursorQuery(request);

    if (format === "csv") {
      const entries = await listAllAgentActionLogEntries({ orgId: org.id, filters });
      const csv = serializeAgentActionLogCsv(entries);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="agent-actions-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const { entries, nextCursor } = await listAgentActionLogEntries({
      orgId: org.id,
      cursor,
      filters,
    });

    return NextResponse.json({ entries, nextCursor });
  },
);
