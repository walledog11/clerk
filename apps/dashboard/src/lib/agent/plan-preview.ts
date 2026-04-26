import type { AgentPlan, PlanStep } from "@/types"

const ACTION_TOOL_PRIORITY = [
  "create_refund",
  "cancel_order",
  "edit_shopify_order",
  "create_shopify_order",
  "update_shopify_order_address",
  "update_shopify_customer_info",
  "add_shopify_customer_note",
]

const TOOL_PHRASE: Record<string, string> = {
  send_reply: "reply",
  send_email: "email customer",
  add_internal_note: "add internal note",
  update_thread_status: "close ticket",
  update_thread_tag: "retag",
}

export interface PlanPreview {
  headline: string
  context: string
  proposal: string
  orderRef: string | null
}

function findActionStep(plan: AgentPlan): PlanStep | null {
  for (const tool of ACTION_TOOL_PRIORITY) {
    const found = plan.steps.find(s => s.tool === tool)
    if (found) return found
  }
  return null
}

function trim(text: string, max = 110): string {
  const cleaned = text.replace(/^"([\s\S]*)"$/, "$1").trim()
  return cleaned.length > max ? `${cleaned.slice(0, max - 3)}...` : cleaned
}

function warningLead(warning: string): string {
  const head = warning.split(/\s[-–—]\s/)[0] ?? warning
  return head.replace(/[.?!]+$/, "").trim()
}

function actionPhraseFor(step: PlanStep): string {
  const fixed = TOOL_PHRASE[step.tool]
  if (fixed) return fixed
  if (step.description) return trim(step.description, 60)
  return step.label || step.tool.replace(/_/g, " ")
}

function summarizeActionChain(plan: AgentPlan, excludeStepId?: string): string {
  const seen = new Set<string>()
  const phrases: string[] = []
  for (const step of plan.steps) {
    if (step.id === excludeStepId) continue
    const phrase = actionPhraseFor(step)
    if (!phrase || seen.has(phrase)) continue
    seen.add(phrase)
    phrases.push(phrase)
    if (phrases.length === 3) break
  }
  return phrases.join(" + ")
}

function buildProposal(plan: AgentPlan | null, headlineStep?: PlanStep | null): string {
  if (!plan) return "No plan generated — open ticket to draft reply"
  const warnings = (plan.warnings ?? []).slice(0, 2).map(warningLead).filter(Boolean)
  const action = summarizeActionChain(plan, headlineStep?.id)
  if (warnings.length === 0 && !action) {
    return "No plan generated — open ticket to draft reply"
  }
  if (warnings.length === 0) return action
  const left = warnings.join(". ")
  return action ? `${left} — ${action}` : left
}

function orderRefFromPlan(plan: AgentPlan): string | null {
  const lookup = plan.rawToolCalls.find(c => c.name === "get_order_by_name")
  const name = (lookup?.input as { order_name?: string } | undefined)?.order_name
  if (typeof name !== "string" || !name.trim()) return null
  return name.startsWith("#") ? name : `#${name}`
}

export function buildPlanPreview(
  plan: AgentPlan | null,
  aiSummary: string | null,
  firstMessage: string | null,
): PlanPreview {
  const action = plan ? findActionStep(plan) : null
  const proposal = buildProposal(plan, action)

  if (action) {
    const headline = action.description ? trim(action.description, 90) : (action.label || "Run action")
    const context = aiSummary?.trim() ? trim(aiSummary, 140) : ""
    return { headline, context, proposal, orderRef: plan ? orderRefFromPlan(plan) : null }
  }

  const headline =
    aiSummary?.trim() ? trim(aiSummary, 100) :
    firstMessage?.trim() ? trim(firstMessage, 100) :
    "New customer message"
  return { headline, context: "", proposal, orderRef: plan ? orderRefFromPlan(plan) : null }
}
