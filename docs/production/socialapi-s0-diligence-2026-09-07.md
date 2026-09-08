# SocialAPI S0 diligence — 2026-09-07

Status: `in_progress`; public-document review complete, external and authenticated checks open.
Owner: founder for vendor/commercial evidence; engineering for authenticated technical evidence.

This record supports S0 in the [SocialAPI launch bridge plan](../socialapi-launch-bridge-plan.md).
It contains no credentials or merchant data. Public documentation is evidence of the vendor's
stated contract, not proof that production behavior matches it.

## Public evidence reviewed

| Topic | Current public statement | Consequence for the bridge | State |
| --- | --- | --- | --- |
| OAuth ownership | SocialAPI supplies the Instagram OAuth app, requests Instagram business messaging scopes, shows its own brand on consent, and does not currently support bring-your-own Meta apps. | The merchant disclosure must name SocialAPI; all bridge merchants share the vendor's Meta-app failure domain. | Documented; capture the live consent screen. |
| Runtime key isolation | Keys can be restricted by scopes and brands. A merchant runtime key can hold `accounts:read`, `dms:read`, and `dms:send` for one brand. Empty scope or brand arrays mean unrestricted access. | Provision one least-privilege runtime key per assigned brand and reject any empty restriction set. | Documented; verify against a real account. |
| Administrative credentials | Key/brand administration requires a full-access key or dashboard. Webhook management and analytics/event logs are account-wide and unavailable to brand-restricted keys. | Keep provisioning and webhook credentials out of normal messaging processes. Account-wide delivery records remain a wider operational trust boundary. | Documented; obtain written isolation/incident controls. |
| DM storage | The inbox guide says DM conversations and messages are stored to support threading and pagination. The privacy policy says posts, comments, DMs, and engagement metrics are stored. | Treat SocialAPI as a processor that persistently holds customer-message content. | Documented. |
| Retention and deletion | The privacy policy lists inbox data for the account lifetime, webhook audit logs for the account lifetime, media for 60 days, disconnect deletion within 30 days, and account deletion purge within 30 days. | Shopkeeper's notice, deletion procedure, and DPA must reflect these maximum windows. | Documented; DPA and backup deletion remain open. |
| Terms contradiction | Section 11.4 of the terms says interaction, review, and message content is not persistently stored and is cached for at most five minutes. | The terms and privacy/inbox promises are mutually inconsistent. External merchant data remains blocked until the vendor reconciles them in writing and in the DPA. | **Blocking.** |
| Webhook authenticity | The webhook guide documents V2 HMAC-SHA256 over `<timestamp>.<raw body>`, a timestamp header, and a delivery ID stable across retries. Five minutes is the recommended freshness window. | Implement V2 only for normal deliveries and deduplicate using the interaction ID plus delivery correlation. | Documented; verify live headers. |
| Registration ping | The initial `webhook.test` ping occurs before the endpoint secret is revealed and the guide instructs the receiver to return `2xx` without verifying that first signature. Test deliveries also omit delivery IDs. | The route needs a narrowly defined unauthenticated registration-ping state or webhook registration must be performed only while an operator-controlled one-time gate is active. A permanent header-only bypass would be unsafe. | Design decision required before S3. |
| Delivery behavior | Normal webhook delivery requires `2xx` within ten seconds and retries failed deliveries five times. Delivery records can be listed and replayed. | Durable queue admission must precede acknowledgement. Vendor retries supplement but do not replace Shopkeeper reconciliation. | Documented; verify live. |
| Inbox recovery | Account sync refreshes only the conversation list; a conversation ID is required to refresh messages for one thread. Reads expose sync state and last-sync time. | A five-minute account sync alone cannot prove that every thread is recovered. The spike must enumerate changed conversations and exercise per-thread message recovery with bounded pagination. | Documented; algorithm remains unproven. |
| Message identity | Webhook examples expose a SocialAPI interaction ID, provider account ID, author ID, received time, and conversation/message fields. Account events expose `platform_user_id`; stored message rows expose `platform_id`. | Live fixtures must prove which fields equal the IDs emitted by direct Meta and which are provider-only routing IDs. | **Blocking for external onboarding.** |
| Attachments | The inbox guide documents `attachment_url` and image/video/audio/file types. It states that most platforms return platform URLs subject to platform expiry; special SocialAPI mirroring behavior is documented for WhatsApp. | Instagram URL lifetime, all required event shapes, and deletion/unsent behavior remain unproven. Shopkeeper must copy supported media into private storage immediately. | **Blocking for external onboarding.** |
| SLA and termination | Paid terms promise 99.9% monthly API uptime excluding platform outages and allow termination with 30 days' notice for any reason. | Keep the eight-merchant ceiling, direct-Meta exit path, and service-continuity procedure. | Documented; support and export commitments remain open. |

Sources reviewed on 2026-09-07:

- [Scoped API keys](https://docs.social-api.ai/guides/scoped-keys)
- [Platform credentials](https://docs.social-api.ai/guides/platform-credentials)
- [Unified inbox](https://docs.social-api.ai/guides/inbox)
- [Webhooks](https://docs.social-api.ai/guides/webhooks)
- [Inbox sync](https://docs.social-api.ai/api-reference/inbox/start-an-inbox-sync)
- [Privacy policy](https://social-api.ai/privacy)
- [Terms of service](https://social-api.ai/terms)

## Vendor message draft

Do not send this message until the founder chooses the sender/account. Send the questions as one
thread and attach the received DPA to the private vendor record, not this repository.

> We are evaluating SocialAPI as a capped Instagram DM transport for up to eight Shopify
> merchants. Before any external merchant data is connected, please provide or confirm the
> following:
>
> 1. Please provide your current DPA and security/subprocessor schedule, including hosting
>    region, backup retention/deletion, breach history, latest penetration-test summary, and
>    incident escalation path.
> 2. Your current privacy policy and inbox documentation say DM conversations/messages are stored
>    for the account lifetime, with media retained up to 60 days and deletion within 30 days.
>    Section 11.4 of the current terms says messages are never persistently stored and may be
>    cached for at most five minutes. Which contract controls? Please list each DM, media,
>    webhook-payload/log, backup, and identifier field stored, its location, and its exact
>    retention/deletion window after disconnect and account deletion.
> 3. Confirm that a brand-restricted key with only `accounts:read`, `dms:read`, and `dms:send`
>    cannot read or mutate another brand. Explain how account-wide webhook delivery payloads and
>    delivery logs are isolated operationally when webhook management cannot use a brand-restricted
>    key.
> 4. Provide real sanitized Instagram payloads for text, image, video, audio, story/post share,
>    deleted/unsent, referral, postback, echo, delivery/read status, and unsupported input. Include
>    original platform timestamps, native IDs, provider IDs, conversation IDs, attachment URL
>    lifetime, MIME type, size, and retry/delivery headers.
> 5. Identify which account, sender, message, and conversation fields are native Meta identifiers.
>    Are they stable and equal when the same account/message is observed through another Meta app?
> 6. Describe missed-event recovery precisely. Does account-level inbox sync discover every
>    conversation changed since a checkpoint? How are archived threads, pagination, deletions,
>    unsends, out-of-order events, and gaps older than the staleness window handled?
> 7. Confirm whether disconnect revokes Meta authorization and when all associated content, media,
>    webhook payloads/logs, backups, and derived identifiers are deleted. Describe export and
>    reconnection behavior if SocialAPI or Shopkeeper terminates service.
> 8. State paid-plan fair-use thresholds, shared Meta-app rate limits, webhook/message-processing
>    SLA coverage, support response targets, RTO/RPO, incident notification timing, and the
>    escalation contact for a missing DM or cross-tenant incident.
> 9. Confirm that one merchant brand with one Instagram Professional account consumes one brand
>    slot, and that separate non-production and production workspaces/keys are supported.
> 10. Provide the exact merchant OAuth consent screen and confirm whether the requested Instagram
>     scopes can be reduced to the DM-only capabilities we use.

## Authenticated verification queue

These checks begin after the founder creates the production paid account and a separate test
account/key. Never paste a key, token, payload containing customer content, or DPA into a tracked
file.

- [ ] Record production and non-production account ownership and billing owner in the private
  credential system.
- [ ] Create one test brand and verify a non-empty brand restriction plus the minimum DM scopes.
- [ ] Prove cross-brand reads and writes fail closed; confirm the response does not reveal whether
  the foreign resource exists.
- [ ] Capture the real scope catalog and compare it with the documented vocabulary.
- [ ] Capture the live SocialAPI-branded Instagram consent screen and authorized scopes.
- [ ] Register a disposable webhook and capture sanitized V2 headers, ping behavior, delivery ID,
  retry timing, delivery-log visibility, and replay behavior.
- [ ] Connect a controlled Instagram Professional account and capture sanitized account/message
  identity fixtures for comparison with direct Meta.
- [ ] Exercise text and every required inbound media/event shape, including URL expiry and provider
  deletion behavior.
- [ ] Disable webhook delivery, recover through stored reads and platform sync, and document the
  earliest unrecoverable gap without relying on poll time as message time.
- [ ] Disconnect and delete the test account; verify remote authorization and provider-held data
  removal against the promised windows.

## Go/no-go gate

Proceed from SP to production implementation only when:

- the DPA and written retention answer are acceptable and mutually consistent;
- live identity fixtures support safe tenant ownership, deduplication, and eventual direct-Meta
  handoff;
- supported message/media coverage and recovery meet Shopkeeper's existing Instagram contract;
- scoped runtime credentials contain a merchant compromise to one assigned brand; and
- the revised implementation estimate still reaches external merchant learning materially sooner
  than waiting for direct Meta Advanced Access.

Any failure above is a no-go for external merchant data. Reusable controlled-spike code may remain
behind a disabled flag while direct Meta approval continues.
