"use client"

import { AnimatePresence, motion } from "motion/react"
import Composer from "./Composer"
import ActionPlanCard from "./ActionPlanCard"
import type { AgentPlan, RawToolCall, Ticket } from "@/types"

interface Props {
  agentName: string
  clerkInstruction: string
  isClerkMode: boolean
  isPlanExecuting: boolean
  isRegenerating: boolean
  noteCount: number
  onChange: (text: string) => void
  onClearClerk: () => void
  onPlanApprove: (approvedToolCalls: RawToolCall[]) => void
  onPlanDismiss: () => void
  onPlanRegenerate: () => void
  onSend: (isNote: boolean) => void
  onViewTabChange: (tab: "chat" | "notes") => void
  pendingPlan: AgentPlan | null
  composer: {
    customerName: string
    channelType: Ticket["channelType"]
    customerPlatformId?: string
    isDrafting: boolean
    isSending: boolean
    onDraft: () => void
    replyText: string
    sendError: string | null
    shopifyCustomerId?: string | null
  }
  viewTab: "chat" | "notes"
}

export default function ConversationComposerArea({
  agentName,
  clerkInstruction,
  isClerkMode,
  isPlanExecuting,
  isRegenerating,
  noteCount,
  onChange,
  onClearClerk,
  onPlanApprove,
  onPlanDismiss,
  onPlanRegenerate,
  onSend,
  onViewTabChange,
  pendingPlan,
  composer,
  viewTab,
}: Props) {
  return (
    <div className="relative shrink-0">
      <AnimatePresence>
        {pendingPlan && viewTab === "chat" && (
          <motion.div
            className="absolute bottom-full left-0 right-0 px-5 pb-2 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.18 } }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="pointer-events-auto">
              <ActionPlanCard
                plan={pendingPlan}
                isExecuting={isPlanExecuting}
                isRegenerating={isRegenerating}
                onApprove={onPlanApprove}
                onDismiss={onPlanDismiss}
                onRegenerate={onPlanRegenerate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Composer
        customerName={composer.customerName}
        agentName={agentName}
        channelType={composer.channelType}
        shopifyCustomerId={composer.shopifyCustomerId}
        customerPlatformId={composer.customerPlatformId}
        value={isClerkMode ? clerkInstruction : composer.replyText}
        isClerkMode={isClerkMode}
        viewTab={viewTab}
        noteCount={noteCount}
        onViewTabChange={onViewTabChange}
        isDrafting={composer.isDrafting}
        isSending={composer.isSending}
        error={composer.sendError}
        onChange={onChange}
        onClearClerk={onClearClerk}
        onSend={onSend}
        onDraft={composer.onDraft}
      />
    </div>
  )
}
