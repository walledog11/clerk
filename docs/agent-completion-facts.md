# Agent completion-fact contract

Last reviewed: 2026-09-07

Customer-facing completion language is conditional until the provider action succeeds. A proposed tool call is evidence of intent, not evidence that an external mutation committed.

## Fact shape

`packages/agent/src/completion-facts.ts` derives a small fact for each supported mutation:

- `action`: the normalized operation, such as `refund`, `cancellation`, `return`, or `fulfillment`;
- `target`: the order, customer, or email the operation affects, including a known customer-facing order alias;
- `amount` and `currency`: present when relevant and known;
- `outcome`: `proposed`, `success`, `error`, `policy_block`, `escalated`, or `unknown`;
- `executionReference`: the approved tool-call ID, provider operation key, or live-read call ID;
- `sourceTool`: the concrete tool that produced the fact.

Plan validation accepts `proposed` facts only to validate a conditional draft. The runtime send guard accepts only `success` facts. Facts are derived from approved inputs plus the action journal/provider result; the model cannot assert its own evidence.

## Wording and execution rules

- Every mutation described by a reply must precede that reply in the plan.
- Explicit order, amount, and currency language must match the fact. A completion email must retain the current customer recipient.
- A compound statement is sendable only when every described operation has a successful fact. Partial execution therefore cannot produce whole-plan success copy.
- A successful cancellation supports cancellation wording. It supports refund wording only when Shopify's returned financial status confirms a refund.
- Known failures block the completion reply as an error. Unknown provider outcomes keep the existing distinct `unknown` path, prevent the reply, and require reconciliation rather than retry.
- Historical completion wording is allowed only when a live Shopify order read establishes the state. Customer messages, summaries, and old/unexecuted plans do not produce facts.

## Approval boundary

The approved plan hash covers the recipient and complete communication input. Successful execution facts may resolve the already approved conditional completion wording without a second approval. Changing the recipient, adding a new promise, changing an amount/currency/target, or describing a materially different action changes the executable plan and requires renewed approval.

Brand voice may surround a verified completion statement, but it cannot change these facts. Unsupported generated wording remains blocking and must be regenerated within the existing planning budget or reviewed by the merchant.
