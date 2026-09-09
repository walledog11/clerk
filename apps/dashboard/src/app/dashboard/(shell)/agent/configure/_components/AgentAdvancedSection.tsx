"use client"

import { AgentAutonomyAdvancedSection } from "./AgentAutonomyAdvancedSection"
import type { AgentTabController } from "./useAgentTabState"
import type { LlmSpendSnapshot } from "./llm-spend-presentation"

export function AgentAdvancedSection({
  controller,
  llmSpend,
}: {
  controller: AgentTabController
  llmSpend: LlmSpendSnapshot
}) {
  return <AgentAutonomyAdvancedSection controller={controller} llmSpend={llmSpend} />
}
