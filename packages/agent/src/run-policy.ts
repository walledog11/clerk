import type { AgentActionApproval } from "./agent-actions.js";
import type { AgentActionMode } from "./agent-context.js";
import type { OrgSettings } from "./types.js";
import { resolveAgentSettings } from "./settings.js";
import { READ_TOOL_NAMES } from "./tools/registry/index.js";

export const DEFAULT_MAX_ITERATIONS = 10;
const READ_ONLY_MAX_ITERATIONS = 4;
export const TOKEN_BUDGET = 20_000;

export { READ_TOOL_NAMES };

export interface RunAgentPolicyOptions {
  readOnly?: boolean;
  mode?: AgentActionMode;
  approval?: AgentActionApproval;
}

export function resolveRunPolicy(settings?: OrgSettings, options?: RunAgentPolicyOptions) {
  const resolvedSettings = resolveAgentSettings(settings);
  const readOnly = options?.readOnly ?? false;
  // An unstated mode used to resolve to `human_approved`, so every turn that did
  // not name one claimed a human had approved it — with no approver to name, so
  // `approverId` was null. That put agent-initiated operator work in the Review
  // page's "you approved" panel and made the audit trail for a money movement
  // unable to answer the one question it exists to answer. The strongest label
  // in the enum is not a default: absence of a stated authorization is not
  // approval, and a caller that means `human_approved` says so and supplies an
  // approver with it.
  const effectiveMode: AgentActionMode = options?.mode ?? (readOnly ? "read_only" : "auto_executed");
  const approval = effectiveMode === "human_approved" ? options?.approval : undefined;
  const maxIterations = readOnly
    ? READ_ONLY_MAX_ITERATIONS
    : (resolvedSettings.maxIterations > 0 ? resolvedSettings.maxIterations : DEFAULT_MAX_ITERATIONS);

  return {
    approval,
    effectiveMode,
    maxIterations,
    readOnly,
    settings: resolvedSettings,
  };
}
