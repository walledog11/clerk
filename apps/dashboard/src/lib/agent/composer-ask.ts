import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/ai/anthropic";
import { AI_MODEL } from "@/lib/ai";
import logger from "@/lib/server/logger";
import type { OrgSettings } from "@/types";
import { resolveAgentSettings } from "./settings";
import { TOOL_CATEGORIES } from "./tools";
import { toAnthropicTools } from "./tools/adapter";
import { executeTool } from "./tools/executor";
import { buildMessageHistory } from "./message-history";
import type { ActionEntry, AgentContext, AgentResult } from "./types";
import { createModelUsageMetrics, hashInstructionForLog, recordModelUsage } from "./usage";

const MAX_ITERATIONS = 4;
const READ_TOOL_NAMES = Object.entries(TOOL_CATEGORIES)
  .filter(([, category]) => category === "read")
  .map(([name]) => name);

function buildComposerAskPrompt(ctx: AgentContext, settings?: OrgSettings): string {
  const s = resolveAgentSettings(settings);
  const ordersJson = ctx.recentOrders.length > 0 ? JSON.stringify(ctx.recentOrders) : "[]";
  const kbSection = ctx.kbArticles.length > 0
    ? ctx.kbArticles.map(a => `### ${a.title}\n${a.body}`).join("\n\n")
    : "No knowledge base articles are pre-loaded.";
  const languageClause = s.replyLanguage && s.replyLanguage !== "auto"
    ? `\n- If drafting customer-facing text, write it in ${s.replyLanguage}.`
    : "";

  return `You are ${s.agentName}, a private assistant inside the support ticket composer for ${ctx.orgName}.

## Current thread
- Thread ID: ${ctx.thread.id}
- Status: ${ctx.thread.status}
- Channel: ${ctx.thread.channelType}
- Tag: ${ctx.thread.tag ?? "none"}
- AI Summary: ${ctx.thread.aiSummary ?? "none"}
- Customer name: ${ctx.customer.name ?? "(not available)"}
- Customer email/handle: ${ctx.customer.platformId}

## Customer's recent orders
${ordersJson}

## Knowledge base
${kbSection}

## Rules
- Answer the support operator privately. Do not address the customer unless the operator asks you to draft customer-facing wording.
- Never send, email, notify, update, refund, cancel, tag, close, or otherwise mutate anything.
- Use only read-only tools when you need context.
- If the operator asks what to say or asks for a draft, provide draft text they can review and send themselves.
- If the operator asks you to perform an action from private ask mode, say what should happen next and offer the plan in natural product language, e.g. "This looks safe to update. I can queue the address-change plan for your approval." Do not say "I can only read data" or mention tool permissions.
- Never mention missing tools, available tools, read-only mode, permissions, or implementation limits. If you do not know something, say what the operator should verify in normal support language.
- Sound like a sharp coworker, not a report generator. Use plain sentences, no markdown headings, no bold labels, and avoid bullet lists unless the operator explicitly asks for a checklist.
- Lead with the practical answer, then include only the details needed to make a decision. Prefer 2-4 sentences.
- Avoid numbered lists for simple uncertainty. Say "I'd check..." or "I'd confirm..." instead.
- Do not end by asking a broad follow-up question unless it is necessary to answer the operator's request.
- Be concise, factual, and specific.${languageClause}`;
}

export async function answerComposerQuestion(
  ctx: AgentContext,
  instruction: string,
  settings?: OrgSettings
): Promise<AgentResult> {
  const startedAt = Date.now();
  const usageTotals = createModelUsageMetrics();
  const instructionHash = hashInstructionForLog(instruction);
  const actionsPerformed: ActionEntry[] = [];
  const tools = toAnthropicTools(settings, READ_TOOL_NAMES);
  const messages = buildMessageHistory(
    ctx.recentMessages,
    `Private question from the support operator. Do not contact the customer.\n\n${instruction}`
  );
  const system = buildComposerAskPrompt(ctx, settings);

  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system,
      messages,
      tools,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    const usage = recordModelUsage(usageTotals, response);
    logger.info({
      orgId: ctx.orgId,
      threadId: ctx.thread.id,
      iteration: i,
      stopReason: response.stop_reason,
      tools: toolUseBlocks.map(b => b.name),
      usage,
      usageTotals,
      instructionHash,
    }, "[agent:composer-ask] model call");

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "max_tokens") {
      return {
        summary: "The answer was cut off because the request was too large. Try asking a more specific question.",
        actionsPerformed,
      };
    }

    if (response.stop_reason === "end_turn" || toolUseBlocks.length === 0) {
      const textBlock = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === "text"
      );
      return {
        summary: textBlock?.text?.trim() || "I do not have enough information to answer that.",
        actionsPerformed,
      };
    }

    const toolResults = [];
    for (const toolCall of toolUseBlocks) {
      const result = TOOL_CATEGORIES[toolCall.name] === "read"
        ? await executeTool(toolCall.name, toolCall.input, ctx, settings)
        : `Error: ${toolCall.name} is not available in private ask mode.`;
      actionsPerformed.push({ tool: toolCall.name, result });
      toolResults.push({
        type: "tool_result" as const,
        tool_use_id: toolCall.id,
        content: result,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  logger.info({
    orgId: ctx.orgId,
    threadId: ctx.thread.id,
    durationMs: Date.now() - startedAt,
    usageTotals,
    instructionHash,
  }, "[agent:composer-ask] max iterations");

  return {
    summary: "I could not finish answering that. Try asking a narrower question.",
    actionsPerformed,
  };
}
