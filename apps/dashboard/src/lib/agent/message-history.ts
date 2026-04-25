import type Anthropic from "@anthropic-ai/sdk";
import type { AgentContext } from "./types";

export function buildMessageHistory(
  recentMessages: AgentContext["recentMessages"],
  instruction: string
): Anthropic.MessageParam[] {
  const rawHistory = recentMessages
    .filter((m) => m.senderType !== "note")
    .map((m) => ({
      role: m.senderType === "agent" ? "assistant" as const : "user" as const,
      content: m.contentText ?? "(media)",
    }));

  const merged: Anthropic.MessageParam[] = [];
  for (const msg of rawHistory) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role && typeof last.content === "string") {
      last.content += "\n" + msg.content;
    } else {
      merged.push({ role: msg.role, content: msg.content });
    }
  }
  while (merged.length > 0 && merged[0].role === "assistant") {
    merged.shift();
  }

  return [...merged, { role: "user", content: instruction }];
}
