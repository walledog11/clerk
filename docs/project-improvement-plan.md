# Shopkeeper improvement and validation plan

Created: 2026-09-07. Status: in progress; A1 verified locally on 2026-09-07.

## Objective

Make the customer-message → Shopify context → merchant approval → verified action/reply workflow reliable, economical, and easy enough that a small Shopify merchant pays to keep using it. Address every weakness identified in the September 7 project review before expanding the product's scope or acquisition spending.

Preserve the direction in [Product Truth](product-truth.md): Instagram is the core social support channel, iMessage is the merchant control surface, Shopify supplies operational context and actions, and the dashboard supports setup, review, and manual fallback. Gmail is a fallback; Telegram remains internal testing infrastructure. Broader operating modules and additional merchant-control channels remain deferred until demand justifies them.

Code defects can be fixed. Demand, differentiation, willingness to pay, and retention must be tested. Completing the engineering checklist alone does not establish a viable business.

## Evidence and scope

The review inspected the working tree, including existing uncommitted agent/channel fixes. It reported 2,366 passing unit tests, including 68 cached tests, 67 passing node-script tests, cached passing typechecks, and a lint failure in the inbox component. The full integration/E2E suite and paid model evaluations were not rerun for that review. The committed August 17 evaluation baseline reported 250/252 passes; it does not certify the current release.

Two weaknesses were reproduced directly: repeated inbox renders with an active ticket and unchanged props, and unsupported-refund wording missed by the reply grounding detector. The visual dashboard audit was incomplete because the local preview encountered a Clerk authentication loop. That is a reproduction/setup problem to investigate, not evidence that production authentication is broken.

External approvals and deployment status below come from repository records and must be checked before acting. In particular, [Agent and channel audit fixes](code-audit-fixes.md) records the outbox migration as applied to production on September 7, with application deployment still outstanding. Preserve that work, establish the actual deployment state, and avoid rebuilding completed fixes.

This document is the implementation and validation plan. Keep immediate open work in [To-do list](to-do-list.md), operational procedures in the [runbook](production/runbook.md), and compatibility retirement in its [existing backlog](compatibility-retirement-backlog.md). Link between them rather than maintaining competing status narratives.

## Priorities, ownership, and order

Owners below are roles. The founder can own several roles; name the actual owner when starting each item. Effort estimates are active working days, are approximate, and exclude provider approval delays. They are not additive staffing commitments.

| ID | Priority | Work | Owner | Rough effort | Dependencies |
| --- | --- | --- | --- | --- | --- |
| A1 | P0 | Stop inbox render loop | Engineering | 0.5–1 day | None |
| A2 | P0 | Reconcile and ship existing reliability fixes | Engineering / release | 1–2 days | A1; current deployment inventory |
| A3 | P0 | Close access, credential, and provider launch gates | Founder / release | 2–4 days plus external waits | Start immediately; A2 before final canaries |
| A4 | P0 | Make completion claims follow actual action outcomes | Agent engineering | 3–5 days | A2; coordinate contract with B4 |
| B1 | P0 | Establish sustainable pricing and entitlement rules | Founder / engineering | 2–4 days initially | Cost baseline from D1; refine during D2 |
| B2 | P0 | Enforce service budgets and show usage | Engineering | 3–5 days | B1 definitions |
| B3 | P1 | Add bounded prior-conversation context | Agent engineering | 2–3 days | A4 behavior contract |
| B4 | P1 | Finish structured result propagation | Engineering | 2–4 days | Inventory existing typed results in A2 |
| C1 | P1 | Bound database reads and benchmark performance | Engineering | 2–4 days | A1; A2 |
| C2 | P1 | Complete onboarding, mobile, and approval usability review | Product / engineering | 2–4 days initially | A1; A3 for real-provider acceptance |
| C3 | P1 | Reconcile documentation and reduce maintenance friction | Engineering | 1–2 days initially | Start now; update with each change |
| C4 | P0 | Certify the actual release candidate | Engineering / release | 1–2 days plus fixes | Pilot gates listed below |
| D1 | P0 | Instrument value, cost, interruptions, and reliability | Product / engineering | 2–3 days | Start now; reuse existing analytics |
| D2 | P0 | Run a narrow paid pilot and test acquisition | Founder | 4–6 weeks after readiness | Pilot gates; D1 |

P0 means required for the paid pilot or its evidence. P1 means bounded product/engineering improvement; the pilot gate below distinguishes what must finish before onboarding from what can continue alongside a supervised pilot.

## A. Make the core workflow safe to use

### A1. Fix the inbox render loop

Entry point: `apps/dashboard/src/app/dashboard/(shell)/tickets/_components/InboxPageLayout.tsx`, particularly `dialogBody`, `lastDialogBody`, and the effect that copies JSX into state.

- [x] Remove the effect-driven cycle that stores newly created JSX on every render. Keep a stable conversation identity or the minimum data needed for the dialog's closing transition; derive rendered content from that state. Do not silence the dependency warning or freeze the first render's props.
- [x] Preserve opening, switching, closing, reopening, loading, and error states. Decide when the exiting conversation is released so stale messages or handlers cannot appear in the next ticket.
- [x] Add an interaction regression with the real layout and an active ticket under stable props. Assert that it settles without self-sustaining updates; include switching tickets and receiving new messages. Avoid an exact render-count assertion that depends on React development behavior.
- [x] Exercise the actual inbox in browser smoke coverage and run dashboard lint.

Done when opening a ticket settles, subsequent updates still render, closing does not flash incorrect content, and lint plus the regression pass. The review's bounded reproduction observed 11 commits before stopping updates; this is a functional defect, not a cosmetic lint issue.

### A2. Reconcile existing work and deploy one verifiable candidate

Entry points: [existing audit fixes](code-audit-fixes.md), [deployment runbook](production/runbook.md), and [production checklist](production/checklist.md).

- [x] Inventory the current source revision, dirty changes, generated client, migration state, Vercel revision, Railway revision, and released Shopify app configuration. Record identifiers from their actual deployment records in [the September 7 release inventory](production/release-inventory-2026-09-07.md).
- [x] Review the already implemented policy forwarding, lease checks, unknown outcomes, action journal, inbound outbox, recovery pagination, media handling, and shared planning budgets. Preserve them and close only remaining defects.
- [x] Verify that the required outbox schema exists before deploying dependent code. Do not reapply or roll back the migration based solely on the document's age.
- [ ] Run the canonical checks on the selected candidate. Deploy compatible dashboard and gateway versions through the existing release procedure, then perform isolated acceptance checks.
- [x] Rehearse crash-after-persistence, queue admission failure, duplicate delivery, lost execution lease, and ambiguous provider response. Confirm accepted work remains recoverable and ambiguous actions are not blindly retried.

Done when both applications run the recorded candidate, the database is compatible, and recovery evidence is attached to that release. Keep an application rollback path compatible with the additive schema; do not promise exactly-once external delivery.

### A3. Close the launch dependencies for the advertised experience

Use [external services work](phase-6-external-services.md), the [Gmail verification packet](production/google-gmail-verification-packet.md), and [data-deletion procedures](production/data-deletion.md).

- [ ] Confirm whether Instagram Advanced Access is still pending. Complete the review package if necessary and prove a non-role merchant's connect → inbound DM → approve → received reply → disconnect/reconnect cycle. Mark restricted availability accurately until this passes.
- [ ] While Advanced Access is pending, execute the capped [SocialAPI launch bridge plan](socialapi-launch-bridge-plan.md) for selected external merchants. Keep direct Meta as the strategic transport, enforce the bridge ceiling, and require the documented live/exit gates rather than treating middleware connectivity as Instagram readiness.
- [ ] Resolve the documented Shopify app-secret exposure. Rotate through the provider and both applications in a coordinated window, validate OAuth and webhook verification afterward, and keep secret values out of evidence artifacts. If already rotated, record that evidence instead.
- [ ] Read installed Shopify scopes from Shopify, test a real merchant install, and explain reauthorization requirements in the UI. Verify missing scopes produce an actionable recovery path without silently disabling advertised work.
- [ ] Complete the applicable Gmail grant/reconnect and verification work. Keep forwarding available where suitable, with its own plain-text, attachment, threading, and bounce acceptance checks. Gmail completion must not be used to claim Instagram readiness.
- [ ] Validate iMessage binding, merchant identity, approvals, stale approvals, disconnects, and recovery on a real linked device.
- [ ] Close the outstanding Shopify compliance acceptance checks using isolated fixtures and the existing procedures before broad merchant onboarding.
- [ ] Keep TikTok Shop gated until API eligibility, app approval, seller authorization, and a complete external seller workflow are proven. Generic TikTok DMs remain a separate, unimplemented capability. Do not build more adapter code without resolving feasibility.

Done when every channel offered to the pilot cohort has dated acceptance evidence, an identified provider owner, and a recovery path. External approval delays extend the schedule. A fallback-channel pilot can validate that channel only; it cannot close the social-support hypothesis.

### A4. Ground completion language in execution evidence

Entry points: `packages/agent/src/plan-grounding.ts`, `plan-validation.ts`, `run-execution.ts`, `agent-actions.ts`, `tools/result.ts`, and the dashboard/gateway send paths.

- [x] Add regressions for unsupported first-person, plural, passive, and coordinated claims, including “We have issued your refund” and “Your refund has been issued.” Include wrong order, amount, currency, recipient, and partial execution cases.
- [x] Define a small structured completion-fact contract for supported mutations: action, target, relevant amount/currency, outcome, and execution reference. Reuse the action journal and provider results as the evidence source.
- [x] Keep proposed actions distinct from committed outcomes. A plan containing a refund tool is insufficient proof that a refund happened. Replies that depend on a mutation must wait for its result.
- [ ] Render sensitive completion statements from validated facts where practical, while allowing brand voice in surrounding text. If a generated statement cannot be supported, regenerate within the existing budget or require merchant review. Do not keep expanding regexes as the primary correctness mechanism.
- [x] Preserve truthful statements about historical actions returned by live store reads. Treat customer text, old summaries, and unexecuted plans as untrusted claims rather than proof of completion.
- [x] Specify the approval contract for post-execution wording: facts may resolve an approved conditional reply, but a changed recipient, new promise, or materially different action requires renewed approval. Known failure and unknown outcome need distinct customer/operator copy.
- [ ] Run targeted model evaluation and the release gate under the [existing evaluation contract](agent-eval-gates.md).

Done when the regression matrix cannot emit a completion claim unsupported by its recorded facts, an uncertain action cannot become a success message, and truthful historical information still works. Finite tests do not prove hallucinations impossible; keep monitoring sampled real outcomes.

## B. Align costs, context, and contracts

### B1. Replace the unlimited promise with a defensible offer

Entry points: `apps/dashboard/src/app/(marketing)/_components/Pricing.tsx`, `packages/db/plan-limits.ts`, billing checkout/webhooks, and onboarding plan selection.

The reviewed offer is $19 for 500 conversations and $49 for unlimited conversations. Full Starter usage yields $0.038 revenue per conversation. At a proposed 80% gross-margin target, only $0.0076 per conversation remains for all direct delivery costs. These are arithmetic scenarios, not measured customer costs or proof that a particular price will work.

- [ ] Measure model cost across classification, planning, execution, retries, summaries, operator turns, and scheduled work. Include messaging, storage, hosting allocation, payment fees, and customer support effort. Report cold-cache and expensive-tail cases separately.
- [ ] Build low, expected, and high usage scenarios per merchant. Show contribution margin and a separate fully loaded view that values founder support time.
- [ ] Define one billable unit, reset period, and treatment of reopened threads, episode rollover, retries, deleted threads, and operator messages. Reconcile the current calendar-month/thread-created counter with checkout and marketing language.
- [ ] Replace unlimited usage with explicit included usage and a clearly disclosed service allowance. Keep both tiers' core capabilities consistent with the existing product decision; vary usage and seats unless evidence supports a deliberate change.
- [ ] Choose the initial paid-pilot offer from the cost scenarios and merchant interviews. Test renewal at that price; do not infer willingness to pay from free use.
- [ ] Give trial, recognized paid, unknown-price, and expired subscriptions explicit entitlement behavior. A missing price mapping must not silently create unlimited AI access. Preserve appropriate read/manual access and explain billing/configuration problems.
- [ ] Update pricing, checkout, in-app usage, Stripe mappings, and support copy together. Specify treatment of existing customers before changing their limits. No surprise overages or retroactive charges.

Done when the offer has a documented cost envelope, every subscription state has deterministic limits, and the merchant sees the same promise on all surfaces. Final price and allowance are decisions supported by evidence, not fixed assumptions in this plan.

### B2. Make spending limits effective and understandable

Entry points: `packages/agent/src/spend.ts`, `packages/db/llm-spend.ts`, `packages/db/spend-store.ts`, model cost accounting, and agent configuration/billing UI.

- [ ] Separate the merchant's optional daily cap, the service's plan allowance, and the platform emergency stop. Raising a merchant-configured cap must not bypass the service allowance. The current $20/day default must not be mistaken for margin protection.
- [ ] Replace “spend read failed → zero” with an explicit unavailable-budget outcome. Pause new paid model work on accounting failure, retain recoverable inbound work, and explain manual fallback. Do not silently report a successful zero-spend read.
- [ ] Reserve a conservative bounded allowance before provider calls, reconcile actual usage afterward, and prevent concurrent runs from spending the same remaining allowance. Use a durable idempotent record or extend an appropriate existing record; avoid a second independent ledger.
- [ ] Handle timeout/process-loss reservations conservatively. Release only amounts known to be unused; reconcile uncertain usage. A failed usage write must remain recoverable and must not permit repeated unaccounted calls.
- [x] Use a shared model-price source for production and evaluations, or enforce parity if packaging requires separate tables. Unknown models must not be silently underpriced.
- [ ] Show usage, remaining allowance, reset time, and reason for any pause. Warn before exhaustion and offer a clear next action. Restore queued work at a bounded rate after recovery or reset.
- [ ] Verify concurrent dashboard/gateway calls, database outages, duplicate usage reports, unknown models, exhausted allowances, and period rollover.

Done when normal concurrent work cannot bypass the service budget, accounting failures are visible and recoverable, and the residual maximum overshoot is documented and tested. Do not claim a strict dollar ceiling if the provider's in-flight usage cannot be bounded.

### B3. Give the agent bounded, correctly scoped customer history

Entry points: `packages/agent/src/context.ts`, `context-budget.ts`, prompt construction, and prior-conversation display in the dashboard.

- [ ] Retrieve a small configurable number of recent prior conversation summaries for the same verified customer within the same organization; start with at most three. Exclude the current thread and deleted records, respect retention policy, and avoid speculative cross-channel identity merging.
- [ ] Attach timestamps, source identifiers, channel, and disposition. Label summaries as historical context; fetch current Shopify state before asserting that an order remains refunded, unfulfilled, or otherwise actionable.
- [ ] Allocate an explicit history budget within the total context budget. Handle missing summaries and retrieval failure without breaking the whole context fan-out.
- [ ] Include regressions for repeat complaints, recent refunds, changed policies, conflicting old summaries, tenant isolation, and anonymous/verified storefront sessions. Do not expose private history to an unverified shopper.
- [ ] Evaluate the prompt change under the existing paid evaluation contract and compare cost and latency with the prior context.

Done when relevant repeat-customer cases use prior context accurately, privacy boundaries hold, and context size remains bounded. A vector database or general identity platform is outside this first implementation.

### B4. Finish structured outcome propagation

Entry points: `packages/agent/src/tools/result.ts`, `message-dispatch.ts`, `run-approved-actions.ts`, action records, and the internal dashboard/gateway response contracts.

- [ ] Inventory remaining control flow based on `Error:`, `Unknown:`, or other message wording. Retain already implemented typed statuses and unknown-outcome handling.
- [ ] Carry typed outcome, error code, execution/request reference, and retryability across the affected boundaries. Keep display text separate from machine decisions.
- [ ] Convert legacy string results once at a named boundary if historical compatibility is required; add no new downstream prefix parsing.
- [ ] Specify the semantics of not-found, policy-blocked, failed-before-send, committed, and unknown. Unknown provider outcomes must remain non-retryable until reconciled.
- [ ] Test propagation through the actual gateway → dashboard send hop and operator summaries. Changing human-readable wording must not change retry, billing, or completion behavior.

Done when active paths use structured outcomes end to end and any remaining legacy adapters have a documented retirement condition.

## C. Make performance, usability, and maintenance verifiable

### C1. Bound reads and establish a performance baseline

Entry points: `apps/dashboard/src/app/api/threads/route.ts`, thread detail/message consumers, `apps/dashboard/src/lib/messaging/thread-list-query.ts`, and inbox pagination hooks.

- [ ] Make thread-list responses bounded previews. Give conversation history a bounded cursor-based endpoint or response, with explicit load-older behavior. Audit all callers before removing full-history responses.
- [ ] Preserve chronological ordering and stable pagination when timestamps tie or new messages arrive. Fetch the latest customer message per thread using a database query with bounded result cardinality; inspect generated SQL before assuming an ORM `distinct` bounds scanned or transferred rows.
- [ ] Inspect plans and indexes against realistic tenant-scoped data. Add an index only for demonstrated query work. Keep hidden-tab polling suspended and verify realtime reconnect fallback.
- [ ] Benchmark isolated local/staging datasets representing 1× and 10× the expected pilot volume, long threads, attachment bursts, webhook retries, and concurrent operators. Use stubbed providers for load; no production mutation traffic.
- [ ] Record hardware/service tier, dataset size, concurrency, cold/warm cache, database time, response size, memory, queue age, and p50/p95 latency. Separate provider/model latency from application work.

Initial acceptance targets, to be adopted or revised with measured evidence before implementation closes: warm list/detail API p95 ≤500 ms at pilot load; provider-independent request failures <1%; representative routine plans ready within 30 seconds at p95; and a 10× inbound burst drains within five minutes after input returns to normal. These are proposed budgets, not current performance claims. Long-thread response size must stay bounded as history grows.

Done when measurements are reproducible, important queries are bounded, and the agreed pilot load fits the service's cost and latency budgets. Optimize measured hotspots before introducing additional infrastructure.

### C2. Complete the usability audit and reduce approval interruptions

Entry points: onboarding components, `apps/dashboard/src/proxy.ts`, `src/lib/e2e-auth.ts`, inbox/review components, and operator notification/binding flows.

- [ ] Reproduce the local Clerk loop with the documented preview command. Determine whether key resolution, middleware initialization, or preview setup caused it. Make isolated preview reproducible without weakening production authentication or allowing production auth bypass.
- [ ] After A1, inspect real rendered desktop and mobile flows: sign-up, Shopify connection, customer channel connection, iMessage binding, first request, approval, correction, takeover, recovery, and disconnect/reconnect.
- [ ] Resolve the onboarding mismatch: the reviewed step sequence directs users through email while the product's wedge is social support. Present the available customer-origin channel choice honestly and let eligible merchants complete the Instagram path without unnecessary email setup. Keep a clear fallback for restricted Instagram access.
- [ ] Check keyboard navigation, focus restoration, dialog announcements, touch targets, screen-reader labels, reduced motion, and mobile keyboard/composer behavior. Capture loading, empty, error, and expired-plan states as well as the happy path.
- [ ] Make the approval card explain the proposed action, affected order, money involved, and relevant evidence. Keep detailed audits available without making them mandatory reading for every approval.
- [ ] Use existing notification/digest controls to batch routine notices, deduplicate reminders, and respect duty hours. Immediate alerts should reflect urgency or required decisions. Do not relax financial approval policies merely to reduce notifications.
- [ ] Observe merchants handling realistic requests. Measure active review/correction time and unnecessary interruptions; ask whether the phone workflow is easier than their previous process.

Done when the complete advertised workflow has browser/device evidence, no critical accessibility/usability blockers remain, and the pilot measures the net effort of approval. A phone-based queue is not successful solely because notifications arrive.

### C3. Restore documentation trust and reduce maintenance friction

- [ ] Reconcile README channel status, polling/realtime behavior, navigation, attachment support, operator channel naming, and testing counts with implementation and deployment evidence. Remove completed to-do entries only after confirming their actual status.
- [ ] Record four separate states for integrations: implemented, locally verified, deployed, and externally accepted. Keep strategic intent in Product Truth and current operational status in the launch records.
- [ ] Add a concise architecture map showing inbound persistence/queueing, agent planning, approval ownership, action execution, provider delivery, and recovery. Identify the authoritative owner of plan state, customer identity, billing eligibility, and action outcomes.
- [ ] Document the shared agent package's supported host interface. Consolidate exports or abstractions only where a real change currently requires duplicated work or knowledge of internals.
- [ ] Name module owners, even if initially the same person. Use the current lint/Knip and compatibility-retirement mechanisms. Do not rename persisted channel enums or BullMQ job identifiers for aesthetics.
- [ ] Require feature changes to update their associated truth/status documents. Mechanical link checks catch broken paths; reviewers must check factual claims.

Done when a developer can trace one customer request and one uncertain delivery through the system from the architecture map, and onboarding documentation matches the code. Do not target arbitrary reductions in files, lines, migrations, or models; reduce the number of places required for a representative change.

### C4. Certify the release that merchants will actually use

Follow [Testing](../TESTING.md), [critical-path coverage](production/critical-path-test-checklist.md), and [agent evaluation gates](agent-eval-gates.md).

- [ ] Add targeted behavioral regressions for the actual defects above. Preserve useful existing coverage rather than adding tests that merely mirror helper implementations.
- [ ] Run `npm run verify:pr` on the candidate: static checks, unit/node tests, coverage/integration, smoke E2E, and production build. Resolve failures and document any optional skipped checks.
- [ ] Include a real rendered inbox interaction; passing helper tests did not detect A1. Exercise reply and approval persistence across both applications, with provider calls recorded in tests.
- [ ] Run the separate Clerk browser-session checks in their appropriate development environment. A bypassed-auth smoke pass cannot certify provider authentication.
- [ ] For prompt, context, grounding, and tool-contract changes, run targeted paid evaluations followed by the release mode using explicit dollar and model-call budgets. Do not reuse the August baseline as current certification or dispatch unbounded paid retries.
- [ ] Record candidate SHA, cache usage, environment, checks/skips, and provider acceptance evidence. Keep operational artifacts free of credentials and unnecessary customer content.

Done when the actual candidate passes the required checks and advertised provider workflows, with no unresolved critical safety or core-workflow defect. Use dated evidence; neither a test count nor a green historical audit is sufficient.

## D. Prove the concept and economics

### D1. Measure outcomes before adding acquisition volume

Reuse `packages/analytics`, `AgentTurnUsage`, request/action records, and [existing PostHog reports](production/posthog-reports.md). Add only missing measures.

- [ ] Make activation mean a connected merchant has received a real customer request and completed a verified action/reply. Report channel-specific funnels; the current documented email step must not exclude the social cohort from activation analysis.
- [ ] Distinguish automated resolution, approved resolution, manual takeover, blocked action, known failure, unknown outcome, and reopened request. A sent reply alone is not proof of resolution.
- [ ] Measure initial setup time, founder help, active merchant review time, substantive edits, unsolicited reminders, and meaningful weekly use. Use observation/time diaries where click timing would falsely count time away from the app as work.
- [ ] Attribute all model/provider costs to the organization and period, including background work and failed/retried requests. Reconcile aggregates against provider totals and flag unattributed spend.
- [ ] Track founder support minutes and assign a stated hourly cost in the economic analysis. Separate one-time setup from ongoing support.
- [ ] Establish incident measures for unsupported completion claims, wrong targets, duplicate actions, lost accepted messages, and time to resolve unknown outcomes. Avoid logging raw message content into general analytics.

Done when five sample workflows reconcile from request through action/reply, usage, analytics, and cost, including a retry and a failure. Metrics must not double-count redelivery, test fixtures, or founder-operated accounts as customer success.

### D2. Run a focused paid pilot and test the reason to choose Shopkeeper

The following is a validation protocol, not a claim of existing traction or authority to contact merchants during this documentation task.

- [ ] Recruit five to ten independent, owner-operated Shopify brands in one segment, initially testing apparel/accessories with recurring social questions and order changes. Screen for enough weekly support work to plausibly save several hours; record current tools and their limitations.
- [ ] Before connecting Shopkeeper, collect a one-week baseline of support volume, active handling time, response delays, and error/rework costs. Separate unusually quiet or peak weeks.
- [ ] Run four to six weeks of real, initially supervised use after the pilot gates pass. Record every founder intervention; manual rescue is a service cost, not autonomous product success.
- [ ] Compare matched request types against the baseline. Report routine and complex cases separately, include unanswered/reopened cases, and show per-merchant results rather than only cohort averages.
- [ ] Ask merchants to renew at the documented intended price. Record payment/renewal behavior, not just survey enthusiasm. If renewal is not yet due, keep the retention conclusion open.
- [ ] Test a repeatable founder-led acquisition route, such as a narrowly defined agency partnership or direct recruitment campaign. Track qualified leads, demos, activation, paid conversion, cash cost, and founder time. Outreach itself is a separate execution step.
- [ ] Ask why merchants chose Shopkeeper over their existing workflow and available competitors. Test the specific value of iMessage control, approval clarity, and completed order work. The research starting points are [Gorgias support skills](https://www.gorgias.com/ai-agent/support-skills), [Tidio](https://apps.shopify.com/tidio-chat), [Shopify Inbox](https://apps.shopify.com/inbox), and [Sidekick](https://www.shopify.com/sidekick); recheck their offers before making new comparative claims.
- [ ] Turn recurring merchant corrections and incidents into consented, redacted evaluation cases. Build differentiation through demonstrated workflow reliability, useful merchant preferences, and distribution relationships. Do not treat notification transport or model choice alone as a durable advantage.

Proposed pilot decision criteria, to adopt before recruitment so the goalposts do not move:

| Measure | Initial decision target | Interpretation |
| --- | --- | --- |
| Independent paid demand | At least five paying merchants; at least three renew at the intended offer | A small directional signal, not proof of product-market fit |
| Time saved | At least three merchants save ≥2 active hours/week after review and rework | Compare similar request volume/types with baseline |
| Approval usefulness | ≥80% of reviewed routine plans approved without substantive edits | Also report rejected, ignored, regenerated, and automatically handled plans |
| Dependence on founder | Recurring rescue/support time decreases over the pilot | High-touch help must be included in costs and reported honestly |
| Economics | Positive contribution per paid merchant; a measured path toward 80% gross margin | Include expensive users, all provider costs, and allocated recurring support |
| Reliability | No unresolved critical wrong-recipient, unauthorized-money, duplicate-action, or lost-message incident | Pause the affected automation and investigate any such event; small samples cannot establish zero risk |
| Acquisition | One route produces multiple independent paying merchants with recorded acquisition cost/time | Referrals from friends alone do not establish repeatable distribution |

Continue investing when merchants renew, net effort falls, critical risks are controlled, and costs support the offer. Narrow the segment or workflow if only a subset gets value. Reprice or reduce included usage if value is strong but costs are excessive. Pause expansion if merchants do not renew or the service depends on persistent founder rescue. Do not respond to weak demand by automatically adding more features.

## Pilot and expansion gates

### Gate 1: Before the first real merchant uses the advertised workflow

- [ ] A1 is fixed; A2's required reliability changes are deployed and verified.
- [ ] A3 passes for every offered channel, including credential rotation and necessary merchant access. If Instagram remains restricted, recruitment and claims explicitly reflect that limitation.
- [ ] A4's sensitive completion/outcome cases pass. Human approval and manual fallback remain available.
- [ ] B1/B2 provide an explicit offer, bounded paid usage, visible pauses, and recovery behavior.
- [ ] C1 establishes bounded core reads and capacity sufficient for the pilot; broader optimization may follow measurement.
- [ ] C2 demonstrates the core device/browser flow and resolves critical usability/authentication blockers.
- [ ] C4 certifies the selected candidate; D1 records the necessary evidence.

B3 and remaining B4/C3 improvements may continue during a small supervised pilot if their residual limitations are disclosed and do not undermine these gates. Treat any discovered privacy, authorization, or outcome-integrity defect as a gate regardless of its task label.

### Gate 2: Before substantial acquisition spending or new operating modules

- [ ] All engineering items in this plan are closed with evidence or explicitly re-scoped based on pilot findings.
- [ ] D2 demonstrates paid renewals, net time savings, and a defensible cost envelope.
- [ ] Typical and expensive merchant workloads fit the chosen offer and operational capacity.
- [ ] A repeatable acquisition route and the merchant's reason to choose Shopkeeper are documented.

## Suggested calendar and status discipline

Start A1, external-access work, documentation reconciliation, and the measurement design immediately. In the first two weeks, prioritize A2/A4, budget correctness, and the pricing model. Use the following two weeks for bounded context/result work, usability, load measurement, and release acceptance. Several tasks can overlap by owner; a solo developer should sequence them and expect a longer technical preparation period.

Begin the four-to-six-week paid observation period only after Gate 1 passes. A planning envelope is roughly eight to ten weeks including technical preparation, and longer if external approvals or the listed estimates require it. Do not compress the observation period to preserve a date, and do not represent provider review turnaround as under engineering control.

For every item, record owner, state (`not_started`, `in_progress`, `blocked_external`, or `verified`), dependency, implementation revision, and evidence link. Mark an item verified only against its acceptance criteria. Keep deploy evidence, local checks, provider acceptance, and customer validation distinguishable. A weekly review should answer: what risk was removed, what did merchants demonstrate, and what evidence permits the next investment?
