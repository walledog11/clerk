# Shopkeeper To-Do List

Open work only. An entry says **what is left and what would close it** — never how it
got to this state. Completed work is deleted, not archived; git history is the record.
Do not add "recently completed" sections, and do not let an entry grow into an account
of its own fix: the moment an item reads as evidence rather than as an instruction, cut
it back. Evidence checklists, failure drills, and standing procedure live in the linked
docs.

Last reviewed: 2026-09-10.

Work is grouped by **what kind of action it needs**, not by when it was filed.

---

## Deploy surfaces

A behind surface outranks everything else in this file, because every one of them fails
silently. There are four: Vercel, Railway, the production database, and the Shopify app
version. Read the deployed commit off the deployment record itself — Vercel's
`meta.githubCommitSha` via the API, Railway's `meta.commitHash` via
`railway deployment list --json`. Never infer it from a timestamp sitting near a commit,
and never from `/health`, which is liveness-only and cannot report a commit at all.

- [ ] **Restore the production Postmark forwarding integration after a credential
  canary.** Verify the dashboard's configured `POSTMARK_API_KEY` can send from
  `hello@useshopkeeper.com`, then recreate that forwarding integration and make it the
  workspace default. If the canary fails, leave Gmail as the default and reconnect
  Postmark through the dashboard instead of writing a live-looking row that cannot send.
  Account approval landed 2026-08-30, so the canary may now send cross-domain — pick a
  recipient off `useshopkeeper.com`, or it proves nothing that the same-domain rule
  would not have allowed anyway.

- [ ] **Reconnect `rscoding11@gmail.com` once, to pick up a non-expiring grant.**
  Publishing the OAuth app stopped the 7-day refresh-token clock for grants issued after
  it, but tokens already issued keep their original expiry — so the live mailbox stays on
  a dying grant until it reconnects. One pass through Settings → Integrations → Gmail.
  Verification is a separate and much longer track —
  [google-gmail-verification-packet.md](production/google-gmail-verification-packet.md).

---

## Prove in prod

Shipped code awaiting a production canary, an observation window, or a configured
provider. **None of these is a code task.**

### Storefront chat

- [ ] **One real merchant workspace, in approval mode.** Toggle on through the
  integration card, activate the theme embed, remove the Shopify Inbox bubble, then run
  the full loop with no ops touching metadata. Never exercised outside the dev store the
  author controls. The released app carries the current widget, so a merchant connecting
  now gets it; nothing blocks this.
- [ ] **Dev-store browser matrix.** Online Store 2.0 and a vintage theme, desktop and
  mobile, embed on and off, Shopify Inbox bubble present and removed — those four
  dimensions are the matrix; no other file holds a longer one. The automated remainder
  is already covered. Read the channel invariants before running it:
  [storefront-chat-verification-2026-08.md](production/storefront-chat-verification-2026-08.md).
- [ ] **Fire the router-materialized escalation path once.** Guest escalations that
  arrived with no reply were fixed by passing `keepReply` into `applyEscalationRouting`,
  but that branch has still never run live. Three attempts missed it the same way: the
  model elected `escalate_to_human` itself, so the `existing` branch preserved the
  model's tool-use id instead of synthesizing `tu_route_escalate`. Firing it needs a
  message the model believes it *can* answer, where `routePlan` returns `escalate`
  anyway. Storefront chat, dev store.
- [ ] **Episode boundary, end to end on the dev store.** Widget, dashboard, operator
  notification and reply/approval paths together. The last unrun item from the
  2026-08-12 episode plan; everything else in it shipped, and the eval gate ran on
  2026-08-17. Boundaries are `CHANNEL_EPISODE_POLICY` in
  `apps/gateway/src/message-handlers/resolve-inbound-episode.ts`.
- [ ] **One live order attributed as `chat_assisted`.** Talk to the widget, verify an
  email, buy something, then confirm the `conversation_attributions` row lands and the
  next briefing reports it. When reading those numbers: attribution covers shoppers who
  verified an email or already exist as a customer record — see the anonymous-shopper
  gap under Parked.

### Operator and agent

- [ ] **Nothing prunes a stale `pendingQuestion`.** `loadLivePendingPlans` drops parked plans
  whose execution is terminal or whose cache moved on; questions have no equivalent, so one
  parked for thread `dd5eb30f` was still in the production ledger 11 days later, feeding the
  operator ledger the model reads. It is also what makes a bare "yes" ambiguous: the keyword
  fast path defers to the model whenever a question is pending, so a stale one changes how an
  unrelated approval is handled. Give questions the same liveness check as plans.

- [ ] **Watch the escalation notice clear itself.** Reply as the merchant *in the
  composer* and confirm the widget notice disappears. Approving an agent plan cannot
  discharge it — `recordMerchantReply` is merchant-only by design, which was confirmed
  live when `escalatedAt` survived an approved `send_reply`.
- [ ] **See a grounded `send_reply` in production once.** Plan validation rejects
  unsupported mutation claims before approval, and the send path now requires a matching
  successful completion fact. Watch one real action/reply pair and confirm its action-journal
  result and provider operation reference support the copy. Include one truthful historical
  refund or fulfillment statement grounded by a live order read. **Half-observed 2026-09-10.**
  The negative case is proven for real: an approved refund failed with `policy_block` and the
  agent sent the customer nothing and claimed nothing, escalating to the merchant instead. The
  validator was also caught wrongly rejecting a *supported* claim and fixed in `0e5bcec0`. What
  is still unobserved is the positive pair — a mutation that actually succeeds and a reply whose
  copy its own journal result supports — because no agent mutation has yet committed in
  production. Blocked behind the refund currency fix in
  [PR #89](https://github.com/walledog11/shopkeeper/pull/89). Note the failed refund it observed
  ran in a free-form operator turn, not an approved plan execution — the invariant held, but not
  on the path this bullet is about.

### Channels and providers

- [ ] **Postmark outbound canary.** Send and bounce attribution under real traffic;
  inbound is already proven end to end. Steps in
  [phase-6-external-services.md](phase-6-external-services.md). Send one *with an
  attachment* while here: Postmark maps them to an `Attachments` field where Gmail
  builds `multipart/mixed` through `buildRawMime`, so Gmail being proven end to end
  says nothing about this path.
- [ ] **Gmail alias send/receive for `support@palettegarments.com`.** The 2026-07-29
  rollout proved native inbound and mailbox receipt, then stopped: a read-only `sendAs`
  check found the address neither present nor verified, so Shopkeeper's `fromEmail` was
  left alone. Needs Gmail administrator access plus an independent external mailbox,
  neither of which the release workspace had. Configure delivery, verify it as a **Send
  mail as** address, and prove inbound and alias sending in Gmail *before* saving the
  alias in Shopkeeper — then send plain-text and HTML-plus-attachment canaries, reply
  from the dashboard alias, and confirm one ticket, attachment persistence, alias sender,
  Gmail threading, one continuing thread, and no duplicate jobs. If alias behavior fails,
  restore Palette's original address immediately; the reliability release can stay
  deployed. Read logs for identifiers only, never content or tokens.
- [ ] **Instagram Advanced Access — parked, not a launch gate.** Implementation and
  Standard Access acceptance are done, and the direct Meta path stays safe and disabled
  for new connections. Meta App Review no longer gates launch, the canaries, the paid
  pilot, or the first 100 users: SocialAPI is the selected `ig_dm` transport for that
  whole phase (2026-09-09, [improvement plan](project-improvement-plan.md) A3). Revisit
  direct Meta transport and any migration on a future dated decision, not on this list's
  schedule. Ops in [runbook.md](production/runbook.md).
---

## Console / config

External consoles, env vars, and provider dashboards. No application code.

Re-verify env presence with `vercel env ls production` — `vercel env pull` redacts
sensitive vars to an empty string, indistinguishable from unset. Brand, domain, OAuth
branding, Postmark approval, Clerk/Shopify/Meta display names, Telegram migration and
the Gmail restricted-scope packet all live in
[phase-6-external-services.md](phase-6-external-services.md); delete that file when its
closing verification passes.

- [ ] **Prove the Shopify compliance webhooks.** `customers/redact` is done: a signed
  production delivery on 2026-08-30 erased a fixture customer holding a captured request
  episode — the shape that used to abort — and the gateway logged non-zero `deleted*`
  counts. Reproduce with `canary:customer-redact:{seed,deliver,verify}`; note that
  `shopify app webhook trigger` cannot do this, because its sample payload names a
  customer that matches nothing and so exercises the empty path. A second delivery the
  same day carried a real private Blob attachment and erased it too, so the Neon and Blob
  legs are both proven. Two gaps remain. Provenance is unproven: the canary holds the
  signing key, so only the admin **Erase personal data** path shows Shopify originated
  the call, on a ~10-day delay. And `customers/data_request` and `shop/redact` have their
  own paths — the first durable-row-plus-export, not a delete — and neither has been
  exercised. Operator fulfillment and completion steps in
  [production/data-deletion.md](production/data-deletion.md).

- [ ] **Rotate `SHOPIFY_APP_SECRET` before onboarding a real merchant.** It was read into
  a terminal transcript on 2026-08-30. It verifies every Shopify webhook and signs the
  OAuth exchange, so whoever holds it can forge deliveries into the gateway — compliance
  topics that delete data among them. Rotation is Partner Dashboard, then **both** Railway
  and Vercel, with webhook verification failing in the gap, which is why it is not worth
  doing while the only store is the author's dev store. It becomes worth doing the moment
  a merchant's data is behind it, and it is no more expensive then.

---

## Build

Open application-code work. An entry names the surface it lands on and what closing
it costs — not a design.

- [ ] **Certify deterministic completion copy in production.** The execution boundary
  replaces supported refund, cancellation, fulfillment, return, exchange, credit, address,
  discount, and order claim sentences with copy derived from successful completion facts,
  while preserving surrounding brand voice and blocking unsupported claims. Run the required
  paid release eval for the exact candidate, deploy it, and observe one grounded action/reply
  pair plus one truthful historical refund or fulfillment reply in production. Two known
  gaps to close with it: the approval card shows the model's sentence while the customer
  receives the rendered one, and the renderer still *selects* what to rewrite by matching
  English verbs in `plan-grounding.ts`. The structural fix — an optional structured
  `completion` field on `send_reply` that the executor renders, so the model never authors
  the graded sentence — is recorded under A4 in the
  [improvement plan](project-improvement-plan.md). It is a planner-surface change and owes
  the eval gate.

- [ ] **Make LLM allowances concurrency-safe.** The daily read now fails closed and the
  configure page shows spend against the merchant safety cap, but parallel calls can still
  spend the same remainder and a failed usage write is not recoverable. Reserve a conservative
  amount durably before each provider call, reconcile actual usage afterward, preserve unknown
  reservations across process loss, and keep the merchant cap separate from the service allowance
  and platform emergency stop. Extend the existing spend record rather than creating an unrelated
  ledger; test duplicate reports, database outages, rollover, and concurrent dashboard/gateway calls.

- [ ] **Define the paid-pilot cost envelope and entitlement contract.** Use `LlmDailySpend` and
  `AgentTurnUsage` to produce low/expected/high merchant scenarios, then add messaging, storage,
  hosting, payment fees, and founder support time. Decide one billable conversation definition,
  included usage, reset behavior, and explicit trial/paid/unknown-price/expired behavior before
  changing pricing copy or provisioning Stripe IDs. Keep founder/test workspaces out of demand and
  renewal evidence.

- [ ] **Prove the SocialAPI approval leg — it has not run yet.** On 2026-09-10 a real
  Instagram DM naming order 1031 planned `create_refund` + `add_internal_note` + `send_reply`,
  routed to `needs_review` because the plan carried an `action`-category call, and reached the
  bound iMessage line 34 seconds after the DM. **That is where the proven part stops.** The
  merchant replied `Yes`, the parked plan was already gone from the queue, and the model
  attempted the refund on its own authority instead — `executionId` null on all seven action
  rows, no `PlanExecution` claim. A merchant approval has still never executed a reviewed plan
  in production. Land [PR #89](https://github.com/walledog11/shopkeeper/pull/89), then re-run
  one DM end to end: approval executing the reviewed plan, the refund committing, and the reply
  arriving in the participant's Instagram app. The first live run's plan was blocked by
  `ungrounded_customer_reply` until `0e5bcec0`
  ([PR #88](https://github.com/walledog11/shopkeeper/pull/88)) landed; the before/after on the
  same message text is the clearest evidence that fix works.

- [ ] **Ship the refund currency fix.** Confirmed against the live store: order #1031 is a
  USD shop with a Toronto customer charged **59.90 CAD**, `calculateRefund` correctly returns
  CAD, and the guard compared it against the *shop* currency and called it unsafe — so no US
  merchant with an international customer could be refunded by the agent. The order read had
  the same confusion, exposing only shop-currency fields, so the agent saw `$43.48 USD` for an
  order the customer paid `59.90 CAD` for: the wrong figure to refund and the wrong one to
  quote. Both fixed in [PR #89](https://github.com/walledog11/shopkeeper/pull/89); this closes
  when that lands and a refund commits in production.

- [ ] **Find out why the merchant's parked plan was discarded.** Not the persist-before-send
  race — `notifyOperator` commits the plan before the card goes out, and the card did go out at
  09:40:44. By the merchant's reply at 09:44:40 the queue was empty, so `approve_pending_plan`
  was right both times and the model improvising the refund afterwards is what PR #89 stops.
  The leading reading is the thread re-planning at 09:40:50, six seconds after the card, which
  orphans the parked entry and makes `loadLivePendingPlans` prune it as `plan_replaced`. PR #89
  makes that drop name which of seven conditions fired, so the next occurrence is diagnosable;
  this closes when a reproduction or a production log line says which one it was. If it is the
  re-plan, the fix is upstream — a re-plan should re-park and re-notify, not silently invalidate
  a card the merchant is looking at.

- [ ] **Re-check the audit trail once PR #89 is live.** The null `approverId` on the
  2026-09-10 rows was not a plumbing gap — every approval entry point threads the approver
  correctly. `resolveRunPolicy` defaulted an unstated mode to `human_approved`, so the
  strongest label in the enum arrived with no approver to name. PR #89 makes the default
  `auto_executed` and has the free-form operator turn state its mode and name the merchant.
  One residual stays open by choice: a genuine plan approval whose Clerk lookup fails still
  records `human_approved` with a null approver, because downgrading it would assert nobody
  approved it. Also fix the Review page's "You approved" panel, which queries
  `modes: ["human_approved"]` with no operator exclusion and so counts direct operator
  instructions as plans the merchant approved before they ran.

- [ ] **Finish the SocialAPI Instagram transport past milestone zero.** This is
  the critical path and the only A3 item that matters until it runs end to end: `ig_dm` is
  the product channel and SocialAPI is its selected transport through the first 100 users.
  Milestone-zero ingress is built and now deployed — a signed `dm.received` is resolved to
  its workspace through the indexed `Integration.providerAccountId` and durably queued as a
  `provider: 'socialapi'` Instagram job keyed on the native `platform_id`, the worker skips the
  Meta-token paths a SocialAPI row cannot use, and an approved reply leaves through SocialAPI's
  conversation endpoint. **Shipped 2026-09-10**:
  `20260909120000_add_integration_provider_account_id` applied to production ahead of its code,
  `b683650a` live on Vercel and Railway with CI green and `/health/deep` ok, the spike's pinned
  `ig_dm` row backfilled into `provider_account_id`, and `SOCIALAPI_API_KEY` already set on the
  dashboard — so the environment pin is retired and `SOCIALAPI_PINNED_*` is deleted from both
  hosts. Outbound picks the transport from the row's `metadata.transport`, not a flag, so the
  approval leg above is unblocked with no further configuration. Only after it: `dm.sent`
  correlation, the ephemeral-vs-gallery image classification, recovery/dedupe,
  reconnect, disconnect, deletion, and capacity controls
  ([transport plan](socialapi-transport-plan.md) S1–S6). **Merchant OAuth landed 2026-09-09** —
  one connect entry point dispatching on `resolveInstagramConnectTransport`, admission by the
  `SOCIALAPI_BRAND_ASSIGNMENTS` map, brand-scoped account verification, and ownership decided on
  `providerAccountId`. It is closed in production and deliberately so: `SOCIALAPI_ENABLED` and
  `SOCIALAPI_BRAND_ASSIGNMENTS` are both unset, `getSocialApiConnectConfig` returns null, and no
  workspace is offered a SocialAPI connect. Provisioning a brand and setting those two is what
  admits the first merchant; it has never been run against a live merchant OAuth, and the vendor
  exposes no native Instagram account id, so `externalAccountId` holds the provider id and
  Professional-account eligibility is unverified at connect. Close the vendor/data-processing
  gates in [S0 diligence](production/socialapi-s0-diligence-2026-09-07.md) before any
  external merchant data. Certify per [improvement plan](project-improvement-plan.md) A3.

- [ ] **Give the agent the customer's prior conversations.** `buildContext` loads this
  thread's messages, Shopify orders, KB articles and merchant preferences. It counts the
  customer's other open threads and never reads one. The dashboard already shows what the
  agent cannot see — `ContextPanel` renders "Past conversations" from
  `/api/threads/customer/[customerId]` — so a customer refunded last week reads as a
  repeat to the merchant and as brand new to the agent, which is the employee principle
  failing on the one signal an employee would certainly have. Bounded version only: the
  newest few closed threads' `aiSummary`, newest-first, budgeted the way KB articles
  already are, with its own catch so a failure cannot take the fan-out down. This is
  deliberately **not** the prior-episode retrieval parked under Episode memory below —
  that is a ranking problem, and taking the newest N in date order ranks nothing. It
  changes the planner's prompt input, so it owes the eval gate.

---

## Parked / decide

Built or decided-deferred. No active build work unless you explicitly choose to resume.
Gated-off integrations cost nothing to keep dark.

- [ ] **TikTok Shop disposition.** Wired end to end behind `TIKTOK_SHOP_ENABLED=false`
  with tests; never validated in prod. The decision is configure-and-enable or cut — not
  more adapter code. If pursued: TikTok Shop app approval, seller authorization,
  multi-merchant SaaS support, prod config. Confirm Customer Service API availability for
  US merchants and third-party SaaS in Partner Center, and keep TikTok Shop buyer
  messages separate from generic TikTok DMs — no generic-DM adapter exists.
- [ ] **Storefront chat M2 — Customer Account OAuth.** Largely superseded by emailed-code
  verification, which bought the same disclosure far cheaper and forced no
  re-authorization. Keep only for genuine account binding — order history across orders,
  saved addresses — and only if a merchant asks. Two blockers first: the two
  `customer_read_*` scopes force re-authorization on every already-connected merchant,
  and the Customer Account API requires the shop to be on new customer accounts, so
  merchants on classic accounts would be permanently guest-only. Sketch in
  [storefront-chat-verification-2026-08.md](production/storefront-chat-verification-2026-08.md).
- [ ] **Episode memory: identity, obligations, and prior-episode retrieval.** Cut from
  the 2026-08-12 episode plan with reasons, and the reasons still hold — each is here
  so it is not re-proposed from scratch. `Person` / `ChannelIdentity` /
  `IdentityLinkAudit` / `PersonMemoryFact` were justified entirely by "skipping
  destroys data permanently", which requires traffic to be losing, and there is none;
  every `Person` would also hold exactly one `ChannelIdentity` until Shopify Customer
  Account OAuth lands. `CustomerObligation` — rollover drops the merchant's queued card
  silently today, and the cheap fix if it bites is telling them the card expired, not a
  table. `ThreadMemoryIndex` and prior-episode retrieval are a ranking problem with no
  traffic to rank against, so designing it blind ships matching rules that are wrong in
  a way no test catches. Also deferred: the widget's collapsed "Previous conversation"
  history (reversible — rolled-over threads are closed, not deleted, and archive at 90
  days), a `CONVERSATION_EPISODE_MODE` shadow mode (shadow-running against zero traffic
  is ceremony), and an email provider-conversation key (`providerConversationScoped:
  true` is already set, so adding the key is the only change needed when it matters).
- [ ] **Attribution for wholly anonymous shoppers.** The real coverage gap in
  conversation-to-sale: a shopper who asks a pre-purchase question and buys without ever
  verifying an email has no server-side identity bridge. Closing it needs cart-attribute
  plumbing in the theme extension — a merchant-facing extension change and a new app
  version. Decide when the attributed share looks low enough to matter.
- [ ] **A two-message email burst still costs two classifier calls** — one inline on the
  first email, one on the settled burst after the follow-up. The characterization suite
  pins this as the remaining lifecycle asymmetry, so it is correct, just not free.
  Closing it means classifying once per request episode; decide when classifier spend
  is worth a restructure of `apps/gateway/src/message-handlers/classification.ts`.
- [ ] **Consolidate the order-read tools, or decide not to.** Deferred with Phase 6 and
  lost when the plan was retired; the condition it waited on has since been met, so it is
  a live decision again. `get_shopify_orders` and `get_order_by_name` genuinely are one
  endpoint — both call `orders.json` through the same `orderFields()` projection
  (`packages/agent/src/shopify/orders.ts:22`, `:47`), differing only in query parameter.
  `get_order_fulfillment_status` is that endpoint under a narrower field allowlist plus an
  email-match guard, so it stays separate for guests. `get_order_tracking` is **not** a
  projection on the order record — it is a different endpoint
  (`orders/{id}/fulfillments.json`) — so folding it in behind an `include` flag would turn
  a call the model visibly did not make into a field it silently omitted. Neither can be
  retired outright: `get_order_by_name` and `get_order_tracking` are the entire
  verified-storefront capability (`guest-policy.ts:60`), so consolidation needs a
  storefront-only exclusion beside `isGuestOnlyTool` (`planner.ts:82`) and the whole
  guest/verified matrix re-proved. If the schema cost justifies that, build
  `get_order { by: 'name' | 'id' | 'customer', value, limit?, fields? }` over `orders.json`
  only, leave `get_order_tracking` as its own tool, and expose `by: 'customer'` to neither
  storefront state. Shared-registry change: it owes the eval gate.
- [ ] **`quick-reply-thanks-ack` passes 1/3.** The only fixture below full, and advisory,
  so it does not gate. Runs classify `needs_review` after repeated `get_order_by_name`
  errors and escalate.
- [ ] **Shopify App Store distribution, or not.** The listing is a primary acquisition
  channel for Shopify merchants and the site appears to have none. The first step is a
  Partner Dashboard check — confirm whether a listing exists at all — because the answer
  decides whether this is a footer badge or a months-long app-review submission, and
  those belong in different quarters. Not a landing-page task; the marketing site can
  only link to whatever this produces.
- [ ] **A capability the agent has already denied stays denied in that thread.** Told it
  could not run a storewide sale, it repeated the refusal after `applies_to` shipped and
  deployed, citing its own earlier message rather than the tool schema in front of it.
  Nothing is stale but the conversation — `buildOperatorShopTools` runs every turn — and
  operator threads are one per binding and effectively permanent, so it does not clear
  itself; a fresh request worked. Every capability added from here inherits this, and it
  fails toward telling the merchant no. The decision is what to do about it: a prompt
  bullet is the special case, not the fix.

**Resume when triggered** (not open checkboxes):

| Trigger | Work | Where |
| --- | --- | --- |
| Privacy policy ships | PostHog Phase 5: staging payload review, then `PRODUCT_ANALYTICS_ENABLED=true` | [posthog-reports.md](production/posthog-reports.md) |
| Redis TLS migration | Gateway `REDIS_URL` → `rediss://` on both services | [compatibility-retirement-backlog.md](compatibility-retirement-backlog.md) |
| Paid beta | Better Stack Level 1 log drains + escalation (free tier done 2026-07-31) | [runbook.md](production/runbook.md), [alerting-evidence.md](production/alerting-evidence.md) |
| Merchants report a duplicate "over your plan" notice | Move the once-per-period marker off `Organization.settings`. `buildSettingsUpdate` rebuilds that blob from `normalizeStoredOrgSettings`, a whitelist, so saving any org setting drops the marker. Every available fix costs more than the bug today. | — |
| First customer launch | The canaries the remediation milestones deferred while there was no real traffic to run them against: outcome rows on a live request path (M3), the auto-plan failure-replan path and its prompt tuning (M4), observed preference proposals under `MERCHANT_PREFERENCE_OBSERVED_PROPOSALS=true` and operator-channel confirm/dismiss (M5), and the classifier version-lifecycle ceremony — production inventory by version, retirement procedure, version-upgrade test (M2). | [AGENT_AUDIT.md](../AGENT_AUDIT.md) §2 |

**Decisions on record** (not tasks): operate "Shopkeeper" unregistered (2026-08-02),
revisiting the trademark at ~50 paying merchants or before marketing spend. Sync
outbound email remains the rollback rail until async recovery exercises complete —
policy in
[compatibility-retirement-backlog.md](compatibility-retirement-backlog.md), not a
checkbox here. Email stale-claim and manual-retry drills:
[alerting-evidence.md](production/alerting-evidence.md),
[runbook.md](production/runbook.md).

---

## Standing rules

Not tasks. They are here because breaking one is what refills this file.

**Pending integrations are work to finish, not removal candidates.** Shopkeeper is still
in active development — channels are being added, not finalized. Frame Instagram DM and
TikTok tasks as build/finish, and treat onboarding sequencing as ordering channels behind
the v1 wedge, never as dropping or de-advertising one. Not-a-removal-candidate is not the
same as next-in-line: **WhatsApp is deprioritized** (2026-08-07). It is a merchant-control
channel, so it adds a third route alongside Telegram and iMessage rather than any new
customer reach, and US penetration is low in the target market. Do not propose it as the
next channel to build. [product-truth.md](product-truth.md) §2.

**The eval release gate is manual and CI can run it.** The committed baseline is the
2026-08-17 capture (250/252 across 84 fixtures at 3 repeats) and is **stale**: Milestones
2 through 7 all landed after it. `ANTHROPIC_API_KEY` is a repo secret. Pull requests run only the free deterministic preflight. Before releasing an
agent-path change that can move an assertion, explicitly dispatch `evals.yml` in
`release` mode for the exact release SHA with dollar and model-call ceilings. The trigger
question is **"can this change move an assertion?"** — not "did it touch a gated path."
The `paths` filter is coarse on purpose; it is a net, not a verdict, so read what the
fixtures assert before booking a paid run. A tool *description* edit sits in the prompt
the model reads and requires certification even when no assertion names it. The complete
84-fixture, three-repeat run is a separate `drift` measurement, not the release gate.
Full rules are in [agent-eval-gates.md](agent-eval-gates.md).

**There is no nightly.** The full 84-fixture suite and the judge evals are a
`workflow_dispatch` you fire deliberately — before a rollout gate, before closing an eval
item, after a model bump. Paid eval files skip unless `EVAL_RUN=1` or
`REQUIRE_MODEL_EVALS=1`, so a bare `test:integration` or `verify:pr` no longer bills.
Runs stay expensive: follow the
[paid model-eval workflow](production/critical-path-test-checklist.md#paid-model-backed-agent-evals)
— single-fixture one-repeat probes for diagnosis, explicit approval before an unfiltered
live-key run, no automatic tune-then-rerun loop.

**Evals cannot see the Shopify layer.** Every Shopify tool result in the suite is
simulated, so nothing in `packages/agent/src/shopify/*` has any eval coverage: a tool can
be structurally broken against the live API — as product search was, returning zero rows
for every natural query — while the gate stays green. Evals grade what the model does
with a tool result, not whether the tool can produce one. Live probes are the only cover
that layer has.

---

## Reference docs

Every file in `docs/`. If it is not here, it does not exist.

**Product and process**

- [product-truth.md](product-truth.md) — the four-layer channel model. Read before
  claiming a channel does something.
- [agent-eval-gates.md](agent-eval-gates.md) — the four eval run modes, what each
  gates, and the budget ceilings a paid run must carry.
- [compatibility-retirement-backlog.md](compatibility-retirement-backlog.md) —
  read before renaming any BullMQ queue or job string.

**Production**

- [production/runbook.md](production/runbook.md) — the deploy document: prerequisites,
  env matrix, deploy sequence, migrations, smoke tests, monitors, channel rollout,
  guardrail triage.
- [production/checklist.md](production/checklist.md) — the short release gate that
  runbook procedure feeds.
- [production/critical-path-test-checklist.md](production/critical-path-test-checklist.md) —
  the coverage contract a new high-risk route owes.
- [production/alerting-evidence.md](production/alerting-evidence.md) — controlled
  alert triggers and verification cheatsheet.
- [production/posthog-reports.md](production/posthog-reports.md) — PostHog report
  definitions and provisioning.
- [production/data-deletion.md](production/data-deletion.md) — merchant and customer
  deletion/export request handling.
- [production/google-gmail-verification-packet.md](production/google-gmail-verification-packet.md) —
  the restricted-scope submission track.
- [production/shopify-app-config-reference.md](production/shopify-app-config-reference.md) —
  rollback targets, the webhook audit utility, and two settings that look like
  cleanups and are not.
- [production/storefront-chat-verification-2026-08.md](production/storefront-chat-verification-2026-08.md) —
  durable findings, channel invariants, and the M2 sketch.
- [phase-6-external-services.md](phase-6-external-services.md) — console-only
  brand/domain checklist; delete when closing verification passes.

Also live, outside `docs/`: [AGENT_AUDIT.md](../AGENT_AUDIT.md) (the agent pipeline
audit and its completion bar), [TESTING.md](../TESTING.md) (suite ownership and local
commands), and `.claude/CLAUDE.md` (architecture law and agent-change invariants).

## Deleted records

Closed docs are deleted, not archived — git history is the record. Named here only
so a search for one lands somewhere.

- 2026-08-27, once every live item was carried into this file: the 2026-08-04
  pre-release validation run
  (`git show cb61ac44:docs/production/pre-release-validation-2026-08-04.md`) and the
  2026-07-29 Gmail native-inbound rollout and soak
  (`git show cb61ac44:docs/production/gmail-rollout-evidence-2026-07-29.md`).
- 2026-09-01, the docs consolidation. All at `c06be3b4:`
  `docs/conversation-context-and-cross-channel-memory-plan.md` (migration rule to the
  runbook, deferred decisions to **Parked**),
  `docs/production/operational-guardrails.md` (triage steps to the runbook),
  `docs/production/deployment.md` (merged into the runbook),
  `docs/production/shopify-webhook-migration.md` (utility into the config reference),
  plus the chronology cut from the storefront-chat record and the closed M0a/M0b
  archaeology cut from the Shopify config reference.
