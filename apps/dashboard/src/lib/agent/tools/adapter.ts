import type Anthropic from "@anthropic-ai/sdk";
import type { OrgSettings } from "@/types";
import { AGENT_TOOLS, TOOL_CATEGORIES } from "./registry";
import { resolveAgentSettings } from "../settings";

export function toAnthropicTools(settings?: OrgSettings, allowedToolNames?: readonly string[] | null): Anthropic.Tool[] {
  const s = resolveAgentSettings(settings);
  const allowed = allowedToolNames ? new Set(allowedToolNames) : null;
  return AGENT_TOOLS.flatMap((t) => {
    if (t.type !== "function") return [];
    const fn = t.function as { name: string; description?: string; parameters?: unknown };
    const category = TOOL_CATEGORIES[fn.name];
    if (category && !s.toolsEnabled[category]) return [];
    if (allowed && !allowed.has(fn.name)) return [];
    return [{
      name: fn.name,
      description: fn.description ?? "",
      input_schema: fn.parameters as Anthropic.Tool["input_schema"],
    }];
  });
}
