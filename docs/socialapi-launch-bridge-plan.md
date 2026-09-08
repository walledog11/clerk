# SocialAPI launch bridge plan

Created: 2026-09-07. Status: in progress; S0 public-document diligence completed on 2026-09-07. Owner: engineering, with founder ownership of vendor diligence and live rollout.

## Objective

Use SocialAPI as a temporary, capacity-limited Instagram transport for the first external launch merchants while Shopkeeper's direct Meta app is waiting for Advanced Access. Preserve the direct Meta implementation, keep Meta approval work moving, and move off the bridge before traffic or merchant count makes the shared-vendor dependency material.

This plan follows the findings in the [SocialAPI pivot assessment](research/socialapi-pivot-assessment-2026-09-07.md). It adds a provider underneath the existing `ig_dm` product channel; it does not introduce a separate user-visible channel.

## Evidence updates from plan review

The following current documentation supersedes corresponding uncertainties in the assessment. These are documented capabilities, not authenticated or live verification:

- SocialAPI documents API keys restricted by brand and permission. Brand creation/key management require administrative access; webhook administration and event-log access cannot use brand-restricted keys. Use separate provisioning and runtime credentials. [Scoped API keys](https://docs.social-api.ai/guides/scoped-keys)
- The inbox guide now explicitly says DMs are stored for threading and pagination. Do not repeat the assessment's claim that this guide promises five-minute-only DM caching. Exact retention, deletion, backups, media, and webhook logs still require written clarification. [Unified inbox](https://docs.social-api.ai/guides/inbox)
- Webhooks support timestamp-bound V2 signatures and stable delivery IDs. Require V2 verification with a freshness window. [Webhooks](https://docs.social-api.ai/guides/webhooks)
- SocialAPI documents an explicit platform inbox-sync operation. Evaluate it alongside stored-message polling; the two recover different failure modes. [Inbox sync](https://docs.social-api.ai/api-reference/inbox/start-an-inbox-sync)

The dated [S0 diligence record](production/socialapi-s0-diligence-2026-09-07.md) captures the current public evidence, the unresolved privacy/terms contradiction, and the questions ready for the vendor. Public-document review does not close S0: a reviewed DPA, authenticated account checks, written vendor answers, and controlled payload evidence remain required before external merchant data is allowed.

## Decisions and invariants

1. **Direct Meta remains the primary strategic transport.** Existing direct integrations stay direct. No automatic migration is performed.
2. **SocialAPI is selected server-side per organization.** Launch merchants do not choose a provider. An audited, fixed set of organization-to-brand assignments controls admission during the bridge period; merchants still complete OAuth themselves.
3. **One integration uses one transport at a time.** An Instagram account is never intentionally active through both transports except for a bounded, observed migration handoff.
4. **There is no automatic send failover.** A SocialAPI-connected merchant has not authorized Shopkeeper's Meta app. A failed SocialAPI send must not be retried through direct Meta.
5. **The existing Shopkeeper workflow remains authoritative.** Both transports normalize into the current durable `InstagramInboundJobData`, ticket, planning, approval, attachment, and outbound-recording paths.
6. **Verified Instagram identity remains canonical.** `Integration.externalAccountId` and `Customer.platformId` retain their direct-Meta identity semantics. Prove cross-app account and sender equivalence with real fixtures, or implement and test an explicit identity mapping before external onboarding. A field labeled “native ID” is insufficient evidence. SocialAPI brand, account, and conversation IDs remain routing metadata.
7. **SocialAPI credentials are infrastructure secrets.** Never store the workspace API key in `Integration`, logs, jobs, or client-visible responses.
8. **The bridge has an enforced ceiling and exit date.** It cannot expand merely because the first canaries work.

## Initial launch envelope

Use the paid Side Hustle tier because production requires webhooks and support. Apply these deliberately conservative controls:

- Maximum: **8 active production SocialAPI merchant organizations**. Enforce this during connect, not by convention. Reserve capacity for a production canary and operational headroom within the published 10-brand tier.
- Cohorts: 2 canaries, then 5 merchants, then at most 8.
- Review trigger: the earliest of **30 calendar days, 5 active merchants, 500 inbound events/day, or 100 outbound replies/day** across the bridge.
- Before the first external canary, record its activation date and a calendar exit decision deadline **30 days later** in the runbook. By that deadline, complete migration or record an explicit exception with owner, reason, service-continuity plan, and a new dated deadline. Without that decision, freeze onboarding; do not abruptly drop service for connected merchants.
- Freeze new SocialAPI connections immediately for any unresolved cross-tenant routing defect, missing supported DM, attachment-loss incident, two consecutive OAuth failures affecting different merchants, or the provider failure alert defined in S6.
- Do not upgrade to the 50-brand plan as an operational reflex. Reaching the eight-merchant ceiling requires a written decision to complete direct Meta migration, negotiate stronger SocialAPI terms/dedicated infrastructure, or delay expansion.

The event thresholds are review triggers, not message-dropping limits. Once an account is connected, Shopkeeper continues accepting its valid events; the connection gate prevents adding more exposure.

Use separate SocialAPI workspaces/API keys for local or staging tests and production if the vendor supports them. If it does not, keep non-production brands outside the eight production slots and include their consumption in the capacity audit.

For this capped bridge, provision brands and scoped runtime keys through an audited operator workflow before merchant OAuth. Maintain at most eight assigned production merchant slots, including pending connections. Failed or abandoned OAuth retains its slot until explicitly released; reconnect reuses it. Validate assignment uniqueness and total vendor-brand consumption. Automated brand creation and dynamic slot allocation are deferred.

## Target architecture

```text
                                     ┌─ Meta direct OAuth/webhook/API ─────┐
Merchant Instagram ─ provider pin ───┤                                    ├─ normalized IG job
                                     └─ SocialAPI OAuth/webhook/API ───────┘         │
                                                                                     ▼
                                                        existing persistence → agent → approval
                                                                                     │
                                                                                     ▼
                                                        provider-pinned outbound transport
```

The provider pin belongs to the `Integration`, and the `Thread.replyIntegrationId` continues to select the exact connected account. `Thread.externalSpaceId` stores the SocialAPI conversation ID needed for replies; it does not make Instagram conversation IDs episode boundaries.

Recommended integration metadata:

```json
{
  "instagram": {
    "authModel": "socialapi",
    "transport": "socialapi",
    "socialApiBrandId": "br_...",
    "connectionGeneration": 1,
    "username": "merchant",
    "connectedAt": "2026-09-07T00:00:00.000Z",
    "healthStatus": "healthy"
  }
}
```

Direct records retain `authModel: "instagram_login"` and use `transport: "meta_direct"` when read through the new provider abstraction. Existing records without `transport` must be interpreted as `meta_direct` so the schema change is backward compatible.

Add an optional, indexed `Integration.providerAccountId` column for SocialAPI's `acc_...` identifier. Do not rely on an unindexed JSON query in the webhook hot path. Keep `externalAccountId` as the native Instagram account ID so the existing global Instagram ownership constraint continues to prevent an account from being attached to two Shopkeeper organizations. Production is blocked if SocialAPI cannot expose the native account ID reliably.

The columns are authoritative: do not duplicate either account ID in metadata. One shared typed reader combines the columns, validated metadata, and a server-side credential reference into the active integration contract. Store scoped keys in the server secret store, not metadata; keep the administrative key out of normal messaging processes. Increment `connectionGeneration` on reconnect or transport change so queued work cannot silently bind to a replacement connection.

Extend the normalized inbound contract with optional, backward-compatible fields:

```ts
provider?: 'meta_direct' | 'socialapi'
providerAccountId?: string | null
providerConversationId?: string | null
connectionGeneration?: number
```

These fields are optional only for compatibility with existing direct jobs. New SocialAPI jobs require all routing fields, with non-null account and conversation IDs. Missing provider means legacy direct Meta; it must never be inferred as SocialAPI from the integration's current state.

For SocialAPI events, `externalMessageId` must use a verified equivalent native Meta message ID when available. Provider-only IDs may be namespaced as `socialapi:<id>` in the controlled spike. External onboarding requires proven webhook/poll deduplication and a tested cross-provider deduplication or explicit mapping/handoff strategy. Do not defer this exit prerequisite until migration day.

## Work plan

Effort estimates are active engineering days and exclude vendor response time and the live observation window.

| ID | Priority | Work | Owner | Effort | Depends on |
| --- | --- | --- | --- | --- | --- |
| S0 | P0 | Close vendor and data-processing gates | Founder | 0.5–1 day plus vendor wait | Parallel with SP |
| SP | P0 | Controlled end-to-end feasibility spike | Engineering | 2–4 days, time-boxed | Controlled account and test credentials |
| S1 | P0 | Define provider contracts, identity, and lifecycle rules | Engineering | Re-estimate after SP | SP evidence |
| S2–S5 core | P0 | Complete one production-shaped OAuth → inbound → approval → reply → disconnect path | Engineering | Re-estimate after SP | S1 |
| S4–S6 hardening | P0 | Recovery, reconnect, deletion, race handling, and operational controls | Engineering / release | Re-estimate after SP | Complete core path |
| S7 | P0 | Certify with two supervised external canaries | Engineering / founder | 7–14 days observation after acceptance | S0; S1–S6 complete |
| S8 | P0 | Run capped launch and direct-Meta exit | Founder / release | Bridge period | S7; Meta approval in parallel |

S1–S6 below are implementation checklists, not a strictly sequential dependency chain. First build the smallest complete path across S2–S5, including text, an image, a real approved reply, and disconnect. Then complete recovery and lifecycle hardening. Tests, provider-tagged logs, environment validation, and basic failure visibility accompany every increment; S7 assembles live evidence rather than starting integration testing.

The original **9–15 engineering days** is a provisional budget, not a commitment. SP consumes that budget; it is not a separate unbudgeted addition. Re-estimate remaining work after SP and compare expected merchant availability with direct Meta approval progress. Stop bridge investment if vendor gaps or the remaining timeline erase its launch advantage.

### SP. Controlled feasibility spike

- [ ] Use controlled accounts and test conversations while S0 diligence proceeds; external merchant data remains gated on S0.
- [ ] Demonstrate connect → inbound text and image → existing ticket/plan → approve → actual reply → disconnect using a thin adapter through the existing workflow.
- [ ] Capture sanitized fixtures for account, sender, message, conversation, timestamp, media, and send-result fields. Compare the same controlled identities and messages through direct Meta where available; document any visibility or subscription limits.
- [ ] Prove webhook and stored-message IDs converge; test missed delivery recovery and investigate platform-side inbox sync separately.
- [ ] Exercise reconnect and a controlled direct-Meta handoff. Verify identity continuity, reply routing, and deduplication, or produce and test the mapping needed to preserve them.
- [ ] Inspect all required attachment/event shapes and establish URL lifetime and deletion behavior. A successful text/image slice proves feasibility, not full production parity.
- [ ] Record a go/no-go decision, remaining vendor gaps, reusable fixtures/code, and revised estimate. Unresolved identity/exit semantics block external onboarding.

Done when the core assumptions have live evidence and the remaining production work is concrete. Do not spend the spike implementing automatic brand provisioning, a generalized provider framework, or complete operational dashboards.

### S0. Vendor and data-processing gate

- [ ] Open a paid production account and obtain a separate non-production account/key.
- [ ] Receive and review the DPA. Reconcile the terms/privacy policy with documented persistent DM storage; record exact content, media, webhook-log, and backup retention and deletion timing.
- [ ] Verify documented brand/scoped-key enforcement against the required API calls; obtain written answers for fair-use thresholds, support response time, webhook/message-processing SLA, incident escalation, and termination/export.
- [ ] Obtain real Instagram payload examples for text, image, video, audio, story/post share, deleted/unsent, referral, and unsupported messages.
- [ ] Confirm the API returns native Instagram account, sender, message, and conversation identifiers, plus provider timestamps and media URL lifetime.
- [ ] Confirm how missed webhooks are listed/backfilled and whether account deletion revokes Meta access and deletes provider-held content.
- [ ] Capture the actual merchant OAuth consent screen and approve the “Powered by SocialAPI” disclosure.

Block external merchant onboarding if identity, attachment coverage, deletion, or retention cannot be resolved. Controlled testing may proceed alongside diligence. A text-only demo does not meet Shopkeeper's existing Instagram contract.

### S1. Provider boundary and additive schema

Entry points: `packages/integrations/src/instagram`, `packages/db/prisma/schema.prisma`, `apps/gateway/src/lib/instagram-integration.ts`, `apps/gateway/src/types.ts`, and `apps/dashboard/src/lib/messaging/instagram-dispatch.ts`.

- [ ] Define a discriminated `InstagramTransport`/active-integration contract for `meta_direct` and `socialapi`; direct requires its stored Meta token, while SocialAPI requires `providerAccountId` and a server-resolved scoped credential. Keep the boundary limited to Instagram's actual needs.
- [ ] Treat missing `instagram.transport` on existing rows as `meta_direct`.
- [ ] Add nullable `providerAccountId`, an appropriate provider/account uniqueness index, and a hand-written additive migration that preserves the existing raw partial indexes.
- [ ] Keep `externalAccountId` native and preserve one Instagram account per Shopkeeper organization/account ownership rules.
- [ ] Extend `InstagramInboundJobData` with provider, provider account, conversation, and connection-generation fields without breaking queued direct-Meta jobs.
- [ ] Add strict metadata readers/writers; do not scatter JSON casts across routes.
- [ ] Define reconnect and migration transitions before implementing them: drain or durably quarantine old-generation work, pause new sends during cutover, and never relabel queued jobs as belonging to a new connection. Resolve quarantined work through verified recovery before declaring the handoff complete.
- [ ] Specify atomic conversation-route replacement on validated reconnect. Current inbound persistence only fills an empty `externalSpaceId`; it must not leave a changed conversation ID stale or let a late old-generation event overwrite the new route.
- [ ] Define a durable cleanup snapshot containing the old transport, provider account/brand identifiers, generation, and credential reference before an in-place migration overwrites metadata. Cleanup must target that snapshot without deleting the retained integration or its threads.
- [ ] Define OAuth attempt ownership so callback retries and losing concurrent attempts cannot compensate by deleting the winning or pre-existing remote account.
- [ ] Decide error categories once: authentication/reconnect, permission, response-window, rate-limit, transient-provider, validation, isolation, and unknown.

Done when existing direct Meta tests pass unchanged or with compatibility-only adjustments and a SocialAPI integration can be represented without a fake access token.

### S2. SocialAPI client and OAuth lifecycle

Entry points: a new `packages/integrations/src/socialapi` module, dashboard environment helpers, Instagram auth/callback routes, integration connection persistence, and integration UI.

- [ ] Implement the core REST surface first: begin Instagram connect, exchange OAuth code, fetch account, send conversation message, and disconnect account. Add health, list/sync recovery, and deletion operations as their checklists require. Brand/key provisioning remains an operator workflow.
- [ ] Apply bounded timeouts, response-shape validation, safe error mapping, and no blind retry of non-idempotent sends.
- [ ] Validate `SOCIALAPI_ENABLED`, `SOCIALAPI_MAX_ACTIVE_ORGS` (at most eight), fixed organization/brand assignments, and server credential references. Keep provisioning credentials separate from scoped runtime keys. Add `SOCIALAPI_BASE_URL` only as a test/local override; production must pin the official HTTPS origin.
- [ ] Reuse Shopkeeper's authenticated OAuth session and persist/verify SocialAPI state against the initiating organization. Do not trust callback organization or brand identifiers from the browser.
- [ ] Resolve exactly one pre-provisioned brand and assigned slot for the authenticated organization; callbacks cannot create brands or change assignments.
- [ ] After exchange, fetch and validate platform=`instagram`, native account ID, Professional-account eligibility, username, and ownership before persisting.
- [ ] Persist the connection only after the provider account is usable. Persist attempt ownership and make callback replay harmless. On local failure, durably schedule compensation only for a remote account proven to have been created by this attempt and not adopted by a successful connection; ambiguous ownership requires reconciliation.
- [ ] Make the existing Connect Instagram action choose SocialAPI only for organizations in the fixed assignment set; an existing direct integration stays direct unless explicitly migrating. Show “Powered by SocialAPI” before authorization and link Shopkeeper's updated privacy disclosure.
- [ ] Validate the fixed assignment set and slot before starting OAuth and transactionally recheck assignment/current integration before persistence. Pending assignments count toward eight; reconnect uses the same slot. If dynamic allocation is introduced later, require durable expiring reservations: a count before the browser redirect does not reserve capacity.

Done when one assigned organization connects through SocialAPI, an unassigned organization retains the current direct behavior/gate, callback replay is harmless, and cross-organization ownership attempts fail.

### S3. Signed inbound webhook

Entry points: new `apps/gateway/src/routes/webhooks-socialapi.ts`, `apps/gateway/src/routes/webhooks.ts`, body-size tests, signature alerting, and integration resolution.

- [ ] Add `POST /webhooks/socialapi` using `SOCIALAPI_WEBHOOK_SECRET` and V2 HMAC-SHA256 over `<timestamp>.<raw body>`. Validate header format/length before constant-time comparison and reject timestamps outside a five-minute past/future tolerance; do not silently downgrade normal deliveries to V1.
- [ ] Handle the vendor's initial `webhook.test` registration ping as the sole unsigned exception because it arrives before the endpoint secret is revealed. Require the exact event header and strict, small ping schema; rate-limit it, perform no persistence/queue/configuration side effect, and return only the acknowledgement. Reject unsigned test-shaped requests from all other paths. Once the endpoint exists, require V2 for test deliveries as well as normal events.
- [ ] Acknowledge supported inbound events only after durable queue admission, within the vendor's ten-second deadline. Return a retryable error for transient database/queue failures. Explicitly acknowledge authenticated test deliveries and intentionally ignored events without manufacturing message jobs.
- [ ] Accept `dm.received`; ignore or use `dm.sent` only to reconcile an outbound result; explicitly classify referral and unknown events.
- [ ] Resolve `data.account_id` through indexed `providerAccountId`, require platform/transport/lifecycle match, and never accept an organization identifier from the webhook.
- [ ] Normalize verified canonical sender/message IDs (using the tested mapping if necessary), original provider timestamp, conversation ID, text, and media into the existing Instagram job. Include provider account and connection generation from the validated integration.
- [ ] Preserve existing rate limits, body limits, no-content logging, trace IDs, bulk queue behavior, and signature-failure alerts with `provider=socialapi`.
- [ ] Make retries idempotent using the existing organization-scoped external-message uniqueness guarantee.
- [ ] Use stable delivery IDs for delivery correlation/deduplication where present; pings may omit them. Delivery IDs do not replace canonical message IDs for webhook-plus-poll deduplication. Retry timestamps describe the delivery attempt, not the customer's message time.

Done when valid events are durably admitted, replays persist once, invalid signatures never reach the queue, unmapped accounts alert safely, and direct Meta ingress remains unchanged. Queue redelivery is allowed; exactly-once persistence is the guarantee.

### S4. Worker, attachment, and catch-up behavior

Entry points: `apps/gateway/src/message-handlers/channels.ts`, Instagram media helpers, inbound persistence, and a new bounded reconciliation job.

- [ ] Refactor active-integration loading so direct jobs require a Meta token and SocialAPI jobs require matching transport, provider account ID, and connection generation. Apply the S1 handoff rules to stale jobs.
- [ ] Use webhook author fields first; call SocialAPI for profile enrichment only when needed and cache the result with the existing bounded pattern.
- [ ] Map SocialAPI media into the existing attachment types and download to Shopkeeper's private blob storage before provider URLs expire.
- [ ] Retain attachment count, byte, MIME, timeout, concurrency, and SSRF protections; explicitly permit only validated provider/CDN origins.
- [ ] Persist `providerConversationId` in `Thread.externalSpaceId` while keeping Instagram's episode policy sender/time based. Validate account/conversation ownership and apply generation-guarded route replacement on reconnect.
- [ ] After the complete core path works, implement bounded recovery for two cases: vendor-received messages not forwarded to Shopkeeper, and messages the vendor missed upstream. Evaluate stored-message/event reads for the former and explicit platform inbox sync for the latter; prove coverage and record unrecoverable cases.
- [ ] Set a durable activation boundary for initial ingestion. Do not automatically import pre-connection history. Recovery uses original message time, accepts only genuine inbound customer events, and must not reopen the 24-hour send window using poll time. Explicit historical imports, if later supported, must suppress automatic planning/sends unless separately authorized.
- [ ] Start with a five-minute recovery schedule, subject to validated quotas. Specify stable ordering, cursor semantics, archived-conversation coverage, checkpoint plus overlap, page/work budgets, and resumable continuation. A capped run must not advance past unprocessed pages or starve older gaps.
- [ ] Record the reconciliation checkpoint only after all fetched events in the completed range are durably admitted. Track pending/failed processing separately: queue admission is not successful persistence. Make webhook and poll ingestion converge on the same idempotency key and test crash recovery and out-of-order arrivals.

Done when webhooks and polling cannot create duplicate messages, a missed webhook is recovered, and every required attachment type is either privately persisted or represented truthfully as unsupported.

### S5. Outbound, health, disconnect, and deletion

Entry points: `instagram-dispatch.ts`, provider send-failure mapping, token health, durable integration disconnect, and workspace deletion.

- [ ] Branch outbound by the pinned transport after loading the exact `replyIntegrationId`.
- [ ] Keep Shopkeeper's local 24-hour-window check. For SocialAPI, require `Thread.externalSpaceId` and send through the conversation endpoint.
- [ ] Preserve outbound claim/idempotency behavior, but attribute calls and alerts to `provider=socialapi`; store the accepted provider message ID.
- [ ] Never retry a SocialAPI failure through Meta. Known transient failures remain retryable through the same provider; unknown outcomes remain unknown.
- [ ] Add SocialAPI health probing for account status/reconnect reason. Do not run direct Meta subscription/token-refresh logic for SocialAPI rows.
- [ ] Route durable disconnect cleanup by transport: direct unsubscribes Meta; SocialAPI deletes the connected account. Workspace deletion also deletes the remote brand when safe.
- [ ] Ensure reconnect updates the existing integration and thread routing when the verified native account is unchanged; increment generation and prevent stale jobs from restoring old routes. Implement the S1 cleanup snapshot and migration handoff before external onboarding.
- [ ] Define outage behavior: flag the integration as degraded, stop automated sends when outcome safety is unclear, keep reconciliation scheduled, and tell the merchant to use Instagram directly. A returned provider message ID proves acceptance, not delivery; claim delivery only with a supported receipt or observed recipient-side evidence.

Done when send, failure, reconnect, disconnect, and workspace deletion are provider-correct and recoverable without leaking credentials or orphaning remote access.

### S6. Observability, capacity, and operations

- [ ] Tag existing integration analytics and ops alerts with `transport=meta_direct|socialapi` while keeping `channel=ig_dm`.
- [ ] Add counts for OAuth attempts/results, active bridge organizations, signed/unmapped/duplicate webhooks, queue failures, reconciliation discoveries, attachment failures, API status/latency, sends by result category, and reconnect-required accounts.
- [ ] Measure provider-received-to-ticket-persisted lag and approval-to-provider-accepted latency without logging message content or customer identifiers.
- [ ] Alert immediately on any isolation mismatch, confirmed missing supported message/attachment, or unrecovered reconciliation gap. Alert on invalid signature bursts and webhook-path inbound lag above two minutes; measure recovery lag separately against its five-minute schedule.
- [ ] Evaluate provider 5xx/timeout above 2% over a rolling 15-minute window only with at least 100 calls; at lower volume, alert and freeze onboarding after three consecutive failures within 15 minutes. Evaluate attachment failures above 1% with at least 100 attempts in 24 hours; below that, review each failure and freeze for confirmed loss. Track retries separately so rates have a defined denominator.
- [ ] Report active and assigned/pending merchant counts separately; alert at 5/8 and 7/8 assigned slots, and audit all remote brands including test accounts and pending cleanup.
- [ ] Extend `audit:instagram-rollout` to report transport counts, invalid metadata, missing provider account IDs, duplicate native/provider identities, health, last successful ingress/send, and cap utilization.
- [ ] Add SocialAPI variables to `turbo.json`, launch-environment validation, network test guards, production inventory, and the runbook. Secret checks report presence/fingerprint only.
- [ ] Add a synthetic production canary if SocialAPI permits a dedicated test account; otherwise schedule a documented manual canary at least daily during the bridge.

Done when release/ops can tell direct and bridge failures apart, stop onboarding before the ceiling, and diagnose a merchant without viewing message content.

### S7. Certification and live canaries

Automated coverage, accumulated during S1–S6:

- [ ] Client response validation, timeouts, error mapping, and non-idempotent retry behavior.
- [ ] OAuth state/org binding, capacity races, callback replay, compensation, account ownership, and reconnect.
- [ ] Webhook signatures, malformed bodies, every supported event/media shape, echoes, unknown events, mapping failures, rate limits, queue failure, retries, and duplicates.
- [ ] Worker disconnect/reconnect/migration races, generation-guarded route replacement, attachment budgets/SSRF, enrichment failure, webhook-plus-poll deduplication, initial history boundary, pagination continuation, and checkpoint crash recovery.
- [ ] Outbound window, missing conversation, accepted ID, invalid token, permission, rate limit, transient failure, unknown outcome, and no direct-provider failover.
- [ ] Provider-specific health, disconnect retry, migration cleanup snapshots, callback compensation ownership, remote deletion, workspace deletion, audits, and environment validation.
- [ ] Existing direct Meta test suites and the canonical repository checks remain green.

Live acceptance, first with a controlled account and then two non-role merchant accounts:

- [ ] Connect → inbound text → ticket/plan → approve → accepted reply with provider ID, then verify receipt in the recipient's Instagram app.
- [ ] Two rapid messages preserve provider timestamps and appear exactly once.
- [ ] Image, video, audio, story/post share, deleted/unsent, referral, and unsupported inputs meet the documented mapping.
- [ ] Temporarily fail the webhook endpoint, restore it, and prove automatic retry plus reconciliation recovery without duplicates.
- [ ] Revoke provider access and prove health/reconnect behavior.
- [ ] Disconnect, prove later events create no tickets, reconnect, and prove existing-account/thread routing.
- [ ] Execute provider-held data deletion and record non-sensitive evidence.
- [ ] Observe for 7–14 days with zero missing supported messages, zero cross-tenant errors, zero duplicate persisted messages, and 100% of eligible canary replies holding a provider message ID.

Entry to S7 requires S0 diligence, completed S1–S6 checks, and controlled-account acceptance. S7 authorizes only the two supervised external canaries, which count toward the eight slots. Its completed 7–14-day observation is the gate for expansion beyond two. Passing mocks or a text-only live test is insufficient.

### S8. Capped launch and exit

Rollout sequence:

1. Continue the same two supervised merchants admitted in S7; do not start a second two-merchant cohort or reset the observation clock. Review every provider error and reconciliation discovery daily.
2. After S7's 7–14-day observation and complete acceptance evidence, expand to five. Require at least three clean days at five before considering eight.
3. Perform the launch-envelope review. Expand to eight only if vendor diligence is closed, attachment/reconciliation evidence is clean, and support response is adequate.
4. Keep direct Meta Advanced Access and its non-role acceptance loop active in parallel.

Exit to direct Meta once Advanced Access and the non-role end-to-end cycle pass:

1. Freeze new SocialAPI connections; make direct Meta the default for new merchants.
2. Migrate one bridge canary first using the handoff rehearsed in SP and implemented in S1–S5. Pause automated sends, complete direct OAuth/subscription verification, drain or durably quarantine old-generation work, and persist the old provider cleanup snapshot before atomically changing the integration in place. Preserve `replyIntegrationId`, increment generation, and clear or replace provider-specific thread routes as appropriate.
3. Run the verified cross-provider deduplication/mapping strategy during bounded dual-subscription overlap. Recover outstanding inbound work, verify direct inbound and outbound, then durably disconnect the old SocialAPI account using its snapshot and resume sends. Define the overlap deadline and recovery owner in the migration runbook. Failure pauses further migrations; it must not silently discard queued messages or delete the retained integration.
4. Migrate remaining merchants in scheduled, communicated batches. Verify inbound and outbound after each reconnect.
5. After zero active SocialAPI integrations for 30 days, run deletion verification, remove the webhook, revoke keys, remove secrets, and move compatibility cleanup to the retirement backlog.

If direct Meta is still unavailable at the ceiling, stop onboarding and make an explicit decision among a stronger SocialAPI contract/dedicated app, another approved provider, or delayed expansion. Do not silently convert the launch bridge into the permanent high-traffic architecture.

## Release and rollback rules

- All schema changes are additive and deploy before code that reads them.
- Dashboard and gateway accept both old direct jobs and new provider-tagged jobs throughout the bridge.
- Rollback disables **new** SocialAPI connects first. It does not disable ingress or replies for already connected merchants.
- A severe isolation or integrity incident disables SocialAPI automated outbound, retains signed ingress where safe, and activates the merchant manual-response procedure.
- Provider switching is an explicit OAuth/reconnect operation. A feature-flag flip alone cannot move a merchant between OAuth apps.
- Removal is complete only after remote account/brand deletion is verified and production secrets are revoked.

## Definition of success

The bridge is successful when Shopkeeper can onboard and learn from its first external Instagram merchants before Meta approval without weakening the existing message, attachment, approval, tenant-isolation, or truthful-outcome guarantees—and can later move those merchants to direct Meta through a controlled reconnect with no stranded conversations or undisclosed data retention.
